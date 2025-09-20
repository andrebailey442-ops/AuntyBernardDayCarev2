

'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Download, ArrowLeft, Trash2, PlusCircle } from 'lucide-react';
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
import { JAMAICAN_PARISHES, CITIES_BY_PARISH } from '@/lib/data';
import { newStudentSchema } from '../schema';
import type { NewStudentFormValues } from '../schema';

const AFTER_CARE_FEE = 500;
const TUITION_FULL = 2375;
const TUITION_INSTALLMENTS = 2500;

const relationshipOptions = [
    'Mother', 'Father', 'Guardian', 'Grandmother', 'Grandfather', 'Aunt', 'Uncle', 'Brother', 'Sister', 'Other'
];

const formSchema = z.object({
    ...newStudentSchema.shape,
    studentId: z.string(),
});

export function NewStudentForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [studentId, setStudentId] = React.useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [isAgeOverrideDialogOpen, setIsAgeOverrideDialogOpen] = React.useState(false);

  const [paymentPlan, setPaymentPlan] = React.useState<'Full Payment' | 'Two Installments' | 'Monthly Plan'>('Two Installments');
  const [showAdditionalServices, setShowAdditionalServices] = React.useState(false);

  const fromSection = searchParams.get('from');

  const [dobState, setDobState] = React.useState({
    day: '',
    month: '',
    year: '',
  });

  const form = useForm<NewStudentFormValues & { studentId: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        studentId: '',
        firstName: '',
        lastName: '',
        gender: undefined,
        guardians: [{ firstName: '', lastName: '', relationship: '', contact: '', phone: '', occupation: '', placeOfEmployment: '', workNumber: '' }],
        preschool: fromSection === 'preschool',
        afterCare: fromSection === 'after-care',
        nursery: fromSection === 'nursery',
        emergencyContactName: '',
        emergencyContactPhone: '',
        medicalConditions: '',
        authorizedPickups: [],
    }
  });

  const { fields: guardianFields, append: appendGuardian, remove: removeGuardian } = useFieldArray({
    control: form.control,
    name: "guardians",
  });

  const { fields: pickupFields, append: appendPickup, remove: removePickup } = useFieldArray({
    control: form.control,
    name: "authorizedPickups",
  });

  React.useEffect(() => {
    const newId = `SID-${Date.now()}`;
    setStudentId(newId);
    form.setValue('studentId', newId);
  }, [form]);

  const dob = form.watch('dob');
  const formValues = form.watch();
  const guardians = form.watch('guardians');

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


  const onSubmit = (data: NewStudentFormValues & { studentId: string }) => {
    setIsLoading(true);
    try {
        const processedGuardians = data.guardians.map((g, index) => {
            if (index === 1 && g.addressSameAsGuardian1) {
                return {
                    ...g,
                    address: data.guardians[0].address,
                    city: data.guardians[0].city,
                    state: data.guardians[0].state,
                };
            }
            return g;
        });

        const studentData = {
            name: `${data.firstName} ${data.lastName}`,
            age: data.age,
            gender: data.gender,
            avatarUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/100/100`,
            imageHint: 'child portrait',
            dob: data.dob.toISOString(),
            guardians: processedGuardians,
            preschool: data.preschool,
            afterCare: data.afterCare,
            nursery: data.nursery,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            medicalConditions: data.medicalConditions,
            authorizedPickups: data.authorizedPickups,
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
        setIsConfirmDialogOpen(false);
        setIsAgeOverrideDialogOpen(false);
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
        setIsConfirmDialogOpen(true);
    } else {
        const ageError = form.formState.errors.age;
        if(ageError && ageError.message?.includes("exceed 6 years")) {
            setIsAgeOverrideDialogOpen(true);
        } else {
            console.log(form.formState.errors);
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please correct the errors on the form before submitting.',
            })
        }
    }
  }

  const handleOverrideSubmit = () => {
    // This function is called when the user confirms the age override.
    // It manually invokes the onSubmit handler with the current form data,
    // bypassing the validation that would normally block it.
    onSubmit(form.getValues());
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
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
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
              <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Guardian Information</h3>
                    <p className="text-sm text-muted-foreground">You can add up to 2 guardians.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => appendGuardian({ firstName: '', lastName: '', relationship: '', contact: '', phone: '', occupation: '', placeOfEmployment: '', workNumber: '' })} disabled={guardianFields.length >= 2}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Guardian
                </Button>
              </div>
              {guardianFields.map((field, index) => {
                const selectedParish = guardians[index]?.state;
                return (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-md">Guardian {index + 1}</h4>
                    {index > 0 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeGuardian(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`guardians.${index}.firstName`} render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`guardians.${index}.lastName`} render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField
                      control={form.control}
                      name={`guardians.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a relationship" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {relationshipOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`guardians.${index}.contact`} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder={`guardian${index+1}@example.com`} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`guardians.${index}.phone`} render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="876-555-5555" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`guardians.${index}.occupation`} render={({ field }) => (<FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`guardians.${index}.placeOfEmployment`} render={({ field }) => (<FormItem><FormLabel>Place of Employment</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`guardians.${index}.workNumber`} render={({ field }) => (<FormItem><FormLabel>Work Number</FormLabel><FormControl><Input placeholder="876-555-5555" {...field} /></FormControl><FormMessage /></FormItem>)} />

                   <Separator className="my-4"/>
                    <h4 className="font-medium">Address Information</h4>
                    
                     {index === 1 && (
                        <FormField
                            control={form.control}
                            name={`guardians.${index}.addressSameAsGuardian1`}
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                <FormLabel>Same as Guardian 1</FormLabel>
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
                    )}

                    { (index === 0 || !guardians[1]?.addressSameAsGuardian1) && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name={`guardians.${index}.state`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parish</FormLabel>
                                    <Select onValueChange={(value) => { field.onChange(value); form.setValue(`guardians.${index}.city`, ''); }} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a parish" /></SelectTrigger></FormControl>
                                        <SelectContent>{JAMAICAN_PARISHES.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name={`guardians.${index}.city`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedParish}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger></FormControl>
                                        <SelectContent>{(CITIES_BY_PARISH[selectedParish || ''] || []).map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            </div>
                            <FormField control={form.control} name={`guardians.${index}.address`} render={({ field }) => (
                                <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}
                </div>
                )})}
              <FormField control={form.control} name="guardians" render={() => ( <FormItem><FormMessage /></FormItem> )} />
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

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Authorized Pickup Persons</h3>
                    <p className="text-sm text-muted-foreground">You can add up to 5 authorized persons.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => appendPickup({ name: '', relationship: '', phone: '' })} disabled={pickupFields.length >= 5}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Person
                </Button>
              </div>
              {pickupFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <h4 className="font-medium text-md">Person {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`authorizedPickups.${index}.name`} render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Jane Doe" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField
                      control={form.control}
                      name={`authorizedPickups.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a relationship" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {relationshipOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                            </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField control={form.control} name={`authorizedPickups.${index}.phone`} render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} placeholder="876-555-5555" /></FormControl><FormMessage /></FormItem>
                    )} />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => removePickup(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
                <FormField control={form.control} name="authorizedPickups" render={() => (
                    <FormItem>
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
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
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
                        {formValues.guardians?.map((guardian, index) => (
                            <div key={index}>
                                <h4 className="font-semibold mb-2">Guardian {index + 1} Information</h4>
                                <p><strong>Name:</strong> {guardian.firstName} {guardian.lastName}</p>
                                <p><strong>Relationship:</strong> {guardian.relationship}</p>
                                <p><strong>Email:</strong> {guardian.contact}</p>
                                <p><strong>Phone:</strong> {guardian.phone}</p>
                                <p><strong>Work Number:</strong> {guardian.workNumber || 'N/A'}</p>
                                <p><strong>Address:</strong> {`${guardian.address}, ${guardian.city}, ${guardian.state}`}</p>
                            </div>
                        ))}
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
                        <AlertDialogAction onClick={() => onSubmit(form.getValues())} disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isAgeOverrideDialogOpen} onOpenChange={setIsAgeOverrideDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Age Limit Exceeded</AlertDialogTitle>
                        <AlertDialogDescription>
                            The student's age is over 6. This online form is for children 6 and under. Do you want to override and continue with the registration? This is recommended only if the student was already accepted via a hard-copy application.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleOverrideSubmit} disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Override and Continue'}
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
