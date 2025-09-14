

import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getStudents } from '@/services/students';
import type { Student } from '@/lib/types';
import StudentListActions from './student-list-actions';


export default async function StudentList() {
  const allStudents = await getStudents();
  const students = allStudents.filter(student => student.status !== 'graduated');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students</CardTitle>
        <CardDescription>An overview of all enrolled students.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="hidden md:table-cell">
                Parent Contact
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Student avatar"
                      className="aspect-square rounded-full object-cover"
                      height="64"
                      src={student.avatarUrl}
                      width="64"
                      data-ai-hint={student.imageHint}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.age}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {student.parentContact}
                  </TableCell>
                  <TableCell>
                    <StudentListActions studentId={student.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No students found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
