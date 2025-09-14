'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Printer, User, DollarSign, Edit } from 'lucide-react';
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
import { STUDENTS, FEES, SUBJECTS } from '@/lib/data';
import type { Student, Fee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FinancialManager() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>(STUDENTS);
  const [makePaymentStudentId, setMakePaymentStudentId] = React.useState('');
  const [updatePaymentStudentId, setUpdatePaymentStudentId] = React.useState('');
  const [newPaymentStatus, setNewPaymentStatus] = React.useState<'Paid' | 'Pending' | 'Overdue' | ''>('');

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
  
  const handleMakePayment = () => {
    toast({
      title: 'Payment Processed',
      description: `Payment for student ID ${makePaymentStudentId} has been recorded.`,
    });
    setMakePaymentStudentId('');
  }
  
  const handleUpdatePayment = () => {
    toast({
      title: 'Payment Updated',
      description: `Payment status for student ID ${updatePaymentStudentId} has been updated to ${newPaymentStatus}.`,
    });
    setUpdatePaymentStudentId('');
    setNewPaymentStatus('');
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
            <CardHeader>
                <CardTitle>Semester Tuition</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">$2,500</p>
                <p className="text-sm text-muted-foreground">Per student for the Fall semester.</p>
            </CardContent>
        </Card>
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Payment Plans</CardTitle>
                <CardDescription>Flexible options to fit your budget.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h4 className="font-semibold">Full Payment</h4>
                    <p className="text-sm text-muted-foreground">Pay upfront and receive a 5% discount.</p>
                    <p className="text-lg font-bold mt-2">$2,375</p>
                </div>
                <div>
                    <h4 className="font-semibold">Two Installments</h4>
                    <p className="text-sm text-muted-foreground">$1,250 at the beginning and mid-point of the semester.</p>
                     <p className="text-lg font-bold mt-2">$1,250 x 2</p>
                </div>
                <div>
                    <h4 className="font-semibold">Monthly Plan</h4>
                    <p className="text-sm text-muted-foreground">Four monthly installments of $625.</p>
                     <p className="text-lg font-bold mt-2">$625 x 4</p>
                </div>
            </CardContent>
        </Card>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Student Fee Status</CardTitle>
        <CardDescription>
          Search for students by name or ID to manage their fee payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
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
          <div className="space-x-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <DollarSign className="mr-2 h-4 w-4"/>
                        Make Payment
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Make a Payment</DialogTitle>
                        <DialogDescription>Enter student and payment details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="make-payment-student-id" className="text-right">Student ID</Label>
                            <Input id="make-payment-student-id" value={makePaymentStudentId} onChange={(e) => setMakePaymentStudentId(e.target.value)} className="col-span-3" placeholder="SID-..." />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="payment-plan" className="text-right">Payment Plan</Label>
                             <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full">Full Payment ($2,375)</SelectItem>
                                    <SelectItem value="installments">Two Installments ($1,250)</SelectItem>
                                    <SelectItem value="monthly">Monthly Plan ($625)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">Amount</Label>
                            <Input id="amount" type="number" placeholder="Enter amount" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleMakePayment} disabled={!makePaymentStudentId}>Process Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="secondary">
                        <Edit className="mr-2 h-4 w-4"/>
                        Update Payment
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Payment Status</DialogTitle>
                        <DialogDescription>Enter student ID to update their payment record.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="update-payment-student-id" className="text-right">Student ID</Label>
                            <Input id="update-payment-student-id" value={updatePaymentStudentId} onChange={(e) => setUpdatePaymentStudentId(e.target.value)} className="col-span-3" placeholder="SID-..." />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">New Status</Label>
                             <Select onValueChange={(value) => setNewPaymentStatus(value as 'Paid' | 'Pending' | 'Overdue')} value={newPaymentStatus}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdatePayment} disabled={!updatePaymentStudentId || !newPaymentStatus}>Update Status</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Plan</TableHead>
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
                  <TableCell>${fee?.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(fee?.status || 'Pending')}>{fee?.status}</Badge>
                  </TableCell>
                  <TableCell>{fee?.plan}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/students/${student.id}`)}>
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: 'Printing Invoice...', description: `Preparing invoice for ${student.name}`})}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  );
}
