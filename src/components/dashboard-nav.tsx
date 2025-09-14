'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ClipboardCheck,
  GraduationCap,
  FileText,
  Book,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/dashboard/grades', label: 'Grades', icon: GraduationCap },
  { href: '/dashboard/forms', label: 'Forms', icon: FileText },
  { href: '/dashboard/reports', label: 'Reports', icon: Book },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => (
         <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname.startsWith(item.href) && item.href !== '/dashboard' && 'bg-muted text-primary',
            pathname === item.href && item.href === '/dashboard' && 'bg-muted text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </>
  );
}
