

'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { format, getYear, getMonth, getDate } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { BusyBeeLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Student } from '@/lib/types';
import { getStudent, updateStudent } from '@/services/students';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const guardianSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  contact: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
});

const editStudentSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.date({ required_error: 'Date of birth is required' }),
    age: z.number().optional(),
    guardian1: guardianSchema,
    guardian2: guardianSchema.partial().optional(),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    afterCare: z.boolean().optional(),
    emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
    emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
    medicalConditions: z.string().optional(),
  });

type EditStudentFormValues = z.infer<typeof editStudentSchema>;

type EditStudentFormProps = {
    studentId: string;
}

export function EditStudentForm({ studentId }: EditStudentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);
  const [student, setStudent] = React.useState<Student | null>(null);

  const [dobState, setDobState] = React.useState({
    day: '',
    month: '',
    year: '',
  });

  const form = useForm<EditStudentFormValues>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
        firstName: '',
        lastName: '',
        guardian1: { firstName: '', lastName: '', relationship: '', contact: '', phone: '' },
        guardian2: { firstName: '', lastName: '', relationship: '', contact: '', phone: '' },
        address: '',
        city: '',
        state: '',
        afterCare: false,
        emergencyContactName: '',
        emergencyContactPhone: '',
        medicalConditions: '',
    }
  });

  React.useEffect(() => {
    const fetchStudent = () => {
        setIsFetching(true);
        const studentData = getStudent(studentId);
        if (studentData) {
            setStudent(studentData);
            const [firstName, ...lastName] = studentData.name.split(' ');
            const dob = studentData.dob ? new Date(studentData.dob) : new Date(new Date().setFullYear(new Date().getFullYear() - studentData.age));
            
            form.reset({
                firstName: firstName,
                lastName: lastName.join(' '),
                dob: dob,
                age: studentData.age,
                guardian1: studentData.guardian1,
                guardian2: studentData.guardian2 || { firstName: '', lastName: '', relationship: '', contact: '', phone: '' },
                address: studentData.address || '',
                city: studentData.city || '',
                state: studentData.state || '',
                afterCare: studentData.afterCare || false,
                emergencyContactName: studentData.emergencyContactName || '',
                emergencyContactPhone: studentData.emergencyContactPhone || '',
                medicalConditions: studentData.medicalConditions || ''
            });

            setDobState({
              day: getDate(dob).toString(),
              month: (getMonth(dob) + 1).toString(),
              year: getYear(dob).toString(),
            });

        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Student not found.' });
            router.push('/dashboard');
        }
        setIsFetching(false);
    }
    fetchStudent();
  }, [studentId, form, router, toast]);

  const dob = form.watch('dob');

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

  React.useEffect(() => {
    const { day, month, year } = dobState;
    if (day && month && year) {
      const newDob = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(newDob.getTime())) {
          form.setValue('dob', newDob, { shouldValidate: true });
      }
    }
  }, [dobState, form]);

  const onSubmit = (data: EditStudentFormValues) => {
    setIsLoading(true);
    try {
        const updatedData: Partial<Student> = {
            name: `${data.firstName} ${data.lastName}`,
            age: data.age,
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
        updateStudent(studentId, updatedData);

        toast({
        title: 'Student Updated',
        description: `The details for ${data.firstName} ${data.lastName} have been successfully updated.`,
        });
        router.push(`/dashboard/students/${studentId}`);
    } catch (error) {
        console.error("Failed to update student: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update student.' });
    } finally {
        setIsLoading(false);
    }
  };

  if (isFetching || !student) {
      return (
        <div>
            <div className="mb-4">
                <Skeleton className="h-10 w-36" />
            </div>
            <Card className="max-w-4xl mx-auto backdrop-blur-sm bg-card/80">
                <CardHeader className="text-center">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <Skeleton className="h-4 w-64 mx-auto" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
      );
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
    <>
    <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
    </div>
    <Card className="max-w-4xl mx-auto backdrop-blur-sm bg-card/80">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
            <BusyBeeLogo className="h-12 w-12 text-primary" />
            <CardTitle className="text-3xl">Edit Student Profile</CardTitle>
        </div>
        <CardDescription>
          Update the student's information below.
        </CardDescription>
        {studentId && (
            <div className="pt-4">
                <p className="text-sm font-semibold text-muted-foreground">Student ID</p>
                <p className="text-lg font-mono text-primary">{studentId}</p>
            </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(555) 555-5555" {...field} /></FormControl><FormMessage /></FormItem>
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
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(555) 555-5555" {...field} /></FormControl><FormMessage /></FormItem>
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
                    <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Program Enrollment</h3>
                 <FormField
                    control={form.control}
                    name="afterCare"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">
                            After-Care Program
                            </FormLabel>
                            <FormDescription>
                                Enroll this student in the after-care program.
                            </FormDescription>
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

            <Separator />

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Emergency and Health Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                        <FormItem><FormLabel>Emergency Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                        <FormItem><FormLabel>Emergency Contact Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </>
  );
}
