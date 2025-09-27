
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, CheckCircle, FileText, Archive } from 'lucide-react';
import type { Student, Attendance } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { FORMS } from '@/lib/data';

type DashboardStatsProps = {
    students: Student[];
    archivedStudents: Student[];
    attendance: Attendance[];
    loading: boolean;
}

export default function DashboardStats({ students, archivedStudents, attendance, loading }: DashboardStatsProps) {
    const { totalStudents, attendanceRate, totalArchived } = React.useMemo(() => {
        // Calculate total students (enrolled only)
        const enrolledStudents = students.filter(s => s.status === 'enrolled');
        const total = enrolledStudents.length;

        // Calculate attendance rate
        let rate = 0;
        if (attendance.length > 0) {
            const presentCount = attendance.filter(a => a.status === 'present').length;
            rate = (presentCount / attendance.length) * 100;
        }

        return { totalStudents: total, attendanceRate: rate, totalArchived: archivedStudents.length };
    }, [students, attendance, archivedStudents]);

    if (loading) {
        return (
            <>
                <Card className="backdrop-blur-sm bg-card/80"><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
                <Card className="backdrop-blur-sm bg-card/80"><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
                <Card className="backdrop-blur-sm bg-card/80"><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
                <Card className="backdrop-blur-sm bg-card/80"><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
            </>
        )
    }

    return (
        <>
            <Card className="backdrop-blur-sm bg-card/80">
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
            <Card className="backdrop-blur-sm bg-card/80">
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
            <Card className="backdrop-blur-sm bg-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{FORMS.length}</div>
                    <p className="text-xs text-muted-foreground">
                        Total available forms
                    </p>
                </CardContent>
            </Card>
            <Link href="/dashboard/archive" className="flex">
                <Card className="w-full backdrop-blur-sm bg-card/80 hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Archived Students</CardTitle>
                        <Archive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalArchived}</div>
                        <p className="text-xs text-muted-foreground">
                            View and restore students
                        </p>
                    </CardContent>
                </Card>
            </Link>
        </>
    );
}
