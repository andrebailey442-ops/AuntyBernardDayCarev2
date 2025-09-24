

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
import { ArrowLeft, File, View } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Student, Fee, StudentDocument } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getStudent } from '@/services/students';
import { getFeeByStudentId } from '@/services/fees';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

type StudentProfileProps = {
    studentId: string;
}

export default function StudentProfile({ studentId }: StudentProfileProps) {
  const router = useRouter();
  const [student, setStudent] = React.useState<Student | null>(null);
  const [fee, setFee] = React.useState<Fee | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const studentData = await getStudent(studentId);
        if (studentData) {
            setStudent(studentData);
            const feeData = await getFeeByStudentId(studentId);
            if (feeData) {
            setFee(feeData);
            }
        } else {
            router.push('/dashboard');
        }
        setLoading(false);
    }
    fetchData();
  }, [studentId, router]);

  const handleViewDocument = (doc: StudentDocument) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<iframe src="${doc.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      newWindow.document.title = doc.name;
    }
  };

  if (loading || !student) {
      return (
        <div>
            <div className="mb-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
            <Card className="max-w-4xl mx-auto backdrop-blur-sm bg-card/80">
                <CardHeader className="text-center">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <Skeleton className="h-4 w-64 mx-auto" />
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        </div>
      );
  }

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
    <Card className="max-w-4xl mx-auto backdrop-blur-sm bg-card/80">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center gap-4 mb-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={student.avatarUrl} alt={student.name} />
                <AvatarFallback>{student.name ? student.name.split(' ').map(n => n[0]).join('') : ''}</AvatarFallback>
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
                    <div><p className="text-sm text-muted-foreground">Full Name</p><p>{student.name}</p></div>
                    <div><p className="text-sm text-muted-foreground">Gender</p><p>{student.gender}</p></div>
                    <div><p className="text-sm text-muted-foreground">Age</p><p>{student.age}</p></div>
                    <div><p className="text-sm text-muted-foreground">Date of Birth</p><p>{format(new Date(student.dob), 'PPP')}</p></div>
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="text-xl font-semibold mb-4">Program Enrollment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <span className="font-medium">Preschool</span>
                        {student.preschool ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3">
                        <span className="font-medium">After-Care</span>
                        {student.afterCare ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3">
                        <span className="font-medium">Nursery</span>
                        {student.nursery ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                    </div>
                </div>
            </div>

            <Separator />

             <div>
                <h3 className="text-xl font-semibold mb-4">Uploaded Documents</h3>
                {student.documents && student.documents.length > 0 ? (
                    <ul className="space-y-2">
                        {student.documents.map((doc, index) => (
                            <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{doc.name}</span>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc)}>
                                    <View className="mr-2 h-4 w-4" />
                                    View
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No documents have been uploaded for this student.</p>
                )}
            </div>

            <Separator />

            <div>
                <h3 className="text-xl font-semibold mb-4">Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {student.guardians.map((guardian, index) => (
                        <div key={index} className="space-y-4 rounded-lg border p-4">
                            <h4 className="font-medium">Guardian {index + 1}</h4>
                            <Separator />
                            <div><p className="text-sm text-muted-foreground">Name</p><p>{guardian.firstName} {guardian.lastName}</p></div>
                            <div><p className="text-sm text-muted-foreground">Relationship</p><p>{guardian.relationship}</p></div>
                            <div><p className="text-sm text-muted-foreground">Email</p><p>{guardian.contact}</p></div>
                            <div><p className="text-sm text-muted-foreground">Phone</p><p>{guardian.phone}</p></div>
                            <div><p className="text-sm text-muted-foreground">Occupation</p><p>{guardian.occupation || 'N/A'}</p></div>
                            <div><p className="text-sm text-muted-foreground">Place of Employment</p><p>{guardian.placeOfEmployment || 'N/A'}</p></div>
                            <div><p className="text-sm text-muted-foreground">Work Number</p><p>{guardian.workNumber || 'N/A'}</p></div>
                             <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p>{`${guardian.address || ''}, ${guardian.city || ''}, ${guardian.state || ''}`}</p>
                            </div>
                        </div>
                    ))}
                    {student.guardians.length < 2 && (
                         <div className="space-y-4 rounded-lg border p-4 border-dashed">
                            <h4 className="font-medium">Guardian 2</h4>
                            <Separator />
                            <p className="text-sm text-muted-foreground">No information provided for a second guardian.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {student.authorizedPickups && student.authorizedPickups.length > 0 && (
                <>
                <Separator />
                <div>
                    <h3 className="text-xl font-semibold mb-4">Authorized Pickup Persons</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.authorizedPickups.map((person, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-medium">Person {index + 1}</h4>
                        <div><p className="text-sm text-muted-foreground">Name</p><p>{person.name}</p></div>
                        <div><p className="text-sm text-muted-foreground">Relationship</p><p>{person.relationship}</p></div>
                        <div><p className="text-sm text-muted-foreground">Phone</p><p>{person.phone}</p></div>
                        </div>
                    ))}
                    </div>
                </div>
                </>
            )}

            <Separator />

            <div>
                <h3 className="text-xl font-semibold mb-4">Emergency and Health Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">Emergency Contact</p><p>{student.emergencyContactName || 'N/A'}</p></div>
                    <div><p className="text-sm text-muted-foreground">Emergency Phone</p><p>{student.emergencyContactPhone || 'N/A'}</p></div>
                    <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Medical Conditions</p><p>{student.medicalConditions || 'None'}</p></div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}

    
