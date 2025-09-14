'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, Wand2 } from 'lucide-react';
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
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { STUDENTS, ATTENDANCE } from '@/lib/data';
import type { AttendanceStatus, Student } from '@/lib/types';
import { suggestAttendance } from '@/ai/flows/suggest-attendance';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

type AttendanceState = Record<string, AttendanceStatus>;

export default function AttendanceTracker() {
  const [date, setDate] = React.useState<Date>(new Date());
  const [attendance, setAttendance] = React.useState<AttendanceState>({});
  const [loadingSuggestions, setLoadingSuggestions] = React.useState<Record<string, boolean>>({});
  const { toast } = useToast();

  React.useEffect(() => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const todaysAttendance = ATTENDANCE.filter((a) => a.date === formattedDate);
    const initialState: AttendanceState = {};
    STUDENTS.forEach(student => {
        const record = todaysAttendance.find(a => a.studentId === student.id);
        initialState[student.id] = record ? record.status : 'present';
    });
    setAttendance(initialState);
  }, [date]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };
  
  const handleSuggest = async (student: Student) => {
    setLoadingSuggestions(prev => ({...prev, [student.id]: true}));
    try {
      const suggestion = await suggestAttendance({ studentId: student.id, date: format(date, 'yyyy-MM-dd') });
      handleStatusChange(student.id, suggestion.status);
      toast({
        title: `Suggestion for ${student.name}`,
        description: `Status set to "${suggestion.status}". ${suggestion.reason || ''}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: 'Could not get an AI suggestion at this time.',
      });
    } finally {
        setLoadingSuggestions(prev => ({...prev, [student.id]: false}));
    }
  };

  const saveAttendance = () => {
    toast({
        title: 'Attendance Saved',
        description: `Attendance for ${format(date, 'PPP')} has been successfully recorded.`,
    });
  };

  return (
    <Card>
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
                  'w-[280px] justify-start text-left font-normal',
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
          <Button onClick={saveAttendance}><Check className="mr-2 h-4 w-4"/>Save Attendance</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">AI</TableHead>
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
                <TableCell>
                  <RadioGroup
                    value={attendance[student.id]}
                    onValueChange={(value: string) =>
                      handleStatusChange(student.id, value as AttendanceStatus)
                    }
                    className="flex justify-center space-x-2 md:space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="present" id={`present-${student.id}`} />
                      <Label htmlFor={`present-${student.id}`}>Present</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                      <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tardy" id={`tardy-${student.id}`} />
                      <Label htmlFor={`tardy-${student.id}`}>Tardy</Label>
                    </div>
                  </RadioGroup>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSuggest(student)} disabled={loadingSuggestions[student.id]}>
                    <Wand2 className="h-4 w-4 mr-2"/>
                    {loadingSuggestions[student.id] ? 'Thinking...' : 'Suggest'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
