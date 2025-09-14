'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { STUDENTS, FEES } from '@/lib/data';
import type { Student, Fee } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type StudentProfileProps = {
    studentId: string;
}

export default function StudentProfile({ studentId }: StudentProfileProps) {
  const router = useRouter();
  const [student, setStudent] = React.useState<Student | null>(null);
  const [fee, setFee] = React.useState<Fee | null>(null);

  React.useEffect(() => {
    const studentData = STUDENTS.find(s => s.id === studentId);
    if (studentData) {
        setStudent(studentData);
        const feeData = FEES.find(f => f.studentId === studentId);
        if (feeData) {
          setFee(feeData);
        }
    } else {
        router.push('/dashboard');
    }
  }, [studentId, router]);

  if (!student) {
      return <div>Loading...</div>
  }

  // Mock data for display, similar to edit form
  const mockDetails = {
    parentFirstName: 'John',
    parentLastName: 'Doe',
    parentEmail: student.parentContact,
    parentPhone: '(555) 123-4567',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '(555) 765-4321',
    medicalConditions: 'None'
  };

    const getStatusVariant = (status: 'Paid' | 'Pending' | 'Overdue') => {
      switch(status) {
          case 'Paid': return 'default';
          case 'Pending': return 'secondary';
          case 'Overdue': return 'destructive';
          default: return 'outline';
      }
  }

  return (
    <>
    <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
    </div>
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center gap-4 mb-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={student.avatarUrl} alt={student.name} />
                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{student.name}</CardTitle>
        </div>
        <CardDescription>
          Student ID: {student.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">First Name</p><p>{student.name.split(' ')[0]}</p></div>
                    <div><p className="text-sm text-muted-foreground">Last Name</p><p>{student.name.split(' ').slice(1).join(' ')}</p></div>
                    <div><p className="text-sm text-muted-foreground">Age</p><p>{student.age}</p></div>
                    <div><p className="text-sm text-muted-foreground">Date of Birth</p><p>{new Date(new Date().setFullYear(new Date().getFullYear() - student.age)).toLocaleDateString()}</p></div>
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="text-xl font-semibold mb-4">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">First Name</p><p>{mockDetails.parentFirstName}</p></div>
                    <div><p className="text-sm text-muted-foreground">Last Name</p><p>{mockDetails.parentLastName}</p></div>
                    <div><p className="text-sm text-muted-foreground">Email</p><p>{mockDetails.parentEmail}</p></div>
                    <div><p className="text-sm text-muted-foreground">Phone</p><p>{mockDetails.parentPhone}</p></div>
                    <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Address</p><p>{`${mockDetails.address}, ${mockDetails.city}, ${mockDetails.state} ${mockDetails.zip}`}</p></div>
                </div>
            </div>

            <Separator />
            
            {fee && (
              <>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Fee & Payment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><p className="text-sm text-muted-foreground">Payment Plan</p><p>{fee.plan}</p></div>
                        <div><p className="text-sm text-muted-foreground">Amount Due</p><p>${fee.amount.toFixed(2)}</p></div>
                        <div><p className="text-sm text-muted-foreground">Status</p><p><Badge variant={getStatusVariant(fee.status)}>{fee.status}</Badge></p></div>
                    </div>
                </div>

                <Separator />
              </>
            )}


            <div>
                <h3 className="text-xl font-semibold mb-4">Emergency and Health Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">Emergency Contact</p><p>{mockDetails.emergencyContactName}</p></div>
                    <div><p className="text-sm text-muted-foreground">Emergency Phone</p><p>{mockDetails.emergencyContactPhone}</p></div>
                    <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Medical Conditions</p><p>{mockDetails.medicalConditions}</p></div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
