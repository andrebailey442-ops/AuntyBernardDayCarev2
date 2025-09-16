
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

type GroupedGraduates = {
  [year: string]: Student[];
};

export default function GraduationManager() {
  const { toast } = useToast();
  const [enrolledStudents, setEnrolledStudents] = React.useState<Student[]>([]);
  const [graduatedStudents, setGraduatedStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const [enrolled, graduated] = await Promise.all([
        getStudents(),
        getArchivedStudents(),
      ]);
      setEnrolledStudents(enrolled);
      setGraduatedStudents(graduated);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const handleGraduate = async (studentId: string) => {
    try {
      const graduationDate = new Date().toISOString();
      await updateStudent(studentId, { status: 'graduated', graduationDate });
      
      const studentToGraduate = enrolledStudents.find(s => s.id === studentId);
      if (studentToGraduate) {
        setEnrolledStudents(prev => prev.filter(s => s.id !== studentId));
        setGraduatedStudents(prev => [...prev, { ...studentToGraduate, status: 'graduated', graduationDate }]);
      }

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
      doc.text('BusyBee', pageWidth / 2, 80, { align: 'center' });

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
            const primaryColor = '#4A90E2'; // A nice blue from the theme
            const greyColor = '#7F8C8D';
            const lightGreyColor = '#F2F2F2';
            const pageWidth = doc.internal.pageSize.getWidth();

            // Base64 for a simple bee logo. In a real app, this might come from a service.
            const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.67 19.33a1 1 0 0 1-1.34 0l-1.33-1.33a1 1 0 0 0-1.41 0l-.63.63a1 1 0 0 1-1.41 0l-.63-.63a1 1 0 0 0-1.41 0l-1.33 1.33a1 1 0 0 1-1.34 0" /><path d="m14.33 15.66 1.33-1.33a1 1 0 0 0 0-1.41l-.63-.63a1 1 0 0 1 0-1.41l.63-.63a1 1 0 0 0 0-1.41l-1.33-1.33a1 1 0 0 0-1.41 0l-1.33 1.33a1 1 0 0 1-1.41 0l-.63-.63a1 1 0 0 0-1.41 0l-.63.63a1 1 0 0 1-1.41 0L4.34 7.66a1 1 0 0 1 0-1.34" /><path d="M10.33 9.66 9 8.33a1 1 0 0 0-1.41 0l-.63.63a1 1 0 0 1-1.41 0l-.63-.63a1 1 0 0 0-1.41 0l-1.33-1.33" /><path d="M18 11.5c.33.33.67.67 1 1a2 2 0 0 1-3 3c-1.33-1.33-2.67-2.67-4-4" /><path d="M20 7a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1Z" /><path d="M14 4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1Z" /></svg>`;
            const logoBase64 = `data:image/svg+xml;base64,${btoa(logoSvg)}`;

            const addHeaderAndFooter = (pageNumber: number) => {
                // Watermark
                doc.saveGraphicsState();
                doc.setGState(new (doc as any).GState({opacity: 0.05}));
                doc.addImage(logoBase64, 'SVG', pageWidth / 2 - 50, doc.internal.pageSize.getHeight() / 2 - 50, 100, 100);
                doc.restoreGraphicsState();

                // Header
                doc.addImage(logoBase64, 'SVG', 15, 12, 12, 12);
                doc.setFontSize(22);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(primaryColor);
                doc.text("BusyBee Preschool", 30, 20);
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
            doc.rect(15, y, pageWidth - 30, 50, 'F');
            doc.setFontSize(10);
            doc.setTextColor(greyColor);
            doc.text("Parent Name", 20, y + 7);
            doc.text("Contact Email", 90, y + 7);
            doc.text("Contact Phone", 150, y + 7);
            doc.setFontSize(12);
            doc.setTextColor('#000000');
            doc.text(`${student.parentFirstName} ${student.parentLastName}`, 20, y + 14);
            doc.text(student.parentContact, 90, y + 14);
            doc.text(student.parentPhone || 'N/A', 150, y + 14);
            
            doc.setFontSize(10);
            doc.setTextColor(greyColor);
            doc.text("Home Address", 20, y + 26);
            doc.setFontSize(12);
            doc.setTextColor('#000000');
            const address = `${student.address || ''}, ${student.city || ''}, ${student.state || ''}`;
            doc.text(address, 20, y + 33);
            y += 60;
            
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

    