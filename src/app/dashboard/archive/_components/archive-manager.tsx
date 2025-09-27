

'use client';

import * as React from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { getArchivedStudents, reregisterStudent } from '@/services/students';
import type { Student } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArchiveRestore, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ArchiveManager() {
  const { toast } = useToast();
  const [archivedStudents, setArchivedStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchArchivedStudents = React.useCallback(async () => {
    setLoading(true);
    const students = await getArchivedStudents();
    setArchivedStudents(students || []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchArchivedStudents();
  }, [fetchArchivedStudents]);

  const handleRestore = async (studentId: string) => {
    try {
      const newStudent = await reregisterStudent(studentId);
      if (newStudent) {
        toast({
          title: 'Student Re-registered',
          description: `${newStudent.name} has been restored to the active list with a new ID: ${newStudent.id}`,
        });
      } else {
        throw new Error('Failed to find archived student.');
      }
    } catch (error) {
      console.error('Failed to restore student:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not re-register the student.',
      });
    }
  };
  
  const getStatusVariant = (status: 'enrolled' | 'pending' | 'graduated' | undefined) => {
    switch (status) {
      case 'enrolled':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'graduated':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-card/80">
      <CardHeader>
        <CardTitle>Archived Students</CardTitle>
        <CardDescription>
          Students who have been graduated or removed from the active list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status at Archival</TableHead>
              <TableHead>Archived On</TableHead>
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
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-10 w-24" /></TableCell>
                </TableRow>
              ))
            ) : archivedStudents.length > 0 ? (
                archivedStudents.map(student => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground font-mono">{student.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(student.status)}>{student.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {student.archivedOn ? format(new Date(student.archivedOn), 'PPP') : (student.graduationDate ? format(new Date(student.graduationDate), 'PPP') : 'N/A')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleRestore(student.id)} size="sm">
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                    No students have been archived.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
