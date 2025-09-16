
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, CheckCircle, FileText } from 'lucide-react';
import { getStudents } from '@/services/students';
import { getAttendance } from '@/services/attendance';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardStats() {
    const [loading, setLoading] = React.useState(true);
    const [totalStudents, setTotalStudents] = React.useState(0);
    const [attendanceRate, setAttendanceRate] = React.useState(0);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [students, attendance] = await Promise.all([
                getStudents(),
                getAttendance(),
            ]);

            // Calculate total students (enrolled only)
            const enrolledStudents = students.filter(s => s.status === 'enrolled');
            setTotalStudents(enrolledStudents.length);

            // Calculate attendance rate
            if (attendance.length > 0) {
                const presentCount = attendance.filter(a => a.status === 'present').length;
                const rate = (presentCount / attendance.length) * 100;
                setAttendanceRate(rate);
            } else {
                setAttendanceRate(0);
            }
            
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <>
                <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
            </>
        )
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalStudents}</div>
                    <p className="text-xs text-muted-foreground">
                        All enrolled students
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{attendanceRate > 0 ? `${attendanceRate.toFixed(1)}%` : 'N/A'}</div>
                    <p className="text-xs text-muted-foreground">
                        Average for this month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                        Total available forms
                    </p>
                </CardContent>
            </Card>
        </>
    );
}
