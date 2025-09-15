
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Sunset } from 'lucide-react';

export default function DashboardSelectionPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center overflow-hidden">
      
      {/* Background Wall Art */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/5"></div>
        <div className="absolute -top-24 -right-12 h-64 w-64 rounded-full bg-accent/5"></div>
        
        {/* Sun */}
        <div className="absolute top-16 left-16 h-24 w-24 rounded-full bg-yellow-300/20"></div>

        {/* Clouds */}
        <div className="absolute top-20 right-40 h-16 w-32 rounded-full bg-blue-200/20"></div>
        <div className="absolute top-28 right-32 h-12 w-24 rounded-full bg-blue-200/20"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 p-4">
        <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to BusyBee</h1>
            <p className="text-muted-foreground">Please select a section to manage.</p>
        </div>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            <Card className="flex flex-col backdrop-blur-sm bg-card/80">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Preschool Management</CardTitle>
                    <CardDescription>Manage students, attendance, grades, and financials for the preschool program.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-end">
                    <Link href="/dashboard/preschool" className="w-full">
                        <Button className="w-full">Go to Preschool Dashboard</Button>
                    </Link>
                </CardContent>
            </Card>
            <Card className="flex flex-col backdrop-blur-sm bg-card/80">
                <CardHeader className="text-center">
                     <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                        <Sunset className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <CardTitle>After Care Management</CardTitle>
                    <CardDescription>Handle check-in, check-out, and activities for the after-care program.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-end">
                    <Link href="/dashboard/after-care" className="w-full">
                        <Button variant="secondary" className="w-full">Go to After Care Dashboard</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
