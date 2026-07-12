const { query } = require('../config/db');
const crypto = require('node:crypto');

class Audit {
  static async getAll() {
    const rows = await query('SELECT * FROM audit_cycles');
    return rows.map(r => ({
      ...r,
      auditorIds: r.auditorIds ? r.auditorIds.split(',') : [],
      auditItems: [] 
    }));
  }

  static async getCycleDetails(id) {
    const rows = await query('SELECT * FROM audit_cycles WHERE id = ?', [id]);
    if (!rows[0]) return null;
    const items = await query('SELECT * FROM audit_items WHERE auditCycleId = ?', [id]);
    return {
      ...rows[0],
      auditorIds: rows[0].auditorIds ? rows[0].auditorIds.split(',') : [],
      auditItems: items
    };
  }

  static async create({ name, scopeType, scopeValue, startDate, endDate, auditorIds }) {
    const id = 'aud-' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    const auditorsStr = auditorIds.join(',');
    await query(
      'INSERT INTO audit_cycles (id, name, scopeType, scopeValue, startDate, endDate, auditorIds, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, "Active", ?)',
      [id, name, scopeType, scopeValue || '', startDate, endDate, auditorsStr, now]
    );
    return id;
  }

  static async logItem(auditCycleId, { assetId, auditorId, status, notes }) {
    const id = 'ai-' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    
    await query('DELETE FROM audit_items WHERE auditCycleId = ? AND assetId = ?', [auditCycleId, assetId]);
    
    await query(
      'INSERT INTO audit_items (id, auditCycleId, assetId, auditorId, checkedAt, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, auditCycleId, assetId, auditorId, now, status, notes || '']
    );
  }

  static async closeCycle(id) {
    await query('UPDATE audit_cycles SET status = "Completed" WHERE id = ?', [id]);
  }
}

module.exports = Audit;
