const { query } = require('../config/db');
const crypto = require('node:crypto');

class Notification {
  static async getByUserId(userId, role) {
    const roleGroup = `Role:${role}`;
    return query(
      'SELECT * FROM notifications WHERE userId = ? OR userId = "All" OR userId = ? ORDER BY timestamp DESC',
      [userId, roleGroup]
    );
  }

  static async create({ userId, title, message, type }) {
    const id = 'n-' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    await query(
      'INSERT INTO notifications (id, userId, title, message, `read`, timestamp, type) VALUES (?, ?, ?, ?, 0, ?, ?)',
      [id, userId, title, message, now, type]
    );
    return id;
  }

  static async markRead(id) {
    await query('UPDATE notifications SET `read` = 1 WHERE id = ?', [id]);
  }
}

module.exports = Notification;
