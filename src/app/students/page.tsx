// src/app/students/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";

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

interface NewStudent {
  name: string;
  email: string;
  roll_number: string;
  class_section?: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStudents, setNewStudents] = useState<NewStudent[]>([]);
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

  const handleExcelData = (parsedData: NewStudent[]) => {
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
      setSelectedStudents([...selectedStudents, email]);
    } else {
      setSelectedStudents(selectedStudents.filter(e => e !== email));
    }
  };

  const handleGeneratePasses = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/students/generate-passes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentEmails: selectedStudents,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Successfully generated passes for ${selectedStudents.length} students`);
        fetchStudents();
        setNewStudents([]);
        setSelectedStudents([]);
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

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class_section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Students</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStudents}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-students">All Students</TabsTrigger>
          <TabsTrigger value="new-students">New Students</TabsTrigger>
        </TabsList>

        <TabsContent value="all-students" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center w-full max-w-sm">
              <Search className="w-4 h-4 mr-2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <StudentTable students={filteredStudents} />
          )}
        </TabsContent>

        <TabsContent value="new-students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import New Students</CardTitle>
              <CardDescription>
                Upload an Excel file with student information to add them to the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelUploader onDataParsed={handleExcelData} />
            </CardContent>
          </Card>

          {newStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Review New Students</CardTitle>
                <CardDescription>
                  Select the students you want to add to the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={
                          newStudents.length > 0 &&
                          newStudents.every((student) =>
                            selectedStudents.includes(student.email)
                          )
                        }
                        onCheckedChange={handleSelectAllChange}
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Select All
                      </label>
                    </div>
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
                          Generate Passes
                        </>
                      )}
                    </Button>
                  </div>

                  <NewStudentsReview
                    newStudents={newStudents}
                    selectedStudents={selectedStudents}
                    onStudentCheckChange={handleStudentCheckChange}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}