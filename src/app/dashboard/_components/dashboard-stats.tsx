
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, CheckCircle, FileText } from 'lucide-react';
import { getStudents } from '@/services/students';
import { getAttendance } from '@/services/attendance';
import { getFees } from '@/services/fees';

export default async function DashboardStats() {
    const [students, attendance, fees] = await Promise.all([
        getStudents(),
        getAttendance(),
        getFees()
    ]);

    // Calculate total students (enrolled only)
    const enrolledStudents = students.filter(s => s.status === 'enrolled');
    const totalStudents = enrolledStudents.length;

    // Calculate attendance rate
    let attendanceRate = 0;
    if (attendance.length > 0) {
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const rate = (presentCount / attendance.length) * 100;
        attendanceRate = rate;
    }
    
    // Calculate revenue
    const totalRevenue = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);


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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Total revenue from paid fees
                    </p>
                </CardContent>
            </Card>
        </>
    );
}
