// src/components/excel-uploader.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import * as XLSX from 'xlsx';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ExcelUploaderProps {
  onDataParsed: (data: ExcelRow[]) => void;
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
  
  const validateExcelData = (data: ExcelRow[]): { isValid: boolean; error?: string } => {
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
      
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Upload Student Data</h3>
            <p className="text-sm text-muted-foreground">
              Upload an Excel file (.xlsx or .xls) containing student information
            </p>
          </div>
          
          <div className="w-full max-w-xs">
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <label htmlFor="excel-upload">
              <Button
                variant="outline"
                className="w-full"
                disabled={isUploading}
                asChild
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Processing..." : "Select Excel File"}
                </span>
              </Button>
            </label>
          </div>
          
          {isUploading && (
            <div className="w-full max-w-xs space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress < 100 ? "Processing file..." : "Complete!"}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}