
'use client';
import Link from 'next/link';
import { PlusCircle, FileText, UserPlus, GraduationCap, Users, DollarSign, ClipboardCheck, Home, Award, UserCog, Baby } from 'lucide-react';
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
    href: '/dashboard',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/dashboard/students/new?from=preschool',
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
    icon: ClipboardCheck,
  },
   {
    href: '/dashboard/graduation',
    label: 'Graduation',
    icon: Award,
  },
];

export default function QuickLinks() {
  return (
    <Card className="backdrop-blur-sm bg-card/80">
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>Fast access to common tasks.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="flex">
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
