import StudentList from './_components/student-list';
import AttendanceChart from './_components/attendance-chart';
import GradeOverview from './_components/grade-overview';
import QuickLinks from './_components/quick-links';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <StudentList />
          <AttendanceChart />
        </div>
        <div className="space-y-8">
          <GradeOverview />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
}
