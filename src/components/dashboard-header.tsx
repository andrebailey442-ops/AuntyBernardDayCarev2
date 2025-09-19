
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
# Aunty Bernard’s School App: Grown-Up's Guide

This is a special guide for grown-ups who are in charge (Administrators). It shows you how to do special things that only you can do!

For everything else, you can read the other **School App Handbook**.

---

## What Grown-Ups Can Do

You can do everything in the app, plus these special things:

*   **Add New People:** You can add new teachers and grown-ups to the app.
*   **Set the Rules:** You can choose what pages teachers are allowed to see.

You can find these tools in your menu at the top of the screen. Look for **Manage Users**.

---

## Adding and Removing People

This is where you can see everyone who uses the app.

### See Who Is Here

*   You will see a list of all the grown-ups and what their job is (\`Admin\` or \`Teacher\`).

### Add a New Person

1.  Click the **Add User** button.
2.  A little box will pop up.
    *   **Username:** Type in a name for them to use.
    *   **Password:** Give them a secret password.
    *   **Role:** Choose if they are an \`Admin\` or a \`Teacher\`.
3.  Click **Add User**. All done! They are now in the list.

### Change or Remove a Person

Click the three little dots next to a person's name to open a menu.

#### Give a New Password

1.  Choose **Reset Password**.
2.  Type in a new secret password for them.
3.  Click the button. It works right away!

#### Take a Person Away

1.  Choose **Remove User**.
2.  A message will ask if you are sure.
3.  Click **Continue** to take them off the list for good. You can’t get them back!

---

## Setting Rules for Teachers

On the same page, you will see "Teacher Role Permissions." This is where you decide what teachers can see and do.

### How It Works

*   If you **check a box**, teachers will see a link for that page in their menu.
*   If you **uncheck a box**, the link will disappear. Teachers can't go to that page anymore.

### Changing the Rules

1.  Look at the list of pages.
2.  **Check the box** to give permission.
3.  **Uncheck the box** to take it away.
4.  Click **Save Changes** when you are finished.

The rules change for all teachers right away!

---

That’s all for the grown-up's guide! For everything else, please read the main **School App Handbook**.
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

type DashboardHeaderProps = {
  setSlideshowDialogOpen: (open: boolean) => void;
}

export function DashboardHeader({ setSlideshowDialogOpen }: DashboardHeaderProps) {
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
  
  const showSlideshow = pathname.startsWith('/dashboard/preschool') || pathname.startsWith('/dashboard/after-care') || pathname.startsWith('/dashboard/nursery');

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <Dialog>
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
                {user?.role === 'Admin' && (
                <DropdownMenuItem onSelect={() => setIsLogoDialogOpen(true)}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <span>Update Logo</span>
                </DropdownMenuItem>
                )}
                {user?.role === 'Admin' && showSlideshow && (
                  <DropdownMenuItem onSelect={() => setSlideshowDialogOpen(true)}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <span>Manage Images</span>
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
      </Dialog>
    </header>
  );
}
