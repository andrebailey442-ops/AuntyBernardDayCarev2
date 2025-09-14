
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { ScholarStartLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { Student } from '@/lib/types';
import { getStudent, updateStudent } from '@/services/students';
import { Skeleton } from '@/components/ui/skeleton';

const editStudentSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.date({ required_error: 'Date of birth is required' }),
    age: z.number().optional(),
    parentFirstName: z.string().min(1, "Parent's first name is required"),
    parentLastName: z.string().min(1, "Parent's last name is required"),
    parentEmail: z.string().email('Invalid email address'),
    parentPhone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(1, 'ZIP code is required'),
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

  const form = useForm<EditStudentFormValues>({
    resolver: zodResolver(editStudentSchema),
  });

  React.useEffect(() => {
    const fetchStudent = async () => {
        setIsFetching(true);
        const studentData = await getStudent(studentId);
        if (studentData) {
            setStudent(studentData);
            const [firstName, ...lastName] = studentData.name.split(' ');
            
            // This is mock data, so we'll invent some parent and address details
            form.reset({
                firstName: firstName,
                lastName: lastName.join(' '),
                dob: studentData.dob ? new Date(studentData.dob) : new Date(new Date().setFullYear(new Date().getFullYear() - studentData.age)), // Approximate DOB
                age: studentData.age,
                parentFirstName: 'John',
                parentLastName: 'Doe',
                parentEmail: studentData.parentContact,
                parentPhone: '(555) 123-4567',
                address: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                zip: '12345',
                emergencyContactName: 'Jane Doe',
                emergencyContactPhone: '(555) 765-4321',
                medicalConditions: 'None'
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

  const onSubmit = async (data: EditStudentFormValues) => {
    setIsLoading(true);
    try {
        const updatedData = {
            name: `${data.firstName} ${data.lastName}`,
            age: data.age,
            dob: data.dob.toISOString(),
            parentContact: data.parentEmail,
            // You would also save other fields here
        };
        await updateStudent(studentId, updatedData);

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
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                       <Skeleton className="h-12 w-12" />
                        <Skeleton className="h-8 w-64" />
                    </div>
                    <Skeleton className="h-4 w-48 mx-auto" />
                    <div className="pt-4">
                        <Skeleton className="h-4 w-32 mx-auto" />
                        <Skeleton className="h-6 w-40 mx-auto mt-1" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <>
    <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
        </Button>
    </div>
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
            <ScholarStartLogo className="h-12 w-12 text-primary" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="dob" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                </PopoverContent>
                            </Popover>
                        <FormMessage />
                        </FormItem>
                    )} />
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

             <div className="space-y-4">
                <h3 className="text-xl font-semibold">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="parentFirstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="parentLastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="parentEmail" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="parent@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="parentPhone" render={({ field }) => (
                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(555) 555-5555" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
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
                    <FormField control={form.control} name="zip" render={({ field }) => (
                        <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

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
