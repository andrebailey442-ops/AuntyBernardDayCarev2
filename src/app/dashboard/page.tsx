
'use client';

import QuickLinks from './_components/quick-links';
import DashboardStats from './_components/dashboard-stats';
import HeroSlideshow from './_components/hero-slideshow';
import StudentList from './_components/student-list';
import AttendanceChart from './_components/attendance-chart';
import GradeOverview from './_components/grade-overview';

export default function DashboardPage() {
  return (
     <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <div className="col-span-1 lg:col-span-3">
            <HeroSlideshow />
        </div>
        <div className="col-span-1 lg:col-span-3">
            <QuickLinks />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 col-span-1 lg:col-span-3">
            <DashboardStats />
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 col-span-1 lg:col-span-3">
            <div className="lg:col-span-2 xl:col-span-2">
                <StudentList />
            </div>
            <div className="grid gap-4 auto-rows-max">
                <AttendanceChart />
                <GradeOverview />
            </div>
        </div>
      </div>
  );
}
