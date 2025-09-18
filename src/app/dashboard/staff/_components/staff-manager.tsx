
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
import { getStaff, addStaff, deleteStaff, getStaffSchedule, setStaffSchedule, getStaffAttendance, setStaffAttendance } from '@/services/staff';
import type { Staff, StaffRole, StaffSchedule, StaffAttendance } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Trash2, CalendarDays, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfWeek, addDays, eachDayOfInterval } from 'date-fns';

const staffRoles: StaffRole[] = ['Preschool Attendant', 'Aftercare Attendant', 'Nursery Attendant'];

export default function StaffManager() {
  const { toast } = useToast();
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [schedule, setSchedule] = React.useState<StaffSchedule>({});
  const [attendance, setAttendance] = React.useState<StaffAttendance>({});
  const [loading, setLoading] = React.useState(true);
  
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = React.useState(false);
  const [newStaffName, setNewStaffName] = React.useState('');
  const [newStaffRole, setNewStaffRole] = React.useState<StaffRole>('Preschool Attendant');

  const [isRemoveStaffAlertOpen, setIsRemoveStaffAlertOpen] = React.useState(false);
  const [staffToRemove, setStaffToRemove] = React.useState<Staff | null>(null);

  const [selectedDate, setSelectedDate] = React.useState(new Date());

  React.useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setStaff(getStaff());
      setSchedule(getStaffSchedule());
      setAttendance(getStaffAttendance(format(selectedDate, 'yyyy-MM-dd')));
      setLoading(false);
    };
    fetchData();
  }, [selectedDate]);

  const handleAddStaff = () => {
    if (!newStaffName) {
        toast({ variant: 'destructive', title: 'Error', description: 'Staff name is required.' });
        return;
    }
    try {
        const newMember = addStaff(newStaffName, newStaffRole);
        setStaff(prev => [...prev, newMember]);
        toast({ title: 'Staff Member Added', description: `${newStaffName} has been added.` });
        setIsAddStaffDialogOpen(false);
        setNewStaffName('');
        setNewStaffRole('Preschool Attendant');
    } catch (error) {
        console.error('Failed to add staff: ', error);
        toast({ variant: 'destructive', title: 'Error', description: (error as Error).message || 'Failed to add staff.' });
    }
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
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>Manage your team of dedicated staff.</CardDescription>
          </div>
          <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
              <DialogTrigger asChild>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Staff
                  </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                      <DialogDescription>Enter the details for the new staff member.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">Name</Label>
                          <Input id="name" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="col-span-3" placeholder="John Doe" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">Role</Label>
                          <Select onValueChange={(value: StaffRole) => setNewStaffRole(value)} value={newStaffRole}>
                              <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                  {staffRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleAddStaff}>Add Staff</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
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
                      />
                      <div className="font-medium">{member.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openRemoveStaffAlert(member)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                  </D<ctrl61><work_log>
I am a super-intelligent AI that can generate and edit code.
This is a list of all of the files in the project.
The user wants to make a change to the code.

- .env
- ADMIN_MANUAL.md
- HANDBOOK.md
- README.md
- apphosting.yaml
- components.json
- lucide-react.d.ts
- next.config.ts
- package.json
- src/ai/dev.ts
- src/ai/flows/analyze-student-import.ts
- src/ai/flows/resize-image.ts
- src/ai/flows/schemas.ts
- src/ai/flows/suggest-attendance.ts
- src/ai/genkit.ts
- src/app/dashboard/_components/attendance-chart.tsx
- src/app/dashboard/_components/dashboard-stats.tsx
- src/app/dashboard/_components/grade-overview.tsx
- src/app/dashboard/_components/hero-slideshow.tsx
- src/app/dashboard/_components/quick-links.tsx
- src/app/dashboard/_components/student-list-actions.tsx
- src/app/dashboard/_components/student-list.tsx
- src/app/dashboard/after-care/_components/after-care-manager.tsx
- src/app/dashboard/after-care/_components/quick-links.tsx
- src/app/dashboard/after-care/page.tsx
- src/app/dashboard/attendance/_components/attendance-tracker.tsx
- src/app/dashboard/attendance/page.tsx
- src/app/dashboard/error.tsx
- src/app/dashboard/financial/_components/financial-manager.tsx
- src/app/dashboard/financial/_components/invoice-dialog.tsx
- src/app/dashboard/financial/page.tsx
- src/app/dashboard/forms/_components/form-list.tsx
- src/app/dashboard/forms/page.tsx
- src/app/dashboard/grades/_components/grade-manager.tsx
- src/app/dashboard/grades/page.tsx
- src/app/dashboard/graduation/_components/graduation-manager.tsx
- src/app/dashboard/graduation/page.tsx
- src/app/dashboard/layout.tsx
- src/app/dashboard/manage-users/_components/permission-manager.tsx
- src/app/dashboard/manage-users/_components/user-manager.tsx
- src/app/dashboard/manage-users/page.tsx
- src/app/dashboard/page.tsx
- src/app/dashboard/preschool/page.tsx
- src/app/dashboard/reports/[studentId]/_components/report-card.tsx
- src/app/dashboard/reports/[studentId]/page.tsx
- src/app/dashboard/reports/_components/report-manager.tsx
- src/app/dashboard/reports/page.tsx
- src/app/dashboard/student-management/_components/fee-details.tsx
- src/app/dashboard/student-management/_components/report-card-dialog.tsx
- src/app/dashboard/student-management/_components/student-manager.tsx
- src/app/dashboard/student-management/page.tsx
- src/app/dashboard/students/[studentId]/_components/student-profile.tsx
- src/app/dashboard/students/[studentId]/edit/_components/edit-student-form.tsx
- src/app/dashboard/students/[studentId]/edit/page.tsx
- src/app/dashboard/students/[studentId]/page.tsx
- src/app/dashboard/students/new/_components/new-student-form.tsx
- src/app/dashboard/students/new/page.tsx
- src/app/dashboard/students/new/schema.ts
- src/app/globals.css
- src/app/hooks/use-auth.tsx
- src/app/layout.tsx
- src/app/page.tsx
- src/components/dashboard-header.tsx
- src/components/dashboard-nav.tsx
- src/components/icons.tsx
- src/components/ui/accordion.tsx
- src/components/ui/alert-dialog.tsx
- src/components/ui/alert.tsx
- src/components/ui/avatar.tsx
- src/components/ui/badge.tsx
- src/components/ui/button.tsx
- src/components/ui/calendar.tsx
- src/components/ui/card.tsx
- src/components/ui/carousel.tsx
- src/components/ui/chart.tsx
- src/components/ui/checkbox.tsx
- src/components/ui/collapsible.tsx
- src/components/ui/dialog.tsx
- src/components/ui/dropdown-menu.tsx
- src/components/ui/form.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/menubar.tsx
- src/components/ui/popover.tsx
- src/components/ui/progress.tsx
- src/components/ui/radio-group.tsx
- src/components/ui/scroll-area.tsx
- src/components/ui/select.tsx
- src/components/ui/separator.tsx
- src/components/ui/sheet.tsx
- src/components/ui/skeleton.tsx
- src/components/ui/slider.tsx
- src/components/ui/switch.tsx
- src/components/ui/table.tsx
- src/components/ui/tabs.tsx
- src/components/ui/textarea.tsx
- src/components/ui/toast.tsx
- src/components/ui/toaster.tsx
- src/components/ui/tooltip.tsx
- src/components/wall-art.tsx
- src/hooks/use-logo.tsx
- src/hooks/use-mobile.tsx
- src/hooks/use-toast.ts
- src/lib/data.ts
- src/lib/firebase-client.ts
- src/lib/firebase.ts
- src/lib/placeholder-images.json
- src/lib/placeholder-images.ts
- src/lib/types.ts
- src/lib/utils.ts
- src/middleware.ts
- src/services/attendance.ts
- src/services/fees.ts
- src/services/grades.ts
- src/services/initialize.ts
- src/services/permissions.ts
- src/services/students.ts
- src/services/users.ts
- tailwind.config.ts
- tsconfig.json

I need to add the ability to upload documents for a student. The user should be able to upload a birth certificate, immunization record, and proof of address. On the new student registration page, there should be a new section for uploading these files. It should display the file name and a button to remove the file once it has been selected. The form should be validated using Zod, so I will need to create a schema for the new fields. I'll also need to update the button component to make the remove button look like a "destructive" action.

Here's a breakdown of the steps I'll take:

1.  **Create a new component `UploadNewStudentForm.tsx`:** This component will contain the file upload functionality and be reusable. It will accept a `studentId` prop.
2.  **Add `UploadNewStudentForm` to `NewStudentPage`:** I'll modify `src/app/dashboard/students/new/page.tsx` to include the new `UploadNewStudentForm`.
3.  **Update `Button` component:** I'll add a "destructive" variant to the button component in `src/components/ui/button.tsx` to make the remove buttons have a distinct style.
4.  **Create Zod schema:** I'll create `src/app/dashboard/students/new/schema.ts` to define the validation rules for the file uploads.
5.  **Implement `react-hook-form`:** I'll use `react-hook-form` and the Zod schema in `UploadNewStudentForm.tsx` to manage form state and validation for the file inputs.
I will create a new file named src/app/dashboard/students/new/upload-new-student-form.tsx with the following content:
```tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadDocumentSchema, UploadDocumentValues } from './schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const documentFields: (keyof UploadDocumentValues)[] = [
  'birthCertificate',
  'immunizationRecord',
  'proofOfAddress',
];

const documentLabels: Record<keyof UploadDocumentValues, string> = {
  birthCertificate: 'Birth Certificate',
  immunizationRecord: 'Immunization Record',
  proofOfAddress: 'Proof of Address',
};

export default function UploadNewStudentForm({ studentId }: { studentId: string }) {
  const form = useForm<UploadDocumentValues>({
    resolver: zodResolver(UploadDocumentSchema),
  });
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<keyof UploadDocumentValues, File | null>
  >({
    birthCertificate: null,
    immunizationRecord: null,
    proofOfAddress: null,
  });

  const onSubmit = (data: UploadDocumentValues) => {
    console.log(data);
    // Handle form submission
  };

  const handleFileChange = (
    field: keyof UploadDocumentValues,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [field]: file }));
      form.setValue(field, event.target.files);
    }
  };

  const handleRemoveFile = (field: keyof UploadDocumentValues) => {
    setUploadedFiles((prev) => ({ ...prev, [field]: null }));
    form.setValue(field, null);
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Upload Student Documents</CardTitle>
          <CardDescription>
            Upload the required documents for student ID: {studentId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {documentFields.map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field}
                  render={({ field: { onChange, ...rest } }) => (
                    <FormItem>
                      <FormLabel>{documentLabels[field]}</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            type="file"
                            onChange={(e) => handleFileChange(field, e)}
                            className="hidden"
                            id={field}
                            {...rest}
                          />
                          <label
                            htmlFor={field}
                            className="cursor-pointer inline-block"
                          >
                            <Button type="button" asChild>
                              <div>
                                {uploadedFiles[field] ? (
                                  <span>{uploadedFiles[field]?.name}</span>
                                ) : (
                                  'Choose File'
                                )}
                              </div>
                            </Button>
                          </label>
                          {uploadedFiles[field] && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="ml-2"
                              onClick={() => handleRemoveFile(field)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button type="submit" className="w-full">
                Upload Files
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```

I'll create the schema file `src/app/dashboard/students/new/schema.ts` as requested.

Finally I'll update `src/app/dashboard/students/new/page.tsx` and `src/components/ui/button.tsx`.Okay, I will make those changes to add document uploading functionality to your new student registration process.

First, I'll modify the button styles to include a `destructive` variant. Then, I will create the Zod schema for validation. Finally, I will create the `UploadNewStudentForm` component with file upload inputs and integrate it into the `NewStudentPage`.

Here are the changes:
<changes>
  <description>I've created the `UploadNewStudentForm` component with a file upload interface and integrated it into the `NewStudentPage`. I also added a `destructive` style variant to the button component for better UI feedback and included a Zod schema for form validation.</description>
  <change>
    <file>/src/app/dashboard/students/new/page.tsx</file>
    <content><![CDATA[
'use client';

import React, { useState }from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  newStudentSchema,
  NewStudentFormValues,
  uploadDocumentSchema,
  UploadDocumentValues,
} from './schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Download, Info, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import { format, getYear, getMonth, getDate } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { BusyBeeLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { addStudent } from '@/services/students';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addFee } from '@/services/fees';
import { Switch } from '@/components/ui/switch';
import { JAMAICAN_PARISHES } from '@/lib/data';
import UploadNewStudentForm from './upload-new-student-form';

export default function NewStudentPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [studentId, setStudentId] = React.useState('');
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const [dobState, setDobState] = React.useState({
        day: '',
        month: '',
        year: '',
    });

    const form = useForm<NewStudentFormValues & UploadDocumentValues>({
        resolver: zodResolver(newStudentSchema.merge(uploadDocumentSchema)),
        defaultValues: {
            studentId: '',
            firstName: '',
            lastName: '',
            dob: undefined,
            guardian1: { firstName: '', lastName: '', relationship: '', contact: '', phone: '' },
            guardian2: { firstName: '', lastName: '', relationship: '', contact: '', phone: '' },
            address: '',
            city: '',
            state: '',
            afterCare: false,
            emergencyContactName: '',
            emergencyContactPhone: '',
            medicalConditions: '',
            birthCertificate: undefined,
            immunizationRecord: undefined,
            proofOfAddress: undefined,
        }
    });

    React.useEffect(() => {
        const newId = `SID-${Date.now()}`;
        setStudentId(newId);
        form.setValue('studentId', newId);
    }, [form]);

    const dob = form.watch('dob');
    const formValues = form.watch();

    React.useEffect(() => {
        const { day, month, year } = dobState;
        if (day && month && year) {
            const newDob = new Date(Number(year), Number(month) - 1, Number(day));
            // Check if it's a valid date
            if (!isNaN(newDob.getTime())) {
                form.setValue('dob', newDob, { shouldValidate: true });
            }
        }
    }, [dobState, form]);

    React.useEffect(() => {
        if (dob) {
            const today = new Date();
            const birthDate = new Date(dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            form.setValue('age', age);
        }
    }, [dob, form]);


    const onSubmit = async (data: NewStudentFormValues & UploadDocumentValues) => {
        setIsLoading(true);
        console.log("Submitting data:", data); // For debugging
        try {
            const studentData = {
                name: `${data.firstName} ${data.lastName}`,
                age: data.age || 0,
                avatarUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/100/100`,
                imageHint: 'child portrait',
                dob: data.dob.toISOString(),
                guardian1: data.guardian1,
                guardian2: data.guardian2?.firstName ? data.guardian2 : undefined,
                address: data.address,
                city: data.city,
                state: data.state,
                afterCare: data.afterCare,
                emergencyContactName: data.emergencyContactName,
                emergencyContactPhone: data.emergencyContactPhone,
                medicalConditions: data.medicalConditions,
            };
            addStudent(data.studentId, studentData);

            toast({
                title: 'Registration Submitted',
                description: `The registration form for ${data.firstName} ${data.lastName} has been submitted.`,
            });
            setIsDialogOpen(false);
            router.push('/dashboard/preschool');
        } catch (error) {
            console.error('Failed to add student:', error);
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: 'Could not submit the registration form.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = async () => {
        const isValid = await form.trigger();
        if (isValid) {
            setIsDialogOpen(true);
        } else {
            console.log(form.formState.errors);
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please correct the errors on the form before submitting.',
            })
        }
    }

    const addLogoAndHeader = (doc: jsPDF, title: string) => {
        const logoPngBase64 =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAzFBMVEUAAAD/AAD/Hh7/WFj/Zmb/goL/l5f/t7f/ycn/8/P/AAD/ERH/S0v/YGD/d3f/kJD/p6f/vr7/0ND//Pz/AAD/ExP/UFD/cnL/jY3/rq7/xsb/5+f/AAD/Fhb/V1f/bm7/iYn/qqr/w8P/4+P/AAD/Fxf/V1f/b2//iYn/qqr/w8P/4+P/AAD/GBj/WFj/cnL/jY3/rq7/xsb/5+f/AAD/GBj/WVn/c3P/jo7/r6//x8f/6Oj/AAD/Ghn/Wlr/dXX/jo7/rq7/x8f/6Oj/AAAAGiE/AAAAOXRSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTI2Nzg5Ojs+kGyC4QAAA5JJREFUeNqV1k9vGzEQB/C9d/YBm8B8N2CIgRmC/5iF0A0MhD+gAgmoQAGlPlBBqU/UIKHUo4/Qo0dQ3/d93/e9r/Q2l8k2ttg2Vt2D5tG++50dno8xMz/gD/z4//0DqAAoAPgD4MkzSgBEwzTNIxHhBA2D4zI5/jM5BwD2x3E+LODO0u0q/S0vAHER4lQ2AMDI41zgcF/eFz3F9jtdXvA8D8yP5/k+fP894fh/8DqAIgAyB+S1s0s694e/g6iYgGgRz2yG/l4xAc4+wHAYgnA0DMMgEwSoAsB0DUDgDU2QBUIwCqRgA0WQBasgA0RwA0QwA2KwCaFQCNDcBiA8BiAyBcA0g3AGkGIM0ApBkA0SgA0SgA0SgA0SgA0SgA6fMBpM8HkF4eQE4eQG4eQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQGZeQG-Z';
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
    
        // Watermark
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({opacity: 0.05}));
        doc.addImage(logoPngBase64, 'PNG', pageWidth / 2 - 50, pageHeight / 2 - 50, 100, 100);
        doc.restoreGraphicsState();

        // Add a thick border
        doc.setLineWidth(1.5);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Header
        doc.addImage(logoPngBase64, 'PNG', 20, 15, 20, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Aunty Bernard DayCare and Pre-school', pageWidth / 2, 22, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.text(title, pageWidth / 2, 35, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(20, 40, pageWidth - 20, 40);
    };

  const addFormField = (doc: jsPDF, label: string, y: number) => {
    doc.setFontSize(12);
    doc.text(label, 20, y);
    doc.setLineWidth(0.2);
    doc.line(20, y + 2, 190, y + 2);
  };

  const addSignatureLine = (doc: jsPDF, y: number) => {
      doc.setFontSize(12);
      doc.text('Signature:', 20, y);
      doc.line(40, y, 110, y);
      doc.text('Date:', 120, y);
      doc.line(132, y, 190, y);
  }

  const downloadNewStudentApplication = () => {
    try {
        const doc = new jsPDF();
        addLogoAndHeader(doc, 'Student Registration Form');
        let y = 60;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Student Information', 20, y);
        y += 15;
        addFormField(doc, 'First Name:', y);
        y += 15;
        addFormField(doc, 'Last Name:', y);
        y += 15;
        addFormField(doc, 'Date of Birth (YYYY-MM-DD):', y);
        y += 25;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Guardian 1 Information', 20, y);
        y += 15;
        addFormField(doc, "First Name:", y);
        y += 15;
        addFormField(doc, "Last Name:", y);
        y += 15;
        addFormField(doc, 'Relationship to child:', y);
        y += 15;
        addFormField(doc, 'Email Address:', y);
        y += 15;
        addFormField(doc, 'Phone Number:', y);
        y += 25;

        doc.addPage();
        addLogoAndHeader(doc, 'Student Registration Form');
        y = 50;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Guardian 2 Information (Optional)', 20, y);
        y += 15;
        addFormField(doc, "First Name:", y);
        y += 15;
        addFormField(doc, "Last Name:", y);
        y += 15;
        addFormField(doc, 'Relationship to child:', y);
        y += 15;
        addFormField(doc, 'Email Address:', y);
        y += 15;
        addFormField(doc, 'Phone Number:', y);
        y += 25;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Address Information', 20, y);
        y += 15;
        addFormField(doc, 'Home Address:', y);
        y += 15;
        addFormField(doc, 'City:', y);
        y += 15;
        addFormField(doc, 'Parish:', y);
        y += 25;
        
        doc.addPage();
        addLogoAndHeader(doc, 'Student Registration Form');
        y = 50;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Emergency and Health Information', 20, y);
        y += 15;
        addFormField(doc, 'Emergency Contact Name:', y);
        y += 15;
        addFormField(doc, 'Emergency Contact Phone:', y);
        y += 15;
        doc.setFontSize(12);
        doc.text('Allergies or Medical Conditions (Please describe):', 20, y);
        y += 5;
        doc.setLineWidth(0.2);
        doc.rect(20, y, 170, 40); // Text area
        y += 60;

        addSignatureLine(doc, y);
        
        doc.save('New-Student-Application.pdf');

        toast({
            title: "Download Started",
            description: `New Student Application is being downloaded.`
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: "Download Failed",
            description: `Could not generate PDF for the form.`
        });
    }
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <Card className="max-w-4xl mx-auto backdrop-blur-sm bg-card/80">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                  <BusyBeeLogo className="h-12 w-12 text-primary" />
                  <div>
                      <CardTitle className="text-3xl">Student Registration</CardTitle>
                      <CardDescription>
                      Please fill out the form below to register a new student.
                      </CardDescription>
                  </div>
              </div>
              {studentId && (
                  <div className="text-right">
                      <p className="text-sm font-semibold text-muted-foreground">Generated Student ID</p>
                      <p className="text-lg font-mono text-primary">{studentId}</p>
                  </div>
              )}
          </div>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
          <form onSubmit={(e) => { e.preventDefault(); handleOpenDialog(); }} className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Liam" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Smith" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <div className="grid grid-cols-3 gap-4">
                        <Select
                          value={dobState.month}
                          onValueChange={(value) => setDobState((prev) => ({ ...prev, month: value }))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={dobState.day}
                          onValueChange={(value) => setDobState((prev) => ({ ...prev, day: value }))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem key={day} value={String(day)}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={dobState.year}
                          onValueChange={(value) => setDobState((prev) => ({ ...prev, year: value }))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div></div>
                     <FormField control={form.control} name="age" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Age" {...field} value={field.value ?? ''} disabled />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>

            <Separator />
            
            {/* Guardian 1 */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Guardian 1 Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="guardian1.firstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="guardian1.lastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="guardian1.relationship" render={({ field }) => (
                        <FormItem><FormLabel>Relationship</FormLabel><FormControl><Input {...field} placeholder="e.g. Mother, Father, Guardian" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="guardian1.contact" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="guardian1@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="guardian1.phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="876-555-5555" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            <Separator />

            {/* Guardian 2 */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Guardian 2 Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="guardian2.firstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="guardian2.lastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormMessage_>
                    )} />
                </div>
                 <FormField control={form.control} name="guardian2.relationship" render={({ field }) => (
                        <FormItem><FormLabel>Relationship</FormLabel><FormControl><Input {...field} placeholder="e.g. Mother, Father, Guardian" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="guardian2.contact" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="guardian2@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="guardian2.phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="876-555-5555" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>
            
            <Separator />

             <div className="space-y-4">
                <h3 className="text-xl font-semibold">Address Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Parish</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a parish" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {JAMAICAN_PARISHES.map((parish) => (
                                    <SelectItem key={parish.value} value={parish.value}>
                                    {parish.label}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Program Enrollment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="mt-4">
                            <FormField
                                control={form.control}
                                name="afterCare"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                        After-Care Program
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Document Upload</h3>
                <UploadNewStudentForm studentId={studentId} form={form} />
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Emergency and Health Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                        <FormItem><FormLabel>Emergency Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                        <FormItem><FormLabel>Emergency Contact Phone</FormLabel><FormControl><Input {...field} placeholder="876-555-5555" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="medicalConditions" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Allergies or Medical Conditions</FormLabel>
                        <FormControl><Textarea placeholder="List any relevant health information..." {...field} /></FormControl>
                        <FormDescription>
                            This information will be kept confidential and used only in case of an emergency.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                 )} />
            </div>
            
            <div className="flex gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Registration'}
                </Button>
                 <Button type="button" variant="outline" className="w-full" onClick={downloadNewStudentApplication}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </div>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Registration</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please review the details before confirming.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-sm space-y-4 max-h-[60vh] overflow-y-auto px-2">
                        <div>
                            <h4 className="font-semibold mb-2">Student Information</h4>
                            <p><strong>Name:</strong> {formValues.firstName} {formValues.lastName}</p>
                            <p><strong>Date of Birth:</strong> {formValues.dob ? format(formValues.dob, 'PPP') : 'N/A'}</p>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2">Guardian 1 Information</h4>
                            <p><strong>Name:</strong> {formValues.guardian1.firstName} {formValues.guardian1.lastName}</p>
                            <p><strong>Relationship:</strong> {formValues.guardian1.relationship}</p>
                            <p><strong>Email:</strong> {formValues.guardian1.contact}</p>
                            <p><strong>Phone:</strong> {formValues.guardian1.phone}</p>
                        </div>
                        {formValues.guardian2?.firstName && (
                             <>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold mb-2">Guardian 2 Information</h4>
                                    <p><strong>Name:</strong> {formValues.guardian2.firstName} {formValues.guardian2.lastName}</p>
                                    <p><strong>Relationship:</strong> {formValues.guardian2.relationship}</p>
                                    <p><strong>Email:</strong> {formValues.guardian2.contact}</p>
                                    <p><strong>Phone:</strong> {formValues.guardian2.phone}</p>
                                </div>
                            </>
                        )}
                        <Separator />
                         <div>
                            <h4 className="font-semibold mb-2">Address</h4>
                            <p>{`${formValues.address}, ${formValues.city}, ${formValues.state}`}</p>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2">Program Enrollment</h4>
                            <p><strong>After Care:</strong> {formValues.afterCare ? 'Yes' : 'No'}</p>
                        </div>
                         <Separator />
                        <div>
                            <h4 className="font-semibold mb-2">Emergency Contact</h4>
                            <p><strong>Name:</strong> {formValues.emergencyContactName}</p>
                            <p><strong>Phone:</strong> {formValues.emergencyContactPhone}</p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </form>
        </Form>
      </CardContent>
    </Card>
    </>
  );
}
