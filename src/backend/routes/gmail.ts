import { Router } from 'express';
import { google } from 'googleapis';
import { getDatabase } from '../database';
import { logAudit } from '../utils/audit';

const router = Router();

let oauth2Client: any = null;

// Initialize Gmail OAuth
router.post('/auth/init', (req, res) => {
  try {
    const { clientId, clientSecret, redirectUri } = req.body;
    
    oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri || 'http://localhost:3001/api/gmail/auth/callback'
    );
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send'
      ]
    });
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error initializing Gmail auth:', error);
    res.status(500).json({ error: 'Failed to initialize Gmail authentication' });
  }
});

// OAuth callback
router.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!oauth2Client) {
      return res.status(400).json({ error: 'OAuth client not initialized' });
    }
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Store tokens securely (in production, encrypt these)
    res.json({ success: true, message: 'Gmail authentication successful' });
  } catch (error) {
    console.error('Error in Gmail auth callback:', error);
    res.status(500).json({ error: 'Failed to complete Gmail authentication' });
  }
});

// Fetch emails and create tickets
router.post('/sync', async (req, res) => {
  try {
    if (!oauth2Client) {
      return res.status(400).json({ error: 'Gmail not authenticated' });
    }
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const db = getDatabase();
    
    // Get unread messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 50
    });
    
    const messages = response.data.messages || [];
    let createdTickets = 0;
    
    for (const message of messages) {
      try {
        // Get full message details
        const msgData = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        });
        
        const headers = msgData.data.payload?.headers || [];
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find(h => h.name === 'From')?.value || '';
        
        // Extract email and name
        const emailMatch = from.match(/<(.+)>/);
        const senderEmail = emailMatch ? emailMatch[1] : from;
        const senderName = emailMatch ? from.replace(/<.+>/, '').trim() : '';
        
        // Get message body
        let body = '';
        if (msgData.data.payload?.body?.data) {
          body = Buffer.from(msgData.data.payload.body.data, 'base64').toString('utf-8');
        } else if (msgData.data.payload?.parts) {
          const textPart = msgData.data.payload.parts.find(p => p.mimeType === 'text/plain');
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        }
        
        // Check if ticket already exists
        const existing = db.prepare('SELECT id FROM tickets WHERE email_id = ?').get(message.id);
        
        if (!existing) {
          // Create ticket
          const result = db.prepare(`
            INSERT INTO tickets (email_id, subject, description, sender_email, sender_name, status)
            VALUES (?, ?, ?, ?, ?, 'open')
          `).run(message.id, subject, body, senderEmail, senderName);
          
          logAudit(db, 'ticket', result.lastInsertRowid as number, 'create', 'gmail-sync', {
            email_id: message.id,
            subject,
            sender_email: senderEmail
          });
          
          // Create or update contact
          const contactExists = db.prepare('SELECT id FROM contacts WHERE email = ?').get(senderEmail);
          if (!contactExists && senderEmail) {
            db.prepare(`
              INSERT INTO contacts (email, name)
              VALUES (?, ?)
            `).run(senderEmail, senderName);
          }
          
          createdTickets++;
        }
      } catch (msgError) {
        console.error(`Error processing message ${message.id}:`, msgError);
      }
    }
    
    res.json({ 
      success: true, 
      totalMessages: messages.length,
      createdTickets 
    });
  } catch (error) {
    console.error('Error syncing Gmail:', error);
    res.status(500).json({ error: 'Failed to sync Gmail messages' });
  }
});

export default router;
