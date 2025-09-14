'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STUDENTS } from '@/lib/data';

export default function StudentList() {
  const router = useRouter();

  const handleViewProfile = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const handleEditProfile = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}/edit`);
  };

  const handleGenerateReport = (studentId: string) => {
    router.push(`/dashboard/reports/${studentId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students</CardTitle>
        <CardDescription>An overview of all enrolled students.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="hidden md:table-cell">
                Parent Contact
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {STUDENTS.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt="Student avatar"
                    className="aspect-square rounded-full object-cover"
                    height="64"
                    src={student.avatarUrl}
                    width="64"
                    data-ai-hint={student.imageHint}
                  />
                </TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{student.age}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {student.parentContact}
                </TableCell>
                <TableCell>
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
                      <DropdownMenuItem
                        onClick={() => handleGenerateReport(student.id)}
                      >
                        Generate Report Card
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
