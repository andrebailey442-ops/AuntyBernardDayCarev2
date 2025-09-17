
'use client';

import * as React from 'react';
import QuickLinks from '../_components/quick-links';
import DashboardStats from '../_components/dashboard-stats';
import StudentList from '../_components/student-list';
import AttendanceChart from '../_components/attendance-chart';
import GradeOverview from '../_components/grade-overview';
import { getAttendance } from '@/services/attendance';
import { getGrades } from '@/services/grades';
import { getStudents } from '@/services/students';
import { Skeleton } from '@/components/ui/skeleton';
import type { Attendance, Grade, Student } from '@/lib/types';


export default function PreschoolDashboardPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [attendance, setAttendance] = React.useState<Attendance[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = () => {
        setLoading(true);
        const studentsData = getStudents();
        const attendanceData = getAttendance();
        const gradesData = getGrades();
        setStudents(studentsData);
        setAttendance(attendanceData);
        setGrades(gradesData);
        setLoading(false);
    }
    fetchData();
  }, []);

  return (
     <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <div className="col-span-1 lg:col-span-3">
            <QuickLinks key="quick-links" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 col-span-1 lg:col-span-3">
            <DashboardStats students={students} attendance={attendance} loading={loading} />
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 col-span-1 lg:col-span-3">
            <div className="lg:col-span-2 xl:col-span-2">
                <StudentList students={students} loading={loading} />
            </div>
            <div className="grid gap-4 auto-rows-max">
                {loading ? <Skeleton className="h-[300px]" /> : <AttendanceChart attendance={attendance} />}
                {loading ? <Skeleton className="h-[300px]" /> : <GradeOverview grades={grades} />}
            </div>
        </div>
      </div>
  );
}
