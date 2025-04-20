import { Pool } from 'pg';
import { initializeDatabase } from './db';
import fs from 'fs';
import path from 'path';

// Create a new pool for this script
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database reset...');
    
    // Read the schema SQL file
    const schemaPath = path.join(process.cwd(), 'src', 'app', 'lib', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema SQL
    await client.query(schemaSQL);
    
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the reset if this file is run directly
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('Database reset completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database reset failed:', error);
      process.exit(1);
    });
}

export { resetDatabase }; 