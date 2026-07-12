const { query } = require('../config/db');
const Asset = require('../models/Asset');
const Department = require('../models/Department');
const Category = require('../models/Category');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');

exports.getAnalytics = async (req, res) => {
  try {
    
    const statusCounts = {
      Available: 0,
      Allocated: 0,
      Reserved: 0,
      'Under Maintenance': 0,
      Lost: 0,
      Retired: 0,
      Disposed: 0
    };
    const statusRows = await query('SELECT lifecycleStatus, COUNT(*) as count FROM assets GROUP BY lifecycleStatus');
    statusRows.forEach(row => {
      if (statusCounts[row.lifecycleStatus] !== undefined) {
        statusCounts[row.lifecycleStatus] = row.count;
      }
    });

    const depts = await Department.getAll();
    const deptAllocations = {};
    depts.forEach(d => {
      deptAllocations[d.name] = 0;
    });
    deptAllocations['Unassigned (Employees)'] = 0;

    const directDeptRows = await query(`
      SELECT d.name, COUNT(*) as count 
      FROM assets a 
      JOIN departments d ON d.id = a.assignedToDepartmentId 
      WHERE a.lifecycleStatus = 'Allocated' 
      GROUP BY d.name
    `);
    directDeptRows.forEach(row => {
      if (deptAllocations[row.name] !== undefined) {
        deptAllocations[row.name] += row.count;
      }
    });

    const indirectDeptRows = await query(`
      SELECT d.name, COUNT(*) as count 
      FROM assets a 
      JOIN users u ON u.id = a.assignedToEmployeeId 
      JOIN departments d ON d.id = u.departmentId 
      WHERE a.lifecycleStatus = 'Allocated' 
      GROUP BY d.name
    `);
    indirectDeptRows.forEach(row => {
      if (deptAllocations[row.name] !== undefined) {
        deptAllocations[row.name] += row.count;
      }
    });

    const unassignedRows = await query(`
      SELECT COUNT(*) as count 
      FROM assets a 
      JOIN users u ON u.id = a.assignedToEmployeeId 
      WHERE a.lifecycleStatus = 'Allocated' AND u.departmentId IS NULL
    `);
    if (unassignedRows[0]) {
      deptAllocations['Unassigned (Employees)'] = unassignedRows[0].count;
    }

    const maintenanceFreq = {};
    const categories = await Category.getAll();
    categories.forEach(c => {
      maintenanceFreq[c.name] = 0;
    });

    const maintRows = await query(`
      SELECT c.name, COUNT(*) as count 
      FROM maintenance_requests m 
      JOIN assets a ON a.id = m.assetId 
      JOIN categories c ON c.id = a.categoryId 
      GROUP BY c.name
    `);
    maintRows.forEach(row => {
      if (maintenanceFreq[row.name] !== undefined) {
        maintenanceFreq[row.name] = row.count;
      }
    });

    const resourceUsage = {};
    const bookableAssets = await query('SELECT name FROM assets WHERE sharedBookable = 1');
    bookableAssets.forEach(a => {
      resourceUsage[a.name] = 0;
    });

    const bookingUsageRows = await query(`
      SELECT a.name, COUNT(*) as count 
      FROM bookings b 
      JOIN assets a ON a.id = b.resourceId 
      GROUP BY a.name
    `);
    bookingUsageRows.forEach(row => {
      if (resourceUsage[row.name] !== undefined) {
        resourceUsage[row.name] = row.count;
      }
    });

    const bookingHeatmap = Array(24).fill(0);
    const activeBookings = await query('SELECT startTime FROM bookings WHERE status != "Cancelled"');
    activeBookings.forEach(b => {
      const date = new Date(b.startTime);
      const hour = date.getHours();
      if (hour >= 0 && hour < 24) {
        bookingHeatmap[hour]++;
      }
    });

    const nowIso = new Date().toISOString();
    const overdueRows = await query(`
      SELECT COUNT(*) as count 
      FROM allocations 
      WHERE status = 'Active' AND expectedReturnDate IS NOT NULL AND expectedReturnDate < ?
    `, [nowIso]);
    const overdueCount = overdueRows[0]?.count || 0;

    const totalAssetsRows = await query('SELECT COUNT(*) as count FROM assets');
    const totalAssets = totalAssetsRows[0]?.count || 0;

    res.json({
      totalAssets,
      statusCounts,
      deptAllocations,
      maintenanceFreq,
      resourceUsage,
      bookingHeatmap,
      overdueCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
