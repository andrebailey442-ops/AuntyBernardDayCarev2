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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { STUDENTS, SUBJECTS } from '@/lib/data';
import type { Student } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function GradeManager() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const { toast } = useToast();

  const handleOpenDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleAddGrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subject = SUBJECTS.find(s => s.id === formData.get('subject'));
    
    if (selectedStudent && subject) {
        toast({
            title: 'Grade Added',
            description: `Grade for ${subject.name} for ${selectedStudent.name} has been recorded.`
        });
    }

    setIsDialogOpen(false);
    setSelectedStudent(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Grade Management</CardTitle>
          <CardDescription>Enter grades for each student.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STUDENTS.map((student) => (
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
                  <TableCell className="text-right">
                    <Button onClick={() => handleOpenDialog(student)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Enter Grade
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Grade for {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddGrade} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select name="subject" required>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select name="grade" required>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {['A', 'B', 'C', 'D', 'F', 'Incomplete'].map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Save Grade
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
