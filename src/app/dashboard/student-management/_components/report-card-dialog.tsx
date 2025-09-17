
'use client';

import * as React from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';
import type { Student, Grade, Subject } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { getGradesByStudent } from '@/services/grades';
import { getAttendanceByStudent } from '@/services/attendance';
import { getSubjects } from '@/services/subjects';

type ReportCardDialogProps = {
  student: Student;
};

export default function ReportCardDialog({ student }: ReportCardDialogProps) {
  const { toast } = useToast();
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [attendance, setAttendance] = React.useState({
    present: 0,
    absent: 0,
    tardy: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = () => {
        setLoading(true);
        const studentGrades = getGradesByStudent(student.id);
        const studentAttendance = getAttendanceByStudent(student.id);
        const subjectData = getSubjects();
        
        setGrades(studentGrades);
        setSubjects(subjectData);

        const summary = { present: 0, absent: 0, tardy: 0 };
        studentAttendance.forEach((a) => {
            summary[a.status]++;
        });
        setAttendance(summary);
        setLoading(false);
    };

    fetchData();
  }, [student.id]);

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || 'N/A';
  };

  const downloadReportCard = () => {
     try {
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('Aunty Bernard', 20, 22);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(18);
        doc.text(`Report Card for ${student.name}`, 20, 35);
        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);
        
        let y = 60;
        doc.setFontSize(12);
        doc.text(`Student ID: ${student.id}`, 20, y);
        y += 10;
        doc.text(`Report Date: ${format(new Date(), 'PPP')}`, 20, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Grades', 20, y);
        y += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        if(grades.length > 0) {
            grades.forEach(grade => {
                doc.text(`${getSubjectName(grade.subject)}: ${grade.grade}`, 25, y);
                y+= 7;
                if (grade.notes) {
                  doc.setFontSize(10);
                  doc.text(`Notes: ${grade.notes}`, 30, y, { maxWidth: 150 });
                  y += 10;
                  doc.setFontSize(12);
                }
            });
        } else {
            doc.text('No grades recorded for this period.', 25, y);
            y+= 7;
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

  return (
    <>
      <DialogHeader>
        <DialogTitle>Report Card Summary</DialogTitle>
        <DialogDescription>
          Showing report for {student.name} ({student.id})
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[60vh] overflow-y-auto p-1">
        {loading ? <p>Loading report...</p> : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
                <h3 className="text-lg font-semibold mb-4">Grades</h3>
                <div className="space-y-3">
                {subjects.map((subject) => {
                    const grade = grades.find((g) => g.subject === subject.id);
                    return (
                    <div key={subject.id} className="flex justify-between">
                        <p className="font-medium">{subject.name}</p>
                        <p className="font-bold text-primary">
                        {grade?.grade || 'N/A'}
                        </p>
                    </div>
                    );
                })}
                {grades.length === 0 && (
                    <p className="text-muted-foreground">No grades recorded.</p>
                )}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-4">Attendance Summary</h3>
                <div className="space-y-3">
                <div className="flex justify-between">
                    <p className="font-medium">Present</p>
                    <p className="font-bold text-green-600">{attendance.present} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                </div>
                <div className="flex justify-between">
                    <p className="font-medium">Absent</p>
                    <p className="font-bold text-destructive">{attendance.absent} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                </div>
                <div className="flex justify-between">
                    <p className="font-medium">Tardy</p>
                    <p className="font-bold text-yellow-500">{attendance.tardy} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                </div>
                </div>
            </div>
            </div>
            <Separator />
            <div className="py-4">
                <h3 className="text-lg font-semibold mb-2">Teacher's Comments</h3>
                <p className="text-sm text-muted-foreground italic">
                    {student.name} has shown great enthusiasm this term. We encourage focusing more on number recognition skills.
                </p>
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button onClick={downloadReportCard} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Download Full Report
        </Button>
      </DialogFooter>
    </>
  );
}
