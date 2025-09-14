
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Student, Subject } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';
import { getStudents } from '@/services/students';
import { getSubjects } from '@/services/subjects';
import { getGrades } from '@/services/grades';
import { Skeleton } from '@/components/ui/skeleton';

type GradeState = { [studentId: string]: { [subjectId: string]: string } };

export default function GradeManager() {
  const { toast } = useToast();
  const [grades, setGrades] = React.useState<GradeState>({});
  const [students, setStudents] = React.useState<Student[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const [studentList, subjectList, gradeList] = await Promise.all([
            getStudents(),
            getSubjects(),
            getGrades()
        ]);
        setStudents(studentList);
        setSubjects(subjectList);

        const initialState: GradeState = {};
        studentList.forEach(student => {
          initialState[student.id] = {};
          subjectList.forEach(subject => {
            const gradeRecord = gradeList.find(g => g.studentId === student.id && g.subject === subject.id);
            initialState[student.id][subject.id] = gradeRecord ? gradeRecord.grade : '';
          });
        });
        setGrades(initialState);
        setLoading(false);
    };
    fetchData();
  }, []);

  const handleGradeChange = (studentId: string, subjectId: string, grade: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: grade,
      },
    }));
  };

  const handleSaveAll = () => {
    console.log('Saving grades:', grades);
    toast({
      title: 'Grades Saved',
      description: 'All student grades have been successfully updated.',
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Grade Management</CardTitle>
            <CardDescription>Enter grades for each student across all subjects.</CardDescription>
          </div>
          <Button onClick={handleSaveAll}>
            <Check className="mr-2 h-4 w-4" />
            Save All Grades
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Student</TableHead>
                {subjects.map((subject) => (
                  <TableHead key={subject.id} className="min-w-[150px]">{subject.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-[150px]" />
                            </div>
                        </TableCell>
                        {subjects.map(subject => (
                            <TableCell key={subject.id}><Skeleton className="h-10 w-full" /></TableCell>
                        ))}
                    </TableRow>
                ))
              ) : students.map((student) => (
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
      <div className="font-medium">{student.name}</div>
                    </div>
                  </TableCell>
                  {subjects.map((subject) => (
                    <TableCell key={subject.id}>
                      <Select
                        value={grades[student.id]?.[subject.id] || ''}
                        onValueChange={(value) => handleGradeChange(student.id, subject.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A', 'B', 'C', 'D', 'F', 'Incomplete'].map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
