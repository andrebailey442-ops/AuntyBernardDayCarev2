'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ClipboardCheck,
  GraduationCap,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
            'text-muted-foreground transition-colors hover:text-foreground',
            pathname === item.href && 'text-foreground'
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}
