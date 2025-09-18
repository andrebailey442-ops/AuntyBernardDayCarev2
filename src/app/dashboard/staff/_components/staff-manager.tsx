
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
import { getStaff, deleteStaff, getStaffSchedule, setStaffSchedule, getStaffAttendance, setStaffAttendance } from '@/services/staff';
import type { Staff, StaffRole, StaffSchedule, StaffAttendance } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Trash2, Edit, User } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { format, startOfWeek, addDays, eachDayOfInterval } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StaffForm } from './staff-form';
import { useRouter } from 'next/navigation';

export const staffRoles: StaffRole[] = ['Preschool Attendant', 'Aftercare Attendant', 'Nursery Attendant'];

export default function StaffManager() {
  const { toast } = useToast();
  const router = useRouter();
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [schedule, setSchedule] = React.useState<StaffSchedule>({});
  const [attendance, setAttendance] = React.useState<StaffAttendance>({});
  const [loading, setLoading] = React.useState(true);
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<Staff | null>(null);

  const [isRemoveStaffAlertOpen, setIsRemoveStaffAlertOpen] = React.useState(false);
  const [staffToRemove, setStaffToRemove] = React.useState<Staff | null>(null);

  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const fetchData = React.useCallback(() => {
    setLoading(true);
    setStaff(getStaff());
    setSchedule(getStaffSchedule());
    setAttendance(getStaffAttendance(format(selectedDate, 'yyyy-MM-dd')));
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
        setStaff(prev => prev.filter(s => s.id !== staffToRemove.id));
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

  const handleAttendanceChange = (staffId: string, status: 'present' | 'absent' | 'late') => {
    const newAttendance = { ...attendance, [staffId]: status };
    setAttendance(newAttendance);
    setStaffAttendance(format(selectedDate, 'yyyy-MM-dd'), newAttendance);
  };

  const weekDays = eachDayOfInterval({ start: startOfWeek(selectedDate, { weekStartsOn: 1 }), end: addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 4) }).map(d => format(d, 'EEEE'));
  
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
        <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>Assign shifts for the week.</CardDescription>
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
            <CardTitle>Daily Attendance</CardTitle>
            <CardDescription>Track staff attendance for {format(selectedDate, 'PPP')}.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {staff.map(member => (
                        <TableRow key={member.id}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>
                                <Badge variant={attendance[member.id] === 'present' ? 'default' : attendance[member.id] === 'absent' ? 'destructive' : 'secondary'}>
                                    {attendance[member.id] || 'Not Set'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleAttendanceChange(member.id, 'present')}>Present</Button>
                                <Button size="sm" variant="outline" onClick={() => handleAttendanceChange(member.id, 'late')}>Late</Button>
                                <Button size="sm" variant="outline" onClick={() => handleAttendanceChange(member.id, 'absent')}>Absent</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
