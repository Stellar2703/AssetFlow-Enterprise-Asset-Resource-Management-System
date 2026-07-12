const { query } = require('../config/db');
const crypto = require('node:crypto');

class Allocation {
  static async getAll() {
    return query('SELECT * FROM allocations');
  }

  static async findActiveByAssetId(assetId) {
    const rows = await query('SELECT * FROM allocations WHERE assetId = ? AND status = "Active"', [assetId]);
    return rows[0] || null;
  }

  static async create({ assetId, allocatedToType, allocatedToId, allocatedById, expectedReturnDate = null }) {
    const id = 'all-' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    await query(
      'INSERT INTO allocations (id, assetId, allocatedToType, allocatedToId, allocatedById, allocationDate, expectedReturnDate, actualReturnDate, returnCondition, returnNotes, status) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, "Active")',
      [id, assetId, allocatedToType, allocatedToId, allocatedById, now, expectedReturnDate || null]
    );
    return id;
  }

  static async close(id, { returnCondition, returnNotes }) {
    const now = new Date().toISOString();
    await query(
      'UPDATE allocations SET actualReturnDate = ?, returnCondition = ?, returnNotes = ?, status = "Returned" WHERE id = ?',
      [now, returnCondition, returnNotes, id]
    );
  }
}

module.exports = Allocation;
