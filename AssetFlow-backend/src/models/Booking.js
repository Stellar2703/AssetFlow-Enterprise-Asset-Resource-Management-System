const { query } = require('../config/db');
const crypto = require('node:crypto');

class Booking {
  static async getAll() {
    return query(`
      SELECT b.*, 
      a.name as resourceName, a.tag as resourceTag,
      u.name as bookedByName,
      d.name as departmentName
      FROM bookings b
      JOIN assets a ON a.id = b.resourceId
      JOIN users u ON u.id = b.bookedById
      LEFT JOIN departments d ON d.id = b.bookedForDepartmentId
    `);
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async checkOverlap(resourceId, startTime, endTime) {
    // Find active bookings that overlap with requested range
    // startA < endB && endA > startB
    const rows = await query(`
      SELECT b.*, u.name as bookedByName FROM bookings b
      JOIN users u ON u.id = b.bookedById
      WHERE b.resourceId = ? 
      AND b.status != 'Cancelled'
      AND ? < b.endTime AND ? > b.startTime
    `, [resourceId, startTime, endTime]);
    return rows[0] || null;
  }

  static async create({ resourceId, bookedById, bookedForDepartmentId = null, startTime, endTime }) {
    const id = 'b-' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    await query(
      'INSERT INTO bookings (id, resourceId, bookedById, bookedForDepartmentId, startTime, endTime, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, "Upcoming", ?)',
      [id, resourceId, bookedById, bookedForDepartmentId || null, startTime, endTime, now]
    );
    return id;
  }

  static async cancel(id) {
    await query('UPDATE bookings SET status = "Cancelled" WHERE id = ?', [id]);
  }
}

module.exports = Booking;
