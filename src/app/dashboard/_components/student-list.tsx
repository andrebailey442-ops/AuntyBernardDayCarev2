
'use client';

import * as React from 'react';
import Image from 'next/image';
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
import StudentListActions from './student-list-actions';
import { Skeleton } from '@/components/ui/skeleton';
import type { Student } from '@/lib/types';

type StudentListProps = {
  students: Student[];
  loading: boolean;
};

export default function StudentList({ students, loading }: StudentListProps) {

  const enrolledStudents = React.useMemo(() => {
    return students.filter(s => s.status === 'enrolled');
  }, [students]);

  return (
    <Card className="backdrop-blur-sm bg-card/80">
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
            {loading ? (
                Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))
            ) : enrolledStudents.length > 0 ? (
              enrolledStudents.map((student) => (
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
