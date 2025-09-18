
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Staff } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getStaffMember } from '@/services/staff';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BusyBeeLogo } from '@/components/icons';


type StaffProfileProps = {
    staffId: string;
}

export default function StaffProfile({ staffId }: StaffProfileProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [staff, setStaff] = React.useState<Staff | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = () => {
        setLoading(true);
        const staffData = getStaffMember(staffId);
        if (staffData) {
            setStaff(staffData);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Staff member not found.'});
            router.push('/dashboard/staff');
        }
        setLoading(false);
    }
    fetchData();
  }, [staffId, router, toast]);

  const handleDownloadReport = () => {
    if (!staff) return;
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("Aunty Bernard", 20, 22);
        doc.setFontSize(18);
        doc.text("Staff Profile Report", pageWidth - 20, 22, { align: 'right' });
        doc.setLineWidth(0.5);
        doc.line(20, 30, pageWidth - 20, 30);
        
        let y = 50;

        // Personal Information
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("Personal Information", 20, y);
        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${staff.name}`, 20, y);
        y += 7;
        doc.text(`Date of Birth: ${format(new Date(staff.dob), 'PPP')}`, 20, y);
        y += 7;
        doc.text(`Age: ${staff.age}`, 20, y);
        y += 7;
        doc.text(`Address: ${staff.address}`, 20, y);
        y += 15;

        // Roles
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("Assigned Roles", 20, y);
        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        if (staff.roles && staff.roles.length > 0) {
            doc.text(staff.roles.join(', '), 20, y);
        } else {
            doc.text("No roles assigned.", 20, y);
        }
        y += 15;
        
        doc.save(`${staff.name}_Report.pdf`);
        toast({
            title: 'Report Downloaded',
            description: `A report for ${staff.name} has been downloaded.`
        });
    } catch(error) {
        console.error("Failed to generate PDF report:", error);
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Could not generate the staff report.'
        });
    }
  }

  if (loading || !staff) {
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
                <CardContent className="p-6 space-y-8">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
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
            Back to Staff List
        </Button>
    </div>
    <Card className="max-w-4xl mx-auto backdrop-blur-sm bg-card/80">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center gap-4 mb-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{staff.name}</CardTitle>
        </div>
        <CardDescription>
          Staff ID: {staff.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">Full Name</p><p>{staff.name}</p></div>
                    <div><p className="text-sm text-muted-foreground">Age</p><p>{staff.age}</p></div>
                    <div><p className="text-sm text-muted-foreground">Date of Birth</p><p>{format(new Date(staff.dob), 'PPP')}</p></div>
                    <div><p className="text-sm text-muted-foreground">Address</p><p>{staff.address}</p></div>
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="text-xl font-semibold mb-4">Roles</h3>
                <div className="flex flex-wrap gap-2">
                    {staff.roles && staff.roles.length > 0 ? (
                        staff.roles.map(role => (
                            <Badge key={role} variant="secondary">{role}</Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No roles have been assigned to this staff member.</p>
                    )}
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter>
          <Button className="w-full" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
      </CardFooter>
    </Card>
    </>
  );
}
