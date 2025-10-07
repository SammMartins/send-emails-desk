import { Router } from 'express';
import { getDatabase } from '../database';
import { logAudit } from '../utils/audit';

const router = Router();

// Get all tickets with filters
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const { status, priority, search, sortBy = 'created_at', sortOrder = 'DESC', limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params: any[] = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    
    if (search) {
      query += ' AND (subject LIKE ? OR description LIKE ? OR sender_email LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
    
    const tickets = db.prepare(query).all(...params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM tickets WHERE 1=1';
    const countParams: any[] = [];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (priority) {
      countQuery += ' AND priority = ?';
      countParams.push(priority);
    }
    
    if (search) {
      countQuery += ' AND (subject LIKE ? OR description LIKE ? OR sender_email LIKE ?)';
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam);
    }
    
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number };
    
    res.json({ tickets, total });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Get annotations
    const annotations = db.prepare('SELECT * FROM annotations WHERE ticket_id = ? ORDER BY created_at DESC').all(req.params.id);
    
    // Get AI analysis
    const aiAnalysis = db.prepare('SELECT * FROM ai_analysis WHERE ticket_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.id);
    
    res.json({ ticket, annotations, aiAnalysis });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Create ticket
router.post('/', (req, res) => {
  try {
    const db = getDatabase();
    const { email_id, subject, description, sender_email, sender_name, priority = 'medium' } = req.body;
    
    const result = db.prepare(`
      INSERT INTO tickets (email_id, subject, description, sender_email, sender_name, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, 'open')
    `).run(email_id, subject, description, sender_email, sender_name, priority);
    
    logAudit(db, 'ticket', result.lastInsertRowid as number, 'create', 'system', req.body);
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Ticket created successfully' });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket
router.put('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const { status, priority, assigned_to } = req.body;
    const ticketId = req.params.id;
    
    // Get current ticket
    const currentTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId) as any;
    if (!currentTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    let updateQuery = 'UPDATE tickets SET updated_at = CURRENT_TIMESTAMP';
    const params: any[] = [];
    
    if (status !== undefined) {
      updateQuery += ', status = ?';
      params.push(status);
      
      // Set resolved_at if status is closed
      if (status === 'closed' && !currentTicket.resolved_at) {
        updateQuery += ', resolved_at = CURRENT_TIMESTAMP';
      }
    }
    
    if (priority !== undefined) {
      updateQuery += ', priority = ?';
      params.push(priority);
    }
    
    if (assigned_to !== undefined) {
      updateQuery += ', assigned_to = ?';
      params.push(assigned_to);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(ticketId);
    
    db.prepare(updateQuery).run(...params);
    
    logAudit(db, 'ticket', Number(ticketId), 'update', 'system', req.body);
    
    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Add annotation to ticket
router.post('/:id/annotations', (req, res) => {
  try {
    const db = getDatabase();
    const { content, created_by = 'system' } = req.body;
    const ticketId = req.params.id;
    
    const result = db.prepare(`
      INSERT INTO annotations (ticket_id, content, created_by)
      VALUES (?, ?, ?)
    `).run(ticketId, content, created_by);
    
    // Update ticket timestamp
    db.prepare('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ticketId);
    
    // Set first_response_at if not set
    const ticket = db.prepare('SELECT first_response_at FROM tickets WHERE id = ?').get(ticketId) as any;
    if (!ticket.first_response_at) {
      db.prepare('UPDATE tickets SET first_response_at = CURRENT_TIMESTAMP WHERE id = ?').run(ticketId);
    }
    
    logAudit(db, 'annotation', result.lastInsertRowid as number, 'create', created_by, { ticket_id: ticketId, content });
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Annotation added successfully' });
  } catch (error) {
    console.error('Error adding annotation:', error);
    res.status(500).json({ error: 'Failed to add annotation' });
  }
});

export default router;
