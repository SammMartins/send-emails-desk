import Database from 'better-sqlite3';

export function logAudit(
  db: Database.Database,
  entityType: string,
  entityId: number,
  action: string,
  user: string,
  changes: any
) {
  try {
    db.prepare(`
      INSERT INTO audit_log (entity_type, entity_id, action, user, changes)
      VALUES (?, ?, ?, ?, ?)
    `).run(entityType, entityId, action, user, JSON.stringify(changes));
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}
