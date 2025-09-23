

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
import { LogIn, LogOut, Users, Archive, Download, Filter, X } from 'lucide-react';
import { format, set, isWithinInterval } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';


type NurseryStatus = 'Checked-In' | 'Checked-Out';

type NurseryRecord = {
  status: NurseryStatus;
  checkInTime?: string; // Storing as ISO string
  checkOutTime?: string; // Storing as ISO string
  checkedInBy?: string;
  checkedOutBy?: string;
  overtimeMinutes?: number;
};

type StudentStatus = {
  [studentId: string]: NurseryRecord;
};

type ArchivedLog = {
    date: string; // YYYY-MM-DD
    records: (Student & { log: NurseryRecord })[];
}

const NURSERY_STORAGE_KEY = 'nurseryStatuses';
const ARCHIVED_LOGS_STORAGE_KEY = 'nurseryArchivedLogs';

export default function NurseryManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [studentStatuses, setStudentStatuses] = React.useState<StudentStatus>({});
  const [loading, setLoading] = React.useState(true);
  const [archivedLogs, setArchivedLogs] = React.useState<ArchivedLog[]>([]);

  // Log History Filter State
  const [logDateRange, setLogDateRange] = React.useState<DateRange | undefined>();
  const [logStudentFilter, setLogStudentFilter] = React.useState<string>('all');
  const [logOvertimeFilter, setLogOvertimeFilter] = React.useState<'all' | 'overtime' | 'none'>('all');

  const fetchStudentsAndLogs = React.useCallback(async () => {
    setLoading(true);
    const allStudents = await getStudents();
    const nurseryStudents = (allStudents || []).filter(student => student.nursery);
    setStudents(nurseryStudents);
    
    const savedStatuses = localStorage.getItem(NURSERY_STORAGE_KEY);
    let initialStatuses: StudentStatus = {};
    if (savedStatuses) {
      initialStatuses = JSON.parse(savedStatuses);
    } else {
      nurseryStudents.forEach(student => {
        initialStatuses[student.id] = { status: 'Checked-Out' };
      });
    }
    setStudentStatuses(initialStatuses);
    
    const savedArchivedLogs = localStorage.getItem(ARCHIVED_LOGS_STORAGE_KEY);
    if (savedArchivedLogs) {
        setArchivedLogs(JSON.parse(savedArchivedLogs));
    }

    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchStudentsAndLogs();
  }, [fetchStudentsAndLogs]);

  const handleToggleStatus = (studentId: string) => {
    const currentRecord = studentStatuses[studentId] || { status: 'Checked-Out' };
    const now = new Date();
    const currentUsername = user?.username || 'Unknown';
    
    let newRecord: NurseryRecord;
    const studentName = students.find(s => s.id === studentId)?.name || 'Student';

    if (currentRecord.status === 'Checked-In') {
        const closingTime = set(now, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 }); // 6:00 PM
        let overtimeMinutes = 0;
        if (now > closingTime) {
            overtimeMinutes = Math.round((now.getTime() - closingTime.getTime()) / (1000 * 60));
        }
        
        newRecord = { ...currentRecord, status: 'Checked-Out', checkOutTime: now.toISOString(), checkedOutBy: currentUsername, overtimeMinutes };
        toast({
          title: `Student Checked Out`,
          description: `${studentName} has been checked out at ${format(now, 'p')} by ${currentUsername}.`,
        });

        if (overtimeMinutes > 0) {
            toast({
                title: 'Overtime Recorded',
                description: `${studentName} is in overtime by ${overtimeMinutes} minutes.`,
            });
        }
    } else {
        newRecord = { ...currentRecord, status: 'Checked-In', checkInTime: now.toISOString(), checkOutTime: undefined, checkedInBy: currentUsername, checkedOutBy: undefined, overtimeMinutes: undefined }; // Reset checkout time and overtime
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
    localStorage.setItem(NURSERY_STORAGE_KEY, JSON.stringify(updatedStatuses));
  };
  
  const getStatusVariant = (status: NurseryStatus) => {
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
    localStorage.setItem(NURSERY_STORAGE_KEY, JSON.stringify(newStatuses));

    toast({ title: 'Log Archived', description: 'Today\'s checkout log has been archived.'});
  }

  const addLogoAndHeader = (doc: jsPDF, title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Aunty Bernard', 20, 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(18);
    doc.text(title, 20, 35);
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
  };

  const downloadLogReport = (log: ArchivedLog) => {
    try {
        const doc = new jsPDF();
        addLogoAndHeader(doc, `Nursery Log for ${format(new Date(log.date + 'T00:00:00'), 'PPP')}`);

        const tableColumn = ["Student", "Check-in Time", "Checked In By", "Check-out Time", "Checked Out By", "Overtime (mins)"];
        const tableRows: (string | number | null)[][] = [];

        log.records.forEach(record => {
            const rowData = [
                record.name,
                record.log.checkInTime ? format(new Date(record.log.checkInTime), 'p') : 'N/A',
                record.log.checkedInBy || 'N/A',
                record.log.checkOutTime ? format(new Date(record.log.checkOutTime), 'p') : 'N/A',
                record.log.checkedOutBy || 'N/A',
                record.log.overtimeMinutes || 0
            ];
            tableRows.push(rowData);
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50, // Adjusted startY for header
        });

        doc.save(`Nursery_Log_${log.date}.pdf`);
        toast({
            title: 'Report Downloaded',
            description: `The log for ${format(new Date(log.date + 'T00:00:00'), 'PPP')} has been downloaded.`
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

  const filteredLogs = React.useMemo(() => {
    return archivedLogs.map(log => {
        let filteredRecords = log.records;

        if (logDateRange?.from && logDateRange?.to) {
            const logDate = new Date(log.date + 'T00:00:00');
            if (!isWithinInterval(logDate, { start: logDateRange.from, end: logDateRange.to })) {
                return { ...log, records: [] };
            }
        }
        
        if (logStudentFilter !== 'all') {
            filteredRecords = filteredRecords.filter(record => record.id === logStudentFilter);
        }

        if (logOvertimeFilter !== 'all') {
            filteredRecords = filteredRecords.filter(record => {
                if (logOvertimeFilter === 'overtime') return record.log.overtimeMinutes && record.log.overtimeMinutes > 0;
                if (logOvertimeFilter === 'none') return !record.log.overtimeMinutes || record.log.overtimeMinutes === 0;
                return true;
            });
        }
        
        return { ...log, records: filteredRecords };
    }).filter(log => log.records.length > 0);
  }, [archivedLogs, logDateRange, logStudentFilter, logOvertimeFilter]);

  const isAnyFilterActive = logDateRange || logStudentFilter !== 'all' || logOvertimeFilter !== 'all';
  
  const resetLogFilters = () => {
    setLogDateRange(undefined);
    setLogStudentFilter('all');
    setLogOvertimeFilter('all');
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="backdrop-blur-sm bg-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{students.length}</div>
                    <p className="text-xs text-muted-foreground">
                        Enrolled in nursery program
                    </p>
                </CardContent>
            </Card>
             <Card className="backdrop-blur-sm bg-card/80">
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
             <Card className="backdrop-blur-sm bg-card/80">
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
        <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader>
            <CardTitle>Nursery Check-in/Check-out</CardTitle>
            <CardDescription>
            Manage student arrivals and departures for the nursery program.
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
                ) : students.length > 0 ? (
                [...notCheckedInStudents, ...checkedInStudents].map((student) => {
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
                        <Badge variant={record ? getStatusVariant(record.status) : 'secondary'}>
                            {record ? record.status : 'Checked-Out'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {record?.checkInTime ? format(new Date(record.checkInTime), 'p') : 'N/A'}
                    </TableCell>
                    <TableCell>
                        {record?.checkedInBy || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button
                            variant={record?.status === 'Checked-In' ? 'destructive' : 'default'}
                            onClick={() => handleToggleStatus(student.id)}
                            size="sm"
                        >
                        {record?.status === 'Checked-In' ? 
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
                        No students enrolled in Nursery.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-card/80">
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
                        <TableHead>Overtime</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">Loading Log...</TableCell>
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
                                        <TableCell>
                                            {record?.overtimeMinutes && record.overtimeMinutes > 0 ? (
                                                <Badge variant="destructive">{record.overtimeMinutes} mins</Badge>
                                            ) : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No students have been checked out yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
         <Card className="backdrop-blur-sm bg-card/80">
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Log History</CardTitle>
                    <CardDescription>Review checkout logs from previous days.</CardDescription>
                </div>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="relative">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                            {isAnyFilterActive && <span className="absolute top-0 right-0 -mt-1 -mr-1 h-2 w-2 rounded-full bg-primary" />}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Filters</h4>
                                <p className="text-sm text-muted-foreground">Filter the log history.</p>
                            </div>
                            <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label>Date Range</Label>
                                    <div className="col-span-2">
                                        <Calendar mode="range" selected={logDateRange} onSelect={setLogDateRange} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label>Student</Label>
                                    <Select value={logStudentFilter} onValueChange={setLogStudentFilter}>
                                        <SelectTrigger className="col-span-2"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Students</SelectItem>
                                            {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label>Overtime</Label>
                                    <Select value={logOvertimeFilter} onValueChange={(v: any) => setLogOvertimeFilter(v)}>
                                        <SelectTrigger className="col-span-2"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="overtime">Has Overtime</SelectItem>
                                            <SelectItem value="none">No Overtime</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {isAnyFilterActive && (
                                    <Button variant="ghost" size="sm" onClick={resetLogFilters} className="justify-self-start">
                                        <X className="mr-2 h-4 w-4" /> Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent>
                {filteredLogs.length > 0 ? (
                    <Tabs defaultValue={filteredLogs[0].date} className="w-full">
                        <TabsList>
                            {filteredLogs.map(log => (
                                <TabsTrigger key={log.date} value={log.date}>{format(new Date(log.date + 'T00:00:00'), 'PPP')}</TabsTrigger>
                            ))}
                        </TabsList>
                        {filteredLogs.map(log => (
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
                                            <TableHead>Overtime</TableHead>
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
                                                <TableCell>
                                                    {student.log.overtimeMinutes && student.log.overtimeMinutes > 0 ? (
                                                        <Badge variant="destructive">{student.log.overtimeMinutes} mins</Badge>
                                                    ) : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        ))}
                    </Tabs>
                ): (
                    <div className="text-center text-muted-foreground py-8">
                        No archived logs found for the selected filters.
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
