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
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, CheckCircle, Search, AlertCircle } from "lucide-react";
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

interface ExcelRow {
  name: string;
  email: string;
  enrollment: string;
  year: string;
}

interface DuplicateInfo {
  student: NewStudent;
  reason: "email" | "roll_number" | "both";
  conflictWith?: Student;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStudents, setNewStudents] = useState<NewStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("all-students");
  const [showPreview, setShowPreview] = useState(false);
  const [duplicateStudents, setDuplicateStudents] = useState<DuplicateInfo[]>([]);
  const [ignoreExisting, setIgnoreExisting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/students");
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Something went wrong while fetching students");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelData = (parsedData: ExcelRow[]) => {
    // Map Excel data to student format
    const mapped: NewStudent[] = parsedData.map((row) => ({
      name: row.name,
      email: row.email.toLowerCase().trim(),
      roll_number: row.enrollment.trim(),
      class_section: row.year.trim(),
    }));

    // Reset state for new upload
    setDuplicateStudents([]);
    setIgnoreExisting(false);

    // Ensure students array is an array (even if empty)
    const existingStudents = Array.isArray(students) ? students : [];
    
    console.log("Excel data received:", mapped);
    console.log("Existing students:", existingStudents);
    
    // Create maps for faster lookup with detailed info
    const emailMap = new Map<string, Student>();
    const rollMap = new Map<string, Student>();
    
    existingStudents.forEach(student => {
      const email = student.email.toLowerCase().trim();
      const roll = student.roll_number.toLowerCase().trim();
      emailMap.set(email, student);
      rollMap.set(roll, student);
    });

    // Find duplicates with reason
    const duplicates: DuplicateInfo[] = [];
    const uniqueStudents: NewStudent[] = [];

    mapped.forEach(student => {
      const emailLower = student.email.toLowerCase().trim();
      const rollLower = student.roll_number.toLowerCase().trim();
      
      const emailExists = emailMap.has(emailLower);
      const rollExists = rollMap.has(rollLower);
      
      console.log(`Checking student: ${student.name}, Email: ${emailLower}, Roll: ${rollLower}`);
      console.log(`- Email exists: ${emailExists}, Roll exists: ${rollExists}`);
      
      if (emailExists || rollExists) {
        let reason: "email" | "roll_number" | "both" = "both";
        if (emailExists && !rollExists) reason = "email";
        if (!emailExists && rollExists) reason = "roll_number";
        
        duplicates.push({
          student,
          reason,
          conflictWith: emailExists ? emailMap.get(emailLower) : rollMap.get(rollLower)
        });
      } else {
        uniqueStudents.push(student);
      }
    });

    setDuplicateStudents(duplicates);
    setNewStudents(uniqueStudents);
    setSelectedStudents(uniqueStudents.map(s => s.email));
    setActiveTab("new-students");
    
    // Log summary
    console.log("Unique students:", uniqueStudents);
    console.log("Duplicate students:", duplicates);
    
    if (uniqueStudents.length === 0 && duplicates.length === 0) {
      toast.error("No valid student data found in the Excel file");
    } else if (uniqueStudents.length === 0 && duplicates.length > 0) {
      toast.warning(`All ${duplicates.length} students appear to be duplicates`, {
        description: "You can review the conflicts or force-add them anyway."
      });
      setShowPreview(true);
    } else {
      setShowPreview(true);
      if (duplicates.length > 0) {
        toast.warning(`Found ${uniqueStudents.length} new students and ${duplicates.length} potential duplicates`, {
          description: "You can review both new and duplicate students."
        });
      } else {
        toast.success(`Found ${uniqueStudents.length} new students`, {
          description: "You can now review and generate passes."
        });
      }
    }
  };

  const toggleIgnoreExisting = () => {
    const newValue = !ignoreExisting;
    setIgnoreExisting(newValue);
    
    if (newValue) {
      // Include duplicates when ignore is enabled
      const allStudents = [...newStudents, ...duplicateStudents.map(d => d.student)];
      setNewStudents(allStudents);
      setSelectedStudents(allStudents.map(s => s.email));
    } else {
      // Remove duplicates when ignore is disabled
      const uniqueOnly = newStudents.filter(student => 
        !duplicateStudents.some(d => d.student.email === student.email)
      );
      setNewStudents(uniqueOnly);
      setSelectedStudents(uniqueOnly.map(s => s.email));
    }
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(newStudents.map((s) => s.email));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentCheckChange = (email: string, checked: boolean) => {
    setSelectedStudents((prev) =>
      checked ? [...prev, email] : prev.filter((e) => e !== email)
    );
  };

  const handleGeneratePasses = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setIsGenerating(true);
    try {
      const studentsToGenerate = newStudents.filter((s) =>
        selectedStudents.includes(s.email)
      );

      const response = await fetch("/api/students/generate-passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: studentsToGenerate }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Passes generated for ${studentsToGenerate.length} students`);
        fetchStudents();
        setNewStudents([]);
        setSelectedStudents([]);
        setShowPreview(false);
        setActiveTab("all-students");
      } else {
        toast.error(data.message || "Failed to generate passes");
      }
    } catch (err) {
      console.error("Pass generation error:", err);
      toast.error("Something went wrong while generating passes");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearNewStudents = () => {
    setNewStudents([]);
    setSelectedStudents([]);
    setShowPreview(false);
    setDuplicateStudents([]);
    setIgnoreExisting(false);
  };

  const filteredStudents = students.filter((student) =>
    [student.name, student.email, student.roll_number, student.class_section]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Students</h1>
        <Button variant="outline" size="sm" onClick={fetchStudents} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-students">All Students</TabsTrigger>
          <TabsTrigger value="new-students">New Students</TabsTrigger>
        </TabsList>

        <TabsContent value="all-students" className="space-y-4">
          <div className="flex items-center w-full max-w-sm">
            <Search className="w-4 h-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <p className="text-muted-foreground">No students found</p>
            </div>
          ) : (
            <StudentTable students={filteredStudents} />
          )}
        </TabsContent>

        <TabsContent value="new-students" className="space-y-4">
          {!showPreview ? (
            <Card>
              <CardHeader>
                <CardTitle>Import New Students</CardTitle>
                <CardDescription>
                  Upload an Excel file to add new students. The file should contain columns for name, email, enrollment, and year.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExcelUploader onDataParsed={handleExcelData} />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Review New Students</CardTitle>
                    <CardDescription>
                      {newStudents.length} student{newStudents.length !== 1 ? 's' : ''} ready to import
                      {duplicateStudents.length > 0 && !ignoreExisting && 
                        ` (${duplicateStudents.length} potential duplicate${duplicateStudents.length !== 1 ? 's' : ''} hidden)`}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleClearNewStudents}>
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
                          Generate Passes ({selectedStudents.length})
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {duplicateStudents.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800">
                              {duplicateStudents.length} potential duplicate{duplicateStudents.length !== 1 ? 's' : ''} detected
                            </h4>
                            <p className="text-sm text-amber-700 mt-1">
                              {ignoreExisting 
                                ? "Duplicate students are now included in the list below."
                                : "Some students appear to already exist in the system. They are hidden by default."}
                            </p>
                            <div className="mt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={ignoreExisting ? "bg-amber-100" : ""}
                                onClick={toggleIgnoreExisting}
                              >
                                {ignoreExisting ? "Hide Duplicates" : "Show All Students"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={
                          newStudents.length > 0 &&
                          newStudents.every((s) => selectedStudents.includes(s.email))
                        }
                        onCheckedChange={handleSelectAllChange}
                      />
                      <label htmlFor="select-all" className="text-sm font-medium">
                        Select All ({newStudents.length})
                      </label>
                    </div>

                    <NewStudentsReview
                      newStudents={newStudents}
                      selectedStudents={selectedStudents}
                      onStudentCheckChange={handleStudentCheckChange}
                      duplicateInfo={ignoreExisting ? duplicateStudents : []}
                    />
                  </div>
                </CardContent>
                {duplicateStudents.length > 0 && (
                  <CardFooter className="bg-gray-50 border-t px-6 py-4">
                    <div className="space-y-2 text-sm text-gray-500 w-full">
                      <p className="font-medium">Potential duplicates detected by:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {duplicateStudents.some(d => d.reason === "email" || d.reason === "both") && (
                          <li>Email address already exists in the system</li>
                        )}
                        {duplicateStudents.some(d => d.reason === "roll_number" || d.reason === "both") && (
                          <li>Roll number already exists in the system</li>
                        )}
                      </ul>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}