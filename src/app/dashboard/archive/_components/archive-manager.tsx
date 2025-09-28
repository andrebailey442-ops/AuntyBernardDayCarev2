

'use client';

import * as React from 'react';
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
import { getArchivedStudents, reregisterStudent, permanentlyDeleteStudent } from '@/services/students';
import type { Student, StudentStatus } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArchiveRestore, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type ArchiveManagerProps = {
    onDataChanged: () => void;
};

export default function ArchiveManager({ onDataChanged }: ArchiveManagerProps) {
  const { toast } = useToast();
  const [archivedStudents, setArchivedStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [studentToRemove, setStudentToRemove] = React.useState<Student | null>(null);

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
        const restoredStudent = await reregisterStudent(studentId);
        if (restoredStudent) {
            toast({
            title: 'Student Re-registered',
            description: `${restoredStudent.name} has been restored to the active list with a new ID: ${restoredStudent.id}.`,
            });
            onDataChanged();
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
  
  const handleRemove = async () => {
      if (!studentToRemove) return;
      try {
          await permanentlyDeleteStudent(studentToRemove.id);
          toast({
              title: 'Student Permanently Removed',
              description: `${studentToRemove.name} has been deleted from the database.`,
          });
          setStudentToRemove(null);
          onDataChanged(); // Trigger data refresh in parent
      } catch (error) {
          console.error('Failed to remove student:', error);
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Could not permanently remove the student.',
          });
      }
  };

  const getStatusVariant = (status: StudentStatus | undefined) => {
    switch (status) {
      case 'enrolled':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'graduated':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      case 'leave-of-absence':
          return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Status at Archival</TableHead>
            <TableHead>Archived On</TableHead>
            <TableHead>Updated By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell className="text-right space-x-2">
                  <Skeleton className="h-10 w-24 inline-block" />
                  <Skeleton className="h-10 w-24 inline-block" />
                </TableCell>
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
                  {student.archivedOn ? format(new Date(student.archivedOn), 'PPP') : 'N/A'}
                </TableCell>
                <TableCell>
                  <div>
                      <div className="font-medium">{student.statusChangedBy || 'N/A'}</div>
                      {student.statusChangedOn && <div className="text-sm text-muted-foreground">{format(new Date(student.statusChangedOn), 'PPP')}</div>}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button onClick={() => handleRestore(student.id)} size="sm" disabled={student.status === 'cancelled' || student.status === 'graduated'}>
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setStudentToRemove(student)} disabled={!(student.status === 'cancelled' || student.status === 'graduated')}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
              <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                  No students have been archived.
                  </TableCell>
              </TableRow>
          )}
        </TableBody>
      </Table>
      {studentToRemove && (
        <AlertDialog open={!!studentToRemove} onOpenChange={(isOpen) => !isOpen && setStudentToRemove(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete {studentToRemove.name}'s record from the database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemove}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
