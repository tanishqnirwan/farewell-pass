// src/app/api/students/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          id, name, email, roll_number, class_section, 
          pass_generated, pass_generated_at, qr_code_url
        FROM 
          students
        ORDER BY 
          created_at DESC
      `);
      
      return NextResponse.json({
        success: true,
        students: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.name || !data.email || !data.roll_number) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    try {
      // Check if student already exists with the same email or roll number
      const checkResult = await client.query(
        `SELECT id FROM students WHERE email = $1 OR roll_number = $2`,
        [data.email, data.roll_number]
      );
      
      if (checkResult.rowCount !== null && checkResult.rowCount > 0) {
        return NextResponse.json(
          { success: false, message: "Student with this email or roll number already exists" },
          { status: 400 }
        );
      }
      
      // Insert new student
      const result = await client.query(
        `INSERT INTO students (name, email, roll_number, class_section) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id`,
        [data.name, data.email, data.roll_number, data.class_section || null]
      );
      
      return NextResponse.json({
        success: true,
        id: result.rows[0].id,
        message: "Student added successfully"
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add student" },
      { status: 500 }
    );
  }
}