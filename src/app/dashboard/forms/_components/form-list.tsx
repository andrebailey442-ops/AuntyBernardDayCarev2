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
import { FORMS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import { jsPDF } from 'jspdf';


type IconComponents = {
  [key: string]: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
};

const icons: IconComponents = {
  FileText,
  HeartPulse,
};


export default function FormList() {
    const { toast } = useToast();

    const handleDownload = (title: string, description: string) => {
        try {
            const doc = new jsPDF();
            
            doc.setFontSize(22);
            doc.text(title, 20, 20);
            
            doc.setFontSize(12);
            doc.text(description, 20, 30);
            
            // Add more form fields as needed
            doc.setFontSize(12);
            doc.text('Name: __________________________', 20, 50);
            doc.text('Date: __________________________', 20, 60);

            doc.save(`${title.replace(/\s+/g, '-')}.pdf`);

            toast({
                title: "Download Started",
                description: `${title} is being downloaded.`
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Download Failed",
                description: `Could not generate PDF for ${title}.`
            });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Forms Repository</CardTitle>
                <CardDescription>Centralized storage for all student-related documents.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {FORMS.map(form => {
                    const Icon = icons[form.icon];
                    return (
                        <Card key={form.id}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                {Icon && <Icon className="w-8 h-8 text-primary" />}
                                <CardTitle>{form.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{form.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleDownload(form.title, form.description)}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
    )
}
