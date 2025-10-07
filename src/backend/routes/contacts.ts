import { Router } from 'express';
import { getDatabase } from '../database';
import { logAudit } from '../utils/audit';

const router = Router();

// Get all contacts with filters
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const { city, search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params: any[] = [];
    
    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    const contacts = db.prepare(query).all(...params);
    res.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get cities for filtering
router.get('/cities', (req, res) => {
  try {
    const db = getDatabase();
    const cities = db.prepare('SELECT DISTINCT city FROM contacts WHERE city IS NOT NULL ORDER BY city').all();
    res.json({ cities: cities.map((c: any) => c.city) });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// Get single contact
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ contact });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Create or update contact
router.post('/', (req, res) => {
  try {
    const db = getDatabase();
    const { email, name, phone, city } = req.body;
    
    // Check if contact exists
    const existing = db.prepare('SELECT id FROM contacts WHERE email = ?').get(email) as any;
    
    if (existing) {
      // Update existing contact
      db.prepare(`
        UPDATE contacts SET name = ?, phone = ?, city = ?
        WHERE email = ?
      `).run(name, phone, city, email);
      
      logAudit(db, 'contact', existing.id, 'update', 'system', req.body);
      res.json({ id: existing.id, message: 'Contact updated successfully' });
    } else {
      // Create new contact
      const result = db.prepare(`
        INSERT INTO contacts (email, name, phone, city)
        VALUES (?, ?, ?, ?)
      `).run(email, name, phone, city);
      
      logAudit(db, 'contact', result.lastInsertRowid as number, 'create', 'system', req.body);
      res.status(201).json({ id: result.lastInsertRowid, message: 'Contact created successfully' });
    }
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ error: 'Failed to save contact' });
  }
});

// Update contact
router.put('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const { name, phone, city } = req.body;
    
    db.prepare(`
      UPDATE contacts SET name = ?, phone = ?, city = ?
      WHERE id = ?
    `).run(name, phone, city, req.params.id);
    
    logAudit(db, 'contact', Number(req.params.id), 'update', 'system', req.body);
    
    res.json({ message: 'Contact updated successfully' });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

export default router;
