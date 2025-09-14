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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { getTeacherPermissions } from '@/services/permissions';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/dashboard/student-management', label: 'Student Management', icon: Users },
  { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/dashboard/grades', label: 'Grades', icon: GraduationCap },
  { href: '/dashboard/financial', label: 'Financial', icon: DollarSign },
  { href: '/dashboard/forms', label: 'Forms', icon: FileText },
  { href: '/dashboard/manage-users', label: 'Manage Users', icon: ShieldCheck, adminOnly: true },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [visibleNavItems, setVisibleNavItems] = React.useState<NavItem[]>([]);

  React.useEffect(() => {
    const determineVisibleItems = async () => {
      if (user?.role === 'Admin') {
        setVisibleNavItems(navItems.filter(item => item.href !== '/dashboard/manage-users'));
      } else if (user?.role === 'Teacher') {
        const permissions = await getTeacherPermissions();
        const teacherNav = navItems.filter(item => !item.adminOnly && (item.href === '/dashboard' || permissions.includes(item.href)));
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
      {visibleNavItems.map((item) => (
         <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === item.href && 'bg-muted text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </>
  );
}
