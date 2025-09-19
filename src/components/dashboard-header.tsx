
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
# Aunty Bernard’s School App: Handbook

Welcome to our school's app! This little book will help you learn how to use it. It’s like a helper for keeping track of all our wonderful students.

---

## Getting Started

### How to Open the App

1.  Go to the login page.
2.  Type in your special \`username\` and \`password\`.
3.  Here are the secret words to start:
    *   **Admin:** \`Admin\` / \`admin\`
    *   **Teacher:** \`Teacher\` / \`teacher\`

### The First Page

After you log in, you will see two big choices: **Preschool** and **After-Care**. Just pick the one you need to work on!

---

## Looking After the Preschool

This is where you do all the fun things for our school day.

### Your Main Screen

The main screen is called the Dashboard. It shows you lots of things at a glance:
*   **Total Students:** How many friends are in our school.
*   **Attendance:** How many friends are here today.
*   **Forms:** Important papers you can print.
*   **Money:** How much money the school has.
*   **Student List:** A list of all our friends.
*   **Pictures:** Fun charts that show you who is here this week and what grades they have.

### Quick Buttons

The "Actions" section has buttons that let you do things with just one click, like adding a new student or checking attendance.

---

## What You Can Do

### Look at Students

*   **See All Friends:** You can see a list of every student. You can even search for them by name!
*   **Do Things for a Student:**
    *   **View/Edit Profile:** Look at or change a student's information.
    *   **Report Summary:** See a quick note about their grades and attendance.
    *   **Full Report Page:** See their full report card that you can print.
    *   **Graduate:** When a student is ready to move up, you can mark them as "graduated."
    *   **Remove:** If a student leaves, you can remove them from the list.

### Adding a New Friend

*   This is a simple page to add a new student.
*   **Student ID:** The app makes a special ID number for you!
*   **Birthday:** Pick the month, day, and year. The app will figure out how old they are.
*   **Payment:** Choose a payment plan. The app tells you how much is needed to start.
*   **Status:** New friends are "Pending." Once their family pays the first part, they become "Enrolled."
*   **Print Form:** You can print a blank paper form if you need one.

### Who's Here Today? (Attendance)

*   Pick a day on the calendar.
*   For each student, choose if they are \`Present\`, \`Absent\`, or \`Tardy\` (a little late).
*   Click **Save Attendance** when you're done.

### Checking Report Cards (Grades)

*   Give each student a grade for each subject (like \`A\`, \`B\`, or \`C\`).
*   Click **Save All Grades** to save everything.

### Money Stuff (Financial)

*   See a list of all students and if their families have paid (\`Paid\`, \`Pending\`, \`Overdue\`).
*   **Make a Payment:**
    *   Choose "Make Payment" from a student's menu.
    *   Type in how much they are paying.
    *   Click **Process Payment**. If they pay enough, they will be enrolled!
*   **View Invoice:**
    *   Choose "View Invoice" to see what they owe.
    *   You can also print it out.

### Important Papers (Forms)

*   This is a library of papers like the \`New Student Application\`.
*   Click **Download PDF** to print a blank copy.

### Making Reports

*   Search for any student, even ones who have graduated.
*   Click **View Report** to see their report card with grades, attendance, and notes from the teacher.
*   You can also print a fancy PDF of the report card.

### Moving Up! (Graduation)

*   **Ready to Graduate:** See a list of all the big kids ready to move up. Click **Graduate** to add them to the graduated list.
*   **Graduated Friends:** See all the friends who have graduated from our school.
*   **Get a Certificate:** For any graduated friend, click **Generate Certificate** to print a special paper just for them!

---

## After-Care

This page is for our friends who stay a little longer after school.

*   **Hello and Goodbye:**
    *   The list shows all the students in after-care.
    *   Click **Check In** when a student arrives.
    *   Click **Check Out** when they go home.
*   **Quick Look:** You can see how many students are here right now.

That's it! We hope this little book helps you use our school's app. For special grown-up tasks, please read the **Administrator's Guide**.
`;

function LogoUpdateDialog({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
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
        onOpenChange(false);
      };
      reader.readAsDataURL(file);
    };
  
    const handleResetLogo = () => {
      clearLogo();
      toast({
        title: 'Logo Reset',
        description: 'The application logo has been reset to the default.',
      });
      onOpenChange(false);
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
  const [isLogoDialogOpen, setIsLogoDialogOpen] = React.useState(false);

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
        <div className="flex items-center gap-2">
            <Link
                href="/dashboard"
                className="flex items-center gap-2 font-semibold"
            >
                <BusyBeeLogo className="h-6 w-6 text-primary" />
                <span className="font-bold text-sm md:text-base whitespace-nowrap">Aunty Bernard DayCare and Pre-school</span>
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
                    <DropdownMenuItem onSelect={() => setIsLogoDialogOpen(true)}>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        <span>Update Logo</span>
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
        </div>

        <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
            <LogoUpdateDialog onOpenChange={setIsLogoDialogOpen} />
        </Dialog>

    </header>
  );
}
