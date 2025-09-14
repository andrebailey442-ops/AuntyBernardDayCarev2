
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
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { ScholarStartLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
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
    AlertDialogTrigger,
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


const newStudentSchema = z.object({
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
  paymentPlan: z.enum(['Full Payment', 'Two Installments', 'Monthly Plan'], {
    required_error: "Payment plan is required"
  }),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
  medicalConditions: z.string().optional(),
});

type NewStudentFormValues = z.infer<typeof newStudentSchema>;

export function NewStudentForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [studentId, setStudentId] = React.useState('');

  const form = useForm<NewStudentFormValues & { studentId: string }>({
    resolver: zodResolver(newStudentSchema.extend({ studentId: z.string() })),
    defaultValues: {
        studentId: '',
    }
  });

  React.useEffect(() => {
    const newId = `SID-${Date.now()}`;
    setStudentId(newId);
    form.setValue('studentId', newId);
  }, [form]);

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

  const onSubmit = async (data: NewStudentFormValues & { studentId: string }) => {
    setIsLoading(true);
    try {
        const studentData = {
            name: `${data.firstName} ${data.lastName}`,
            age: data.age || 0,
            parentContact: data.parentEmail,
            avatarUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/100/100`,
            imageHint: 'child portrait',
            dob: data.dob.toISOString(),
        };
        await addStudent(data.studentId, studentData);
        
        let amount = 0;
        if (data.paymentPlan === 'Full Payment') amount = 2375;
        if (data.paymentPlan === 'Two Installments') amount = 2500;
        if (data.paymentPlan === 'Monthly Plan') amount = 2500;

        const feeData = {
            studentId: data.studentId,
            plan: data.paymentPlan,
            amount: amount,
            status: 'Pending' as 'Pending' | 'Paid' | 'Overdue',
        }
        await addFee(feeData);

        toast({
        title: 'Registration Submitted',
        description: `The registration form for ${data.firstName} ${data.lastName} has been submitted.`,
        });
        router.push('/dashboard');
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

  const addLogoAndHeader = (doc: jsPDF, title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('ScholarStart', 20, 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(18);
    doc.text(title, 20, 35);
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
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
        let y = 50;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Student ID: ${studentId}`, 20, y);
        y += 10;
        

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Student Information', 20, y);
        y += 15;
        addFormField(doc, 'First Name:', y);
        y += 15;
        addFormField(doc, 'Last Name:', y);
        y += 15;
        addFormField(doc, 'Date of Birth (YYYY-MM-DD):', y);
        y += 15;
        addFormField(doc, 'Age:', y);
        y += 25;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Parent/Guardian Information', 20, y);
        y += 15;
        addFormField(doc, "Parent's First Name:", y);
        y += 15;
        addFormField(doc, "Parent's Last Name:", y);
        y += 15;
        addFormField(doc, 'Email Address:', y);
        y += 15;
        addFormField(doc, 'Phone Number:', y);
        y += 15;
        addFormField(doc, 'Home Address:', y);
        y += 15;
        addFormField(doc, 'City:', y);
        y += 15;
        addFormField(doc, 'State:', y);
        y += 15;
        addFormField(doc, 'ZIP Code:', y);
        y += 25;
        
        doc.addPage();
        y = 30;
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

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
            <ScholarStartLogo className="h-12 w-12 text-primary" />
            <CardTitle className="text-3xl">Student Registration</CardTitle>
        </div>
        <CardDescription>
          Please fill out the form below to register a new student.
        </CardDescription>
        {studentId && (
            <div className="pt-4">
                <p className="text-sm font-semibold text-muted-foreground">Generated Student ID</p>
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
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Liam" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Smith" {...field} /></FormControl><FormMessage /></FormItem>
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

            <Separator />
            
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Payment Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="paymentPlan"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Select a Payment Plan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a plan..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Full Payment">Full Payment ($2,375)</SelectItem>
                            <SelectItem value="Two Installments">Two Installments ($1,250 x 2)</SelectItem>
                            <SelectItem value="Monthly Plan">Monthly Plan ($625 x 4)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <Card className="md:col-span-2">
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                        <div>
                            <h4 className="font-semibold">Full Payment</h4>
                            <p className="text-sm text-muted-foreground">Pay upfront and receive a 5% discount.</p>
                            <p className="text-lg font-bold mt-2">$2,375</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Two Installments</h4>
                            <p className="text-sm text-muted-foreground">$1,250 at the beginning and mid-point of the semester.</p>
                            <p className="text-lg font-bold mt-2">$1,250 x 2</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Monthly Plan</h4>
                            <p className="text-sm text-muted-foreground">Four monthly installments of $625.</p>
                            <p className="text-lg font-bold mt-2">$625 x 4</p>
                        </div>
                    </CardContent>
                </Card>
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
            <AlertDialog>
                <div className="flex gap-4">
                    <AlertDialogTrigger asChild>
                        <Button type="button" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Registration'}
                        </Button>
                    </AlertDialogTrigger>
                    <Button type="button" variant="outline" className="w-full" onClick={downloadNewStudentApplication} disabled={isLoading}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Registration</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to submit this new student registration? Please review the details before confirming.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    