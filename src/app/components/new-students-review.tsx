// src/components/new-students-review.tsx
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Student {
  name: string;
  email: string;
  roll_number: string;
  class_section?: string;
}

interface ExistingStudent {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  class_section: string;
  pass_generated: boolean;
  pass_generated_at: string | null;
  qr_code_url: string | null;
}

interface DuplicateInfo {
  student: Student;
  reason: "email" | "roll_number" | "both";
  conflictWith?: ExistingStudent;
}

interface NewStudentsReviewProps {
  newStudents: Student[];
  selectedStudents: string[];
  onStudentCheckChange: (email: string, checked: boolean) => void;
  duplicateInfo?: DuplicateInfo[];
}

export function NewStudentsReview({
  newStudents,
  selectedStudents,
  onStudentCheckChange,
  duplicateInfo = [],
}: NewStudentsReviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    setFilteredStudents(
      newStudents.filter(
        (student) =>
          student.name.toLowerCase().includes(lowerSearch) ||
          student.email.toLowerCase().includes(lowerSearch) ||
          student.roll_number.toLowerCase().includes(lowerSearch) ||
          (student.class_section &&
            student.class_section.toLowerCase().includes(lowerSearch))
      )
    );
  }, [searchTerm, newStudents]);

  // Set filtered students initially
  useEffect(() => {
    setFilteredStudents(newStudents);
  }, [newStudents]);

  // Helper to check if a student is a duplicate
  const isDuplicate = (student: Student) => {
    return duplicateInfo.some(d => d.student.email === student.email);
  };

  // Get duplicate info for a student
  const getDuplicateInfo = (student: Student) => {
    return duplicateInfo.find(d => d.student.email === student.email);
  };

  // Get conflict reason text
  const getConflictReason = (reason: "email" | "roll_number" | "both") => {
    switch(reason) {
      case "email": return "Email already exists";
      case "roll_number": return "Roll number already exists";
      case "both": return "Email and roll number already exist";
      default: return "Duplicate";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Search className="w-4 h-4 mr-2 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredStudents.length > 0 &&
                    filteredStudents.every((student) =>
                      selectedStudents.includes(student.email)
                    )
                  }
                  onCheckedChange={(checked) => {
                    filteredStudents.forEach((student) => {
                      onStudentCheckChange(student.email, !!checked);
                    });
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Class Section</TableHead>
              <TableHead className="w-20">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const duplicate = isDuplicate(student);
                const duplicateInfo = duplicate ? getDuplicateInfo(student) : null;
                
                return (
                  <TableRow 
                    key={student.email}
                    className={duplicate ? "bg-amber-50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.email)}
                        onCheckedChange={(checked) => {
                          onStudentCheckChange(student.email, !!checked);
                        }}
                      />
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell className={duplicate && duplicateInfo?.reason !== "roll_number" ? "text-amber-700 font-medium" : ""}>
                      {student.email}
                    </TableCell>
                    <TableCell className={duplicate && duplicateInfo?.reason !== "email" ? "text-amber-700 font-medium" : ""}>
                      {student.roll_number}
                    </TableCell>
                    <TableCell>{student.class_section || "-"}</TableCell>
                    <TableCell>
                      {duplicate && duplicateInfo && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center text-amber-600 text-xs">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Duplicate
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getConflictReason(duplicateInfo.reason)}</p>
                              {duplicateInfo.conflictWith && (
                                <p className="text-xs mt-1">
                                  Conflicts with: {duplicateInfo.conflictWith.name}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}