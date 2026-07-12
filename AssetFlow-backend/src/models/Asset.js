const { query } = require('../config/db');
const crypto = require('node:crypto');

class Asset {
  static async getAll(filters = {}) {
    const { tag, serialNumber, categoryId, status, location, q } = filters;
    let sql = 'SELECT a.*, c.name as categoryName, ' +
              'CASE ' +
              '  WHEN a.assignedToEmployeeId IS NOT NULL THEN (SELECT u.name FROM users u WHERE u.id = a.assignedToEmployeeId) ' +
              '  WHEN a.assignedToDepartmentId IS NOT NULL THEN (SELECT d.name FROM departments d WHERE d.id = a.assignedToDepartmentId) ' +
              '  ELSE "None" ' +
              'END as assigneeName ' +
              'FROM assets a ' +
              'JOIN categories c ON c.id = a.categoryId WHERE 1=1';
    const params = [];

    if (q) {
      sql += ' AND (LOWER(a.tag) LIKE ? OR LOWER(a.name) LIKE ? OR LOWER(a.serialNumber) LIKE ? OR LOWER(a.location) LIKE ?)';
      const lq = `%${q.toLowerCase()}%`;
      params.push(lq, lq, lq, lq);
    }
    if (tag) {
      sql += ' AND LOWER(a.tag) LIKE ?';
      params.push(`%${tag.toLowerCase()}%`);
    }
    if (serialNumber) {
      sql += ' AND LOWER(a.serialNumber) LIKE ?';
      params.push(`%${serialNumber.toLowerCase()}%`);
    }
    if (categoryId) {
      sql += ' AND a.categoryId = ?';
      params.push(categoryId);
    }
    if (status) {
      sql += ' AND a.lifecycleStatus = ?';
      params.push(status);
    }
    if (location) {
      sql += ' AND LOWER(a.location) LIKE ?';
      params.push(`%${location.toLowerCase()}%`);
    }

    const rows = await query(sql, params);
    return rows.map(r => ({
      ...r,
      sharedBookable: !!r.sharedBookable,
      customFieldValues: r.customFieldValues ? JSON.parse(r.customFieldValues) : {}
    }));
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM assets WHERE id = ?', [id]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      sharedBookable: !!rows[0].sharedBookable,
      customFieldValues: rows[0].customFieldValues ? JSON.parse(rows[0].customFieldValues) : {}
    };
  }

  static async findBySerial(serial) {
    const rows = await query('SELECT * FROM assets WHERE LOWER(serialNumber) = LOWER(?)', [serial]);
    return rows[0] || null;
  }

  static async generateTag() {
    const rows = await query('SELECT tag FROM assets');
    let nextTagNum = 1;
    if (rows.length > 0) {
      const tags = rows.map(a => {
        const parts = a.tag.split('-');
        return parts.length > 1 ? parseInt(parts[1], 10) : 0;
      }).filter(n => !isNaN(n));
      if (tags.length > 0) {
        nextTagNum = Math.max(...tags) + 1;
      }
    }
    return `AF-${nextTagNum.toString().padStart(4, '0')}`;
  }

  static async create({ name, categoryId, serialNumber, acquisitionDate, acquisitionCost, condition, location, sharedBookable, customFieldValues }) {
    const id = 'a-' + crypto.randomBytes(8).toString('hex');
    const tag = await this.generateTag();
    const cfValString = JSON.stringify(customFieldValues || {});
    await query(
      'INSERT INTO assets (id, tag, name, categoryId, serialNumber, acquisitionDate, acquisitionCost, `condition`, location, sharedBookable, lifecycleStatus, assignedToEmployeeId, assignedToDepartmentId, customFieldValues) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "Available", NULL, NULL, ?)',
      [id, tag, name, categoryId, serialNumber, acquisitionDate, acquisitionCost || 0, condition, location, sharedBookable ? 1 : 0, cfValString]
    );
    return id;
  }

  static async updateStatus(id, status, assignedToEmployeeId = null, assignedToDepartmentId = null) {
    await query(
      'UPDATE assets SET lifecycleStatus = ?, assignedToEmployeeId = ?, assignedToDepartmentId = ? WHERE id = ?',
      [status, assignedToEmployeeId, assignedToDepartmentId, id]
    );
  }

  static async updateCondition(id, condition) {
    await query('UPDATE assets SET `condition` = ? WHERE id = ?', [condition, id]);
  }
}

module.exports = Asset;
