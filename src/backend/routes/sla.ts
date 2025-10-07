import { Router } from 'express';
import { getDatabase } from '../database';
import { logAudit } from '../utils/audit';

const router = Router();

// Get SLA configuration
router.get('/config', (req, res) => {
  try {
    const db = getDatabase();
    const config = db.prepare('SELECT * FROM sla_config WHERE id = 1').get();
    res.json({ config });
  } catch (error) {
    console.error('Error fetching SLA config:', error);
    res.status(500).json({ error: 'Failed to fetch SLA configuration' });
  }
});

// Update SLA configuration
router.put('/config', (req, res) => {
  try {
    const db = getDatabase();
    const { first_response_hours, resolution_hours, business_hours_only } = req.body;
    
    db.prepare(`
      UPDATE sla_config 
      SET first_response_hours = ?, resolution_hours = ?, business_hours_only = ?
      WHERE id = 1
    `).run(first_response_hours, resolution_hours, business_hours_only ? 1 : 0);
    
    logAudit(db, 'sla_config', 1, 'update', 'system', req.body);
    
    res.json({ success: true, message: 'SLA configuration updated successfully' });
  } catch (error) {
    console.error('Error updating SLA config:', error);
    res.status(500).json({ error: 'Failed to update SLA configuration' });
  }
});

export default router;
