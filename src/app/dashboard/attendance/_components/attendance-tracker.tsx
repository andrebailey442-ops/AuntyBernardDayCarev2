
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AttendanceStatus, Student, Subject } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getStudents } from '@/services/students';
import { getSubjects } from '@/services/subjects';
import { getAttendance, upsertAttendance } from '@/services/attendance';
import { Skeleton } from '@/components/ui/skeleton';

type AttendanceState = { [studentId: string]: { [subjectId: string]: AttendanceStatus } };

export default function AttendanceTracker() {
  const [date, setDate] = React.useState<Date>(new Date());
  const [students, setStudents] = React.useState<Student[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [attendance, setAttendance] = React.useState<AttendanceState>({});
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const [studentList, subjectList] = await Promise.all([
            getStudents(),
            getSubjects(),
        ]);
        setStudents(studentList);
        setSubjects(subjectList);
        setLoading(false);
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    if (students.length === 0 || subjects.length === 0) return;

    const formattedDate = format(date, 'yyyy-MM-dd');
    const fetchTodaysAttendance = async () => {
      const allAttendance = await getAttendance();
      const todaysAttendance = allAttendance.filter((a) => a.date === formattedDate);

      const initialState: AttendanceState = {};
      students.forEach(student => {
        initialState[student.id] = {};
        subjects.forEach(subject => {
            const record = todaysAttendance.find(a => a.studentId === student.id && a.subject === subject.id);
            initialState[student.id][subject.id] = record ? record.status : 'present';
        });
      });
      setAttendance(initialState);
    }
    fetchTodaysAttendance();

  }, [date, students, subjects]);

  const handleStatusChange = (studentId: string, subjectId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ 
        ...prev, 
        [studentId]: {
            ...(prev[studentId] || {}),
            [subjectId]: status
        } 
    }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(attendance).flatMap(([studentId, subjectStatuses]) => 
        Object.entries(subjectStatuses).map(([subjectId, status]) => 
          upsertAttendance(studentId, subjectId, date, status)
        )
      );
      await Promise.all(promises);
      toast({
          title: 'Attendance Saved',
          description: `Attendance for ${format(date, 'PPP')} has been successfully recorded.`,
      });
    } catch (error) {
      console.error("Failed to save attendance: ", error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save attendance records.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-card/80">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <CardTitle>Daily Attendance</CardTitle>
          <CardDescription>
            Mark attendance for {format(date, 'PPP')}.
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[240px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => day && setDate(day)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={saveAttendance} disabled={saving}>
              {saving ? 'Saving...' : <><Check className="mr-2 h-4 w-4"/>Save Attendance</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background/80 backdrop-blur-sm">Student</TableHead>
              {subjects.map(subject => (
                  <TableHead key={subject.id} className="min-w-[150px] text-center">{subject.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="sticky left-0 bg-background/80 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-[120px]" />
                            </div>
                        </TableCell>
                        {subjects.map(subject => (
                             <TableCell key={subject.id} className="text-center">
                                <Skeleton className="h-10 w-full" />
                             </TableCell>
                        ))}
                    </TableRow>
                ))
            ) : students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium sticky left-0 bg-background/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Image
                      alt="Student avatar"
                      className="aspect-square rounded-full object-cover"
                      height="40"
                      src={student.avatarUrl}
                      width="40"
                      data-ai-hint={student.imageHint}
                    />
                    <span>{student.name}</span>
                  </div>
                </TableCell>
                {subjects.map(subject => (
                    <TableCell key={subject.id} className="text-center">
                        <Select
                            value={attendance[student.id]?.[subject.id] || 'present'}
                            onValueChange={(value) => handleStatusChange(student.id, subject.id, value as AttendanceStatus)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="tardy">Tardy</SelectItem>
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
  );
}
