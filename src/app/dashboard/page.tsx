
'use client';

import StudentList from './_components/student-list';
import QuickLinks from './_components/quick-links';
import DashboardStats from './_components/dashboard-stats';

export default function DashboardPage() {
  return (
     <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
            <QuickLinks />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 col-span-1 lg:col-span-2 xl:col-span-3">
            <DashboardStats />
        </div>
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
            <StudentList />
        </div>
      </div>
  );
}
