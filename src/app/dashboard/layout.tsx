'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { useAuth } from '@/hooks/use-auth';
import { getTeacherPermissions } from '@/services/permissions';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '';

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/');
      } else if (user.role === 'Teacher') {
        // Redirect teacher if they try to access a forbidden page
        const checkPermissions = async () => {
          const permissions = await getTeacherPermissions();
          const isAllowed =
            pathname === '/dashboard' || permissions.includes(pathname);
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
        {children}
      </main>
    </div>
  );
}
