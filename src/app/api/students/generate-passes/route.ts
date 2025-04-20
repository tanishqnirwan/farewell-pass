// src/app/api/students/generate-passes/route.ts
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/db";
import { transporter, createEmailTemplate } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { students } = await request.json();
    
    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, message: "No students provided" },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      let successCount = 0;
      let failedCount = 0;
      const results = [];
      
      for (const student of students) {
        if (!student.name || !student.email || !student.roll_number) {
          results.push({
            email: student.email || 'unknown',
            status: 'failed',
            message: 'Missing required fields'
          });
          failedCount++;
          continue;
        }
        
        try {
          // Check if student already exists
          const checkResult = await client.query(
            `SELECT id, pass_generated FROM students WHERE email = $1 OR roll_number = $2`,
            [student.email, student.roll_number]
          );
          
          let studentId;
          
          if (checkResult.rows.length > 0) {
            // Student exists, check if pass is already generated
            const existingStudent = checkResult.rows[0];
            
            if (existingStudent.pass_generated) {
              results.push({
                email: student.email,
                status: 'skipped',
                message: 'Pass already generated'
              });
              continue;
            }
            
            studentId = existingStudent.id;
          } else {
            // Insert new student
            const insertResult = await client.query(
              `INSERT INTO students (name, email, roll_number, class_section) 
               VALUES ($1, $2, $3, $4) 
               RETURNING id`,
              [student.name, student.email, student.roll_number, student.class_section || null]
            );
            
            studentId = insertResult.rows[0].id;
          }
          
          // Generate unique pass ID for QR code
          const passId = uuidv4();
          const qrCodeData = JSON.stringify({
            id: passId,
            studentId,
            name: student.name,
            email: student.email,
            rollNumber: student.roll_number
          });
          
          // Generate QR code with better quality settings
          const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
            width: 500,
            margin: 2,
            errorCorrectionLevel: 'H',
            type: 'image/png',
          });
          
          // Create pass history record first
          const historyResult = await client.query(
            `INSERT INTO pass_history (student_id, generated_at)
             VALUES ($1, CURRENT_TIMESTAMP)
             RETURNING id`,
            [studentId]
          );
          
          const historyId = historyResult.rows[0].id;
          
          // Generate email HTML using the template
          const emailHtml = createEmailTemplate({
            name: student.name,
            email: student.email,
            rollNumber: student.roll_number,
            classSection: student.class_section,
          });
          
          // Send email
          await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
            to: student.email,
            subject: "Your Farewell Pass",
            html: emailHtml,
            attachments: [{
              filename: 'qr-code.png',
              path: qrCodeUrl,
              cid: 'qr-code@farewell' // Content ID for referencing in HTML
            }]
          });
          
          // Only update student record after email is sent successfully
          await client.query(
            `UPDATE students 
             SET pass_generated = true, 
                 pass_generated_at = CURRENT_TIMESTAMP, 
                 qr_code_url = $1
             WHERE id = $2`,
            [qrCodeUrl, studentId]
          );
          
          // Update pass history status
          await client.query(
            `UPDATE pass_history
             SET email_sent_at = CURRENT_TIMESTAMP,
                 email_status = $1
             WHERE id = $2`,
            ["sent", historyId]
          );
          
          results.push({
            email: student.email,
            status: 'success'
          });
          
          successCount++;
        } catch (error) {
          console.error("Error processing student:", student.email, error);
          
          results.push({
            email: student.email,
            status: 'failed',
            message: error instanceof Error ? error.message : 'Unknown error'
          });
          
          failedCount++;
        }
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        summary: {
          total: students.length,
          successful: successCount,
          failed: failedCount
        },
        results
      });
      
    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error generating passes:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to generate passes"
      },
      { status: 500 }
    );
  }
}