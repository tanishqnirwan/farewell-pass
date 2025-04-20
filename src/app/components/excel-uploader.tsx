// src/components/excel-uploader.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import * as XLSX from 'xlsx';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ExcelUploaderProps {
  onDataParsed: (data: any[]) => void;
}

interface ExcelRow {
  name: string;
  email: string;
  roll_number: string;
  class_section?: string;
}

export function ExcelUploader({ onDataParsed }: ExcelUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      // Parse Excel file
      const data = await readExcel(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        
        // Validate the data structure
        const validationResult = validateExcelData(data);
        if (!validationResult.isValid) {
          setError(validationResult.error || "Invalid Excel format. Please ensure your file contains the required columns.");
          return;
        }
        
        onDataParsed(data);
      }, 500);
      
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      setError("Failed to parse Excel file. Please try again with a valid format.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const readExcel = (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
            raw: false,
            defval: '', // Default value for empty cells
          });
          
          // Clean up the data
          const cleanedData = jsonData.map((row: ExcelRow) => ({
            name: String(row.name || '').trim(),
            email: String(row.email || '').trim().toLowerCase(),
            roll_number: String(row.roll_number || '').trim(),
            class_section: String(row.class_section || '').trim()
          }));
          
          console.log('Parsed Excel data:', cleanedData); // Debug log
          resolve(cleanedData);
        } catch (error) {
          console.error("Error processing Excel file:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };
  
  const validateExcelData = (data: any[]): { isValid: boolean; error?: string } => {
    if (data.length === 0) {
      return { isValid: false, error: "The Excel file is empty" };
    }
    
    // Check if the first row has the required fields
    const firstRow = data[0];
    if (!firstRow.name || !firstRow.email || !firstRow.roll_number) {
      return { 
        isValid: false, 
        error: "Missing required columns. Please ensure your file contains: name, email, and roll_number" 
      };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = data.filter(row => !emailRegex.test(row.email));
    if (invalidEmails.length > 0) {
      return { 
        isValid: false, 
        error: `Found ${invalidEmails.length} invalid email addresses. Please check your data.` 
      };
    }
    
    return { isValid: true };
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="border-dashed border-2 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Student Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload an Excel file (.xlsx or .xls) with student information
          </p>
          
          <div className="w-full max-w-md">
            {isUploading ? (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">
                  {uploadProgress === 100 ? "Processing file..." : "Uploading..."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full relative cursor-pointer"
                  disabled={isUploading}
                >
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    onClick={(e) => {
                      // Reset file input value to allow re-uploading the same file
                      (e.target as HTMLInputElement).value = '';
                    }}
                  />
                  <Upload className="mr-2 h-4 w-4" />
                  Select Excel File
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Excel Format Requirements:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Required columns: name, email, roll_number</li>
                    <li>Optional columns: class_section</li>
                    <li>Excel file (.xlsx or .xls) format</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}