
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
import { Badge } from '@/components/ui/badge';
import type { Student } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getStudents, initializeStudentData } from '@/services/students';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, LogIn, LogOut, Users } from 'lucide-react';

type AfterCareStatus = 'Checked-In' | 'Checked-Out';
type StudentStatus = {
  [studentId: string]: AfterCareStatus;
};

export default function AfterCareManager() {
  const { toast } = useToast();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [studentStatuses, setStudentStatuses] = React.useState<StudentStatus>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      initializeStudentData();
      const studentList = await getStudents();
      setStudents(studentList);
      
      // Initialize all students to 'Checked-Out'
      const initialStatuses: StudentStatus = {};
      studentList.forEach(student => {
        initialStatuses[student.id] = 'Checked-Out';
      });
      setStudentStatuses(initialStatuses);

      setLoading(false);
    };
    fetchStudents();
  }, []);

  const handleToggleStatus = (studentId: string) => {
    const currentStatus = studentStatuses[studentId];
    const newStatus: AfterCareStatus = currentStatus === 'Checked-In' ? 'Checked-Out' : 'Checked-In';
    
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: newStatus,
    }));

    toast({
      title: `Student ${newStatus}`,
      description: `${students.find(s => s.id === studentId)?.name} has been ${newStatus.toLowerCase()}.`,
    });
  };
  
  const getStatusVariant = (status: AfterCareStatus) => {
    return status === 'Checked-In' ? 'default' : 'secondary';
  };

  const checkedInCount = Object.values(studentStatuses).filter(s => s === 'Checked-In').length;
  const checkedOutCount = students.length - checkedInCount;

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{students.length}</div>
                    <p className="text-xs text-muted-foreground">
                        Enrolled in after-care program
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Students Checked In</CardTitle>
                    <LogIn className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{checkedInCount}</div>
                     <p className="text-xs text-muted-foreground">
                        Currently present
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Students Checked Out</CardTitle>
                    <LogOut className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{checkedOutCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Have departed for the day
                    </p>
                </CardContent>
            </Card>
        </div>
        <Card>
        <CardHeader>
            <CardTitle>After Care Check-in/Check-out</CardTitle>
            <CardDescription>
            Manage student arrivals and departures for the after-care program.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-10 w-28" /></TableCell>
                        </TableRow>
                    ))
                ) : students.length > 0 ? (
                students.map((student) => (
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
                    <TableCell>
                        <Badge variant={getStatusVariant(studentStatuses[student.id])}>
                        {studentStatuses[student.id]}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button
                            variant={studentStatuses[student.id] === 'Checked-In' ? 'destructive' : 'default'}
                            onClick={() => handleToggleStatus(student.id)}
                            size="sm"
                        >
                        {studentStatuses[student.id] === 'Checked-In' ? 
                            <><LogOut className="mr-2 h-4 w-4" />Check Out</> : 
                            <><LogIn className="mr-2 h-4 w-4" />Check In</>
                        }
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                    No students enrolled in after care.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    </div>
  );
}
