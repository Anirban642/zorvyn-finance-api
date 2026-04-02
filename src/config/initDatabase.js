const pool = require('./database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database initialization...');
    
    // Read SQL schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await client.query(schema);
    
    console.log('✅ Database schema created successfully!');
    console.log('✅ Default roles inserted!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables created:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Verify roles
    const roles = await client.query('SELECT * FROM roles ORDER BY id');
    console.log('\n👥 Roles available:');
    roles.rows.forEach(role => {
      console.log(`   - ${role.name}: ${role.description}`);
    });
    
    console.log('\n✨ Database initialization complete!\n');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initializeDatabase;