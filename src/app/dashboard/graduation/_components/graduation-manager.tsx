
'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Student, Grade } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getStudents, updateStudent } from '@/services/students';
import { getGradesByStudent } from '@/services/grades';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, GraduationCap } from 'lucide-react';
import jsPDF from 'jspdf';

export default function GraduationManager() {
  const { toast } = useToast();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const studentList = await getStudents();
      setStudents(studentList);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const handleGraduate = async (studentId: string) => {
    try {
      await updateStudent(studentId, { status: 'graduated' });
      setStudents(prev =>
        prev.map(s => (s.id === studentId ? { ...s, status: 'graduated' } : s))
      );
      toast({
        title: 'Student Graduated',
        description: 'The student has been moved to the graduated list.',
      });
    } catch (error) {
      console.error('Failed to graduate student:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update student status.',
      });
    }
  };

  const calculateGPA = (grades: Grade[]): string => {
    if (!grades || grades.length === 0) return 'N/A';
    const gradePoints: { [key: string]: number } = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };
    let totalPoints = 0;
    let gradedSubjects = 0;
    grades.forEach(grade => {
      if (grade.grade && grade.grade in gradePoints) {
        totalPoints += gradePoints[grade.grade];
        gradedSubjects++;
      }
    });
    if (gradedSubjects === 0) return 'N/A';
    return (totalPoints / gradedSubjects).toFixed(2);
  };

  const generateCertificate = async (student: Student) => {
    try {
      const grades = await getGradesByStudent(student.id);
      const gpa = calculateGPA(grades);

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'letter'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add a border
      doc.setDrawColor('#007BFF');
      doc.setLineWidth(10);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.setLineWidth(2);
      doc.rect(15, 15, pageWidth - 30, pageHeight - 35);

      // School Logo
      doc.setFontSize(40);
      doc.setFont('times', 'bold');
      doc.setTextColor('#0056b3');
      doc.text('ScholarStart', pageWidth / 2, 80, { align: 'center' });

      doc.setFontSize(22);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#000000');
      doc.text('Certificate of Graduation', pageWidth / 2, 130, { align: 'center' });
      
      doc.setFontSize(18);
      doc.text('This certifies that', pageWidth / 2, 180, { align: 'center' });

      doc.setFontSize(36);
      doc.setFont('times', 'italic');
      doc.setTextColor('#0056b3');
      doc.text(student.name, pageWidth / 2, 230, { align: 'center' });

      doc.setFontSize(18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#000000');
      doc.text('has successfully completed the Preschool Program.', pageWidth / 2, 280, { align: 'center' });

      if (gpa !== 'N/A') {
        doc.text(`with a final Grade Point Average of ${gpa}.`, pageWidth / 2, 310, { align: 'center' });
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'italic');
      doc.text('We wish you the best in all your future endeavors!', pageWidth / 2, 350, { align: 'center' });


      // Signature lines
      const signatureY = pageHeight - 80;
      doc.setLineWidth(1);
      doc.line(100, signatureY, 250, signatureY);
      doc.text('School Director', 175, signatureY + 15, { align: 'center' });

      doc.line(pageWidth - 250, signatureY, pageWidth - 100, signatureY);
      doc.text('Lead Teacher', pageWidth - 175, signatureY + 15, { align: 'center' });

      doc.save(`${student.name}_Certificate.pdf`);
      toast({
        title: 'Certificate Generated',
        description: `A certificate for ${student.name} has been downloaded.`,
      });
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate the certificate PDF.',
      });
    }
  };

  const enrolledStudents = students.filter(s => s.status !== 'graduated');
  const graduatedStudents = students.filter(s => s.status === 'graduated');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <CardDescription>
            Students currently enrolled. Select "Graduate" to move them to the graduated list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Age</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-10 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : enrolledStudents.length > 0 ? (
                enrolledStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          alt="Student avatar"
                          className="aspect-square rounded-full object-cover"
                          height="40"
                          src={student.avatarUrl}
                          width="40"
                          data-ai-hint={student.imageHint}
                        />
                        <div className="font-medium">{student.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.age}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => handleGraduate(student.id)} size="sm">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Graduate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No enrolled students.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Graduated Students</CardTitle>
          <CardDescription>
            Students who have successfully graduated from the program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Age at Graduation</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Loading...
                    </TableCell>
                </TableRow>
              ) : graduatedStudents.length > 0 ? (
                graduatedStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          alt="Student avatar"
                          className="aspect-square rounded-full object-cover"
                          height="40"
                          src={student.avatarUrl}
                          width="40"
                          data-ai-hint={student.imageHint}
                        />
                        <div className="font-medium">{student.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.age}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => generateCertificate(student)} size="sm" variant="secondary">
                        <Award className="mr-2 h-4 w-4" />
                        Generate Certificate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No students have graduated yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
