
'use client';

import * as React from 'react';
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
import { Check, Search } from 'lucide-react';
import { getStudents } from '@/services/students';
import { getSubjects } from '@/services/subjects';
import { getGrades, upsertGrade } from '@/services/grades';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

type GradeState = { [studentId: string]: { [subjectId: string]: string } };

export default function GradeManager() {
  const { toast } = useToast();
  const [grades, setGrades] = React.useState<GradeState>({});
  const [allStudents, setAllStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const studentList = await getStudents() || [];
        const subjectList = await getSubjects();
        const gradeList = await getGrades() || [];
        
        setAllStudents(studentList);
        setFilteredStudents(studentList);
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

  React.useEffect(() => {
    const results = allStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(results);
  }, [searchTerm, allStudents]);

  const handleGradeChange = (studentId: string, subjectId: string, grade: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: grade,
      },
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          const grade = grades[studentId][subjectId];
          if (grade) { // Only save if a grade is selected
            await upsertGrade(studentId, subjectId, grade);
          }
        }
      }
      toast({
        title: 'Grades Saved',
        description: 'All student grades have been successfully updated.',
      });
    } catch (error) {
      console.error("Failed to save grades: ", error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save grades.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="mb-4 md:mb-0">
            <CardTitle>Grade Management</CardTitle>
            <CardDescription>Enter grades for each student across all subjects.</CardDescription>
          </div>
          <div className="flex flex-col-reverse md:flex-row items-center gap-4">
            <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name or ID..."
                    className="pl-8 sm:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={handleSaveAll} disabled={saving} className="w-full md:w-auto">
                {saving ? 'Saving...' : <><Check className="mr-2 h-4 w-4" /> Save All Grades</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Student</TableHead>
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
                                <div>
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-3 w-[120px] mt-1" />
                                </div>
                            </div>
                        </TableCell>
                        {subjects.map(subject => (
                            <TableCell key={subject.id}><Skeleton className="h-10 w-full" /></TableCell>
                        ))}
                    </TableRow>
                ))
              ) : filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">{student.id}</div>
                      </div>
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
