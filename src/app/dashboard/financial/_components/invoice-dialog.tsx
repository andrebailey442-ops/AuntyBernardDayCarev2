
'use client';

import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Student, Fee } from '@/lib/types';
import { Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ScholarStartLogo } from '@/components/icons';


type InvoiceDetailsProps = {
    student: Student;
    fee: Fee | undefined;
}

const TUITION_FEE = 2500;
const AFTER_CARE_FEE = 500;

export default function InvoiceDialog({ student, fee }: InvoiceDetailsProps) {
    const { toast } = useToast();

    const getStatusVariant = (status?: 'Paid' | 'Pending' | 'Overdue') => {
        switch(status) {
            case 'Paid': return 'default';
            case 'Pending': return 'secondary';
            case 'Overdue': return 'destructive';
            default: return 'outline';
        }
    }
    
    const addLogoAndHeader = (doc: jsPDF, title: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('ScholarStart', 20, 22);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(18);
        doc.text(title, 20, 35);
        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);
    };

    const downloadInvoice = () => {
        if (!fee) return;
        try {
            const doc = new jsPDF();
            addLogoAndHeader(doc, `Invoice for ${student.name}`);
            let y = 60;
            
            doc.setFontSize(12);
            doc.text(`Student Name: ${student.name}`, 20, y);
            y += 7;
            doc.text(`Student ID: ${student.id}`, 20, y);
            y += 7;
            doc.text(`Invoice Date: ${format(new Date(), 'PPP')}`, 20, y);
            y += 15;

            doc.setFont('helvetica', 'bold');
            doc.text('Description', 20, y);
            doc.text('Amount', 170, y, { align: 'right' });
            y += 7;
            doc.setLineWidth(0.2);
            doc.line(20, y, 190, y);
            y += 10;
            doc.setFont('helvetica', 'normal');

            let tuitionAmount = TUITION_FEE;
            if (fee.plan === 'Full Payment') {
                tuitionAmount *= 0.95;
            }
            doc.text(`Tuition Fee - ${fee.plan}`, 20, y);
            doc.text(`$${tuitionAmount.toFixed(2)}`, 170, y, { align: 'right' });
            y+=10;

            if (student.afterCare) {
                doc.text(`After-Care Fee`, 20, y);
                doc.text(`$${AFTER_CARE_FEE.toFixed(2)}`, 170, y, { align: 'right' });
                y += 10;
            }
            
            y += 5;
            doc.line(20, y, 190, y);
            y += 10;
            
            doc.setFont('helvetica', 'bold');
            doc.text('Total Amount', 120, y);
            doc.text(`$${fee.amount.toFixed(2)}`, 170, y, { align: 'right' });
            y += 10;

            doc.setFont('helvetica', 'normal');
            doc.text('Amount Paid', 120, y);
            doc.text(`$${(fee.amountPaid || 0).toFixed(2)}`, 170, y, { align: 'right' });
            y += 10;

            doc.setFont('helvetica', 'bold');
            doc.text('Amount Due', 120, y);
            doc.text(`$${(fee.amount - (fee.amountPaid || 0)).toFixed(2)}`, 170, y, { align: 'right' });
            y += 10;
            
            doc.setFontSize(14);
            doc.text(`Status: ${fee.status}`, 120, y);
            
            doc.save(`${student.name.replace(' ', '_')}_Invoice.pdf`);

            toast({
                title: "Download Started",
                description: `Invoice for ${student.name} is being downloaded.`
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Download Failed",
                description: "Could not generate the invoice PDF."
            });
        }
    }

    const amountDue = fee ? fee.amount - (fee.amountPaid || 0) : 0;

    return (
        <>
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                Showing invoice for {student.name} ({student.id})
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {fee ? (
                    <div className="space-y-4">
                         <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-muted-foreground">Student</span>
                            <span className="col-span-2 font-semibold">{student.name}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-muted-foreground">Payment Plan</span>
                            <span className="col-span-2 font-semibold">{fee.plan}</span>
                        </div>
                        {student.afterCare && (
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="text-muted-foreground">After Care</span>
                                <span className="col-span-2 font-semibold">${AFTER_CARE_FEE.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-muted-foreground">Total Amount</span>
                            <span className="col-span-2 font-semibold">${fee.amount.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-muted-foreground">Amount Paid</span>
                            <span className="col-span-2 font-semibold">${(fee.amountPaid || 0).toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4 font-bold">
                            <span className="text-muted-foreground">Amount Due</span>
                            <span className="col-span-2">${amountDue.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-muted-foreground">Status</span>
                            <div className="col-span-2">
                                <Badge variant={getStatusVariant(fee.status)}>{fee.status}</Badge>
                            </div>
                        </div>
                        <Separator />
                        <div className="text-xs text-muted-foreground">
                            <p>Invoice Date: {format(new Date(), 'PPP')}</p>
                            <p>For the current semester.</p>
                        </div>
                    </div>
                ) : (
                    <p>No fee information found for this student.</p>
                )}
            </div>
            <DialogFooter>
                <Button onClick={downloadInvoice} disabled={!fee}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </DialogFooter>
        </>
    )
}
