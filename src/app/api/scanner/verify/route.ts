import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { passId, studentId } = await request.json();
    
    if (!passId || !studentId) {
      return NextResponse.json(
        { success: false, message: "Missing pass ID or student ID" },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Check if student exists and has a valid pass
      const studentResult = await client.query(
        `SELECT s.id, s.name, s.email, s.roll_number, s.class_section,
                p.verification_count, p.last_verified_at
         FROM students s
         LEFT JOIN pass_verifications p ON s.id = p.student_id AND p.pass_id = $1
         WHERE s.id = $2 AND s.pass_generated = true`,
        [passId, studentId]
      );
      
      if (studentResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, message: "Invalid pass or student not found" },
          { status: 400 }
        );
      }
      
      const student = studentResult.rows[0];
      
      // Check if pass has already been used
      if (student.verification_count && student.verification_count > 0) {
        const lastVerified = new Date(student.last_verified_at).toLocaleString();
        await client.query('ROLLBACK');
        return NextResponse.json({
          success: false,
          message: `Pass already used at ${lastVerified}`,
          student: {
            name: student.name,
            email: student.email,
            roll_number: student.roll_number
          },
          verification: {
            count: student.verification_count,
            lastVerifiedAt: student.last_verified_at
          }
        }, { status: 400 });
      }
      
      // Record the verification
      const verificationResult = await client.query(
        `INSERT INTO pass_verifications (pass_id, student_id, verification_count, last_verified_at)
         VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (pass_id, student_id)
         DO UPDATE SET 
           verification_count = 1,
           last_verified_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         RETURNING verification_count, last_verified_at`,
        [passId, studentId]
      );
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: "Pass verified successfully",
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          roll_number: student.roll_number,
          class_section: student.class_section
        },
        verification: {
          count: 1,
          lastVerifiedAt: new Date().toISOString()
        }
      });
      
    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error verifying pass:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify pass" },
      { status: 500 }
    );
  }
} 