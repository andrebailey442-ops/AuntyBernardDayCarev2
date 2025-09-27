
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
  useFormField,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { getYear, getMonth, getDate, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Staff, StaffRole } from '@/lib/types';
import { addStaff, updateStaff, getStaffMember } from '@/services/staff';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { staffRoles } from './staff-manager';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Trash2 } from 'lucide-react';

const staffFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  avatarUrl: z.string().optional(),
  dob: z.date({ required_error: 'Date of birth is required' }),
  address: z.string().min(5, 'Address is required.'),
  roles: z.array(z.string()).min(1, 'At least one role must be selected.'),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

type StaffFormProps = {
  staffMember: Staff | null;
  onSuccess: () => void;
};

export function StaffForm({ staffMember, onSuccess }: StaffFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const avatarUploadRef = React.useRef<HTMLInputElement>(null);

  const [dobState, setDobState] = React.useState({
    day: '',
    month: '',
    year: '',
  });

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: '',
      avatarUrl: '',
      address: '',
      roles: [],
    },
  });

  React.useEffect(() => {
    if (staffMember) {
      const dob = staffMember.dob ? parseISO(staffMember.dob) : new Date();
      form.reset({
        name: staffMember.name,
        avatarUrl: staffMember.avatarUrl,
        dob: dob,
        address: staffMember.address,
        roles: staffMember.roles,
      });
      setDobState({
        day: getDate(dob).toString(),
        month: (getMonth(dob) + 1).toString(),
        year: getYear(dob).toString(),
      });
    } else {
        form.reset({
            name: '',
            avatarUrl: '',
            address: '',
            roles: [],
            dob: undefined,
        });
        setDobState({ day: '', month: '', year: '' });
    }
  }, [staffMember, form]);

  const dob = form.watch('dob');
  const avatarUrl = form.watch('avatarUrl');

  React.useEffect(() => {
    const { day, month, year } = dobState;
    if (day && month && year) {
      const newDob = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(newDob.getTime())) {
        form.setValue('dob', newDob, { shouldValidate: true });
      }
    }
  }, [dobState, form]);

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({
            variant: "destructive",
            title: "File too large",
            description: "Please upload an image smaller than 1MB.",
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        form.setValue('avatarUrl', dataUri, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };


  const onSubmit = (data: StaffFormValues) => {
    setIsLoading(true);
    try {
      const age = calculateAge(data.dob);
      const staffData: Partial<Staff> = {
        name: data.name,
        dob: data.dob.toISOString(),
        age,
        address: data.address,
        roles: data.roles,
        avatarUrl: data.avatarUrl || `https://i.pravatar.cc/150?u=${data.name.replace(/\s/g, '')}`,
        imageHint: data.avatarUrl ? 'custom' : 'person',
      };
      
      if (staffMember) {
        updateStaff(staffMember.id, staffData);
        toast({ title: 'Staff Updated', description: `${data.name}'s profile has been updated.` });
      } else {
        addStaff(staffData as Omit<Staff, 'id'>);
        toast({ title: 'Staff Added', description: `${data.name} has been added to the team.` });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save staff member:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save staff member.' });
    } finally {
      setIsLoading(false);
    }
  };

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
      <DialogHeader>
        <DialogTitle>{staffMember ? 'Edit Staff Profile' : 'Add New Staff Member'}</DialogTitle>
        <DialogDescription>
          {staffMember ? `Update details for ${staffMember.name}.` : 'Fill in the details for the new team member.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto px-2">
            <FormField
                control={form.control}
                name="avatarUrl"
                render={() => (
                    <FormItem className="flex flex-col items-center text-center">
                        <FormLabel>Profile Picture</FormLabel>
                        <FormControl>
                            <div id={useFormField().id} className="flex flex-col items-center gap-2">
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={avatarUploadRef}
                                    onChange={handleAvatarUpload}
                                    accept="image/png, image/jpeg, image/webp"
                                />
                                <div
                                    className="relative group cursor-pointer"
                                    onClick={() => avatarUploadRef.current?.click()}
                                >
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={avatarUrl} alt={form.getValues('name')} />
                                        <AvatarFallback>
                                            {form.getValues('name')?.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                {avatarUrl && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => form.setValue('avatarUrl', '', { shouldValidate: true })}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove Photo
                                    </Button>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormDescription>Age: {dob ? calculateAge(dob) : '...'}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 123 Main Street, Kingston" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />
          
          <FormField
            control={form.control}
            name="roles"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Roles</FormLabel>
                  <FormDescription>Select all applicable roles for this staff member.</FormDescription>
                </div>
                <div className="space-y-3">
                  {staffRoles.map((role) => (
                    <FormField
                      key={role}
                      control={form.control}
                      name="roles"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <FormLabel className="font-normal">{role}</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value?.includes(role)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), role])
                                    : field.onChange(field.value?.filter((value) => value !== role));
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
