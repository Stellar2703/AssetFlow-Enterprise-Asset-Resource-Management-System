const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');

// Import MVC routes
const authRoutes = require('./routes/authRoutes');
const orgRoutes = require('./routes/orgRoutes');
const assetRoutes = require('./routes/assetRoutes');
const transferRoutes = require('./routes/transferRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const auditRoutes = require('./routes/auditRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'MySQL' });
});

// Bind MVC routes
app.use('/api/auth', authRoutes);
app.use('/api', orgRoutes);
app.use('/api', assetRoutes);
app.use('/api', transferRoutes);
app.use('/api', bookingRoutes);
app.use('/api', maintenanceRoutes);
app.use('/api', auditRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Bootstrap Database and Start Server
async function startServer() {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`AssetFlow MVC Express server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Error: The server is not able to connect to the database.');
    console.error('Please ensure your MySQL instance is running and configured correctly.');
    console.error('Database connection error details:', err.message);
    process.exit(1);
  }
}

startServer();
