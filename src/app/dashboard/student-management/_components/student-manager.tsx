

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, GraduationCap, Download, Upload, FileUp, FileDown, Wand2, Filter, X, LogOut, FileArchive, FolderCog } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Student, StudentStatus } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ReportCardDialog from './report-card-dialog';
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
import { useToast } from '@/hooks/use-toast';
import { getStudents, updateStudent, addStudent } from '@/services/students';
import { getGradesByStudent } from '@/services/grades';
import { getAttendanceByStudent } from '@/services/attendance';
import { getSubjects } from '@/services/subjects';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { analyzeStudentImport } from '@/ai/flows/analyze-student-import';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import UploadDocumentsDialog from './upload-documents-dialog';


export default function StudentManager() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [allStudents, setAllStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [selectedStudentForDialog, setSelectedStudentForDialog] = React.useState<Student | null>(null);
  const [dialogContent, setDialogContent] = React.useState<'report' | 'upload' | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isProcessingImport, setIsProcessingImport] = React.useState(false);
  const [selectedStudents, setSelectedStudents] = React.useState<string[]>([]);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const importInputRef = React.useRef<HTMLInputElement>(null);

  const [statusFilter, setStatusFilter] = React.useState<StudentStatus | 'all'>('all');
  const [ageRange, setAgeRange] = React.useState<[number, number]>([0, 10]);
  const [genderFilter, setGenderFilter] = React.useState<'all' | 'Male' | 'Female'>('all');
  const [programFilters, setProgramFilters] = React.useState({
    preschool: false,
    afterCare: false,
    nursery: false,
  });

  const fetchStudents = React.useCallback(async () => {
    setLoading(true);
    const studentList = await getStudents();
    setAllStudents(studentList || []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  React.useEffect(() => {
    let results = allStudents;

    if (statusFilter !== 'all') {
      results = results.filter(s => s.status === statusFilter);
    }
    
    results = results.filter(s => s.age >= ageRange[0] && s.age <= ageRange[1]);
    
    if (genderFilter !== 'all') {
      results = results.filter(s => s.gender === genderFilter);
    }

    const activeProgramFilters = Object.entries(programFilters).filter(([, value]) => value).map(([key]) => key);
    if (activeProgramFilters.length > 0) {
        results = results.filter(student => 
            activeProgramFilters.every(filterKey => {
                const key = filterKey as keyof typeof student;
                return student[key];
            })
        );
    }

    if (searchTerm) {
        results = results.filter(student =>
            (student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || student?.id.includes(searchTerm))
        );
    }


    setFilteredStudents(results);
  }, [searchTerm, allStudents, statusFilter, ageRange, genderFilter, programFilters]);

  const resetFilters = () => {
    setStatusFilter('all');
    setAgeRange([0, 10]);
    setGenderFilter('all');
    setProgramFilters({ preschool: false, afterCare: false, nursery: false });
  }

  const isAnyFilterActive = statusFilter !== 'all' || ageRange[0] !== 0 || ageRange[1] !== 10 || genderFilter !== 'all' || Object.values(programFilters).some(v => v);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  }

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  }

  const handleViewProfile = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const handleEditProfile = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}/edit`);
  };
  
  const handleViewReportPage = (studentId: string) => {
    router.push(`/dashboard/reports/${studentId}`);
  };

  const handleChangeStatus = async (studentId: string, status: StudentStatus) => {
    try {
        await updateStudent(studentId, { status });
        fetchStudents();
        toast({
            title: 'Student Status Updated',
            description: `The student's status has been changed to "${status.replace('-', ' ')}".`,
        });
    } catch (error) {
        console.error('Failed to update student status:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not update student status.',
        });
    }
  }

  const handleExport = () => {
    const studentsToExport = filteredStudents.length > 0
      ? selectedStudents.length > 0 ? filteredStudents.filter(s => selectedStudents.includes(s.id)) : filteredStudents
      : allStudents;

    const worksheet = XLSX.utils.json_to_sheet(studentsToExport.map(s => {
        const guardian1 = s.guardians[0];
        const guardian2 = s.guardians[1];
        return {
            ID: s.id,
            Name: s.name,
            Age: s.age,
            Gender: s.gender,
            Birthday: s.dob,
            'Guardian 1 Name': guardian1 ? `${guardian1.firstName} ${guardian1.lastName}` : '',
            'Guardian 1 Relationship': guardian1 ? guardian1.relationship : '',
            'Guardian 1 Email': guardian1 ? guardian1.contact : '',
            'Guardian 1 Phone': guardian1 ? guardian1.phone : '',
            'Address 1': guardian1 ? `${guardian1.address}, ${guardian1.city}, ${guardian1.state}` : '',
            'Guardian 2 Name': guardian2 ? `${guardian2.firstName} ${guardian2.lastName}` : '',
            'Guardian 2 Relationship': guardian2 ? guardian2.relationship : '',
            'Guardian 2 Email': guardian2 ? guardian2.contact : '',
            'Guardian 2 Phone': guardian2 ? guardian2.phone : '',
            'Address 2': guardian2 ? `${guardian2.address}, ${guardian2.city}, ${guardian2.state}` : '',
            'Preschool': s.preschool ? 'Yes' : 'No',
            'After Care': s.afterCare ? 'Yes' : 'No',
            'Nursery': s.nursery ? 'Yes' : 'No',
            'Emergency Contact': s.emergencyContactName,
            'Emergency Phone': s.emergencyContactPhone,
            'Medical Info': s.medicalConditions
        }
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'students.xlsx');
    toast({
        title: 'Export Complete',
        description: `${studentsToExport.length} student(s) have been exported.`,
    });
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingImport(true);
    toast({
        title: 'AI is Analyzing Your File',
        description: 'Please wait while we process the student data...',
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json<any>(worksheet);

            const mappedStudents = await analyzeStudentImport(json);

            if (!mappedStudents || mappedStudents.length === 0) {
                throw new Error("AI analysis did not return any student data.");
            }

            mappedStudents.forEach(studentData => {
                const newId = `SID-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
                
                const finalStudentData = {
                    name: studentData.name,
                    age: studentData.age || 0,
                    gender: studentData.gender || 'Male',
                    dob: studentData.dob || new Date().toISOString(),
                    avatarUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/100/100`,
                    imageHint: 'child portrait',
                    guardians: studentData.guardians.map(g => ({
                        ...g,
                        address: studentData.address,
                        city: studentData.city,
                        state: studentData.state,
                    })),
                    preschool: studentData.preschool || false,
                    afterCare: studentData.afterCare || false,
                    nursery: studentData.nursery || false,
                    emergencyContactName: studentData.emergencyContactName || '',
                    emergencyContactPhone: studentData.emergencyContactPhone || '',
                    medicalConditions: studentData.medicalConditions || ''
                };
                addStudent(newId, finalStudentData);
            });

            
            toast({
                title: 'Import Successful',
                description: `${mappedStudents.length} students have been imported.`,
            });
            fetchStudents(); // Refresh student list
        } catch (error) {
            console.error('Import failed:', error);
            toast({
                variant: 'destructive',
                title: 'Import Failed',
                description: 'The AI could not process the file. Please check the file format and try again.',
            });
        } finally {
             if (importInputRef.current) {
                importInputRef.current.value = '';
            }
            setIsProcessingImport(false);
        }
    }
    reader.readAsArrayBuffer(file);
  }


  const handleDownloadReports = async () => {
    setIsDownloading(true);
    toast({
      title: 'Generating Reports',
      description: `Preparing to download ${selectedStudents.length} report(s). Please wait...`,
    });
  
    for (const studentId of selectedStudents) {
      const student = allStudents.find(s => s.id === studentId);
      if (!student) continue;
  
      try {
        const grades = await getGradesByStudent(studentId);
        const attendanceRecords = await getAttendanceByStudent(studentId);
        const subjects = await getSubjects();
  
        const attendanceSummary = { present: 0, absent: 0, tardy: 0 };
        (attendanceRecords || []).forEach(a => {
          attendanceSummary[a.status]++;
        });
        
        const getSubjectName = (subjectId: string) => subjects.find(s => s.id === subjectId)?.name || 'N/A';
  
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
        doc.text(`Student ID: ${student.id}`, 20, y); y += 10;
        doc.text(`Report Date: ${format(new Date(), 'PPP')}`, 20, y); y += 15;
  
        doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.text('Grades', 20, y); y += 10;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
        if(grades.length > 0) {
            grades.forEach(grade => {
                doc.text(`${getSubjectName(grade.subject)}: ${grade.grade}`, 25, y); y+= 7;
            });
        } else {
            doc.text('No grades recorded for this period.', 25, y); y+= 7;
        }
        y += 10;
        doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.text('Attendance Summary', 20, y); y += 10;
        doc.setFontSize(12); doc.setFont('helvetica', 'normal');
        doc.text(`Present: ${attendanceSummary.present} days`, 25, y); y += 7;
        doc.text(`Absent: ${attendanceSummary.absent} days`, 25, y); y += 7;
        doc.text(`Tardy: ${attendanceSummary.tardy} days`, 25, y);
  
        doc.save(`${student.name.replace(' ', '_')}_ReportCard.pdf`);
  
      } catch (error) {
        console.error(`Failed to generate report for ${student.name}:`, error);
        toast({
          variant: 'destructive',
          title: 'Download Failed',
          description: `Could not generate PDF for ${student.name}.`,
        });
      }
    }
    
    setIsDownloading(false);
    setSelectedStudents([]);
    toast({
        title: 'Download Complete',
        description: 'Finished generating all selected reports.',
    });
  }

  const openDialog = (student: Student, content: 'report' | 'upload') => {
    setSelectedStudentForDialog(student);
    setDialogContent(content);
  }

  const getStatusVariant = (status: StudentStatus | undefined) => {
    switch (status) {
      case 'enrolled':
        return 'default';
      case 'pending':
      case 'leave-of-absence':
        return 'secondary';
      case 'graduated':
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <>
    <Card className="backdrop-blur-sm bg-card/80">
      <CardHeader>
        <CardTitle>Student Management</CardTitle>
        <CardDescription>
          Search for enrolled students by name or ID to view their profile and reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search by name or ID..."
                className="pl-8 sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                        {isAnyFilterActive && <span className="absolute top-0 right-0 -mt-1 -mr-1 h-2 w-2 rounded-full bg-primary" />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Filters</h4>
                            <p className="text-sm text-muted-foreground">Adjust filters to refine the list.</p>
                        </div>
                        <div className="grid gap-2">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="status">Status</Label>
                                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                    <SelectTrigger id="status" className="col-span-2 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Active</SelectItem>
                                        <SelectItem value="enrolled">Enrolled</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="leave-of-absence">Leave of Absence</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={genderFilter} onValueChange={(value: any) => setGenderFilter(value)}>
                                    <SelectTrigger id="gender" className="col-span-2 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 items-center gap-4">
                                <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
                                <Slider value={ageRange} onValueChange={setAgeRange} max={10} step={1} />
                            </div>
                            <div className="grid grid-cols-1 items-center gap-2">
                                <Label>Programs</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="preschool" checked={programFilters.preschool} onCheckedChange={(checked) => setProgramFilters(p => ({...p, preschool: !!checked}))} />
                                    <Label htmlFor="preschool" className="text-sm font-normal">Preschool</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="afterCare" checked={programFilters.afterCare} onCheckedChange={(checked) => setProgramFilters(p => ({...p, afterCare: !!checked}))} />
                                    <Label htmlFor="afterCare" className="text-sm font-normal">After-Care</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="nursery" checked={programFilters.nursery} onCheckedChange={(checked) => setProgramFilters(p => ({...p, nursery: !!checked}))} />
                                    <Label htmlFor="nursery" className="text-sm font-normal">Nursery</Label>
                                </div>
                            </div>
                            {isAnyFilterActive && (
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="justify-self-start">
                                    <X className="mr-2 h-4 w-4" /> Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Button onClick={handleDownloadReports} disabled={selectedStudents.length === 0 || isDownloading} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? 'Downloading...' : `Download Reports (${selectedStudents.length})`}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <input type="file" ref={importInputRef} className="hidden" onChange={handleImport} accept=".xlsx, .csv" />
            <Button onClick={() => importInputRef.current?.click()} variant="outline" disabled={isProcessingImport}>
                <FileUp className="mr-2 h-4 w-4" />
                {isProcessingImport ? 'Processing...' : 'Import'}
            </Button>
            <Button variant="outline" disabled>
                <Wand2 className="mr-2 h-4 w-4" />
                Suggest
            </Button>
            <Button onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Export
            </Button>
          </div>
        </div>
          <Dialog onOpenChange={(open) => !open && setDialogContent(null)}>
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead padding="checkbox" className="w-12">
                        <Checkbox
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        aria-label="Select all"
                        />
                    </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-3 w-[120px] mt-1" />
                            </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} data-state={selectedStudents.includes(student.id) && "selected"}>
                      <TableCell padding="checkbox">
                        <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                            aria-label={`Select student ${student.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground font-mono">{student.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.age}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(student.status)}>{student.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewProfile(student.id)}>View Profile</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditProfile(student.id)}>Edit Profile</DropdownMenuItem>
                              <DropdownMenuSeparator />
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={() => openDialog(student, 'upload')}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Documents
                                  </DropdownMenuItem>
                                </DialogTrigger>
                              <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={() => openDialog(student, 'report')}>View Report Summary</DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem onClick={() => handleViewReportPage(student.id)}>
                                View Full Report Page
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <FolderCog className="mr-2 h-4 w-4" />
                                  Enrollment Change
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleChangeStatus(student.id, 'leave-of-absence')}>
                                      <LogOut className="mr-2 h-4 w-4" />
                                      <span>Leave of Absence</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatus(student.id, 'cancelled')}>
                                      <FileArchive className="mr-2 h-4 w-4" />
                                      <span>Cancel Enrollment</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              <DropdownMenuItem onClick={() => handleChangeStatus(student.id, 'graduated')}>
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Graduate Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {selectedStudentForDialog && (
              <DialogContent className={dialogContent === 'report' ? 'sm:max-w-3xl' : 'sm:max-w-md'}>
                {dialogContent === 'report' && <ReportCardDialog student={selectedStudentForDialog} />}
                {dialogContent === 'upload' && <UploadDocumentsDialog student={selectedStudentForDialog} onUploadComplete={fetchStudents} />}
              </DialogContent>
            )}
          </Dialog>
      </CardContent>
    </Card>
    </>
  );
}

