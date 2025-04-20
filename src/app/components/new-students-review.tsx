// src/components/new-students-review.tsx
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
import { useState } from "react";
import { Search } from "lucide-react";

interface Student {
  name: string;
  email: string;
  roll_number: string;
  class_section?: string;
}

interface NewStudentsReviewProps {
  newStudents: Student[];
  selectedStudents: string[];
  onStudentCheckChange: (email: string, checked: boolean) => void;
}

export function NewStudentsReview({
  newStudents,
  selectedStudents,
  onStudentCheckChange,
}: NewStudentsReviewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = newStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.class_section &&
        student.class_section.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                    newStudents.length > 0 &&
                    newStudents.every((student) =>
                      selectedStudents.includes(student.email)
                    )
                  }
                  onCheckedChange={(checked) => {
                    newStudents.forEach((student) => {
                      onStudentCheckChange(student.email, !!checked);
                    });
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Class Section</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.email}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(student.email)}
                      onCheckedChange={(checked) => {
                        onStudentCheckChange(student.email, !!checked);
                      }}
                    />
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.roll_number}</TableCell>
                  <TableCell>{student.class_section || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}