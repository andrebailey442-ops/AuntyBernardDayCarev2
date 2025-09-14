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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { STUDENTS, GRADES } from '@/lib/data';
import type { Grade, Student, GradeCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const gradeCategories: GradeCategory[] = ['daily', 'projects', 'tests', 'quizzes'];

export default function GradeManager() {
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(STUDENTS[0]);
  const [studentGrades, setStudentGrades] = React.useState<Grade[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (selectedStudent) {
      setStudentGrades(GRADES.filter((g) => g.studentId === selectedStudent.id));
    }
  }, [selectedStudent]);

  const handleSelectStudent = (studentId: string) => {
    const student = STUDENTS.find((s) => s.id === studentId);
    setSelectedStudent(student || null);
  };

  const handleAddGrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newGrade = {
        id: `g${Date.now()}`,
        studentId: selectedStudent!.id,
        subject: formData.get('subject') as string,
        category: formData.get('category') as GradeCategory,
        grade: formData.get('grade') as Grade['grade'],
        date: new Date().toISOString().split('T')[0],
        notes: formData.get('notes') as string,
    }
    setStudentGrades(prev => [...prev, newGrade]);
    setIsDialogOpen(false);
    toast({
        title: "Grade Added",
        description: `A new grade for ${newGrade.subject} has been added for ${selectedStudent!.name}.`
    });
  }

  const renderGradesTable = (grades: Grade[]) => {
    if (grades.length === 0) {
      return <p className="text-muted-foreground text-center py-8">No grades in this category yet.</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grades.map((grade) => (
            <TableRow key={grade.id}>
              <TableCell className="font-medium">{grade.subject}</TableCell>
              <TableCell>
                <Badge>{grade.grade}</Badge>
              </TableCell>
              <TableCell>{grade.date}</TableCell>
              <TableCell>{grade.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="mb-4 md:mb-0">
                <CardTitle>Grade Management</CardTitle>
                <CardDescription>
                    View and record student grades.
                </CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <Select
                    onValueChange={handleSelectStudent}
                    defaultValue={selectedStudent?.id}
                >
                    <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                    {STUDENTS.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                        {student.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={!selectedStudent}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Grade
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Grade for {selectedStudent?.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddGrade} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" name="subject" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select name="category" required>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradeCategories.map(cat => <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="grade">Grade</Label>
                                <Select name="grade" required>
                                    <SelectTrigger id="grade">
                                        <SelectValue placeholder="Select grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['A', 'B', 'C', 'D', 'F', 'Incomplete'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" name="notes" placeholder="Optional notes..."/>
                            </div>
                            <Button type="submit" className="w-full">Save Grade</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedStudent ? (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {gradeCategories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all" className="mt-4">
                {renderGradesTable(studentGrades)}
            </TabsContent>
            {gradeCategories.map(cat => (
                <TabsContent key={cat} value={cat} className="mt-4">
                    {renderGradesTable(studentGrades.filter(g => g.category === cat))}
                </TabsContent>
            ))}
          </Tabs>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Please select a student to view their grades.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
