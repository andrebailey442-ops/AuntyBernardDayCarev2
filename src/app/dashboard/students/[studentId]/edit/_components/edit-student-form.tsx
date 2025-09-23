

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
import { ArrowLeft, Trash2, PlusCircle } from 'lucide-react';
import { format, getYear, getMonth, getDate, parseISO } from 'date-fns';
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
import { JAMAICAN_PARISHES, CITIES_BY_PARISH } from '@/lib/data';
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

const phoneRegex = new RegExp(
  /^(\+\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
);

const guardianSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.').max(50, 'First name cannot exceed 50 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.').max(50, 'Last name cannot exceed 50 characters.'),
  relationship: z.string().min(2, 'Relationship is required.'),
  contact: z.string().email('Invalid email address.'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format.'),
  occupation: z.string().optional(),
  placeOfEmployment: z.string().optional(),
  workNumber: z.string().regex(phoneRegex, 'Invalid phone number format.').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  addressSameAsGuardian1: z.boolean().optional(),
});

const authorizedPickupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    relationship: z.string().min(2, 'Relationship is required.'),
    phone: z.string().regex(phoneRegex, 'Invalid phone number format.'),
});

const editStudentSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters.').max(50, 'First name cannot exceed 50 characters.'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters.').max(50, 'Last name cannot exceed 50 characters.'),
    dob: z.date({ required_error: 'Date of birth is required' }),
    age: z.number({ required_error: 'Age is required and calculated from DOB.' }).refine(age => age <= 6, {
        message: "Student's age cannot exceed 6 years for online registration.",
    }),
    gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required.' }),
    guardians: z.array(guardianSchema).min(1, 'At least one guardian is required.').max(2, 'You can add a maximum of 2 guardians.'),
    preschool: z.boolean().default(false),
    afterCare: z.boolean().default(false),
    nursery: z.boolean().default(false),
    emergencyContactName: z.string().min(2, 'Emergency contact name is required.').max(100, 'Name is too long'),
    emergencyContactPhone: z.string().regex(phoneRegex, 'Invalid phone number format.'),
    medicalConditions: z.string().max(500, 'Medical conditions cannot exceed 500 characters.').optional(),
    authorizedPickups: z.array(authorizedPickupSchema).max(5, 'You can add a maximum of 5 authorized pickup persons.').optional(),
}).superRefine((data, ctx) => {
    if (data.guardians[0]) {
        if (!data.guardians[0].address || !data.guardians[0].city || !data.guardians[0].state) {
            ctx.addIssue({ code: 'custom', path: ['guardians', 0, 'address'], message: 'Address information is required for the primary guardian.' });
        }
    }
    if (data.guardians[1] && !data.guardians[1].addressSameAsGuardian1) {
        if (!data.guardians[1].address || !data.guardians[1].city || !data.guardians[1].state) {
            ctx.addIssue({ code: 'custom', path: ['guardians', 1, 'address'], message: 'Address information is required if not same as Guardian 1.' });
        }
    }
    if (!data.preschool && !data.afterCare && !data.nursery) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['preschool'], // You can attach the error to one of the fields
            message: 'At least one program (Preschool, After-Care, or Nursery) must be selected.',
        });
    }
});


type EditStudentFormValues = z.infer<typeof editStudentSchema>;

type EditStudentFormProps = {
    studentId: string;
}

const relationshipOptions = [
    'Mother', 'Father', 'Guardian', 'Grandmother', 'Grandfather', 'Aunt', 'Uncle', 'Brother', 'Sister', 'Other'
];

export function EditStudentForm({ studentId }: EditStudentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);
  const [student, setStudent] = React.useState<Student | null>(null);
  const [isAgeOverrideDialogOpen, setIsAgeOverrideDialogOpen] = React.useState(false);

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
        gender: undefined,
        guardians: [],
        preschool: false,
        afterCare: false,
        nursery: false,
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
    const fetchStudent = async () => {
        setIsFetching(true);
        const studentData = await getStudent(studentId);
        if (studentData) {
            setStudent(studentData);
            const [firstName, ...lastName] = studentData.name.split(' ');
            const dob = studentData.dob ? new Date(studentData.dob) : new Date(new Date().setFullYear(new Date().getFullYear() - studentData.age));
            
            form.reset({
                firstName: firstName,
                lastName: lastName.join(' '),
                dob: dob,
                age: studentData.age,
                gender: studentData.gender,
                guardians: studentData.guardians.map(g => ({ ...g, occupation: g.occupation || '', placeOfEmployment: g.placeOfEmployment || '', workNumber: g.workNumber || '' })),
                preschool: studentData.preschool || false,
                afterCare: studentData.afterCare || false,
                nursery: studentData.nursery || false,
                emergencyContactName: studentData.emergencyContactName || '',
                emergencyContactPhone: studentData.emergencyContactPhone || '',
                medicalConditions: studentData.medicalConditions || '',
                authorizedPickups: studentData.authorizedPickups || [],
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
  const guardians = form.watch('guardians');

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
        const processedGuardians = data.guardians.map((g, index) => {
            if (index === 1 && g.addressSameAsGuardian1 && data.guardians[0]) {
                return {
                    ...g,
                    address: data.guardians[0].address,
                    city: data.guardians[0].city,
                    state: data.guardians[0].state,
                }
            }
            return g;
        });

        const updatedData: Partial<Student> = {
            name: `${data.firstName} ${data.lastName}`,
            age: data.age,
            dob: data.dob.toISOString(),
            gender: data.gender,
            guardians: processedGuardians,
            preschool: data.preschool,
            afterCare: data.afterCare,
            nursery: data.nursery,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            medicalConditions: data.medicalConditions,
            authorizedPickups: data.authorizedPickups,
        };
        updateStudent(studentId, updatedData);

        toast({
        title: 'Student Updated',
        description: `The details for ${data.firstName} ${data.lastName} have been successfully updated.`,
        });
        setIsAgeOverrideDialogOpen(false);
        router.push(`/dashboard/students/${studentId}`);
    } catch (error) {
        console.error("Failed to update student: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update student.' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
        onSubmit(form.getValues());
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
    onSubmit(form.getValues());
  }

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
          <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-8">
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
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="preschool"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <FormLabel className="font-normal">Preschool</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="afterCare"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <FormLabel className="font-normal">After-Care</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="nursery"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <FormLabel className="font-normal">Nursery</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                        )}
                    />
                </div>
                 <FormField control={form.control} name="preschool" render={() => ( <FormItem><FormMessage /></FormItem> )} />
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
                {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </form>
        </Form>
        <AlertDialog open={isAgeOverrideDialogOpen} onOpenChange={setIsAgeOverrideDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Age Limit Exceeded</AlertDialogTitle>
                    <AlertDialogDescription>
                        The student's age is over 6. This online form is for children 6 and under. Do you want to override and continue with the update?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleOverrideSubmit} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Override and Continue'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
    </>
  );
}
