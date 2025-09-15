
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
import { Bell, LogOut, Settings, Menu, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { BusyBeeLogo } from './icons';
import { DashboardNav } from './dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

const handbookContent = `
# BusyBee Application Handbook

## 1. Introduction

Welcome to the BusyBee application! This handbook provides a comprehensive overview of the features and functionalities available to manage your preschool and after-care programs. BusyBee is designed to be an intuitive and efficient tool for handling student records, attendance, grades, financials, and more.

---

## 2. Getting Started

### 2.1. Logging In

-   Access the application through the main login page.
-   Enter your assigned \`username\` and \`password\`.
-   The default credentials for initial setup are:
    -   **Admin:** \`Admin\` / \`admin\`
    -   **Teacher:** \`Teacher\` / \`teacher\`

### 2.2. Main Dashboard

After logging in, you will land on the main dashboard, which presents two primary sections:
-   **Preschool Management:** For all academic and administrative tasks related to the preschool.
-   **After-Care Management:** For managing student check-ins and check-outs for the after-care program.

---

## 3. Preschool Management Dashboard

This is the central hub for managing all aspects of the preschool.

### 3.1. Dashboard Overview

The preschool dashboard provides an at-a-glance view of key metrics:
-   **Total Students:** The number of currently enrolled students.
-   **Attendance Rate:** The average attendance for the current month.
-   **Active Forms:** The number of downloadable forms available.
-   **Revenue:** Total revenue from paid fees.
-   **Student List:** A list of all enrolled students.
-   **Weekly Attendance Chart:** A bar chart summarizing the week's attendance.
-   **Grade Distribution:** A pie chart showing the overall distribution of grades.

### 3.2. Quick Links / Actions

The "Actions" section offers one-click access to the most common tasks:
-   **Add New Student:** Opens the student registration form.
-   **Student Management:** Takes you to the detailed student management table.
-   **Financial:** Opens the financial management page.
-   **View All Forms:** Navigates to the forms repository.
-   **Enter New Grades:** Opens the grade entry page.
-   **Take Attendance:** Navigates to the daily attendance tracker.
-   **Graduation:** Opens the graduation management page.

---

## 4. Core Modules

### 4.1. Student Management (\`/dashboard/student-management\`)

-   **View Students:** A searchable and filterable table of all enrolled students.
-   **Actions for Each Student:**
    -   **View/Edit Profile:** Access the student's detailed profile or edit their information.
    -   **View Report Summary:** Open a dialog with a quick summary of the student's grades and attendance.
    -   **View Full Report Page:** Navigate to the dedicated, printable report card page for the student.
    -   **Graduate Student:** Change the student's status to 'graduated' and move them to the archive.
    -   **Remove Student:** Permanently delete a student's record from the system.

### 4.2. New Student Registration (\`/dashboard/students/new\`)

-   A detailed form to register a new student.
-   **Auto-Generated Student ID:** A unique ID is created automatically.
-   **Date of Birth Entry:** Use the dropdowns for Month, Day, and Year. The age is calculated automatically.
-   **Payment Plan Selection:** Choose a payment plan. The required 30% enrollment deposit is calculated and displayed.
-   **Enrollment Status:** New students are added with a **\`Pending\`** status. Their status automatically changes to **\`Enrolled\`** once at least 30% of their fee is paid.
-   **Download PDF:** You can download a blank, printable version of the registration form.

### 4.3. Attendance (\`/dashboard/attendance\`)

-   Select a date using the calendar.
-   For each student, select \`Present\`, \`Absent\`, or \`Tardy\` for each subject from the dropdown menus.
-   Click **Save Attendance** to record the day's data.

### 4.4. Grades (\`/dashboard/grades\`)

-   Enter grades (\`A\`, \`B\`, \`C\`, \`D\`, \`F\`, or \`Incomplete\`) for each student in each subject.
-   Click **Save All Grades** to update the records.

### 4.5. Financial (\`/dashboard/financial\`)

-   View a list of all students and their fee status (\`Paid\`, \`Pending\`, \`Overdue\`).
-   **Make Payment:**
    -   From the actions menu on a student row, select "Make Payment."
    -   The dialog will pre-fill the student's ID and payment plan.
    -   Enter the amount being paid.
    -   Click **Process Payment**. If the payment meets the 30% threshold, the student's status will change to \`Enrolled\`.
-   **View Invoice:**
    -   From the actions menu, select "View Invoice" to see an on-screen summary.
    -   You can download a detailed PDF of the invoice, which includes the amount paid and the remaining amount due.

### 4.6. Forms (\`/dashboard/forms\`)

-   A central repository for important documents.
-   Currently available forms: \`New Student Application\`, \`Medical & Consent Form\`, and \`Fee Payment Form\`.
-   Click **Download PDF** to get a blank, printable copy of any form.

### 4.7. Reports (\`/dashboard/reports\`)

-   Search for any student (including graduated ones).
-   Click **View Report** to navigate to a detailed, printable report card page that includes grades, attendance summary, and teacher comments.
-   From the report card page, you can download a formal PDF version.

### 4.8. Graduation (\`/dashboard/graduation\`)

-   **Enrolled Students List:** View all students eligible for graduation. Click **Graduate** to move them to the graduated list.
-   **Graduated Students List:** View all archived graduates.
-   **Generate Certificate:** For any graduated student, click **Generate Certificate** to download a personalized, printable PDF certificate of graduation.

---

## 5. After-Care Management (\`/dashboard/after-care\`)

-   This page is dedicated to managing students enrolled in the after-care program.
-   **Check-in / Check-out:**
    -   The main table lists all students in the after-care program.
    -   Click **Check In** to mark a student as present. The time of check-in is automatically logged.
    -   Click **Check Out** to mark a student as having departed. The time of check-out is also logged.
-   **Dashboard Cards:** View real-time counts of total students, students currently checked in, and students who have been checked out.

This handbook should serve as a useful guide for navigating the BusyBee application. For administrative functions, please refer to the \`ADMIN_MANUAL.md\`.
`;

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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
      
      doc.save('BusyBee_Handbook.pdf');
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

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <div className="flex items-center gap-2">
        <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <BusyBeeLogo className="h-6 w-6 text-primary" />
            <span className="font-bold">BusyBee</span>
          </Link>
      </div>
      
      <div className="hidden md:flex md:items-center md:gap-5 lg:gap-6 text-sm font-medium">
        <DashboardNav />
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
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                    variant="outline"
                    size="icon"
                    >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <nav className="grid gap-6 text-lg font-medium mt-8">
                      <DashboardNav />
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
