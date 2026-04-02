const pool = require('./database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await client.query(`
      INSERT INTO users (email, password, full_name, role_id, is_active)
      VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'admin'), true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name;
    `, ['admin@finance.com', hashedPassword, 'Admin User']);
    
    if (adminUser.rows.length > 0) {
      console.log('✅ Admin user created:');
      console.log(`   Email: admin@finance.com`);
      console.log(`   Password: admin123`);
    }
    
    // Create analyst user
    const analystPassword = await bcrypt.hash('analyst123', 10);
    const analystUser = await client.query(`
      INSERT INTO users (email, password, full_name, role_id, is_active)
      VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'analyst'), true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name;
    `, ['analyst@finance.com', analystPassword, 'Analyst User']);
    
    if (analystUser.rows.length > 0) {
      console.log('✅ Analyst user created:');
      console.log(`   Email: analyst@finance.com`);
      console.log(`   Password: analyst123`);
    }
    
    // Create viewer user
    const viewerPassword = await bcrypt.hash('viewer123', 10);
    const viewerUser = await client.query(`
      INSERT INTO users (email, password, full_name, role_id, is_active)
      VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'viewer'), true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name;
    `, ['viewer@finance.com', viewerPassword, 'Viewer User']);
    
    if (viewerUser.rows.length > 0) {
      console.log('✅ Viewer user created:');
      console.log(`   Email: viewer@finance.com`);
      console.log(`   Password: viewer123`);
    }
    
    // Create sample financial records for admin user
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
        await client.query(`
          INSERT INTO financial_records (user_id, amount, type, category, description, date)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [userId, record.amount, record.type, record.category, record.description, record.date]);
      }
      
      console.log('✅ Sample financial records created!');
    }
    
    console.log('\n✨ Database seeding complete!\n');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedDatabase;