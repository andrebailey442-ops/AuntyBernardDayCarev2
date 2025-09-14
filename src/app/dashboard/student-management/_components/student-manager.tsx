'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User } from 'lucide-react';
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
import { STUDENTS, FEES } from '@/lib/data';
import type { Student, Fee } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export default function StudentManager() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>(STUDENTS);

  React.useEffect(() => {
    const results = STUDENTS.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.includes(searchTerm)
    );
    setFilteredStudents(results);
  }, [searchTerm]);

  const getStudentFee = (studentId: string): Fee | undefined => {
      return FEES.find(fee => fee.studentId === studentId);
  }

  const getStatusVariant = (status: 'Paid' | 'Pending' | 'Overdue') => {
      switch(status) {
          case 'Paid': return 'default';
          case 'Pending': return 'secondary';
          case 'Overdue': return 'destructive';
          default: return 'outline';
      }
  }

  const handleViewProfile = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const handleEditProfile = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}/edit`);
  };
  
  const handleViewReport = (studentId: string) => {
    router.push(`/dashboard/reports/${studentId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Management</CardTitle>
        <CardDescription>
          Search for students by name or ID to view their profile, reports, and fee status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
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
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Fee Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const fee = getStudentFee(student.id);
                return (
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
                    <Badge variant={getStatusVariant(fee?.status || 'Pending')}>{fee?.status}</Badge>
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
                        <DropdownMenuItem onClick={() => handleViewReport(student.id)}>
                          View Report Card
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
