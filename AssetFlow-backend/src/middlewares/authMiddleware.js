const { query } = require('../config/db');

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  const token = authHeader.split(' ')[1];
  
  try {
    const sessionRows = await query('SELECT userId FROM sessions WHERE token = ?', [token]);
    if (sessionRows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }
    
    const userId = sessionRows[0].userId;
    const userRows = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (userRows.length === 0 || userRows[0].status === 'Inactive') {
      return res.status(401).json({ error: 'User is inactive or deleted' });
    }
    
    req.user = userRows[0];
    req.token = token;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during auth' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles
};
