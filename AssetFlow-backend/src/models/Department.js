const { query } = require('../config/db');
const crypto = require('node:crypto');

class Department {
  static async getAll() {
    return query('SELECT * FROM departments');
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM departments WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ name, parentDepartmentId = null, headId = null, status = 'Active' }) {
    const id = 'd-' + crypto.randomBytes(8).toString('hex');
    await query(
      'INSERT INTO departments (id, name, parentDepartmentId, headId, status) VALUES (?, ?, ?, ?, ?)',
      [id, name, parentDepartmentId || null, headId || null, status]
    );
    return id;
  }

  static async update(id, { name, parentDepartmentId, headId, status }) {
    await query(
      'UPDATE departments SET name = ?, parentDepartmentId = ?, headId = ?, status = ? WHERE id = ?',
      [name, parentDepartmentId, headId, status, id]
    );
  }

  static async setHead(id, headId) {
    await query('UPDATE departments SET headId = ? WHERE id = ?', [headId, id]);
  }
}

module.exports = Department;
