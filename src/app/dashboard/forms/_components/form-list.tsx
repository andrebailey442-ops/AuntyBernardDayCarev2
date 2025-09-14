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
import { Download, FileText, HeartPulse, Camera, Bus } from 'lucide-react';
import { FORMS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';


type IconComponents = {
  [key: string]: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
};

const icons: IconComponents = {
  FileText,
  HeartPulse,
  Camera,
  Bus,
};


export default function FormList() {
    const { toast } = useToast();

    const handleDownload = (title: string) => {
        toast({
            title: "Download Started",
            description: `${title} is being downloaded.`
        });
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
                                <Button className="w-full" onClick={() => handleDownload(form.title)}>
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
