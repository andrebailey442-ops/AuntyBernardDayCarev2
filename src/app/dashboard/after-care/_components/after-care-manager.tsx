
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
import { LogIn, LogOut, Users, Archive, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';


type AfterCareStatus = 'Checked-In' | 'Checked-Out';

type AfterCareRecord = {
  status: AfterCareStatus;
  checkInTime?: string; // Storing as ISO string
  checkOutTime?: string; // Storing as ISO string
  checkedInBy?: string;
  checkedOutBy?: string;
};

type StudentStatus = {
  [studentId: string]: AfterCareRecord;
};

type ArchivedLog = {
    date: string; // YYYY-MM-DD
    records: (Student & { log: AfterCareRecord })[];
}

const AFTER_CARE_STORAGE_KEY = 'afterCareStatuses';
const ARCHIVED_LOGS_STORAGE_KEY = 'afterCareArchivedLogs';

export default function AfterCareManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [studentStatuses, setStudentStatuses] = React.useState<StudentStatus>({});
  const [loading, setLoading] = React.useState(true);
  const [archivedLogs, setArchivedLogs] = React.useState<ArchivedLog[]>([]);

  React.useEffect(() => {
    const fetchStudentsAndLogs = async () => {
      setLoading(true);
      const allStudents = await getStudents();
      const afterCareStudents = allStudents.filter(student => student.afterCare);
      setStudents(afterCareStudents);
      
      const savedStatuses = localStorage.getItem(AFTER_CARE_STORAGE_KEY);
      let initialStatuses: StudentStatus = {};
      if (savedStatuses) {
        initialStatuses = JSON.parse(savedStatuses);
      } else {
        afterCareStudents.forEach(student => {
          initialStatuses[student.id] = { status: 'Checked-Out' };
        });
      }
      setStudentStatuses(initialStatuses);
      
      const savedArchivedLogs = localStorage.getItem(ARCHIVED_LOGS_STORAGE_KEY);
      if (savedArchivedLogs) {
          setArchivedLogs(JSON.parse(savedArchivedLogs));
      }

      setLoading(false);
    };
    fetchStudentsAndLogs();
  }, []);

  const handleToggleStatus = (studentId: string) => {
    const currentRecord = studentStatuses[studentId] || { status: 'Checked-Out' };
    const now = new Date();
    const currentUsername = user?.username || 'Unknown';
    
    let newRecord: AfterCareRecord;
    const studentName = students.find(s => s.id === studentId)?.name || 'Student';

    if (currentRecord.status === 'Checked-In') {
        newRecord = { ...currentRecord, status: 'Checked-Out', checkOutTime: now.toISOString(), checkedOutBy: currentUsername };
        toast({
          title: `Student Checked Out`,
          description: `${studentName} has been checked out at ${format(now, 'p')} by ${currentUsername}.`,
        });
    } else {
        newRecord = { ...currentRecord, status: 'Checked-In', checkInTime: now.toISOString(), checkOutTime: undefined, checkedInBy: currentUsername, checkedOutBy: undefined }; // Reset checkout time
        toast({
          title: `Student Checked In`,
          description: `${studentName} has been checked in at ${format(now, 'p')} by ${currentUsername}.`,
        });
    }
    
    const updatedStatuses = {
      ...studentStatuses,
      [studentId]: newRecord,
    };

    setStudentStatuses(updatedStatuses);
    localStorage.setItem(AFTER_CARE_STORAGE_KEY, JSON.stringify(updatedStatuses));
  };
  
  const getStatusVariant = (status: AfterCareStatus) => {
    return status === 'Checked-In' ? 'default' : 'secondary';
  };

  const checkedInStudents = students.filter(student => studentStatuses[student.id]?.status === 'Checked-In');
  const checkedOutStudents = students.filter(student => studentStatuses[student.id]?.status === 'Checked-Out' && studentStatuses[student.id]?.checkOutTime);
  const notCheckedInStudents = students.filter(student => !studentStatuses[student.id] || (studentStatuses[student.id]?.status === 'Checked-Out' && !studentStatuses[student.id]?.checkOutTime));

  const checkedInCount = Object.values(studentStatuses).filter(s => s.status === 'Checked-In').length;

  const handleArchiveLog = () => {
    const recordsToArchive = checkedOutStudents.map(student => ({
        ...student,
        log: studentStatuses[student.id],
    }));

    if (recordsToArchive.length === 0) {
        toast({ variant: 'destructive', title: 'Nothing to Archive', description: 'No students have been checked out today.'});
        return;
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const existingLogIndex = archivedLogs.findIndex(log => log.date === todayStr);
    
    let updatedArchivedLogs: ArchivedLog[];

    if (existingLogIndex > -1) {
        // Append to existing log for today
        updatedArchivedLogs = [...archivedLogs];
        const existingRecords = updatedArchivedLogs[existingLogIndex].records;
        const newRecordIds = new Set(recordsToArchive.map(r => r.id));
        // Filter out any students that might already be in the log for today to prevent duplicates
        const updatedRecords = existingRecords.filter(r => !newRecordIds.has(r.id));
        updatedArchivedLogs[existingLogIndex].records = [...updatedRecords, ...recordsToArchive];

    } else {
        // Create a new log for today
        const newArchive: ArchivedLog = {
            date: todayStr,
            records: recordsToArchive
        }
        updatedArchivedLogs = [newArchive, ...archivedLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    setArchivedLogs(updatedArchivedLogs);
    localStorage.setItem(ARCHIVED_LOGS_STORAGE_KEY, JSON.stringify(updatedArchivedLogs));

    // Reset student statuses for checked out students
    const newStatuses = { ...studentStatuses };
    checkedOutStudents.forEach(student => {
      newStatuses[student.id] = { status: 'Checked-Out' }; // Reset their record
    });
    setStudentStatuses(newStatuses);
    localStorage.setItem(AFTER_CARE_STORAGE_KEY, JSON.stringify(newStatuses));

    toast({ title: 'Log Archived', description: 'Today\'s checkout log has been archived.'});
  }

  const addLogoAndHeader = (doc: jsPDF, title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('BusyBee', 20, 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(18);
    doc.text(title, 20, 35);
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
  };

  const downloadLogReport = (log: ArchivedLog) => {
    try {
        const doc = new jsPDF();
        addLogoAndHeader(doc, `After-Care Log for ${format(new Date(log.date), 'PPP')}`);

        const tableColumn = ["Student", "Check-in Time", "Checked In By", "Check-out Time", "Checked Out By"];
        const tableRows: (string | null)[][] = [];

        log.records.forEach(record => {
            const rowData = [
                record.name,
                record.log.checkInTime ? format(new Date(record.log.checkInTime), 'p') : 'N/A',
                record.log.checkedInBy || 'N/A',
                record.log.checkOutTime ? format(new Date(record.log.checkOutTime), 'p') : 'N/A',
                record.log.checkedOutBy || 'N/A'
            ];
            tableRows.push(rowData);
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50, // Adjusted startY for header
        });

        doc.save(`AfterCare_Log_${log.date}.pdf`);
        toast({
            title: 'Report Downloaded',
            description: `The log for ${format(new Date(log.date), 'PPP')} has been downloaded.`
        });

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Could not generate the log report.'
        });
    }
  }


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
                    <div className="text-2xl font-bold">{checkedOutStudents.length}</div>
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
                <TableHead>Checked In By</TableHead>
                <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-10 w-28" /></TableCell>
                        </TableRow>
                    ))
                ) : [...notCheckedInStudents, ...checkedInStudents].length > 0 ? (
                [...notCheckedInStudents, ...checkedInStudents].map((student) => {
                    const record = studentStatuses[student.id] || { status: 'Checked-Out' };
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
                        {record.checkInTime ? format(new Date(record.checkInTime), 'p') : 'N/A'}
                    </TableCell>
                    <TableCell>
                        {record.checkedInBy || 'N/A'}
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
                        All students have been checked out for the day.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Today's Checked-Out Log</CardTitle>
                    <CardDescription>
                    Record of all students who have been checked out today.
                    </CardDescription>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={checkedOutStudents.length === 0}>
                            <Archive className="mr-2 h-4 w-4" />
                            Clear & Archive Log
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will move today's checkout log to the archives and reset the check-in status for all students. This is typically done at the end of the day.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchiveLog}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead>Checked In By</TableHead>
                        <TableHead>Check-out Time</TableHead>
                        <TableHead>Checked Out By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Loading Log...</TableCell>
                            </TableRow>
                        ) : checkedOutStudents.length > 0 ? (
                            checkedOutStudents.map(student => {
                                const record = studentStatuses[student.id];
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-mono">{student.id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    alt="Student avatar"
                                                    className="aspect-square rounded-full object-cover"
                                                    height="32"
                                                    src={student.avatarUrl}
                                                    width="32"
                                                    data-ai-hint={student.imageHint}
                                                />
                                                <div className="font-medium">{student.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{record?.checkInTime ? format(new Date(record.checkInTime), 'p') : 'N/A'}</TableCell>
                                        <TableCell>{record?.checkedInBy || 'N/A'}</TableCell>
                                        <TableCell>{record?.checkOutTime ? format(new Date(record.checkOutTime), 'p') : 'N/A'}</TableCell>
                                        <TableCell>{record?.checkedOutBy || 'N/A'}</TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No students have been checked out yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Log History</CardTitle>
                <CardDescription>
                Review checkout logs from previous days.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {archivedLogs.length > 0 ? (
                    <Tabs defaultValue={archivedLogs[0].date} className="w-full">
                        <TabsList>
                            {archivedLogs.map(log => (
                                <TabsTrigger key={log.date} value={log.date}>{format(new Date(log.date), 'MMM d, yyyy')}</TabsTrigger>
                            ))}
                        </TabsList>
                        {archivedLogs.map(log => (
                             <TabsContent key={log.date} value={log.date}>
                                <div className="flex justify-end mb-4">
                                     <Button variant="outline" size="sm" onClick={() => downloadLogReport(log)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Log
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Check-in Time</TableHead>
                                            <TableHead>Checked In By</TableHead>
                                            <TableHead>Check-out Time</TableHead>
                                            <TableHead>Checked Out By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {log.records.map(student => (
                                            <TableRow key={student.id}>
                                                <TableCell>
                                                     <div className="flex items-center gap-3">
                                                        <Image
                                                            alt="Student avatar"
                                                            className="aspect-square rounded-full object-cover"
                                                            height="32"
                                                            src={student.avatarUrl}
                                                            width="32"
                                                            data-ai-hint={student.imageHint}
                                                        />
                                                        <div className="font-medium">{student.name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{student.log.checkInTime ? format(new Date(student.log.checkInTime), 'p') : 'N/A'}</TableCell>
                                                <TableCell>{student.log.checkedInBy || 'N/A'}</TableCell>
                                                <TableCell>{student.log.checkOutTime ? format(new Date(student.log.checkOutTime), 'p') : 'N/A'}</TableCell>
                                                <TableCell>{student.log.checkedOutBy || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        ))}
                    </Tabs>
                ): (
                    <div className="text-center text-muted-foreground py-8">
                        No archived logs found.
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

    