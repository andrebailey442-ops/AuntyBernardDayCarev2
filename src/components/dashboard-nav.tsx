
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardCheck,
  GraduationCap,
  FileText,
  Users,
  DollarSign,
  type LucideIcon,
  Sunset,
  Home,
  Award,
  UserCog,
  Baby,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { getPermissionsByRole } from '@/services/permissions';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  id: string;
};

const navItems: NavItem[] = [
  { href: '/dashboard/preschool', label: 'Preschool', icon: GraduationCap, id: '/dashboard/preschool' },
  { href: '/dashboard/student-management', label: 'Students', icon: Users, id: '/dashboard/student-management' },
  { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardCheck, id: '/dashboard/attendance' },
  { href: '/dashboard/grades', label: 'Grades', icon: GraduationCap, id: '/dashboard/grades' },
  { href: '/dashboard/forms', label: 'Forms', icon: FileText, id: '/dashboard/forms' },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText, id: '/dashboard/reports' },
  { href: '/dashboard/graduation', label: 'Graduation', icon: Award, id: '/dashboard/graduation' },
  { href: '/dashboard/after-care', label: 'After Care', icon: Sunset, id: '/dashboard/after-care' },
  { href: '/dashboard/nursery', label: 'Nursery', icon: Baby, id: '/dashboard/nursery' },
  { href: '/dashboard/staff', label: 'Staff', icon: UserCog, id: '/dashboard/staff' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [visibleNavItems, setVisibleNavItems] = React.useState<NavItem[]>([]);

  React.useEffect(() => {
    if (user) {
      const permissions = getPermissionsByRole(user.role);
      const userNav = navItems.filter(item => permissions.includes(item.id));
      setVisibleNavItems(userNav);
    } else {
      setVisibleNavItems([]);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
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
    </nav>
  );
}
