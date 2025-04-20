// src/components/student-table.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Badge } from "@/components/ui/badge";
  import { format } from "date-fns";
  
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
  
  interface StudentTableProps {
    students: Student[];
  }
  
  export function StudentTable({ students }: StudentTableProps) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Class/Section</TableHead>
              <TableHead>Pass Status</TableHead>
              <TableHead>Generated On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.roll_number}</TableCell>
                <TableCell>{student.class_section || "-"}</TableCell>
                <TableCell>
                  {student.pass_generated ? (
                    <Badge  className="bg-green-100 text-green-800">
                      Generated
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Generated</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {student.pass_generated_at
                    ? format(new Date(student.pass_generated_at), "MMM dd, yyyy HH:mm")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }