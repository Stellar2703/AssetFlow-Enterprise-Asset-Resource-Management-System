const { query } = require('../config/db');
const crypto = require('node:crypto');

class Maintenance {
  static async getAll() {
    return query(`
      SELECT m.*, 
      a.tag as assetTag, a.name as assetName,
      u.name as requesterName
      FROM maintenance_requests m
      JOIN assets a ON a.id = m.assetId
      JOIN users u ON u.id = m.raisedById
    `);
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM maintenance_requests WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ assetId, raisedById, description, priority }) {
    const id = 'm-' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    await query(
      'INSERT INTO maintenance_requests (id, assetId, raisedById, description, priority, status, technicianName, resolvedNotes, createdAt) VALUES (?, ?, ?, ?, ?, "Pending", NULL, NULL, ?)',
      [id, assetId, raisedById, description, priority, now]
    );
    return id;
  }

  static async updateStatus(id, status) {
    await query('UPDATE maintenance_requests SET status = ? WHERE id = ?', [status, id]);
  }

  static async assignTechnician(id, technicianName) {
    await query(
      'UPDATE maintenance_requests SET status = "Technician Assigned", technicianName = ? WHERE id = ?',
      [technicianName, id]
    );
  }

  static async resolve(id, notes) {
    await query(
      'UPDATE maintenance_requests SET status = "Resolved", resolvedNotes = ? WHERE id = ?',
      [notes, id]
    );
  }
}

module.exports = Maintenance;
