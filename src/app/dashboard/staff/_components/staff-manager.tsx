
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
import { useToast } from '@/hooks/use-toast';
import { getStaff, deleteStaff, getStaffSchedule, setStaffSchedule, getStaffAttendance, setStaffAttendance, getArchivedStaffLogs, saveArchivedStaffLogs } from '@/services/staff';
import type { Staff, StaffRole, StaffSchedule, StaffAttendance, StaffClockRecord, ArchivedStaffLog } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Trash2, Edit, User, LogIn, LogOut, Archive, Download } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { format, startOfWeek, addDays, eachDayOfInterval, set } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StaffForm } from './staff-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';


export const staffRoles: StaffRole[] = ['Preschool Attendant', 'Aftercare Attendant', 'Nursery Attendant'];

export default function StaffManager() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [schedule, setSchedule] = React.useState<StaffSchedule>({});
  const [attendance, setAttendance] = React.useState<StaffAttendance>({});
  const [loading, setLoading] = React.useState(true);
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<Staff | null>(null);

  const [isRemoveStaffAlertOpen, setIsRemoveStaffAlertOpen] = React.useState(false);
  const [staffToRemove, setStaffToRemove] = React.useState<Staff | null>(null);

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [archivedLogs, setArchivedLogs] = React.useState<ArchivedStaffLog[]>([]);

  const fetchData = React.useCallback(() => {
    setLoading(true);
    setStaff(getStaff());
    setSchedule(getStaffSchedule());
    setAttendance(getStaffAttendance(format(selectedDate, 'yyyy-MM-dd')));
    setArchivedLogs(getArchivedStaffLogs());
    setLoading(false);
  }, [selectedDate]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSuccess = () => {
    fetchData();
    setIsFormOpen(false);
    setSelectedStaff(null);
  }

  const handleEdit = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedStaff(null);
    setIsFormOpen(true);
  };

  const handleRemoveStaff = () => {
    if (!staffToRemove) return;
    try {
        deleteStaff(staffToRemove.id);
        fetchData();
        toast({ title: 'Staff Member Removed', description: `${staffToRemove.name} has been removed.` });
    } catch(error) {
        console.error('Failed to remove staff: ', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove staff member.' });
    } finally {
        setIsRemoveStaffAlertOpen(false);
        setStaffToRemove(null);
    }
  };
  
  const openRemoveStaffAlert = (staffMember: Staff) => {
    setStaffToRemove(staffMember);
    setIsRemoveStaffAlertOpen(true);
  };
  
  const handleScheduleChange = (staffId: string, day: string, value: string) => {
    const newSchedule = { ...schedule, [staffId]: { ...schedule[staffId], [day]: value } };
    setSchedule(newSchedule);
    setStaffSchedule(newSchedule);
  };

  const handleToggleStatus = (staffId: string) => {
    const currentRecord = attendance[staffId] || { status: 'Clocked-Out' };
    const now = new Date();
    const currentUsername = user?.username || 'Unknown';
    
    let newRecord: StaffClockRecord;
    const staffName = staff.find(s => s.id === staffId)?.name || 'Staff Member';

    if (currentRecord.status === 'Clocked-In') {
        newRecord = { ...currentRecord, status: 'Clocked-Out', checkOutTime: now.toISOString(), checkedOutBy: currentUsername };
        toast({
          title: `Staff Clocked Out`,
          description: `${staffName} has been clocked out at ${format(now, 'p')} by ${currentUsername}.`,
        });
    } else {
        const startTime = set(now, { hours: 6, minutes: 0, seconds: 0, milliseconds: 0 }); // 6:00 AM
        const lateThreshold = set(now, { hours: 6, minutes: 15, seconds: 0, milliseconds: 0 }); // 6:15 AM
        const isLate = now > lateThreshold;

        newRecord = { 
            ...currentRecord, 
            status: 'Clocked-In', 
            checkInTime: now.toISOString(), 
            checkOutTime: undefined, 
            checkedInBy: currentUsername, 
            checkedOutBy: undefined,
            isLate: isLate
        };
        toast({
          title: `Staff Clocked In`,
          description: `${staffName} has been clocked in at ${format(now, 'p')} by ${currentUsername}.`,
        });
        if (isLate) {
            toast({
                title: 'Staff Member Late',
                description: `${staffName} clocked in after 6:15 AM.`
            })
        }
    }
    
    const updatedAttendance = { ...attendance, [staffId]: newRecord };
    setAttendance(updatedAttendance);
    setStaffAttendance(format(selectedDate, 'yyyy-MM-dd'), updatedAttendance);
  };

  const handleArchiveLog = () => {
    const recordsToArchive = staff
      .filter(s => attendance[s.id]?.status === 'Clocked-Out' && attendance[s.id]?.checkOutTime)
      .map(s => ({ ...s, log: attendance[s.id] }));

    if (recordsToArchive.length === 0) {
        toast({ variant: 'destructive', title: 'Nothing to Archive', description: 'No staff have been clocked out today.'});
        return;
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const newArchive: ArchivedStaffLog = { date: todayStr, records: recordsToArchive };

    const updatedLogs = [newArchive, ...archivedLogs.filter(log => log.date !== todayStr)]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setArchivedLogs(updatedLogs);
    saveArchivedStaffLogs(updatedLogs);

    const newAttendance = { ...attendance };
    recordsToArchive.forEach(rec => {
      newAttendance[rec.id] = { status: 'Clocked-Out' };
    });
    setAttendance(newAttendance);
    setStaffAttendance(todayStr, newAttendance);

    toast({ title: 'Log Archived', description: 'Today\'s staff log has been archived.'});
  }

  const downloadLogReport = (log: ArchivedStaffLog) => {
    try {
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('Aunty Bernard', 20, 22);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(18);
        doc.text(`Staff Log for ${format(new Date(log.date), 'PPP')}`, 20, 35);
        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);

        const tableColumn = ["Staff", "Clock-in Time", "Clocked In By", "Clock-out Time", "Clocked Out By"];
        const tableRows: (string | null)[][] = log.records.map(record => [
            record.name,
            record.log.checkInTime ? format(new Date(record.log.checkInTime), 'p') : 'N/A',
            record.log.checkedInBy || 'N/A',
            record.log.checkOutTime ? format(new Date(record.log.checkOutTime), 'p') : 'N/A',
            record.log.checkedOutBy || 'N/A'
        ]);

        (doc as any).autoTable({ head: [tableColumn], body: tableRows, startY: 50 });
        doc.save(`Staff_Log_${log.date}.pdf`);
        toast({ title: 'Report Downloaded', description: `The log for ${format(new Date(log.date), 'PPP')} has been downloaded.` });
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not generate the log report.' });
    }
  }


  const weekDays = eachDayOfInterval({ start: startOfWeek(selectedDate, { weekStartsOn: 1 }), end: addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 4) }).map(d => format(d, 'EEEE'));
  const clockedOutStaff = staff.filter(s => attendance[s.id]?.status === 'Clocked-Out' && attendance[s.id]?.checkOutTime);
  
  const generateWeeklyRoster = () => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Add border
        doc.setLineWidth(1.5);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Add header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Aunty Bernard DayCare and Pre-school', pageWidth / 2, 22, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.text(`Weekly Staff Roster - Week of ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'PPP')}`, pageWidth / 2, 35, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(20, 40, pageWidth - 20, 40);

        const tableColumn = ["Staff Member", ...weekDays];
        const tableRows = staff.map(member => {
            const row = [member.name];
            weekDays.forEach(day => {
                row.push(schedule[member.id]?.[day] || 'Off');
            });
            return row;
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: {
                fillColor: [22, 163, 74], // A pleasant green color
                textColor: 255,
                fontStyle: 'bold',
            },
            styles: {
                cellPadding: 3,
                fontSize: 10,
            }
        });

        doc.save('Weekly_Staff_Roster.pdf');
        toast({ title: 'Roster Generated', description: 'The weekly staff roster has been downloaded.' });
    } catch (error) {
        console.error("Failed to generate roster PDF:", error);
        toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not generate the roster PDF.' });
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setSelectedStaff(null); } else { setIsFormOpen(true); }}}>
        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>Manage your team of dedicated staff.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Staff
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                            <TableCell><Skeleton className="h-6 w-[120px] rounded-full" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                    ))
                ) : staff.map(member => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          alt={member.name}
                          className="aspect-square rounded-full object-cover"
                          height="40"
                          src={member.avatarUrl}
                          width="40"
                          data-ai-hint={member.imageHint}
                        />
                        <div className="font-medium">{member.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {member.roles && member.roles.length > 0 ? member.roles.map(role => <Badge key={role} variant="outline">{role}</Badge>) : <span className="text-muted-foreground">No roles assigned</span>}
                      </div>
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
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/staff/${member.id}`)}>
                                <User className="mr-2 h-4 w-4" />
                                View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(member)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => openRemoveStaffAlert(member)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Staff
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-2xl">
          <StaffForm staffMember={selectedStaff} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Assign shifts for the week.</CardDescription>
            </div>
            <Button variant="outline" onClick={generateWeeklyRoster}>
                <Download className="mr-2 h-4 w-4" />
                Generate Roster
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Staff Member</TableHead>
                        {weekDays.map(day => <TableHead key={day} className="text-center">{day}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staff.map(member => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            {weekDays.map(day => (
                                <TableCell key={day}>
                                    <Input 
                                        className="text-center" 
                                        placeholder="e.g., 9am-5pm"
                                        value={schedule[member.id]?.[day] || ''}
                                        onChange={(e) => handleScheduleChange(member.id, day, e.target.value)}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

        <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader>
            <CardTitle>Daily Clock-in / Clock-out</CardTitle>
            <CardDescription>Manage staff arrivals and departures for {format(selectedDate, 'PPP')}.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lateness</TableHead>
                <TableHead>Clock-in Time</TableHead>
                <TableHead>Clocked In By</TableHead>
                <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
                ) : staff.filter(s => attendance[s.id]?.status !== 'Clocked-Out' || !attendance[s.id]?.checkOutTime).map(member => {
                    const record = attendance[member.id];
                    return (
                        <TableRow key={member.id}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>
                                <Badge variant={record?.status === 'Clocked-In' ? 'default' : 'secondary'}>{record?.status || 'Clocked-Out'}</Badge>
                            </TableCell>
                             <TableCell>
                                {record?.isLate ? <Badge variant="destructive">Late</Badge> : (record?.status === 'Clocked-In' ? <Badge variant="secondary">On Time</Badge> : 'N/A')}
                            </TableCell>
                            <TableCell>{record?.checkInTime ? format(new Date(record.checkInTime), 'p') : 'N/A'}</TableCell>
                            <TableCell>{record?.checkedInBy || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant={record?.status === 'Clocked-In' ? 'destructive' : 'default'}
                                    onClick={() => handleToggleStatus(member.id)}
                                    size="sm"
                                >
                                {record?.status === 'Clocked-In' ? <><LogOut className="mr-2 h-4 w-4" />Clock Out</> : <><LogIn className="mr-2 h-4 w-4" />Clock In</>}
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
            </Table>
        </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Today's Clocked-Out Log</CardTitle>
                    <CardDescription>Record of all staff who have clocked out today.</CardDescription>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={clockedOutStaff.length === 0}><Archive className="mr-2 h-4 w-4" />Clear &amp; Archive Log</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will archive today's clock-out log and reset the status for all staff members.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleArchiveLog}>Continue</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Clock-in Time</TableHead>
                        <TableHead>Clocked In By</TableHead>
                        <TableHead>Clock-out Time</TableHead>
                        <TableHead>Clocked Out By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clockedOutStaff.length > 0 ? clockedOutStaff.map(member => {
                            const record = attendance[member.id];
                            return (
                                <TableRow key={member.id}>
                                    <TableCell>{member.name}</TableCell>
                                    <TableCell>{record?.checkInTime ? format(new Date(record.checkInTime), 'p') : 'N/A'}</TableCell>
                                    <TableCell>{record?.checkedInBy || 'N/A'}</TableCell>
                                    <TableCell>{record?.checkOutTime ? format(new Date(record.checkOutTime), 'p') : 'N/A'}</TableCell>
                                    <TableCell>{record?.checkedOutBy || 'N/A'}</TableCell>
                                </TableRow>
                            )
                        }) : <TableRow><TableCell colSpan={5} className="h-24 text-center">No staff have been clocked out yet.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/80">
            <CardHeader><CardTitle>Log History</CardTitle><CardDescription>Review clock-out logs from previous days.</CardDescription></CardHeader>
            <CardContent>
                {archivedLogs.length > 0 ? (
                    <Tabs defaultValue={archivedLogs[0].date} className="w-full">
                        <TabsList>{archivedLogs.map(log => <TabsTrigger key={log.date} value={log.date}>{format(new Date(log.date), 'PPP')}</TabsTrigger>)}</TabsList>
                        {archivedLogs.map(log => (
                             <TabsContent key={log.date} value={log.date}>
                                <div className="flex justify-end mb-4"><Button variant="outline" size="sm" onClick={() => downloadLogReport(log)}><Download className="mr-2 h-4 w-4" />Download Log</Button></div>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Staff</TableHead><TableHead>Clock-in</TableHead><TableHead>By</TableHead><TableHead>Clock-out</TableHead><TableHead>By</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {log.records.map(rec => (
                                            <TableRow key={rec.id}>
                                                <TableCell>{rec.name}</TableCell>
                                                <TableCell>{rec.log.checkInTime ? format(new Date(rec.log.checkInTime), 'p') : 'N/A'}</TableCell>
                                                <TableCell>{rec.log.checkedInBy || 'N/A'}</TableCell>
                                                <TableCell>{rec.log.checkOutTime ? format(new Date(rec.log.checkOutTime), 'p') : 'N/A'}</TableCell>
                                                <TableCell>{rec.log.checkedOutBy || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : <div className="text-center text-muted-foreground py-8">No archived logs found.</div>}
            </CardContent>
        </Card>


      <AlertDialog open={isRemoveStaffAlertOpen} onOpenChange={setIsRemoveStaffAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove {staffToRemove?.name}.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveStaff}>
                      Continue
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
