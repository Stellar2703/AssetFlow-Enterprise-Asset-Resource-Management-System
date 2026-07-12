const { query } = require('../config/db');
const crypto = require('node:crypto');

class Log {
  static async getAll() {
    return query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100');
  }

  static async create({ userId, userName, userRole, action, details }) {
    const id = 'l-' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    await query(
      'INSERT INTO activity_logs (id, userId, userName, userRole, action, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userId, userName, userRole, action, details, now]
    );
    return id;
  }
}

module.exports = Log;
