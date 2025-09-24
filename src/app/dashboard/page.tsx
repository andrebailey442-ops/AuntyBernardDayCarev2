
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Sunset, Baby, UserCog, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getPermissionsByRole } from '@/services/permissions';
import { Skeleton } from '@/components/ui/skeleton';

type SectionCard = {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    buttonText: string;
    variant: 'default' | 'secondary' | 'outline';
    className?: string;
}

const allSections: SectionCard[] = [
    {
        id: '/dashboard/preschool',
        title: 'Preschool Management',
        description: 'Manage students, attendance, grades, and financials for the preschool program.',
        href: '/dashboard/preschool',
        icon: GraduationCap,
        buttonText: 'Go to Preschool Dashboard',
        variant: 'default',
    },
    {
        id: '/dashboard/after-care',
        title: 'After Care Management',
        description: 'Handle check-in, check-out, and activities for the after-care program.',
        href: '/dashboard/after-care',
        icon: Sunset,
        buttonText: 'Go to After Care Dashboard',
        variant: 'secondary',
    },
    {
        id: '/dashboard/nursery',
        title: 'Nursery Management',
        description: 'Handle check-in, check-out, and activities for the nursery program.',
        href: '/dashboard/nursery',
        icon: Baby,
        buttonText: 'Go to Nursery Dashboard',
        variant: 'outline',
        className: 'border-purple-500 text-purple-500 hover:bg-purple-500/10 hover:text-purple-600',
    },
    {
        id: '/dashboard/staff',
        title: 'Staff Management',
        description: 'Manage staff members, schedules, and attendance.',
        href: '/dashboard/staff',
        icon: UserCog,
        buttonText: 'Go to Staff Section',
        variant: 'outline',
        className: 'border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600',
    }
];

export default function DashboardSelectionPage() {
  const { user } = useAuth();
  const [visibleSections, setVisibleSections] = React.useState<SectionCard[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPermissions = async () => {
        if (user) {
            setLoading(true);
            const permissions = await getPermissionsByRole(user.role);
            const userSections = allSections.filter(section => permissions.includes(section.id));
            setVisibleSections(userSections);
            setLoading(false);
        }
    };

    fetchPermissions();
  }, [user]);

  if (loading) {
      return (
        <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
             <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="flex flex-col backdrop-blur-sm bg-card/80">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                            <Skeleton className="h-6 w-48 mx-auto" />
                            <Skeleton className="h-4 w-64 mx-auto mt-2" />
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col justify-end">
                             <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
             </div>
        </div>
      )
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 p-4">
        <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to Aunty Bernard DayCare and Pre-school</h1>
            <p className="text-muted-foreground">Please select a section to manage.</p>
        </div>
        <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {visibleSections.map(section => {
                const Icon = section.icon;
                return (
                    <Card key={section.id} className="flex flex-col backdrop-blur-sm bg-card/80">
                        <CardHeader className="text-center">
                            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${section.id === '/dashboard/preschool' ? 'bg-primary/10' : 'bg-accent/20'}`}>
                                <Icon className={`h-8 w-8 ${section.id === '/dashboard/preschool' ? 'text-primary' : 'text-accent-foreground'}`} />
                            </div>
                            <CardTitle>{section.title}</CardTitle>
                            <CardDescription>{section.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col justify-end">
                            <Link href={section.href} className="w-full">
                                <Button variant={section.variant} className={`w-full ${section.className || ''}`}>{section.buttonText}</Button>
                            </Link>
                        </CardContent>
                    </Card>
                );
            })}
             {visibleSections.length === 0 && !loading && (
                <div className="col-span-1 md:col-span-2 text-center text-muted-foreground">
                    You do not have permission to access any sections. Please contact an administrator.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
