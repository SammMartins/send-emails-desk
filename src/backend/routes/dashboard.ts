import { Router } from 'express';
import { getDatabase } from '../database';
import { calculateBusinessHours } from '../utils/sla';

const router = Router();

// Get dashboard metrics
router.get('/metrics', (req, res) => {
  try {
    const db = getDatabase();
    
    // Get SLA config
    const slaConfig = db.prepare('SELECT * FROM sla_config WHERE id = 1').get() as any;
    
    // Total tickets by status
    const ticketsByStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM tickets
      GROUP BY status
    `).all();
    
    // Tickets by priority
    const ticketsByPriority = db.prepare(`
      SELECT priority, COUNT(*) as count
      FROM tickets
      GROUP BY priority
    `).all();
    
    // Average first response time
    const avgFirstResponse = db.prepare(`
      SELECT AVG(
        CASE 
          WHEN first_response_at IS NOT NULL 
          THEN (julianday(first_response_at) - julianday(created_at)) * 24
          ELSE NULL
        END
      ) as avg_hours
      FROM tickets
      WHERE first_response_at IS NOT NULL
    `).get() as any;
    
    // Average resolution time
    const avgResolution = db.prepare(`
      SELECT AVG(
        CASE 
          WHEN resolved_at IS NOT NULL 
          THEN (julianday(resolved_at) - julianday(created_at)) * 24
          ELSE NULL
        END
      ) as avg_hours
      FROM tickets
      WHERE resolved_at IS NOT NULL
    `).get() as any;
    
    // SLA compliance - First Response
    const firstResponseSLA = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE 
          WHEN first_response_at IS NOT NULL 
            AND (julianday(first_response_at) - julianday(created_at)) * 24 <= ?
          THEN 1 
          ELSE 0 
        END) as within_sla
      FROM tickets
      WHERE first_response_at IS NOT NULL
    `).get(slaConfig.first_response_hours) as any;
    
    // SLA compliance - Resolution
    const resolutionSLA = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE 
          WHEN resolved_at IS NOT NULL 
            AND (julianday(resolved_at) - julianday(created_at)) * 24 <= ?
          THEN 1 
          ELSE 0 
        END) as within_sla
      FROM tickets
      WHERE resolved_at IS NOT NULL
    `).get(slaConfig.resolution_hours) as any;
    
    // Tickets created per day (last 30 days)
    const ticketsPerDay = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM tickets
      WHERE created_at >= DATE('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all();
    
    // Top senders
    const topSenders = db.prepare(`
      SELECT 
        sender_email,
        sender_name,
        COUNT(*) as ticket_count
      FROM tickets
      GROUP BY sender_email
      ORDER BY ticket_count DESC
      LIMIT 10
    `).all();
    
    res.json({
      slaConfig,
      ticketsByStatus,
      ticketsByPriority,
      averageFirstResponseHours: avgFirstResponse.avg_hours || 0,
      averageResolutionHours: avgResolution.avg_hours || 0,
      firstResponseSLA: {
        total: firstResponseSLA.total,
        withinSLA: firstResponseSLA.within_sla,
        percentage: firstResponseSLA.total > 0 
          ? (firstResponseSLA.within_sla / firstResponseSLA.total * 100).toFixed(2)
          : 0
      },
      resolutionSLA: {
        total: resolutionSLA.total,
        withinSLA: resolutionSLA.within_sla,
        percentage: resolutionSLA.total > 0 
          ? (resolutionSLA.within_sla / resolutionSLA.total * 100).toFixed(2)
          : 0
      },
      ticketsPerDay,
      topSenders
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

export default router;
