
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Printer, User, DollarSign, Edit, FileText, CheckCircle, MoreHorizontal } from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
  } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InvoiceDialog from './invoice-dialog';
import { getStudents, updateStudent as updateStudentStatus } from '@/services/students';
import { getFees, getFeeByStudentId, updateFee } from '@/services/fees';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinancialManager() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [students, setStudents] = React.useState<Student[]>([]);
  const [fees, setFees] = React.useState<Fee[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [paymentStudent, setPaymentStudent] = React.useState<Student | null>(null);
  const [amountToPay, setAmountToPay] = React.useState<number | ''>('');
  const [updatePaymentStudentId, setUpdatePaymentStudentId] = React.useState('');
  const [newPaymentStatus, setNewPaymentStatus] = React.useState<'Paid' | 'Pending' | 'Overdue' | ''>('');
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);


  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const [studentList, feeList] = await Promise.all([getStudents(), getFees()]);
    setStudents(studentList);
    setFees(feeList);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    const results = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.includes(searchTerm)
    );
    setFilteredStudents(results);
  }, [searchTerm, students]);

  const getStudentFee = (studentId: string): Fee | undefined => {
      return fees.find(fee => fee.studentId === studentId);
  }

  const getStatusVariant = (status: 'Paid' | 'Pending' | 'Overdue') => {
      switch(status) {
          case 'Paid': return 'default';
          case 'Pending': return 'secondary';
          case 'Overdue': return 'destructive';
          default: return 'outline';
      }
  }
  
  const handleMakePayment = async () => {
    if (!paymentStudent || amountToPay === '' || amountToPay <= 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter a valid payment amount.'});
        return;
    };
    
    try {
        const feeToUpdate = await getFeeByStudentId(paymentStudent.id);
        if (!feeToUpdate) {
            throw new Error('Fee record not found for student.');
        }
        
        const newAmountPaid = (feeToUpdate.amountPaid || 0) + Number(amountToPay);
        const newStatus = newAmountPaid >= feeToUpdate.amount ? 'Paid' : feeToUpdate.status;

        await updateFee(feeToUpdate.id, { 
            amountPaid: newAmountPaid,
            status: newStatus 
        });

        setFees(prevFees =>
            prevFees.map(fee =>
                fee.id === feeToUpdate.id
                ? { ...fee, amountPaid: newAmountPaid, status: newStatus }
                : fee
            )
        );

        // Check for enrollment status update
        if (paymentStudent.status === 'pending' && newAmountPaid >= (feeToUpdate.amount * 0.3)) {
          await updateStudentStatus(paymentStudent.id, { status: 'enrolled' });
          setStudents(prev => prev.map(s => s.id === paymentStudent.id ? { ...s, status: 'enrolled'} : s));
          toast({
            title: 'Student Enrolled',
            description: `${paymentStudent.name} has met the payment threshold and is now enrolled.`,
          });
        } else {
            toast({
                title: 'Payment Processed',
                description: `Payment of $${amountToPay} for ${paymentStudent.name} has been recorded.`,
            });
        }

        setPaymentStudent(null);
        setAmountToPay('');
    } catch(error) {
        console.error("Failed to process payment: ", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to process payment.',
        });
    }
  }
  
  const handleUpdatePayment = async () => {
    if (!updatePaymentStudentId || !newPaymentStatus) return;
    
    try {
        const feeToUpdate = await getFeeByStudentId(updatePaymentStudentId);
        if (!feeToUpdate) {
            throw new Error('Fee record not found for student.');
        }

        let newAmountPaid = feeToUpdate.amountPaid;
        if (newPaymentStatus === 'Paid') {
            newAmountPaid = feeToUpdate.amount;
        }
        
        await updateFee(feeToUpdate.id, { status: newPaymentStatus as 'Paid' | 'Pending' | 'Overdue', amountPaid: newAmountPaid });

        setFees(prevFees =>
            prevFees.map(fee =>
                fee.studentId === updatePaymentStudentId
                ? { ...fee, status: newPaymentStatus as 'Paid' | 'Pending' | 'Overdue', amountPaid: newAmountPaid }
                : fee
            )
        );

        const studentToUpdate = students.find(s => s.id === updatePaymentStudentId);
        if (studentToUpdate?.status === 'pending' && newAmountPaid >= (feeToUpdate.amount * 0.3)) {
            await updateStudentStatus(updatePaymentStudentId, { status: 'enrolled' });
            setStudents(prev => prev.map(s => s.id === updatePaymentStudentId ? { ...s, status: 'enrolled'} : s));
        }

        toast({
        title: 'Payment Updated',
        description: `Payment status for student ID ${updatePaymentStudentId} has been updated to ${newPaymentStatus}.`,
        });
        setUpdatePaymentStudentId('');
        setNewPaymentStatus('');
    } catch(error) {
        console.error("Failed to update payment: ", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to update payment status.',
        });
    }
  }

  const handleOpenPaymentDialog = (student: Student) => {
    setPaymentStudent(student);
  }
  
  const handleViewInvoice = (student: Student) => {
    setSelectedStudent(student);
    setIsInvoiceDialogOpen(true);
  }

  const studentFee = paymentStudent ? getStudentFee(paymentStudent.id) : null;
  const amountDue = studentFee ? studentFee.amount - (studentFee.amountPaid || 0) : 0;

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
            <CardHeader>
                <CardTitle>Semester Tuition</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">$2,500</p>
                <p className="text-sm text-muted-foreground">Base tuition for the Fall semester.</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>After-Care Program</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">$500</p>
                <p className="text-sm text-muted-foreground">Additional fee per semester.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Payment Plans</CardTitle>
                 <CardDescription>Flexible options for base tuition.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div>
                    <h4 className="font-semibold">Full Payment Discount</h4>
                    <p className="text-sm text-muted-foreground">Pay tuition upfront and receive a 5% discount.</p>
                    <p className="text-lg font-bold mt-1">$2,375</p>
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
                    <Button variant="secondary">
                        <Edit className="mr-2 h-4 w-4"/>
                        Update Status
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
                            <Input id="update-payment-student-id" value={updatePaymentStudentId} onChange={(e) => setUpdatePaymentStudentId(e.target.value)} className="col-span-3" placeholder="ID..." />
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
            {loading ? (
                Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-3 w-[120px] mt-1" />
                                </div>
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[70px] rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell className="text-right">
                           <Skeleton className="h-8 w-8" />
                        </TableCell>
                    </TableRow>
                ))
            ) : filteredStudents.length > 0 ? (
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
                  <TableCell>${fee ? (fee.amount - (fee.amountPaid || 0)).toFixed(2) : '0.00'}</TableCell>
                  <TableCell>
                    <Badge variant={fee?.status ? getStatusVariant(fee.status) : 'outline'}>{fee?.status ?? 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{fee?.plan ?? 'N/A'}</TableCell>
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
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id}`)}>
                            <User className="mr-2 h-4 w-4" />
                            View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewInvoice(student)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleOpenPaymentDialog(student)}
                            disabled={fee?.status === 'Paid'}
                        >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Make Payment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
        
        {selectedStudent && (
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <InvoiceDialog student={selectedStudent} fee={getStudentFee(selectedStudent.id)} />
                </DialogContent>
            </Dialog>
        )}

        {paymentStudent && studentFee && (
             <Dialog open={!!paymentStudent} onOpenChange={(open) => !open && setPaymentStudent(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Make a Payment</DialogTitle>
                        <DialogDescription>Confirm payment for {paymentStudent.name}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="make-payment-student-id" className="text-right">Student ID</Label>
                            <Input id="make-payment-student-id" value={paymentStudent.id} readOnly className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="payment-plan" className="text-right">Payment Plan</Label>
                            <Input id="payment-plan" value={studentFee.plan} readOnly className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">Amount Due</Label>
                            <Input id="amount" type="text" value={`$${amountDue.toFixed(2)}`} readOnly className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount-to-pay" className="text-right">Amount to Pay</Label>
                            <Input id="amount-to-pay" type="number" value={amountToPay} onChange={(e) => setAmountToPay(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleMakePayment}>Process Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}

      </CardContent>
    </Card>
    </>
  );
}

