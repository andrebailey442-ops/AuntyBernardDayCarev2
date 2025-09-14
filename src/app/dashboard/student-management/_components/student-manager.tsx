
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Student } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ReportCardDialog from './report-card-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { getStudents, deleteStudent } from '@/services/students';
import { Skeleton } from '@/components/ui/skeleton';


export default function StudentManager() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [allStudents, setAllStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [dialogContent, setDialogContent] = React.useState<'report' | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchStudents = React.useCallback(async () => {
    setLoading(true);
    const studentList = await getStudents();
    setAllStudents(studentList);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  React.useEffect(() => {
    const results = allStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.includes(searchTerm)
    );
    setFilteredStudents(results);
  }, [searchTerm, allStudents]);

  const handleViewProfile = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const handleEditProfile = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}/edit`);
  };
  
  const handleViewReportPage = (studentId: string) => {
    router.push(`/dashboard/reports/${studentId}`);
  };

  const handleRemoveStudent = async (studentId: string) => {
    const studentToRemove = allStudents.find(s => s.id === studentId);
    if (!studentToRemove) return;

    try {
      await deleteStudent(studentId);
      setAllStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
      toast({
          title: 'Student Removed',
          description: `${studentToRemove.name} has been removed from the system.`,
      });
    } catch (error) {
      console.error("Failed to remove student: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove student.',
      });
    }
  };

  const openDialog = (student: Student, content: 'report') => {
    setSelectedStudent(student);
    setDialogContent(content);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Management</CardTitle>
        <CardDescription>
          Search for students by name or ID to view their profile and reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or ID..."
              className="pl-8 sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <AlertDialog>
          <Dialog onOpenChange={(open) => !open && setDialogContent(null)}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
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
                      <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
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
                      <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewProfile(student.id)}>View Profile</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditProfile(student.id)}>Edit Profile</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DialogTrigger asChild>
                                  <DropdownMenuItem onClick={() => openDialog(student, 'report')}>View Report</DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewReportPage(student.id)}>
                                View Report Card Page
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Student
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                               <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. This will permanently remove {student.name} and all their associated data from the servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveStudent(student.id)}>
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                               </AlertDialogContent>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {selectedStudent && (
              <DialogContent className={dialogContent === 'report' ? 'sm:max-w-3xl' : 'sm:max-w-[425px]'}>
                {dialogContent === 'report' && <ReportCardDialog student={selectedStudent} />}
              </DialogContent>
            )}
          </Dialog>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
