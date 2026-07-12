const { query, hashPassword } = require('../config/db');
const crypto = require('node:crypto');

class User {
  static async findById(id) {
    const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    return rows[0] || null;
  }

  static async create({ name, email, password, role = 'Employee', departmentId = null }) {
    const id = 'u-' + crypto.randomBytes(8).toString('hex');
    const passHash = hashPassword(password);
    const now = new Date().toISOString();
    await query(
      'INSERT INTO users (id, name, email, passwordHash, role, departmentId, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, "Active", ?)',
      [id, name, email.toLowerCase(), passHash, role, departmentId, now]
    );
    return id;
  }

  static async getAll() {
    return query('SELECT * FROM users');
  }

  static async updateRoleAndDept(id, role, departmentId, status) {
    await query(
      'UPDATE users SET role = ?, departmentId = ?, status = ? WHERE id = ?',
      [role, departmentId, status, id]
    );
  }
}

module.exports = User;
