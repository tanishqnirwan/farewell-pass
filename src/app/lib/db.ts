// src/app/lib/db.ts
import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    rejectUnauthorized: false // Required for Aiven PostgreSQL
  }
});

export interface Transaction {
  query: <T extends QueryResultRow>(text: string, params?: any[]) => Promise<QueryResult<T>>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

export async function beginTransaction(): Promise<Transaction> {
  const client = await pool.connect();
  await client.query('BEGIN');
  
  return {
    query: async <T extends QueryResultRow>(text: string, params?: any[]) => {
      return client.query<T>(text, params);
    },
    commit: async () => {
      await client.query('COMMIT');
      client.release();
    },
    rollback: async () => {
      await client.query('ROLLBACK');
      client.release();
    },
  };
}

export async function withTransaction<T>(
  callback: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const transaction = await beginTransaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function executeQuery<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  try {
    return await pool.query<T>(text, params);
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

// Alias for backward compatibility
export const query = executeQuery;

export async function executeQueryWithRetry<T extends QueryResultRow>(
  text: string,
  params?: any[],
  maxRetries = 3
): Promise<QueryResult<T>> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await executeQuery<T>(text, params);
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

export async function getById<T extends QueryResultRow>(
  table: string,
  id: string | number
): Promise<T | null> {
  const result = await executeQuery<T>(
    `SELECT * FROM ${table} WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getAll<T extends QueryResultRow>(
  table: string
): Promise<T[]> {
  const result = await executeQuery<T>(`SELECT * FROM ${table}`);
  return result.rows;
}

// Helper function to check if a table exists
export async function tableExists(tableName: string): Promise<boolean> {
  const result = await executeQuery(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )`,
    [tableName]
  );
  return result.rows[0].exists;
}

// Helper function to initialize the database schema if needed
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if tables exist
    const studentsTableExists = await tableExists('students');
    const passesTableExists = await tableExists('passes');
    
    if (!studentsTableExists || !passesTableExists) {
      console.log('Initializing database schema...');
      
      // Read the schema SQL file
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(process.cwd(), 'src', 'app', 'lib', 'schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute the schema SQL
      await executeQuery(schemaSQL);
      
      console.log('Database schema initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export default pool;