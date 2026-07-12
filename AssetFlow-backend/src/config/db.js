const mysql = require('mysql2/promise');
const crypto = require('node:crypto');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin'
};

let pool = null;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function initDb() {
  console.log('Initializing MySQL Database...');
  
  // 1. Establish temporary connection without database selected to create database
  const connection = await mysql.createConnection(dbConfig);
  await connection.query('CREATE DATABASE IF NOT EXISTS assetflow_db;');
  await connection.end();

  // 2. Setup connection pool for the assetflow_db database
  pool = mysql.createPool({
    ...dbConfig,
    database: 'assetflow_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log('Database pool created. Creating schemas if needed...');

  // 3. Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      passwordHash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      departmentId VARCHAR(50) NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Active',
      createdAt VARCHAR(50) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      headId VARCHAR(50) NULL,
      parentDepartmentId VARCHAR(50) NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Active'
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      customFields TEXT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS assets (
      id VARCHAR(50) PRIMARY KEY,
      tag VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      categoryId VARCHAR(50) NOT NULL,
      serialNumber VARCHAR(100) UNIQUE NOT NULL,
      acquisitionDate VARCHAR(50) NOT NULL,
      acquisitionCost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      \`condition\` VARCHAR(50) NOT NULL,
      location VARCHAR(100) NOT NULL,
      sharedBookable TINYINT(1) NOT NULL DEFAULT 0,
      lifecycleStatus VARCHAR(50) NOT NULL DEFAULT 'Available',
      assignedToEmployeeId VARCHAR(50) NULL,
      assignedToDepartmentId VARCHAR(50) NULL,
      customFieldValues TEXT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS allocations (
      id VARCHAR(50) PRIMARY KEY,
      assetId VARCHAR(50) NOT NULL,
      allocatedToType VARCHAR(50) NOT NULL,
      allocatedToId VARCHAR(50) NOT NULL,
      allocatedById VARCHAR(50) NOT NULL,
      allocationDate VARCHAR(50) NOT NULL,
      expectedReturnDate VARCHAR(50) NULL,
      actualReturnDate VARCHAR(50) NULL,
      returnCondition VARCHAR(50) NULL,
      returnNotes TEXT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Active'
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transfers (
      id VARCHAR(50) PRIMARY KEY,
      assetId VARCHAR(50) NOT NULL,
      fromEmployeeId VARCHAR(50) NULL,
      fromDepartmentId VARCHAR(50) NULL,
      toEmployeeId VARCHAR(50) NULL,
      toDepartmentId VARCHAR(50) NULL,
      requestedById VARCHAR(50) NOT NULL,
      requestedAt VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      resolvedById VARCHAR(50) NULL,
      resolvedAt VARCHAR(50) NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(50) PRIMARY KEY,
      resourceId VARCHAR(50) NOT NULL,
      bookedById VARCHAR(50) NOT NULL,
      bookedForDepartmentId VARCHAR(50) NULL,
      startTime VARCHAR(50) NOT NULL,
      endTime VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Upcoming',
      createdAt VARCHAR(50) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id VARCHAR(50) PRIMARY KEY,
      assetId VARCHAR(50) NOT NULL,
      raisedById VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      priority VARCHAR(20) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      technicianName VARCHAR(100) NULL,
      resolvedNotes TEXT NULL,
      createdAt VARCHAR(50) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_cycles (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      scopeType VARCHAR(50) NOT NULL,
      scopeValue VARCHAR(100) NOT NULL,
      startDate VARCHAR(50) NOT NULL,
      endDate VARCHAR(50) NOT NULL,
      auditorIds TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Active',
      createdAt VARCHAR(50) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_items (
      id VARCHAR(50) PRIMARY KEY,
      auditCycleId VARCHAR(50) NOT NULL,
      assetId VARCHAR(50) NOT NULL,
      auditorId VARCHAR(50) NOT NULL,
      checkedAt VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL,
      notes TEXT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(50) PRIMARY KEY,
      userId VARCHAR(50) NOT NULL,
      title VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      \`read\` TINYINT(1) NOT NULL DEFAULT 0,
      timestamp VARCHAR(50) NOT NULL,
      type VARCHAR(50) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id VARCHAR(50) PRIMARY KEY,
      userId VARCHAR(50) NOT NULL,
      userName VARCHAR(100) NOT NULL,
      userRole VARCHAR(50) NOT NULL,
      action VARCHAR(100) NOT NULL,
      details TEXT NOT NULL,
      timestamp VARCHAR(50) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token VARCHAR(100) PRIMARY KEY,
      userId VARCHAR(50) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Tables verified. Checking if seeding is needed...');

  // 4. Seed database if empty
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (rows[0].count === 0) {
    console.log('Database is empty. Seeding initial data...');
    await seedInitialData();
  } else {
    console.log('Database already has records. Seeding skipped.');
  }
}

async function seedInitialData() {
  const adminId = 'u-admin';
  const priyaId = 'u-priya';
  const rajId = 'u-raj';
  const managerId = 'u-manager';
  const techId = 'u-tech';
  const emp1Id = 'u-emp1';
  const emp2Id = 'u-emp2';

  const engDeptId = 'd-eng';
  const mktDeptId = 'd-mkt';
  const hrDeptId = 'd-hr';
  const finDeptId = 'd-fin';

  const catElecId = 'c-elec';
  const catVehId = 'c-veh';
  const catFurnId = 'c-furn';

  const nowIso = new Date().toISOString();
  const todayStr = nowIso.split('T')[0];

  // Seed Departments
  await pool.query(`
    INSERT INTO departments (id, name, headId, parentDepartmentId, status) VALUES
    ('${engDeptId}', 'Engineering', '${priyaId}', NULL, 'Active'),
    ('${mktDeptId}', 'Marketing', '${rajId}', NULL, 'Active'),
    ('${hrDeptId}', 'Human Resources', NULL, NULL, 'Active'),
    ('${finDeptId}', 'Finance', NULL, NULL, 'Active')
  `);

  // Seed Users
  await pool.query(`
    INSERT INTO users (id, name, email, passwordHash, role, departmentId, status, createdAt) VALUES
    ('${adminId}', 'System Admin', 'admin@assetflow.com', '${hashPassword('admin123')}', 'Admin', NULL, 'Active', '${nowIso}'),
    ('${priyaId}', 'Priya Sharma', 'priya@assetflow.com', '${hashPassword('priya123')}', 'Department Head', '${engDeptId}', 'Active', '${nowIso}'),
    ('${rajId}', 'Raj Patel', 'raj@assetflow.com', '${hashPassword('raj123')}', 'Department Head', '${mktDeptId}', 'Active', '${nowIso}'),
    ('${managerId}', 'Sarah Manager', 'manager@assetflow.com', '${hashPassword('manager123')}', 'Asset Manager', NULL, 'Active', '${nowIso}'),
    ('${techId}', 'John Tech', 'tech@assetflow.com', '${hashPassword('tech123')}', 'Employee', '${engDeptId}', 'Active', '${nowIso}'),
    ('${emp1Id}', 'David Lee', 'employee1@assetflow.com', '${hashPassword('emp1')}', 'Employee', '${engDeptId}', 'Active', '${nowIso}'),
    ('${emp2Id}', 'Emma Watson', 'employee2@assetflow.com', '${hashPassword('emp2')}', 'Employee', '${mktDeptId}', 'Active', '${nowIso}')
  `);

  // Seed Categories
  const customFieldsElec = JSON.stringify([
    { name: 'warrantyPeriod', label: 'Warranty Period (months)', type: 'number' },
    { name: 'brand', label: 'Brand', type: 'string' }
  ]);
  const customFieldsVeh = JSON.stringify([
    { name: 'licensePlate', label: 'License Plate', type: 'string' },
    { name: 'nextService', label: 'Next Service Date', type: 'date' }
  ]);
  const customFieldsFurn = JSON.stringify([
    { name: 'material', label: 'Material', type: 'string' }
  ]);

  await pool.query(`
    INSERT INTO categories (id, name, customFields) VALUES
    ('${catElecId}', 'Electronics', '${customFieldsElec}'),
    ('${catVehId}', 'Vehicles', '${customFieldsVeh}'),
    ('${catFurnId}', 'Furniture', '${customFieldsFurn}')
  `);

  // Seed Assets
  const customVal1 = JSON.stringify({ warrantyPeriod: 36, brand: 'Apple' });
  const customVal2 = JSON.stringify({ warrantyPeriod: 24, brand: 'Lenovo' });
  const customVal3 = JSON.stringify({ licensePlate: 'TSLA-333', nextService: '2026-09-15' });
  const customVal4 = JSON.stringify({ material: 'Oak Wood' });
  const customVal5 = JSON.stringify({ warrantyPeriod: 12, brand: 'Epson' });

  await pool.query(`
    INSERT INTO assets (id, tag, name, categoryId, serialNumber, acquisitionDate, acquisitionCost, \`condition\`, location, sharedBookable, lifecycleStatus, assignedToEmployeeId, assignedToDepartmentId, customFieldValues) VALUES
    ('a-0001', 'AF-0001', 'MacBook Pro 16', '${catElecId}', 'C02F1234MD6M', '2025-01-10', 2499.00, 'Good', 'HQ Room 402', 0, 'Allocated', '${priyaId}', NULL, '${customVal1}'),
    ('a-0002', 'AF-0002', 'ThinkPad X1 Carbon', '${catElecId}', 'PF123456', '2025-03-15', 1899.00, 'New', 'HQ Room 402', 0, 'Allocated', '${emp1Id}', NULL, '${customVal2}'),
    ('a-0003', 'AF-0003', 'Tesla Model 3', '${catVehId}', '5YJ3E1EA5L', '2024-06-20', 39990.00, 'Good', 'Garage Spot 12', 0, 'Allocated', NULL, '${mktDeptId}', '${customVal3}'),
    ('a-0004', 'AF-0004', 'Boardroom B2', '${catFurnId}', 'ROOM-B2', '2023-11-01', 5000.00, 'Good', 'Floor 2', 1, 'Available', NULL, NULL, '${customVal4}'),
    ('a-0005', 'AF-0005', 'Epson 4K Projector', '${catElecId}', 'EPSON-998', '2024-09-01', 999.00, 'Fair', 'IT Desk', 1, 'Under Maintenance', NULL, NULL, '${customVal5}')
  `);

  // Seed Allocations
  await pool.query(`
    INSERT INTO allocations (id, assetId, allocatedToType, allocatedToId, allocatedById, allocationDate, expectedReturnDate, actualReturnDate, returnCondition, returnNotes, status) VALUES
    ('all-1', 'a-0001', 'Employee', '${priyaId}', '${managerId}', '2026-01-10', '2026-08-15', NULL, NULL, NULL, 'Active'),
    ('all-2', 'a-0003', 'Department', '${mktDeptId}', '${managerId}', '2026-01-20', '2026-07-20', NULL, NULL, NULL, 'Active'),
    ('all-3', 'a-0002', 'Employee', '${emp1Id}', '${managerId}', '2026-06-01', '2026-07-05', NULL, NULL, NULL, 'Active')
  `);

  // Seed Bookings
  await pool.query(`
    INSERT INTO bookings (id, resourceId, bookedById, bookedForDepartmentId, startTime, endTime, status, createdAt) VALUES
    ('b-1', 'a-0004', '${priyaId}', '${engDeptId}', '${todayStr}T09:00:00.000Z', '${todayStr}T10:00:00.000Z', 'Completed', '${nowIso}'),
    ('b-2', 'a-0004', '${rajId}', '${mktDeptId}', '${todayStr}T13:00:00.000Z', '${todayStr}T14:00:00.000Z', 'Upcoming', '${nowIso}')
  `);

  // Seed Maintenance
  await pool.query(`
    INSERT INTO maintenance_requests (id, assetId, raisedById, description, priority, status, technicianName, resolvedNotes, createdAt) VALUES
    ('m-1', 'a-0005', '${priyaId}', 'Flickering screen on HDMI input', 'High', 'In Progress', 'John Tech', NULL, '${nowIso}')
  `);

  // Seed Audit
  await pool.query(`
    INSERT INTO audit_cycles (id, name, scopeType, scopeValue, startDate, endDate, auditorIds, status, createdAt) VALUES
    ('aud-1', 'Q3 IT Equipment Audit', 'Department', '${engDeptId}', '2026-07-01', '2026-07-31', '${managerId}', 'Active', '${nowIso}')
  `);
  await pool.query(`
    INSERT INTO audit_items (id, auditCycleId, assetId, auditorId, checkedAt, status, notes) VALUES
    ('ai-1', 'aud-1', 'a-0001', '${managerId}', '${nowIso}', 'Verified', 'In good shape on Priya\\'s desk.'),
    ('ai-2', 'aud-1', 'a-0002', '${managerId}', '${nowIso}', 'Missing', 'Cannot find in HQ Room 402.')
  `);

  // Seed Notifications
  await pool.query(`
    INSERT INTO notifications (id, userId, title, message, \`read\`, timestamp, type) VALUES
    ('n-1', '${priyaId}', 'Asset Allocated', 'MacBook Pro 16 (AF-0001) has been allocated to you.', 0, '${nowIso}', 'allocation'),
    ('n-2', 'Role:Asset Manager', 'New Maintenance Request', 'Priya raised a maintenance request for Projector (AF-0005).', 0, '${nowIso}', 'maintenance')
  `);

  // Seed Logs
  await pool.query(`
    INSERT INTO activity_logs (id, userId, userName, userRole, action, details, timestamp) VALUES
    ('l-1', 'system', 'System', 'System', 'Seed Database', 'Initial MySQL schemas and sample master data populated.', '${nowIso}')
  `);

  console.log('MySQL Seeding completed.');
}

async function query(sql, params) {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDb() first.');
  }
  const [results] = await pool.execute(sql, params);
  return results;
}

module.exports = {
  initDb,
  query,
  hashPassword,
  getPool: () => pool
};
