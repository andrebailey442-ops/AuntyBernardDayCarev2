
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
  Menu,
  LogOut,
  Settings
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScholarStartLogo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardNav } from '@/components/dashboard-nav';
import { useAuth } from '@/hooks/use-auth';
import { getTeacherPermissions, initializePermissionData } from '@/services/permissions';
import { DashboardHeader } from '@/components/dashboard-header';
import HeroSlideshow from './_components/hero-slideshow';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/');
      } else if (user.role === 'Teacher') {
        initializePermissionData();
        // Redirect teacher if they try to access a forbidden page
        const checkPermissions = async () => {
          const permissions = await getTeacherPermissions();
          // The base dashboard and preschool pages are always allowed for teachers
          const isAllowed =
            pathname === '/dashboard' || 
            pathname.startsWith('/dashboard/preschool') ||
            permissions.includes(pathname);
          const isAdminPage = pathname.startsWith('/dashboard/manage-users');

          if (!isAllowed || isAdminPage) {
            router.replace('/dashboard');
          }
        };
        checkPermissions();
      }
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {pathname.startsWith('/dashboard/preschool') && <HeroSlideshow title="ScholarStart" />}
        {pathname.startsWith('/dashboard/after-care') && <HeroSlideshow title="ScholarStart AfterCare" />}
        {children}
      </main>
    </div>
  );
}
