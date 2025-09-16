
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, Settings, Menu, Users } from 'lucide-react';
import { BusyBeeLogo } from '@/components/icons';
import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { DashboardHeader } from '@/components/dashboard-header';
import HeroSlideshow from './_components/hero-slideshow';
import { Skeleton } from '@/components/ui/skeleton';
import WallArt from '@/components/wall-art';
import { Dialog } from '@/components/ui/dialog';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
        router.replace('/');
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
                <Skeleton className="h-8 w-36" />
                <div className="flex w-full items-center gap-4 justify-end">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </header>
            <main className="flex flex-1 items-center justify-center">
                <div>Loading...</div>
            </main>
        </div>
    );
  }
  
  const showSlideshow = pathname.startsWith('/dashboard/preschool') || pathname.startsWith('/dashboard/after-care');
  const slideshowTitle = pathname.includes('preschool') ? 'BusyBee Preschool' : 'BusyBee AfterCare';

  return (
    <Dialog>
    <div className="flex min-h-screen w-full flex-col bg-background">
      <DashboardHeader />
      <main className="relative flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-hidden">
        <WallArt />
        <div className="relative z-10">
            {showSlideshow && <HeroSlideshow key={pathname} title={slideshowTitle} />}
            {children}
        </div>
      </main>
    </div>
    </Dialog>
  );
}
