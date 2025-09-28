

'use client';

import * as React from 'react';
import QuickLinks from '../_components/quick-links';
import DashboardStats, { ArchivedStudentsSection } from '../_components/dashboard-stats';
import StudentList from '../_components/student-list';
import { getAttendance } from '@/services/attendance';
import { getGrades } from '@/services/grades';
import { getStudents, getArchivedStudents } from '@/services/students';
import type { Attendance, Grade, Student } from '@/lib/types';


export default function PreschoolDashboardPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [archivedStudents, setArchivedStudents] = React.useState<Student[]>([]);
  const [attendance, setAttendance] = React.useState<Attendance[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const [studentData, archivedData, attendanceData, gradeData] = await Promise.all([
          getStudents(),
          getArchivedStudents(),
          getAttendance(),
          getGrades()
        ]);
        setStudents(studentData || []);
        setArchivedStudents(archivedData || []);
        setAttendance(attendanceData || []);
        setGrades(gradeData || []);
        setLoading(false);
    }
    fetchData();
  }, []);

  return (
     <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <div className="col-span-1 lg:col-span-3">
            <QuickLinks key="quick-links" />
        </div>
        <DashboardStats students={students} attendance={attendance} archivedStudents={archivedStudents} loading={loading} />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 col-span-1 lg:col-span-3">
            <div className="lg:col-span-3 xl:col-span-3">
                <StudentList students={students} loading={loading} />
            </div>
        </div>
        <div className="col-span-1 lg:col-span-3">
            <ArchivedStudentsSection />
        </div>
      </div>
  );
}
