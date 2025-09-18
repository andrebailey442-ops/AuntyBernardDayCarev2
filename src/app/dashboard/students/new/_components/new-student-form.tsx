
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
import { Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { BusyBeeLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { newStudentSchema } from '../schema';
import type { NewStudentFormValues } from '../schema';

const AFTER_CARE_FEE = 500;
const TUITION_FULL = 2375;
const TUITION_INSTALLMENTS = 2500;

export function NewStudentForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [studentId, setStudentId] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [paymentPlan, setPaymentPlan] = React.useState<'Full Payment' | 'Two Installments' | 'Monthly Plan'>('Two Installments');
  const [showAdditionalServices, setShowAdditionalServices] = React.useState(false);

  const fromSection = searchParams.get('from');

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
        guardian1: { firstName: '', lastName: '', relationship: '', contact: '', phone: '' },
        guardian2: { firstName: '', lastName: '', relationship: '', contact: '', phone: '' },
        address: '',
        city: '',
        state: '',
        preschool: fromSection === 'preschool',
        afterCare: fromSection === 'after-care',
        nursery: fromSection === 'nursery',
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

  const totalFee = React.useMemo(() => {
    let total = 0;
    if (formValues.preschool) {
      total += paymentPlan === 'Full Payment' ? TUITION_FULL : TUITION_INSTALLMENTS;
    }
    if (formValues.afterCare) {
        total += AFTER_CARE_FEE;
    }
    // Assuming nursery might have a fee, add here if necessary
    return total;
  }, [paymentPlan, formValues.preschool, formValues.afterCare]);

  const enrollmentDeposit = totalFee * 0.3;

  React.useEffect(() => {
    const { day, month, year } = dobState;
    if (day && month && year) {
        const newDob = new Date(Number(year), Number(month) - 1, Number(day));
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
            avatarUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/100/100`,
            imageHint: 'child portrait',
            dob: data.dob.toISOString(),
            guardian1: data.guardian1,
            guardian2: data.guardian2?.firstName ? data.guardian2 : undefined,
            address: data.address,
            city: data.city,
            state: data.state,
            preschool: data.preschool,
            afterCare: data.afterCare,
            nursery: data.nursery,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            medicalConditions: data.medicalConditions,
        };
        addStudent(data.studentId, studentData);

        if (totalFee > 0) {
            addFee({
                studentId: data.studentId,
                amount: totalFee,
                amountPaid: 0,
                status: 'Pending',
                plan: paymentPlan,
            });
        }

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
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setLineWidth(1.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
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
        addFormField(doc, 'First Name:', y); y += 15;
        addFormField(doc, 'Last Name:', y); y += 15;
        addFormField(doc, 'Date of Birth (YYYY-MM-DD):', y); y += 25;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Guardian 1 Information', 20, y);
        y += 15;
        addFormField(doc, "First Name:", y); y += 15;
        addFormField(doc, "Last Name:", y); y += 15;
        addFormField(doc, 'Relationship to child:', y); y += 15;
        addFormField(doc, 'Email Address:', y); y += 15;
        addFormField(doc, 'Phone Number:', y); y += 25;
        doc.addPage();
        addLogoAndHeader(doc, 'Student Registration Form');
        y = 50;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Guardian 2 Information (Optional)', 20, y);
        y += 15;
        addFormField(doc, "First Name:", y); y += 15;
        addFormField(doc, "Last Name:", y); y += 15;
        addFormField(doc, 'Relationship to child:', y); y += 15;
        addFormField(doc, 'Email Address:', y); y += 15;
        addFormField(doc, 'Phone Number:', y); y += 25;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Address Information', 20, y);
        y += 15;
        addFormField(doc, 'Home Address:', y); y += 15;
        addFormField(doc, 'City:', y); y += 15;
        addFormField(doc, 'Parish:', y); y += 25;
        doc.addPage();
        addLogoAndHeader(doc, 'Student Registration Form');
        y = 50;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Emergency and Health Information', 20, y);
        y += 15;
        addFormField(doc, 'Emergency Contact Name:', y); y += 15;
        addFormField(doc, 'Emergency Contact Phone:', y); y += 15;
        doc.setFontSize(12);
        doc.text('Allergies or Medical Conditions (Please describe):', 20, y);
        y += 5;
        doc.setLineWidth(0.2);
        doc.rect(20, y, 170, 40);
        y += 60;
        addSignatureLine(doc, y);
        doc.save('New-Student-Application.pdf');
        toast({ title: "Download Started", description: `New Student Application is being downloaded.` });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Download Failed", description: `Could not generate PDF for the form.` });
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

  const availableServices = [
      { name: 'preschool', field: 'preschool', label: 'Preschool Program' },
      { name: 'after-care', field: 'afterCare', label: 'After-Care Program' },
      { name: 'nursery', field: 'nursery', label: 'Nursery Program' },
  ];

  return (
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
                  render={() => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <div className="grid grid-cols-3 gap-4">
                        <Select value={dobState.month} onValueChange={(value) => setDobState((prev) => ({ ...prev, month: value }))}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl>
                          <SelectContent>{months.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}</SelectContent>
                        </Select>
                        <Select value={dobState.day} onValueChange={(value) => setDobState((prev) => ({ ...prev, day: value }))}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl>
                          <SelectContent>{days.map((d) => (<SelectItem key={d} value={String(d)}>{d}</SelectItem>))}</SelectContent>
                        </Select>
                        <Select value={dobState.year} onValueChange={(value) => setDobState((prev) => ({ ...prev, year: value }))}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl>
                          <SelectContent>{years.map((y) => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}</SelectContent>
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
            
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Guardian 1 Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="guardian1.firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="guardian1.lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="guardian1.relationship" render={({ field }) => (<FormItem><FormLabel>Relationship</FormLabel><FormControl><Input {...field} placeholder="e.g. Mother, Father, Guardian" /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="guardian1.contact" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="guardian1@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="guardian1.phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="876-555-5555" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Guardian 2 Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="guardian2.firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="guardian2.lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <FormField control={form.control} name="guardian2.relationship" render={({ field }) => (<FormItem><FormLabel>Relationship</FormLabel><FormControl><Input {...field} placeholder="e.g. Mother, Father, Guardian" /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="guardian2.contact" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="guardian2@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="guardian2.phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="876-555-5555" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>
            
            <Separator />

             <div className="space-y-4">
                <h3 className="text-xl font-semibold">Address Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>Parish</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a parish" /></SelectTrigger></FormControl><SelectContent>{JAMAICAN_PARISHES.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Program Enrollment</h3>
                <div className="space-y-2">
                    {fromSection && (
                        <div className="p-3 border rounded-lg bg-muted/50">
                            <p className="font-semibold capitalize">{fromSection.replace('-', ' ')} Program</p>
                            <p className="text-sm text-muted-foreground">This program is automatically selected based on where you started the registration.</p>
                        </div>
                    )}
                     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Add Additional Services?</FormLabel>
                            <FormDescription>Select other programs to enroll this student in.</FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={showAdditionalServices} onCheckedChange={setShowAdditionalServices} />
                        </FormControl>
                    </FormItem>

                    {showAdditionalServices && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {availableServices
                                .filter(service => service.name !== fromSection)
                                .map(service => (
                                    <FormField
                                        key={service.name}
                                        control={form.control}
                                        name={service.field as keyof NewStudentFormValues}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">{service.label}</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value as boolean | undefined} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Emergency and Health Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="emergencyContactName" render={({ field }) => (<FormItem><FormLabel>Emergency Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (<FormItem><FormLabel>Emergency Contact Phone</FormLabel><FormControl><Input {...field} placeholder="876-555-5555" /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <FormField control={form.control} name="medicalConditions" render={({ field }) => (
                    <FormItem><FormLabel>Allergies or Medical Conditions</FormLabel><FormControl><Textarea placeholder="List any relevant health information..." {...field} /></FormControl><FormDescription>This information will be kept confidential and used only in case of an emergency.</FormDescription><FormMessage /></FormItem>
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
                        <AlertDialogDescription>Please review the details before confirming.</AlertDialogDescription>
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
                             <><Separator /><div>
                                <h4 className="font-semibold mb-2">Guardian 2 Information</h4>
                                <p><strong>Name:</strong> {formValues.guardian2.firstName} {formValues.guardian2.lastName}</p>
                                <p><strong>Relationship:</strong> {formValues.guardian2.relationship}</p>
                                <p><strong>Email:</strong> {formValues.guardian2.contact}</p>
                                <p><strong>Phone:</strong> {formValues.guardian2.phone}</p>
                            </div></>
                        )}
                        <Separator />
                         <div>
                            <h4 className="font-semibold mb-2">Address</h4>
                            <p>{`${formValues.address}, ${formValues.city}, ${formValues.state}`}</p>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2">Program Enrollment</h4>
                            <p><strong>Preschool:</strong> {formValues.preschool ? 'Yes' : 'No'}</p>
                            <p><strong>After Care:</strong> {formValues.afterCare ? 'Yes' : 'No'}</p>
                            <p><strong>Nursery:</strong> {formValues.nursery ? 'Yes' : 'No'}</p>
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
  );
}
