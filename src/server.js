const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const routes = require('./routes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Backend API is running',
    version: '1.0.0',
    documentation: '/api',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// TEMPORARY: Database setup endpoint
// REMOVE THIS AFTER FIRST USE!
app.post('/admin/setup-database', async (req, res) => {
  const { secret } = req.body;
  
  // Simple protection
  if (secret !== 'setup-finance-db-2026') {
    return res.status(403).json({ error: 'Invalid secret' });
  }
  
  try {
    const fs = require('fs');
    const path = require('path');
    const pool = require('./config/database');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    
    // Run seed data
    const seedDatabase = require('./config/seedData');
    await seedDatabase();
    
    res.json({ 
      success: true, 
      message: 'Database initialized successfully! REMOVE THIS ENDPOINT NOW!' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
});

module.exports = app;