
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ClipboardCheck,
  GraduationCap,
  FileText,
  Users,
  DollarSign,
  type LucideIcon,
  ShieldCheck,
  Sunset,
  Home,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { getTeacherPermissions, initializePermissionData } from '@/services/permissions';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: '/dashboard/preschool', label: 'Preschool', icon: GraduationCap },
  { href: '/dashboard/student-management', label: 'Students', icon: Users },
  { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/dashboard/grades', label: 'Grades', icon: GraduationCap },
  { href: '/dashboard/financial', label: 'Financial', icon: DollarSign },
  { href: '/dashboard/forms', label: 'Forms', icon: FileText },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/graduation', label: 'Graduation', icon: Award },
  { href: '/dashboard/after-care', label: 'After Care', icon: Sunset },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [visibleNavItems, setVisibleNavItems] = React.useState<NavItem[]>([]);

  React.useEffect(() => {
    const determineVisibleItems = async () => {
      if (user?.role === 'Admin') {
        setVisibleNavItems(navItems);
      } else if (user?.role === 'Teacher') {
        initializePermissionData();
        const permissions = await getTeacherPermissions();
        // The main dashboard link is always visible
        const teacherNav = navItems.filter(item => 
            !item.adminOnly && (item.href === '/dashboard/preschool' || permissions.includes(item.href))
        );
        setVisibleNavItems(teacherNav);
      } else {
        setVisibleNavItems([]);
      }
    };

    if (user) {
      determineVisibleItems();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <>
      <Link
        href="/dashboard"
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
          pathname === '/dashboard' && 'bg-muted text-primary'
        )}
      >
        <Home className="h-4 w-4" />
        Home
      </Link>
      {visibleNavItems.map((item) => (
         <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            (pathname.startsWith(item.href)) && 'bg-muted text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </>
  );
}
