
import QuickLinks from '../_components/quick-links';
import DashboardStats from '../_components/dashboard-stats';
import StudentList from '../_components/student-list';
import AttendanceChart from '../_components/attendance-chart';
import GradeOverview from '../_components/grade-overview';
import { getAttendance } from '@/services/attendance';
import { getGrades } from '@/services/grades';

export default async function PreschoolDashboardPage() {
  const [attendance, grades] = await Promise.all([
    getAttendance(),
    getGrades()
  ]);

  return (
     <div className="grid auto-rows-max items-start gap-4 md:gap-8">
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
                <AttendanceChart attendance={attendance} />
                <GradeOverview grades={grades} />
            </div>
        </div>
      </div>
  );
}
