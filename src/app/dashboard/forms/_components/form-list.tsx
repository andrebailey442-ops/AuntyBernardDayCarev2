
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, HeartPulse } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LucideIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { FormDocument } from '@/lib/types';
import { FORMS } from '@/lib/data';


const icons: { [key: string]: LucideIcon } = {
  FileText,
  HeartPulse,
};


export default function FormList() {
    const { toast } = useToast();

    const addLogoAndHeader = (doc: jsPDF, title: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('Aunty Bernard', 20, 22);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(18);
      doc.text(title, 20, 35);
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
    };

    const addFormField = (doc: jsPDF, label: string, y: number) => {
      doc.setFontSize(12);
      doc.text(label, 20, y);
      doc.setLineWidth(0.2);
      doc.line(20, y + 2, 190, y + 2);
    };

    const addCheckboxField = (doc: jsPDF, label: string, y: number) => {
        doc.setFontSize(12);
        doc.rect(20, y - 4, 5, 5); // Simple square for checkbox
        doc.text(label, 30, y);
    }

    const addSignatureLine = (doc: jsPDF, y: number) => {
        doc.setFontSize(12);
        doc.text('Signature:', 20, y);
        doc.line(40, y, 110, y);
        doc.text('Date:', 120, y);
        doc.line(132, y, 190, y);
    }

    const downloadNewStudentApplication = () => {
        const doc = new jsPDF();
        addLogoAndHeader(doc, 'Student Registration Form');
        let y = 60;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Student Information', 20, y);
        y += 15;
        addFormField(doc, 'First Name:', y);
        y += 15;
        addFormField(doc, 'Last Name:', y);
        y += 15;
        addFormField(doc, 'Date of Birth (YYYY-MM-DD):', y);
        y += 25;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Guardian 1 Information', 20, y);
        y += 15;
        addFormField(doc, "First Name:", y);
        y += 15;
        addFormField(doc, "Last Name:", y);
        y += 15;
        addFormField(doc, 'Relationship to child:', y);
        y += 15;
        addFormField(doc, 'Email Address:', y);
        y += 15;
        addFormField(doc, 'Phone Number:', y);
        y += 25;

        doc.addPage();
        y = 30;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Guardian 2 Information (Optional)', 20, y);
        y += 15;
        addFormField(doc, "First Name:", y);
        y += 15;
        addFormField(doc, "Last Name:", y);
        y += 15;
        addFormField(doc, 'Relationship to child:', y);
        y += 15;
        addFormField(doc, 'Email Address:', y);
        y += 15;
        addFormField(doc, 'Phone Number:', y);
        y += 25;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Address Information', 20, y);
        y += 15;
        addFormField(doc, 'Home Address:', y);
        y += 15;
        addFormField(doc, 'City:', y);
        y += 15;
        addFormField(doc, 'Parish:', y);
        y += 25;
        
        doc.addPage();
        y = 30;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Emergency and Health Information', 20, y);
        y += 15;
        addFormField(doc, 'Emergency Contact Name:', y);
        y += 15;
        addFormField(doc, 'Emergency Contact Phone:', y);
        y += 15;
        doc.setFontSize(12);
        doc.text('Allergies or Medical Conditions (Please describe):', 20, y);
        y += 5;
        doc.setLineWidth(0.2);
        doc.rect(20, y, 170, 40); // Text area
        y += 60;

        addSignatureLine(doc, y);
        
        doc.save('New-Student-Application.pdf');
    }

    const downloadMedicalConsentForm = () => {
        const doc = new jsPDF();
        addLogoAndHeader(doc, 'Medical & Consent Form');
        let y = 60;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Child's Information", 20, y);
        y += 15;
        addFormField(doc, "Child's Full Name:", y);
        y += 15;
        addFormField(doc, 'Date of Birth:', y);
        y += 25;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Parent/Guardian Information", 20, y);
        y += 15;
        addFormField(doc, "Parent/Guardian Full Name:", y);
        y += 15;
        addFormField(doc, "Phone Number:", y);
        y += 25;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Health Information', 20, y);
        y += 15;
        doc.setFontSize(12);
        doc.text('Known Allergies (food, medication, environmental):', 20, y);
        y += 5;
        doc.rect(20, y, 170, 20);
        y += 30;
        doc.text('Current Medications (name, dosage, frequency):', 20, y);
        y += 5;
        doc.rect(20, y, 170, 20);
        y += 30;
        addFormField(doc, "Physician's Name:", y);
        y += 15;
        addFormField(doc, "Physician's Phone Number:", y);
        y += 25;
        
        doc.addPage();
        y = 30;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Consent for Treatment & Activities', 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.text("I, the undersigned, as the parent or legal guardian of the child named above, do hereby give my consent for the administration of any emergency medical treatment deemed necessary by a licensed physician or dentist. This consent is given in advance of any specific diagnosis, treatment, or hospital care being required, and is intended to grant authority to any qualified medical personnel to render care.", 20, y, { maxWidth: 170 });
        y += 40;
        addCheckboxField(doc, "I give my consent.", y);
        y += 15;

        doc.setFontSize(10);
        doc.text("I also grant permission for my child to participate in all school activities, including any off-campus trips that may be scheduled throughout the school year.", 20, y, { maxWidth: 170 });
        y += 20;
        addCheckboxField(doc, "I give my consent.", y);
        y += 30;
        
        doc.setFontSize(12);
        doc.text('Parent/Guardian Name (Please Print):', 20, y);
        doc.line(80, y, 190, y);
        y += 20;

        addSignatureLine(doc, y);

        doc.save('Medical-and-Consent-Form.pdf');
    }

    const handleDownload = (formId: string) => {
        try {
            if (formId === 'f1') {
                downloadNewStudentApplication();
            } else if (formId === 'f2') {
                downloadMedicalConsentForm();
            }

            const form = FORMS.find(f => f.id === formId);
            if (form) {
                toast({
                    title: "Download Started",
                    description: `${form.title} is being downloaded.`
                });
            }
        } catch (error) {
            console.error(error);
            const form = FORMS.find(f => f.id === formId);
            toast({
                variant: 'destructive',
                title: "Download Failed",
                description: `Could not generate PDF for ${form?.title || 'the form'}.`
            });
        }
    }

    return (
        <Card className="backdrop-blur-sm bg-card/80">
            <CardHeader>
                <CardTitle>Forms Repository</CardTitle>
                <CardDescription>Centralized storage for all student-related documents.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {FORMS.map(form => {
                    const Icon = icons[form.icon];
                    return (
                        <Card key={form.id} className="backdrop-blur-sm bg-card/80">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Icon className="w-8 h-8 text-primary" />
                                <CardTitle>{form.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{form.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleDownload(form.id)}>
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
    )
}
