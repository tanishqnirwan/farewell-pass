// src/app/lib/models.ts

export interface Student {
    id: number;
    name: string;
    email: string;
    class?: string;
    roll_number?: string;
    pass_generated: boolean;
    pass_sent: boolean;
    pass_used: boolean;
    qr_code?: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Pass {
    id: number;
    student_id: number;
    pass_code: string;
    is_valid: boolean;
    scanned_at?: Date;
    status: 'active' | 'used' | 'expired' | 'revoked';
    created_at: Date;
  }
  
  export interface ExcelRow {
    name: string;
    email: string;
    class?: string;
    roll_number?: string;
  }

  export interface PassValidationRequest {
    passId: number;
    passCode: string;
  }

  export interface PassValidationResponse {
    valid: boolean;
    message: string;
    studentName?: string;
    studentEmail?: string;
    studentClass?: string;
    studentRollNumber?: string;
    scannedAt?: string;
  }

  export interface PassGenerationRequest {
    studentIds: number[];
  }

  export interface PassGenerationResponse {
    success: Array<{
      studentId: number;
      passId: number;
    }>;
    failed: Array<{
      studentId: number;
      reason: string;
    }>;
  }

  export interface PassSendingRequest {
    studentIds: number[];
    emailConfig?: {
      email: string;
      password: string;
    };
  }

  export interface PassSendingResponse {
    success: boolean;
    message: string;
    sentPasses: number;
    failedPasses: number;
    details: {
      studentId: number;
      success: boolean;
      message: string;
    }[];
  }

  export interface StudentImportRequest {
    students: ExcelRow[];
  }

  export interface StudentImportResponse {
    success: boolean;
    message: string;
    totalStudents: number;
    newStudents: number;
    updatedStudents: number;
    students: Student[];
  }