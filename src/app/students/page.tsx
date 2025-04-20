// src/app/students/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, RefreshCw, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";

import { Progress } from "@/components/ui/progress";
import { StudentTable } from "@/app/components/student-table";
import { ExcelUploader } from "@/app/components/excel-uploader";
import { NewStudentsReview } from "@/app/components/new-students-review";

interface Student {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  class_section: string;
  pass_generated: boolean;
  pass_generated_at: string | null;
  qr_code_url: string | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStudents, setNewStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("all-students");
  
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/students");
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Something went wrong while fetching students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelData = (parsedData: any[]) => {
    // Filter out students that already exist in the database
    const existingEmails = new Set(students.map(student => student.email.toLowerCase()));
    const existingRollNumbers = new Set(students.map(student => student.roll_number.toLowerCase()));
    
    const uniqueStudents = parsedData.filter(
      student => 
        !existingEmails.has(student.email.toLowerCase()) && 
        !existingRollNumbers.has(student.roll_number.toLowerCase())
    );
    
    setNewStudents(uniqueStudents);
    setSelectedStudents(uniqueStudents.map(student => student.email));
    setActiveTab("new-students");
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(newStudents.map(student => student.email));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentCheckChange = (email: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, email]);
    } else {
      setSelectedStudents(prev => prev.filter(e => e !== email));
    }
  };

  const handleGeneratePasses = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to generate passes");
      return;
    }

    setIsGenerating(true);
    try {
      const selectedStudentData = newStudents.filter(student => 
        selectedStudents.includes(student.email)
      );

      const response = await fetch("/api/students/generate-passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: selectedStudentData }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Successfully generated and sent passes to ${data.count} students`);
        setNewStudents([]);
        setSelectedStudents([]);
        fetchStudents();
        setActiveTab("all-students");
      } else {
        toast.error(data.message || "Failed to generate passes");
      }
    } catch (error) {
      console.error("Error generating passes:", error);
      toast.error("Something went wrong while generating passes");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.class_section && student.class_section.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Farewell Pass Manager</CardTitle>
          <CardDescription>
            Manage student passes for the farewell event
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all-students">All Students</TabsTrigger>
          <TabsTrigger value="new-students">
            Upload Students
            {newStudents.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {newStudents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-students">
          <Card>
            <CardHeader>
              <CardTitle>Registered Students</CardTitle>
              <CardDescription>
                Students who have been registered for farewell passes
              </CardDescription>
              <div className="flex items-center mt-4">
                <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, roll number or class"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button 
                  variant="outline" 
                  onClick={fetchStudents} 
                  className="ml-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p>Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No students match your search" : "No students registered yet"}
                </div>
              ) : (
                <StudentTable students={filteredStudents} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-students">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Students</CardTitle>
              <CardDescription>
                Upload an Excel file with new student data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {newStudents.length === 0 ? (
                <ExcelUploader onDataParsed={handleExcelData} />
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="select-all" 
                        checked={selectedStudents.length === newStudents.length}
                        onCheckedChange={handleSelectAllChange}
                      />
                      <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                        Select All ({newStudents.length})
                      </label>
                    </div>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setNewStudents([]);
                          setSelectedStudents([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleGeneratePasses}
                        disabled={selectedStudents.length === 0 || isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Generate & Send {selectedStudents.length} Passes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <NewStudentsReview 
                    newStudents={newStudents}
                    selectedStudents={selectedStudents}
                    onStudentCheckChange={handleStudentCheckChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}