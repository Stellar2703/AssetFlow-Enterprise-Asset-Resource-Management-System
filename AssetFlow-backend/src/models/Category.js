const { query } = require('../config/db');
const crypto = require('node:crypto');

class Category {
  static async getAll() {
    const rows = await query('SELECT * FROM categories');
    return rows.map(r => ({
      ...r,
      customFields: r.customFields ? JSON.parse(r.customFields) : []
    }));
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM categories WHERE id = ?', [id]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      customFields: rows[0].customFields ? JSON.parse(rows[0].customFields) : []
    };
  }

  static async create({ name, customFields = [] }) {
    const id = 'c-' + crypto.randomBytes(8).toString('hex');
    const cfString = JSON.stringify(customFields);
    await query(
      'INSERT INTO categories (id, name, customFields) VALUES (?, ?, ?)',
      [id, name, cfString]
    );
    return id;
  }

  static async update(id, { name, customFields }) {
    const cfString = JSON.stringify(customFields);
    await query(
      'UPDATE categories SET name = ?, customFields = ? WHERE id = ?',
      [name, cfString, id]
    );
  }
}

module.exports = Category;
