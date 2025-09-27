
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
import { handbookContent, adminManualContent } from '@/lib/documentation-content';


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

  const downloadDocumentation = () => {
    try {
        const doc = new jsPDF();
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const textWidth = pageWidth - margin * 2;
        let cursorY = margin;
        let pageNumber = 1;

        const addPageBorder = () => {
            doc.setDrawColor(40, 40, 40);
            doc.setLineWidth(2);
            doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
            doc.setLineWidth(0.5);
            doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
        };

        const addHeaderFooter = () => {
            addPageBorder();
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text('Aunty Bernard DayCare and Pre-school - User Guide', margin, pageHeight - 12);
            doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
        };
        
        // --- Cover Page ---
        addPageBorder();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.text('Aunty Bernard DayCare', pageWidth / 2, 80, { align: 'center' });
        doc.text('and Pre-school', pageWidth / 2, 95, { align: 'center' });
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'normal');
        doc.text('Application User Guide', pageWidth / 2, 120, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 40, { align: 'center' });


        // --- Table of Contents ---
        doc.addPage();
        pageNumber++;
        addHeaderFooter();
        cursorY = 40;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(0);
        doc.text('Table of Contents', margin, cursorY);
        cursorY += 20;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 200); // Link-like color
        doc.textWithLink('User Handbook', margin, cursorY, {});
        cursorY += 10;
        doc.textWithLink('Administrator\'s Guide', margin, cursorY, {});


        const processMarkdown = (markdown: string) => {
            const lines = markdown.split('\n');

            lines.forEach(line => {
            if (cursorY > pageHeight - margin - 20) {
                doc.addPage();
                pageNumber++;
                addHeaderFooter();
                cursorY = margin + 20;
            }

            // Reset font for each line
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(0);

            if (line.startsWith('# ')) {
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                const text = line.substring(2);
                doc.text(text, margin, cursorY);
                cursorY += 14;
            } else if (line.startsWith('## ')) {
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                const text = line.substring(3);
                doc.text(text, margin, cursorY);
                cursorY += 10;
            } else if (line.startsWith('### ')) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                const text = line.substring(4);
                doc.text(text, margin, cursorY);
                cursorY += 8;
            } else if (line.startsWith('* ') || line.startsWith('- ')) {
                const text = line.substring(2);
                const splitText = doc.splitTextToSize(text, textWidth - 5);
                doc.text(`•`, margin, cursorY, {charSpace: 0});
                doc.text(splitText, margin + 5, cursorY);
                cursorY += (splitText.length * 7) + 4;
            } else if (line.startsWith('---')) {
                cursorY += 4;
                doc.setDrawColor(200);
                doc.line(margin, cursorY, pageWidth - margin, cursorY);
                cursorY += 8;
            } else if (line.trim() === '') {
                cursorY += 6; // Paragraph break
            } else {
                const splitText = doc.splitTextToSize(line, textWidth);
                doc.text(splitText, margin, cursorY);
                cursorY += (splitText.length * 7) + 4;
            }
            });
        };
        
        doc.addPage();
        pageNumber = 1; // Reset for content pages
        addHeaderFooter();
        cursorY = margin + 20;
        processMarkdown(handbookContent);

        doc.addPage();
        pageNumber++;
        addHeaderFooter();
        cursorY = margin + 20;
        processMarkdown(adminManualContent);
        
        doc.save('AuntyBernard_User_Documentation.pdf');
        toast({
            title: 'Download Started',
            description: 'The user documentation is being downloaded.',
        });
    } catch (error) {
        console.error("Failed to generate documentation PDF: ", error);
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Could not generate the documentation PDF.',
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
                    <AvatarFallback>{user?.username ? user.username.charAt(0).toUpperCase() : ''}</AvatarFallback>
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
                <DropdownMenuItem onClick={downloadDocumentation}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Download Documentation</span>
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
