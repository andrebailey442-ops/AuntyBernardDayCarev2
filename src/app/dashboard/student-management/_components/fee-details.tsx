'use client';

import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Student, Fee } from '@/lib/types';
import { Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


type FeeDetailsProps = {
    student: Student;
    fee: Fee | undefined;
}

export default function FeeDetails({ student, fee }: FeeDetailsProps) {
    const { toast } = useToast();

    const getStatusVariant = (status?: 'Paid' | 'Pending' | 'Overdue') => {
        switch(status) {
            case 'Paid': return 'default';
            case 'Pending': return 'secondary';
            case 'Overdue': return 'destructive';
            default: return 'outline';
        }
    }
    
    const handlePrintInvoice = () => {
        toast({
            title: 'Printing Invoice',
            description: `Invoice for ${student.name} is being prepared.`,
        });
    }

    return (
        <>
            <DialogHeader>
              <DialogTitle>Fee Payment Details</DialogTitle>
              <DialogDescription>
                Showing payment information for {student.name} ({student.id})
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {fee ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-muted-foreground">Payment Plan</span>
                            <span className="col-span-2 font-semibold">{fee.plan}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-muted-foreground">Amount Due</span>
                            <span className="col-span-2 font-semibold">${fee.amount.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-muted-foreground">Status</span>
                            <div className="col-span-2">
                                <Badge variant={getStatusVariant(fee.status)}>{fee.status}</Badge>
                            </div>
                        </div>
                        <Separator />
                        <div className="text-xs text-muted-foreground">
                            <p>Invoice generated: {new Date().toLocaleDateString()}</p>
                            <p>For the current semester.</p>
                        </div>
                    </div>
                ) : (
                    <p>No fee information found for this student.</p>
                )}
            </div>
            <DialogFooter>
                <Button onClick={handlePrintInvoice} disabled={!fee}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </Button>
            </DialogFooter>
        </>
    )
}
