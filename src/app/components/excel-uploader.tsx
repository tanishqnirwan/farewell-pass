// src/components/excel-uploader.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface ExcelUploaderProps {
  onDataParsed: (data: ExcelRow[]) => void;
}

interface ExcelRow {
  name: string;
  email: string;
  enrollment: string;
  year: string;
}

export function ExcelUploader({ onDataParsed }: ExcelUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Invalid file type", {
        description: "Please upload an Excel file (.xlsx or .xls).",
      });
      e.target.value = ""; // Reset file input
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const data = await readExcel(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      const validationResult = validateExcelData(data);

      if (!validationResult.isValid) {
        toast.error("Invalid Excel Data", {
          description: validationResult.error || "Please check your file.",
        });
        resetUpload();
        e.target.value = ""; // Reset file input
        return;
      }

      setTimeout(() => {
        resetUpload();
        onDataParsed(data);
        e.target.value = ""; // Reset file input
      }, 300);
    } catch (err) {
      console.error("Error parsing Excel file:", err);
      toast.error("Parsing Error", {
        description: "Something went wrong while reading the file.",
      });
      resetUpload();
      e.target.value = ""; // Reset file input
    }
  };

  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  const readExcel = (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
            raw: false,
            defval: "",
          });

          const cleanedData = jsonData.map((row) => ({
            name: String(row.name || "").trim(),
            email: String(row.email || "").trim().toLowerCase(),
            enrollment: String(row.enrollment || "").trim(),
            year: String(row.year || "").trim(),
          }));

          resolve(cleanedData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const validateExcelData = (
    data: ExcelRow[]
  ): { isValid: boolean; error?: string } => {
    if (!data.length) return { isValid: false, error: "Excel file is empty." };

    const requiredFields = ["name", "email", "enrollment", "year"];

    // Check if all required fields exist in the first row
    for (const field of requiredFields) {
      if (data[0][field as keyof ExcelRow] === undefined) {
        return {
          isValid: false,
          error: `Missing required column: "${field}". Required columns: ${requiredFields.join(", ")}`,
        };
      }
    }

    // Validate that no rows have empty required fields
    const emptyFieldRows = data.filter(row => 
      requiredFields.some(field => !row[field as keyof ExcelRow])
    );
    
    if (emptyFieldRows.length > 0) {
      return {
        isValid: false,
        error: `Found ${emptyFieldRows.length} row(s) with empty required fields.`,
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = data.filter((r) => !emailRegex.test(r.email));
    if (invalidEmails.length > 0) {
      return {
        isValid: false,
        error: `Found ${invalidEmails.length} invalid email(s).`,
      };
    }

    return { isValid: true };
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Upload Student Data</h3>
            <p className="text-sm text-muted-foreground">
              Expected columns: <strong>name, email, enrollment, year</strong>
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
              <Button variant="outline" className="w-full" disabled={isUploading} asChild>
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