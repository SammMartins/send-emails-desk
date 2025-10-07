import { Router } from 'express';
import OpenAI from 'openai';
import { getDatabase } from '../database';

const router = Router();

let openaiClient: OpenAI | null = null;

// Initialize OpenAI
router.post('/init', (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    openaiClient = new OpenAI({ apiKey });
    
    res.json({ success: true, message: 'OpenAI initialized successfully' });
  } catch (error) {
    console.error('Error initializing OpenAI:', error);
    res.status(500).json({ error: 'Failed to initialize OpenAI' });
  }
});

// Analyze ticket text
router.post('/analyze/:ticketId', async (req, res) => {
  try {
    if (!openaiClient) {
      return res.status(400).json({ error: 'OpenAI not initialized. Please configure API key first.' });
    }
    
    const db = getDatabase();
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.ticketId) as any;
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const textToAnalyze = `Subject: ${ticket.subject}\n\nDescription: ${ticket.description}`;
    
    // Analyze sentiment and tone
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a customer service assistant that analyzes support ticket messages. Analyze the sentiment (positive, neutral, negative), tone (professional, urgent, frustrated, polite), and extract key topics. Also suggest a professional response template.'
        },
        {
          role: 'user',
          content: textToAnalyze
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const analysis = completion.choices[0].message.content || '';
    
    // Parse the analysis (simplified - in production, use structured output)
    let sentiment = 'neutral';
    let tone = 'professional';
    let keywords = '';
    let suggestedResponse = '';
    
    if (analysis.toLowerCase().includes('negative') || analysis.toLowerCase().includes('frustrated')) {
      sentiment = 'negative';
    } else if (analysis.toLowerCase().includes('positive') || analysis.toLowerCase().includes('satisfied')) {
      sentiment = 'positive';
    }
    
    if (analysis.toLowerCase().includes('urgent')) {
      tone = 'urgent';
    } else if (analysis.toLowerCase().includes('frustrated')) {
      tone = 'frustrated';
    }
    
    // Extract keywords (simplified)
    const keywordMatch = analysis.match(/(?:keywords?|topics?):\s*(.+?)(?:\n|$)/i);
    if (keywordMatch) {
      keywords = keywordMatch[1].trim();
    }
    
    // Generate suggested response
    const responseCompletion = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional customer service representative. Generate a polite, helpful response template for this support ticket. Keep it concise and professional.'
        },
        {
          role: 'user',
          content: textToAnalyze
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });
    
    suggestedResponse = responseCompletion.choices[0].message.content || '';
    
    // Store analysis
    db.prepare(`
      INSERT INTO ai_analysis (ticket_id, sentiment, tone_analysis, suggested_response, keywords)
      VALUES (?, ?, ?, ?, ?)
    `).run(ticket.id, sentiment, tone, suggestedResponse, keywords);
    
    res.json({
      success: true,
      analysis: {
        sentiment,
        tone,
        keywords,
        suggestedResponse,
        fullAnalysis: analysis
      }
    });
  } catch (error) {
    console.error('Error analyzing ticket:', error);
    res.status(500).json({ error: 'Failed to analyze ticket' });
  }
});

export default router;
