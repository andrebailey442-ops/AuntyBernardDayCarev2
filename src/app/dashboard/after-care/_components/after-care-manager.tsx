
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
import { getStudents } from '@/services/students';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn, LogOut, Users } from 'lucide-react';
import { format } from 'date-fns';

type AfterCareStatus = 'Checked-In' | 'Checked-Out';

type AfterCareRecord = {
  status: AfterCareStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
};

type StudentStatus = {
  [studentId: string]: AfterCareRecord;
};

export default function AfterCareManager() {
  const { toast } = useToast();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [studentStatuses, setStudentStatuses] = React.useState<StudentStatus>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const allStudents = await getStudents();
      const afterCareStudents = allStudents.filter(student => student.afterCare);
      setStudents(afterCareStudents);
      
      const initialStatuses: StudentStatus = {};
      afterCareStudents.forEach(student => {
        initialStatuses[student.id] = { status: 'Checked-Out' };
      });
      setStudentStatuses(initialStatuses);

      setLoading(false);
    };
    fetchStudents();
  }, []);

  const handleToggleStatus = (studentId: string) => {
    const currentRecord = studentStatuses[studentId];
    const now = new Date();
    
    let newRecord: AfterCareRecord;

    if (currentRecord.status === 'Checked-In') {
        newRecord = { ...currentRecord, status: 'Checked-Out', checkOutTime: now };
    } else {
        newRecord = { status: 'Checked-In', checkInTime: now, checkOutTime: undefined }; // Reset checkout time
    }
    
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: newRecord,
    }));

    toast({
      title: `Student ${newRecord.status}`,
      description: `${students.find(s => s.id === studentId)?.name} has been ${newRecord.status.toLowerCase()} at ${format(now, 'p')}.`,
    });
  };
  
  const getStatusVariant = (status: AfterCareStatus) => {
    return status === 'Checked-In' ? 'default' : 'secondary';
  };

  const checkedInCount = Object.values(studentStatuses).filter(s => s.status === 'Checked-In').length;
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
                <TableHead>Check-in Time</TableHead>
                <TableHead>Check-out Time</TableHead>
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
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-10 w-28" /></TableCell>
                        </TableRow>
                    ))
                ) : students.length > 0 ? (
                students.map((student) => {
                    const record = studentStatuses[student.id];
                    return (
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
                        <Badge variant={getStatusVariant(record.status)}>
                            {record.status}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {record.checkInTime ? format(record.checkInTime, 'p') : 'N/A'}
                    </TableCell>
                    <TableCell>
                        {record.checkOutTime ? format(record.checkOutTime, 'p') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button
                            variant={record.status === 'Checked-In' ? 'destructive' : 'default'}
                            onClick={() => handleToggleStatus(student.id)}
                            size="sm"
                        >
                        {record.status === 'Checked-In' ? 
                            <><LogOut className="mr-2 h-4 w-4" />Check Out</> : 
                            <><LogIn className="mr-2 h-4 w-4" />Check In</>
                        }
                        </Button>
                    </TableCell>
                    </TableRow>
                )})
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
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
