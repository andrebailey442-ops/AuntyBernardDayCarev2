'use client';
import Link from 'next/link';
import { PlusCircle, FileText, UserPlus, GraduationCap, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const links = [
  {
    href: '/dashboard/students/new',
    label: 'Add New Student',
    icon: UserPlus,
  },
  {
    href: '/dashboard/student-management',
    label: 'Student Management',
    icon: Users,
  },
  {
    href: '/dashboard/forms',
    label: 'View All Forms',
    icon: FileText,
  },
  {
    href: '/dashboard/grades',
    label: 'Enter New Grades',
    icon: GraduationCap,
  },
  {
    href: '/dashboard/attendance',
    label: 'Take Attendance',
    icon: PlusCircle,
  },
];

export default function QuickLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>Fast access to common tasks.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {links.map((link) => (
            <Link key={link.label} href={link.href} passHref legacyBehavior>
              <Button variant="outline" className="flex flex-col h-28 w-full justify-center gap-2">
                <link.icon className="h-6 w-6" />
                <span className="text-center">{link.label}</span>
              </Button>
            </Link>
          ))}
      </CardContent>
    </Card>
  );
}
