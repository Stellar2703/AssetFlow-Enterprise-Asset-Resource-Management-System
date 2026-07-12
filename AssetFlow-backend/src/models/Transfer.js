const { query } = require('../config/db');
const crypto = require('node:crypto');

class Transfer {
  static async getAll() {
    return query(`
      SELECT t.*, 
      a.tag as assetTag, a.name as assetName,
      ru.name as requesterName,
      CASE WHEN t.fromEmployeeId IS NOT NULL THEN (SELECT name FROM users WHERE id = t.fromEmployeeId)
           WHEN t.fromDepartmentId IS NOT NULL THEN (SELECT name FROM departments WHERE id = t.fromDepartmentId)
           ELSE 'None' END as fromName,
      CASE WHEN t.toEmployeeId IS NOT NULL THEN (SELECT name FROM users WHERE id = t.toEmployeeId)
           WHEN t.toDepartmentId IS NOT NULL THEN (SELECT name FROM departments WHERE id = t.toDepartmentId)
           ELSE 'None' END as toName
      FROM transfers t
      JOIN assets a ON a.id = t.assetId
      JOIN users ru ON ru.id = t.requestedById
    `);
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM transfers WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ assetId, fromEmployeeId, fromDepartmentId, toEmployeeId, toDepartmentId, requestedById }) {
    const id = 'tr-' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    await query(
      'INSERT INTO transfers (id, assetId, fromEmployeeId, fromDepartmentId, toEmployeeId, toDepartmentId, requestedById, requestedAt, status, resolvedById, resolvedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "Pending", NULL, NULL)',
      [id, assetId, fromEmployeeId, fromDepartmentId, toEmployeeId, toDepartmentId, requestedById, now]
    );
    return id;
  }

  static async resolve(id, status, resolvedById) {
    const now = new Date().toISOString();
    await query(
      'UPDATE transfers SET status = ?, resolvedById = ?, resolvedAt = ? WHERE id = ?',
      [status, resolvedById, now, id]
    );
  }
}

module.exports = Transfer;
