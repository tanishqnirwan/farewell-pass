import { Pool } from 'pg';

// Create a new pool for this script
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkConnection() {
  const client = await pool.connect();
  
  try {
    console.log('Checking database connection...');
    
    // Execute a simple query to check if the connection is working
    const result = await client.query('SELECT NOW()');
    
    console.log('Database connection successful!');
    console.log('Current database time:', result.rows[0].now);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Existing tables:');
    if (tablesResult.rows.length === 0) {
      console.log('  No tables found');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    client.release();
  }
}

// Execute the check if this file is run directly
if (require.main === module) {
  checkConnection()
    .then((success) => {
      if (success) {
        console.log('Database connection check completed successfully');
        process.exit(0);
      } else {
        console.log('Database connection check failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Database connection check failed:', error);
      process.exit(1);
    });
}

export { checkConnection }; 