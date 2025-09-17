
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
              <TableHead>Student</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="hidden md:table-cell">
                Parent
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
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-3 w-[100px] mt-1" />
                                </div>
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                        <TableCell className="hidden md:table-cell">
                            <div>
                                <Skeleton className="h-4 w-[120px]" />
                                <Skeleton className="h-3 w-[180px] mt-1" />
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))
            ) : enrolledStudents.length > 0 ? (
              enrolledStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Image
                            alt="Student avatar"
                            className="aspect-square rounded-full object-cover"
                            height="40"
                            src={student.avatarUrl}
                            width="40"
                            data-ai-hint={student.imageHint}
                        />
                        <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground font-mono">{student.id}</div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.age}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {student.guardian1 ? (
                      <div>
                          <div className="font-medium">{student.guardian1.firstName} {student.guardian1.lastName}</div>
                          <div className="text-sm text-muted-foreground">{student.guardian1.phone}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">N/A</div>
                    )}
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
