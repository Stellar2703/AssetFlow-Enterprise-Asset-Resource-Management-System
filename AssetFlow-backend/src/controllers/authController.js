const User = require('../models/User');
const Department = require('../models/Department');
const Log = require('../models/Log');
const Notification = require('../models/Notification');
const { query, hashPassword } = require('../config/db');
const crypto = require('node:crypto');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = await User.create({ name, email, password });
    await Log.create({
      userId,
      userName: name,
      userRole: 'Employee',
      action: 'User Signup',
      details: 'Registered a new employee account.'
    });

    res.status(201).json({ message: 'Registration successful. Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ error: 'Your account is inactive. Please contact the administrator.' });
    }

    const token = 't-' + crypto.randomBytes(16).toString('hex');
    await query('INSERT INTO sessions (token, userId) VALUES (?, ?)', [token, user.id]);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    await query('DELETE FROM sessions WHERE token = ?', [req.token]);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.me = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      departmentId: req.user.departmentId
    }
  });
};

exports.employeesList = async (req, res) => {
  try {
    const employees = await User.getAll();
    const depts = await Department.getAll();
    
    const list = employees.map(u => {
      const dept = depts.find(d => d.id === u.departmentId);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        departmentId: u.departmentId,
        departmentName: dept ? dept.name : 'Unassigned',
        status: u.status,
        createdAt: u.createdAt
      };
    });
    
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.promote = async (req, res) => {
  try {
    const { employeeId, role, departmentId, status } = req.body;
    if (!employeeId || !role) {
      return res.status(400).json({ error: 'Employee ID and role are required' });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await User.updateRoleAndDept(employeeId, role, departmentId, status || employee.status);

    if (role === 'Department Head' && departmentId) {
      await Department.setHead(departmentId, employeeId);
    }

    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Update Employee Role/Status',
      details: `Modified ${employee.name} - Role: ${employee.role} -> ${role}, Status: ${status}`
    });

    await Notification.create({
      userId: employeeId,
      title: 'Profile Updated',
      message: `Your profile has been updated by Admin. New Role: ${role}.`,
      type: 'profile'
    });

    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
