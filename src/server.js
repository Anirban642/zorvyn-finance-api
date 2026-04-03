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

// ============================================
// TEMPORARY: Database setup endpoint
// ⚠️ REMOVE THIS AFTER FIRST SUCCESSFUL USE!
// ============================================
app.post('/admin/setup-database', async (req, res) => {
  const { secret } = req.body;
  
  // Simple protection
  if (secret !== 'setup-finance-db-2026') {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid secret' 
    });
  }
  
  try {
    console.log('🔄 Starting database setup...');
    
    const fs = require('fs');
    const path = require('path');
    const pool = require('./config/database');
    const bcrypt = require('bcryptjs');
    
    // Step 1: Create schema
    console.log('📋 Creating schema...');
    const schemaPath = path.join(__dirname, 'config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Schema created');
    
    // Step 2: Create users
    console.log('👥 Creating users...');
    
    // Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (email, password, full_name, role_id, is_active)
      VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'admin'), true)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@finance.com', adminPassword, 'Admin User']);
    
    // Analyst user
    const analystPassword = await bcrypt.hash('analyst123', 10);
    await pool.query(`
      INSERT INTO users (email, password, full_name, role_id, is_active)
      VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'analyst'), true)
      ON CONFLICT (email) DO NOTHING
    `, ['analyst@finance.com', analystPassword, 'Analyst User']);
    
    // Viewer user
    const viewerPassword = await bcrypt.hash('viewer123', 10);
    await pool.query(`
      INSERT INTO users (email, password, full_name, role_id, is_active)
      VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'viewer'), true)
      ON CONFLICT (email) DO NOTHING
    `, ['viewer@finance.com', viewerPassword, 'Viewer User']);
    
    console.log('✅ Users created');
    
    // Step 3: Create sample records
    console.log('💰 Creating sample records...');
    const adminUser = await pool.query(`SELECT id FROM users WHERE email = 'admin@finance.com'`);
    
    if (adminUser.rows.length > 0) {
      const userId = adminUser.rows[0].id;
      
      const sampleRecords = [
        { amount: 5000, type: 'income', category: 'Salary', description: 'Monthly salary', date: '2026-03-01' },
        { amount: 1500, type: 'expense', category: 'Rent', description: 'Monthly rent payment', date: '2026-03-05' },
        { amount: 200, type: 'expense', category: 'Groceries', description: 'Weekly groceries', date: '2026-03-10' },
        { amount: 300, type: 'income', category: 'Freelance', description: 'Website project', date: '2026-03-15' },
        { amount: 100, type: 'expense', category: 'Utilities', description: 'Electricity bill', date: '2026-03-20' },
        { amount: 50, type: 'expense', category: 'Entertainment', description: 'Movie tickets', date: '2026-03-25' },
      ];
      
      for (const record of sampleRecords) {
        await pool.query(`
          INSERT INTO financial_records (user_id, amount, type, category, description, date)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [userId, record.amount, record.type, record.category, record.description, record.date]);
      }
      
      console.log('✅ Sample records created');
    }
    
    res.json({ 
      success: true, 
      message: 'Database initialized successfully!',
      warning: '⚠️ REMOVE /admin/setup-database ENDPOINT NOW!',
      users_created: [
        'admin@finance.com / admin123',
        'analyst@finance.com / analyst123',
        'viewer@finance.com / viewer123'
      ]
    });
    
  } catch (error) {
    console.error('❌ Setup error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// ============================================
// END OF TEMPORARY SETUP ENDPOINT
// ============================================

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