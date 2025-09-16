
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
import { Download, Info, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { BusyBeeLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
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
  afterCare: z.boolean().default(false),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
  medicalConditions: z.string().optional(),
});

type NewStudentFormValues = z.infer<typeof newStudentSchema>;

const AFTER_CARE_FEE = 500;
const TUITION_FULL = 2375;
const TUITION_INSTALLMENTS = 2500;


export function NewStudentForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [studentId, setStudentId] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [dobState, setDobState] = React.useState({
    day: '',
    month: '',
    year: '',
  });

  const form = useForm<NewStudentFormValues & { studentId: string }>({
    resolver: zodResolver(newStudentSchema.extend({ studentId: z.string() })),
    defaultValues: {
        studentId: '',
        firstName: '',
        lastName: '',
        dob: undefined,
        parentFirstName: '',
        parentLastName: '',
        parentEmail: '',
        parentPhone: '',
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
            parentFirstName: data.parentFirstName,
            parentLastName: data.parentLastName,
            parentPhone: data.parentPhone,
            address: data.address,
            city: data.city,
            state: data.state,
            afterCare: data.afterCare,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            medicalConditions: data.medicalConditions,
        };
        await addStudent(data.studentId, studentData);

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
    }
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
        <Form {...form}>
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
                            <h4 className="font-semibold mb-2">Parent/Guardian Information</h4>
                            <p><strong>Name:</strong> {formValues.parentFirstName} {formValues.parentLastName}</p>
                            <p><strong>Email:</strong> {formValues.parentEmail}</p>
                            <p><strong>Phone:</strong> {formValues.parentPhone}</p>
                            <p><strong>Address:</strong> {`${formValues.address}, ${formValues.city}, ${formValues.state}`}</p>
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
