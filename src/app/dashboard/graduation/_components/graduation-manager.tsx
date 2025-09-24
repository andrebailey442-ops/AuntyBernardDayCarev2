

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
import type { Student, Grade, Subject } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getStudents, getArchivedStudents, updateStudent } from '@/services/students';
import { getGradesByStudent } from '@/services/grades';
import { getSubjects } from '@/services/subjects';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, GraduationCap, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, getYear } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BusyBeeLogo } from '@/components/icons';

type GroupedGraduates = {
  [year: string]: Student[];
};

export default function GraduationManager() {
  const { toast } = useToast();
  const [enrolledStudents, setEnrolledStudents] = React.useState<Student[]>([]);
  const [graduatedStudents, setGraduatedStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchStudents = React.useCallback(async () => {
    setLoading(true);
    const enrolled = await getStudents();
    const graduated = await getArchivedStudents();
    setEnrolledStudents(enrolled || []);
    setGraduatedStudents(graduated || []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleGraduate = async (studentId: string) => {
    try {
      const graduationDate = new Date().toISOString();
      await updateStudent(studentId, { status: 'graduated', graduationDate });
      
      await fetchStudents();

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
      doc.text('Aunty Bernard', pageWidth / 2, 80, { align: 'center' });

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
  
  const downloadFullProfile = async (student: Student) => {
    try {
        const grades = await getGradesByStudent(student.id);
        const subjects = await getSubjects();
        const getSubjectName = (subjectId: string) => subjects.find(s => s.id === subjectId)?.name || 'N/A';

        const doc = new jsPDF();
        const primaryColor = '#4A90E2';
        const greyColor = '#7F8C8D';
        const lightGreyColor = '#F2F2F2';
        const pageWidth = doc.internal.pageSize.getWidth();
        
        
        const addHeaderAndFooter = (pageNumber: number) => {
            // Header
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryColor);
            doc.text("Aunty Bernard", 30, 20);
            doc.setDrawColor(primaryColor);
            doc.setLineWidth(0.5);
            doc.line(15, 25, pageWidth - 15, 25);
            
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(greyColor);
            doc.text(`Page ${pageNumber}`, pageWidth / 2, 290, { align: 'center' });
        };
        
        // --- Page 1: Profile Summary ---
        addHeaderAndFooter(1);
        let y = 45;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#000000');
        doc.text("Graduated Student Profile", pageWidth / 2, y, { align: 'center' });
        y += 15;

        // Student Info Section
        doc.setFontSize(14);
        doc.text("Student Information", 15, y);
        y += 8;
        doc.setFillColor(lightGreyColor);
        doc.rect(15, y, pageWidth - 30, 35, 'F');
        doc.setFontSize(10);
        doc.setTextColor(greyColor);
        doc.text("Full Name", 20, y + 7);
        doc.text("Date of Birth", 90, y + 7);
        doc.text("Student ID", 150, y + 7);
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        doc.text(student.name, 20, y + 14);
        doc.text(format(new Date(student.dob), 'PPP'), 90, y + 14);
        doc.text(student.id, 150, y + 14);
        y += 45;
        
        // Parent Info
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Parent/Guardian Information", 15, y);
        y += 8;
        doc.setFillColor(lightGreyColor);
        doc.rect(15, y, pageWidth - 30, 80, 'F');
        doc.setFontSize(10);
        doc.setTextColor(greyColor);
        doc.text("Guardian 1 Name", 20, y + 7);
        doc.text("Guardian 1 Contact", 120, y + 7);
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        doc.text(`${student.guardians[0].firstName} ${student.guardians[0].lastName} (${student.guardians[0].relationship})`, 20, y + 14);
        doc.text(student.guardians[0].contact, 120, y + 14);

        if(student.guardians[1]) {
            doc.setFontSize(10);
            doc.setTextColor(greyColor);
            doc.text("Guardian 2 Name", 20, y + 26);
            doc.text("Guardian 2 Contact", 120, y + 26);
            doc.setFontSize(12);
            doc.setTextColor('#000000');
            doc.text(`${student.guardians[1].firstName} ${student.guardians[1].lastName} (${student.guardians[1].relationship})`, 20, y + 33);
            doc.text(student.guardians[1].contact, 120, y + 33);
        }

        doc.setFontSize(10);
        doc.setTextColor(greyColor);
        doc.text("Home Address", 20, y + 45);
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        const address = `${student.guardians[0].address || ''}, ${student.guardians[0].city || ''}, ${student.guardians[0].state || ''}`;
        doc.text(address, 20, y + 52);
        y += 90;
        
        // Emergency/Health Info
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Health & Emergency Information", 15, y);
        y += 8;
        doc.setFillColor(lightGreyColor);
        doc.rect(15, y, pageWidth - 30, 45, 'F');
        doc.setFontSize(10);
        doc.setTextColor(greyColor);
        doc.text("Emergency Contact", 20, y + 7);
        doc.text("Emergency Phone", 120, y + 7);
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        doc.text(student.emergencyContactName || 'N/A', 20, y + 14);
        doc.text(student.emergencyContactPhone || 'N/A', 120, y + 14);
        
        doc.setFontSize(10);
        doc.setTextColor(greyColor);
        doc.text("Medical Conditions / Allergies", 20, y + 26);
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        const medicalLines = doc.splitTextToSize(student.medicalConditions || 'None provided', pageWidth - 40);
        doc.text(medicalLines, 20, y + 33);


        // --- Page 2: Grade Sheet ---
        doc.addPage();
        addHeaderAndFooter(2);
        y = 45;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Final Academic Report', pageWidth / 2, y, { align: 'center' });
        y += 15;

        (doc as any).autoTable({
            startY: y,
            head: [['Subject', 'Final Grade', 'Notes']],
            body: grades.map(g => [
                getSubjectName(g.subject),
                g.grade || 'Incomplete',
                g.notes || ''
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: primaryColor,
                textColor: '#FFFFFF',
                fontStyle: 'bold'
            },
            styles: {
                cellPadding: 3,
                fontSize: 11,
            },
            alternateRowStyles: {
                fillColor: lightGreyColor,
            }
        });

        doc.save(`${student.name}_Full_Profile.pdf`);
        toast({
            title: "Profile Downloaded",
            description: `Full profile for ${student.name} has been downloaded.`,
        });
    } catch (error) {
        console.error("Failed to generate full profile:", error);
        toast({
            variant: 'destructive',
            title: "Download Failed",
            description: "Could not generate the full student profile.",
        });
    }
  };
    
  const groupedGraduates = React.useMemo(() => {
    return graduatedStudents.reduce((acc, student) => {
      const year = student.graduationDate ? getYear(new Date(student.graduationDate)) : 'Unknown';
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(student);
      return acc;
    }, {} as GroupedGraduates);
  }, [graduatedStudents]);

  const sortedYears = Object.keys(groupedGraduates).sort((a, b) => Number(b) - Number(a));


  return (
    <div className="space-y-8">
      <Card className="backdrop-blur-sm bg-card/80">
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

      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle>Graduation History</CardTitle>
          <CardDescription>
            Students who have successfully graduated from the program, grouped by year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : sortedYears.length > 0 ? (
            <Tabs defaultValue={sortedYears[0]} className="w-full">
              <TabsList>
                {sortedYears.map(year => (
                  <TabsTrigger key={year} value={year}>Class of {year}</TabsTrigger>
                ))}
              </TabsList>
              {sortedYears.map(year => (
                <TabsContent key={year} value={year}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Age at Graduation</TableHead>
                        <TableHead>Graduation Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedGraduates[year].map(student => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="font-medium">{student.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{student.age}</Badge>
                          </TableCell>
                          <TableCell>
                            {student.graduationDate ? format(new Date(student.graduationDate), 'PPP') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                             <Button onClick={() => downloadFullProfile(student)} size="sm" variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Full Profile
                            </Button>
                            <Button onClick={() => generateCertificate(student)} size="sm" variant="secondary">
                              <Award className="mr-2 h-4 w-4" />
                              Certificate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No students have graduated yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    
