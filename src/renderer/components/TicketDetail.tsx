import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api';

interface Ticket {
  id: number;
  subject: string;
  description: string;
  sender_email: string;
  sender_name: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
}

interface Annotation {
  id: number;
  content: string;
  created_by: string;
  created_at: string;
}

interface AIAnalysis {
  sentiment: string;
  tone_analysis: string;
  suggested_response: string;
  keywords: string;
}

interface TicketDetailProps {
  ticketId: number;
  onBack: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, onBack }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [analyzingAI, setAnalyzingAI] = useState(false);

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    setLoading(true);
    try {
      const data = await apiGet(`/tickets/${ticketId}`);
      setTicket(data.ticket);
      setAnnotations(data.annotations || []);
      setAIAnalysis(data.aiAnalysis || null);
    } catch (error) {
      console.error('Error loading ticket details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (updates: Partial<Ticket>) => {
    try {
      await apiPut(`/tickets/${ticketId}`, updates);
      await loadTicketDetails();
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket');
    }
  };

  const addAnnotation = async () => {
    if (!newAnnotation.trim()) return;

    try {
      await apiPost(`/tickets/${ticketId}/annotations`, {
        content: newAnnotation,
        created_by: 'user'
      });
      setNewAnnotation('');
      await loadTicketDetails();
    } catch (error) {
      console.error('Error adding annotation:', error);
      alert('Failed to add annotation');
    }
  };

  const analyzeWithAI = async () => {
    setAnalyzingAI(true);
    try {
      const result = await apiPost(`/ai/analyze/${ticketId}`, {});
      if (result.success) {
        setAIAnalysis(result.analysis);
      } else {
        alert('AI analysis failed. Make sure OpenAI is configured in Settings.');
      }
    } catch (error) {
      console.error('Error analyzing with AI:', error);
      alert('Failed to analyze with AI. Make sure OpenAI is configured in Settings.');
    } finally {
      setAnalyzingAI(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading ticket details...</div>;
  }

  if (!ticket) {
    return <div className="error">Ticket not found</div>;
  }

  return (
    <div className="ticket-detail">
      <div className="detail-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Inbox
        </button>
        <h2>Ticket #{ticket.id}</h2>
      </div>

      <div className="ticket-info">
        <div className="info-row">
          <strong>Subject:</strong> {ticket.subject}
        </div>
        <div className="info-row">
          <strong>From:</strong> {ticket.sender_name || ticket.sender_email} ({ticket.sender_email})
        </div>
        <div className="info-row">
          <strong>Status:</strong>
          <select
            value={ticket.status}
            onChange={(e) => updateTicket({ status: e.target.value })}
            className="inline-select"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="info-row">
          <strong>Priority:</strong>
          <select
            value={ticket.priority}
            onChange={(e) => updateTicket({ priority: e.target.value })}
            className="inline-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="info-row">
          <strong>Created:</strong> {new Date(ticket.created_at).toLocaleString('pt-BR')}
        </div>
        {ticket.first_response_at && (
          <div className="info-row">
            <strong>First Response:</strong> {new Date(ticket.first_response_at).toLocaleString('pt-BR')}
          </div>
        )}
        {ticket.resolved_at && (
          <div className="info-row">
            <strong>Resolved:</strong> {new Date(ticket.resolved_at).toLocaleString('pt-BR')}
          </div>
        )}
      </div>

      <div className="ticket-description">
        <h3>Description</h3>
        <div className="description-content">{ticket.description}</div>
      </div>

      {aiAnalysis && (
        <div className="ai-analysis">
          <h3>AI Analysis</h3>
          <div className="analysis-content">
            <div className="analysis-item">
              <strong>Sentiment:</strong> <span className={`sentiment ${aiAnalysis.sentiment}`}>{aiAnalysis.sentiment}</span>
            </div>
            <div className="analysis-item">
              <strong>Tone:</strong> {aiAnalysis.tone_analysis}
            </div>
            {aiAnalysis.keywords && (
              <div className="analysis-item">
                <strong>Keywords:</strong> {aiAnalysis.keywords}
              </div>
            )}
            {aiAnalysis.suggested_response && (
              <div className="analysis-item">
                <strong>Suggested Response:</strong>
                <div className="suggested-response">{aiAnalysis.suggested_response}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {!aiAnalysis && (
        <button onClick={analyzeWithAI} disabled={analyzingAI} className="analyze-btn">
          {analyzingAI ? 'Analyzing...' : '🤖 Analyze with AI'}
        </button>
      )}

      <div className="annotations-section">
        <h3>Annotations</h3>
        <div className="annotations-list">
          {annotations.map((annotation) => (
            <div key={annotation.id} className="annotation">
              <div className="annotation-header">
                <strong>{annotation.created_by}</strong>
                <span className="timestamp">
                  {new Date(annotation.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="annotation-content">{annotation.content}</div>
            </div>
          ))}
        </div>

        <div className="add-annotation">
          <textarea
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            placeholder="Add a note or response..."
            rows={4}
            className="annotation-input"
          />
          <button onClick={addAnnotation} className="add-annotation-btn">
            Add Annotation
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
