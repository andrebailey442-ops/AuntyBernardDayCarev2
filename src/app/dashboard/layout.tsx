
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { Dialog } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHeader } from '@/components/dashboard-header';
import HeroSlideshow from './_components/hero-slideshow';
import WallArt from '@/components/wall-art';
import { useAuth } from '@/hooks/use-auth';

// A simple function to format the pathname into a title
const getTitleFromPathname = (pathname: string): string => {
    if (pathname === '/dashboard') return 'Dashboard';
    const segment = pathname.split('/')[2] || 'Dashboard';
    // a few special cases
    if (segment === 'preschool') return 'Preschool';
    if (segment === 'after-care') return 'After-Care';
    if (segment === 'nursery') return 'Nursery';
    if (segment === 'staff') return 'Staff Management';

    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
  
  const showSlideshow = (pathname.startsWith('/dashboard/preschool') || pathname.startsWith('/dashboard/after-care') || pathname.startsWith('/dashboard/nursery')) && !pathname.includes('/new') && !pathname.includes('/edit') && !pathname.split('/')[3];
  const slideshowTitle = getTitleFromPathname(pathname);

  return (
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
  );
}
