'use client';

import * as React from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, ArrowLeft } from 'lucide-react';
import { STUDENTS, GRADES, SUBJECTS, ATTENDANCE } from '@/lib/data';
import type { Student, Grade, Subject as SubjectType, Attendance as AttendanceType } from '@/lib/types';
import { ScholarStartLogo } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type ReportCardProps = {
  studentId: string;
};

export default function ReportCard({ studentId }: ReportCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = React.useState<Student | null>(null);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [attendance, setAttendance] = React.useState<{ present: number; absent: number; tardy: number }>({ present: 0, absent: 0, tardy: 0 });

  React.useEffect(() => {
    const studentData = STUDENTS.find((s) => s.id === studentId);
    if (studentData) {
      setStudent(studentData);
      const studentGrades = GRADES.filter((g) => g.studentId === studentId);
      setGrades(studentGrades);
      
      const studentAttendance = ATTENDANCE.filter(a => a.studentId === studentId);
      const summary = { present: 0, absent: 0, tardy: 0 };
      studentAttendance.forEach(a => {
        summary[a.status]++;
      });
      setAttendance(summary);

    } else {
      // Handle student not found, maybe redirect or show an error
      router.push('/dashboard/reports');
    }
  }, [studentId, router]);
  
  const getSubjectName = (subjectId: string) => {
    return SUBJECTS.find(s => s.id === subjectId)?.name || 'N/A';
  }

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
  
  const downloadReportCard = () => {
    if (!student) return;

    try {
        const doc = new jsPDF();
        addLogoAndHeader(doc, `Report Card for ${student.name}`);
        let y = 60;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Student Information', 20, y);
        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Student ID: ${student.id}`, 20, y);
        y += 7;
        doc.text(`Name: ${student.name}`, 20, y);
        y += 7;
        doc.text(`Age: ${student.age}`, 20, y);
        y += 7;
        doc.text(`Report Date: ${format(new Date(), 'PPP')}`, 20, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Grades', 20, y);
        y += 10;
        doc.setFont('helvetica', 'normal');
        if(grades.length > 0) {
            grades.forEach(grade => {
                doc.text(`${getSubjectName(grade.subject)}: ${grade.grade}`, 25, y);
                y += 7;
                if (grade.notes) {
                  doc.setFontSize(10);
                  doc.text(`Notes: ${grade.notes}`, 30, y, { maxWidth: 150 });
                  y += 10;
                  doc.setFontSize(12);
                }
            })
        } else {
            doc.text('No grades recorded for this period.', 25, y);
            y += 7;
        }
        y += 10;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Attendance Summary', 20, y);
        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Present: ${attendance.present} days`, 25, y);
        y += 7;
        doc.text(`Absent: ${attendance.absent} days`, 25, y);
        y += 7;
        doc.text(`Tardy: ${attendance.tardy} days`, 25, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Teacher's Comments", 20, y);
        y += 10;
        doc.setLineWidth(0.2);
        doc.rect(20, y, 170, 40);
        y += 60;

        doc.setFontSize(12);
        doc.text('Signature:', 20, y);
        doc.line(40, y, 110, y);
        doc.text('Date:', 120, y);
        doc.line(132, y, 190, y);

        doc.save(`${student.name.replace(' ', '_')}_ReportCard.pdf`);
        toast({
            title: "Download Started",
            description: `Report card for ${student.name} is being downloaded.`
        });
    } catch (e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: "Download Failed",
            description: `Could not generate PDF for the report card.`
        });
    }
  }


  if (!student) {
    return <div>Loading report card...</div>;
  }

  return (
    <>
    <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Button>
      </div>
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
            <ScholarStartLogo className="h-12 w-12 text-primary" />
            <CardTitle className="text-3xl">Report Card</CardTitle>
            <CardDescription className="text-lg">{student.name}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={student.avatarUrl} alt={student.name} />
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                    <p className="text-sm text-muted-foreground">Age: {student.age}</p>
                    <p className="text-sm text-muted-foreground">Report Date: {format(new Date(), 'PPP')}</p>
                </div>
            </div>
        </div>
        
        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-semibold mb-4">Grades</h3>
                <div className="space-y-4">
                {SUBJECTS.map(subject => {
                    const grade = grades.find(g => g.subject === subject.id);
                    return (
                        <div key={subject.id}>
                            <p className="font-medium">{subject.name}</p>
                            <p className="text-2xl font-bold text-primary">{grade?.grade || 'N/A'}</p>
                            {grade?.notes && <p className="text-sm text-muted-foreground mt-1">Notes: {grade.notes}</p>}
                        </div>
                    )
                })}
                {grades.length === 0 && <p className="text-muted-foreground">No grades recorded for this period.</p>}
                </div>
            </div>
             <div>
                <h3 className="text-xl font-semibold mb-4">Attendance Summary</h3>
                <div className="space-y-4">
                    <div>
                        <p className="font-medium">Present</p>
                        <p className="text-2xl font-bold text-green-600">{attendance.present} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                    </div>
                     <div>
                        <p className="font-medium">Absent</p>
                        <p className="text-2xl font-bold text-destructive">{attendance.absent} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                    </div>
                     <div>
                        <p className="font-medium">Tardy</p>
                        <p className="text-2xl font-bold text-yellow-500">{attendance.tardy} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                    </div>
                </div>
            </div>
        </div>

        <Separator className="my-6" />

        <div>
            <h3 className="text-xl font-semibold mb-2">Teacher's Comments</h3>
            <p className="text-muted-foreground italic">
                {student.name} has shown great enthusiasm this term, especially in creative activities. We encourage focusing more on number recognition skills.
            </p>
        </div>

      </CardContent>
      <CardFooter className="p-6">
        <Button className="w-full" onClick={downloadReportCard}>
            <Download className="mr-2 h-4 w-4"/>
            Download Report Card
        </Button>
      </CardFooter>
    </Card>
    </>
  );
}

    