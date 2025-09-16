
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { Bell, LogOut, Settings, Menu, Users, BookOpen, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { BusyBeeLogo } from './icons';
import { DashboardNav } from './dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import HeroSlideshow from '@/app/dashboard/_components/hero-slideshow';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';
import { useLogo } from '@/hooks/use-logo';


const handbookContent = `
# Aunty Bernard DayCare and Pre-school Application Handbook

## 1. Introduction

Welcome to Aunty Bernard DayCare and Pre-school! This handbook is your guide to using the application to manage your preschool and after-care programs. We've designed it to be a simple and powerful tool for handling student records, attendance, grades, payments, and more.

---

## 2. Getting Started

### 2.1. Logging In

-   Go to the login page.
-   Enter your \`username\` and \`password\`.
-   The default login details are:
    -   **Admin:** \`Admin\` / \`admin\`
    -   **Teacher:** \`Teacher\` / \`teacher\`

### 2.2. The Main Hub

After logging in, you'll see the main hub. From here, you can choose to manage the **Preschool** or the **After-Care** program.

---

## 3. Preschool Management

This is where you'll handle all the day-to-day tasks for the preschool.

### 3.1. Dashboard Overview

The dashboard gives you a quick look at important information:
-   **Total Students:** The number of enrolled students.
-   **Attendance Rate:** The average attendance for the current month.
-   **Active Forms:** How many downloadable forms are available.
-   **Revenue:** Total income from paid fees.
-   **Student List:** A list of all your students.
-   **Charts:** Visual summaries of the week's attendance and overall grade distribution.

### 3.2. Quick Actions

The "Actions" section gives you one-click access to common tasks like adding a new student, managing finances, or taking attendance.

---

## 4. Main Features

### 4.1. Student Management

-   **View Students:** See a complete list of your enrolled students. You can search for students by name.
-   **Actions for Each Student:**
    -   **View/Edit Profile:** Look at or update a student's detailed information.
    -   **View Report Summary:** See a quick summary of a student's grades and attendance.
    -   **View Full Report Page:** Go to a printable report card for the student.
    -   **Graduate Student:** Mark a student as "graduated" and move them to the graduated students list.
    -   **Remove Student:** Permanently delete a student's record.

### 4.2. New Student Registration

-   A simple form to register a new student.
-   **Automatic Student ID:** A unique ID is created for you.
-   **Date of Birth:** Use the dropdown menus to select the Month, Day, and Year. The student's age will be calculated for you.
-   **Payment Plan:** Choose a payment plan. The required 30% enrollment deposit is calculated and shown on the screen.
-   **Enrollment Status:** New students are "Pending" until at least 30% of their fee is paid. Once paid, their status automatically becomes "Enrolled".
-   **Download PDF:** You can download a blank, printable version of the registration form.

### 4.3. Attendance

-   Choose a date from the calendar.
-   For each student, select \`Present\`, \`Absent\`, or \`Tardy\` for each subject.
-   Click **Save Attendance** to save your work.

### 4.4. Grades

-   Enter a grade (\`A\`, \`B\`, \`C\`, \`D\`, \`F\`, or \`Incomplete\`) for each student in each subject.
-   Click **Save All Grades** to update all records at once.

### 4.5. Financial

-   See a list of all students and their payment status (\`Paid\`, \`Pending\`, \`Overdue\`).
-   **Make a Payment:**
    -   From the menu on a student's row, select "Make Payment."
    -   Enter the amount being paid.
    -   Click **Process Payment**. If the payment meets the 30% requirement, the student will be enrolled.
-   **View Invoice:**
    -   From the menu, select "View Invoice" for an on-screen summary.
    -   You can also download a PDF of the invoice.

### 4.6. Forms

-   A library of important documents like the \`New Student Application\` and \`Medical & Consent Form\`.
-   Click **Download PDF** to get a blank, printable copy of any form.

### 4.7. Reports

-   Search for any student, including those who have graduated.
-   Click **View Report** to see a detailed, printable report card with grades, attendance, and teacher comments.
-   You can also download a formal PDF of the report card from this page.

### 4.8. Graduation

-   **Enrolled Students List:** See all students who are ready to graduate. Click **Graduate** to move them to the graduated list.
-   **Graduated Students List:** See all your past graduates.
-   **Generate Certificate:** For any graduated student, click **Generate Certificate** to download a personalized graduation certificate.

---

## 5. After-Care Management

This page is for managing students in the after-care program.

-   **Check-in / Check-out:**
    -   The main table lists all students in the program.
    -   Click **Check In** to log a student's arrival time.
    -   Click **Check Out** to log their departure time.
-   **Dashboard Cards:** See live counts of total students, how many are currently checked in, and how many have checked out.

This handbook should help you get comfortable with the Aunty Bernard DayCare and Pre-school application. For administrator-only features, please see the **Administrator User Manual**.
`;

function LogoUpdateDialog() {
    const { logoUrl, setLogoUrl, clearLogo } = useLogo();
    const { toast } = useToast();
    const uploadInputRef = React.useRef<HTMLInputElement>(null);
  
    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
  
      if (file.size > 1024 * 1024) { // 1MB limit
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Please upload a logo smaller than 1MB.',
        });
        return;
      }
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setLogoUrl(dataUri);
        toast({
          title: 'Logo Updated',
          description: 'Your new application logo has been saved.',
        });
      };
      reader.readAsDataURL(file);
    };
  
    const handleResetLogo = () => {
      clearLogo();
      toast({
        title: 'Logo Reset',
        description: 'The application logo has been reset to the default.',
      });
    };
  
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Application Logo</DialogTitle>
          <DialogDescription>
            Upload a new logo for the application. The recommended size is 128x128 pixels.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground">Current Logo</p>
            <BusyBeeLogo className="h-24 w-24 text-primary" />
          </div>
          <input
            type="file"
            ref={uploadInputRef}
            className="hidden"
            onChange={handleLogoUpload}
            accept="image/png, image/jpeg, image/webp, image/gif"
          />
          <Button onClick={() => uploadInputRef.current?.click()} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload New Logo
          </Button>
          <Button onClick={handleResetLogo} variant="outline" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
        </div>
      </DialogContent>
    );
  }

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  const downloadHandbook = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const textWidth = pageWidth - margin * 2;

      const lines = doc.splitTextToSize(handbookContent, textWidth);

      let cursorY = margin;

      lines.forEach((line: string) => {
        if (cursorY > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }

        const isHeader = line.startsWith('#');
        if (isHeader) {
          const level = (line.match(/#/g) || []).length;
          doc.setFont('helvetica', 'bold');
          if (level === 1) {
            doc.setFontSize(24);
          } else if (level === 2) {
            doc.setFontSize(18);
          } else {
            doc.setFontSize(14);
          }
        }

        doc.text(line.replace(/#/g, '').trim(), margin, cursorY);
        cursorY += 7;

        if (isHeader) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(12);
        }
      });
      
      doc.save('AuntyBernard_Handbook.pdf');
      toast({
        title: 'Download Started',
        description: 'The application handbook is being downloaded.',
      });
    } catch (error) {
        console.error("Failed to generate handbook PDF: ", error);
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Could not generate the handbook PDF.',
        });
    }
  }
  
  const showSlideshow = pathname.startsWith('/dashboard/preschool') || pathname.startsWith('/dashboard/after-care');

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <Dialog>
            <div className="flex items-center gap-2">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold"
                >
                    <BusyBeeLogo className="h-6 w-6 text-primary" />
                    <span className="font-bold">Aunty Bernard</span>
                </Link>
            </div>

            <div className="flex w-full items-center gap-4 justify-end">
                <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage
                        src={user?.avatarUrl}
                        alt={user?.username}
                        />
                        <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    </DropdownMenuItem>
                    {user?.role === 'Admin' && (
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/manage-users">
                            <Users className="mr-2 h-4 w-4" />
                            <span>Manage Users</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                    {user?.role === 'Admin' && showSlideshow && (
                        <DialogTrigger asChild>
                            <DropdownMenuItem>
                                <ImageIcon className="mr-2 h-4 w-4" />
                                <span>Manage Images</span>
                            </DropdownMenuItem>
                        </DialogTrigger>
                    )}
                     {user?.role === 'Admin' && (
                        <DialogTrigger asChild>
                            <DropdownMenuItem>
                                <ImageIcon className="mr-2 h-4 w-4" />
                                <span>Update Logo</span>
                            </DropdownMenuItem>
                        </DialogTrigger>
                     )}
                    <DropdownMenuItem onClick={downloadHandbook}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Handbook</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <LogoUpdateDialog />
      </Dialog>
    </header>
  );
}
