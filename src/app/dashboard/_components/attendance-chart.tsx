
'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart';
import type { Attendance } from '@/lib/types';
import { format, startOfWeek, addDays } from 'date-fns';

const chartConfig = {
  present: {
    label: 'Present',
    color: 'hsl(var(--chart-1))',
  },
  absent: {
    label: 'Absent',
    color: 'hsl(var(--destructive))',
  },
  tardy: {
    label: 'Tardy',
    color: 'hsl(var(--chart-2))',
  },
};

type AttendanceChartProps = {
    attendance: Attendance[];
}

export default function AttendanceChart({ attendance }: AttendanceChartProps) {
  const weeklyData = React.useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

    const chartData = weekDays.map(day => {
        const formattedDay = format(day, 'yyyy-MM-dd');
        const dayOfWeek = format(day, 'E');
        const todaysAttendance = attendance.filter(a => a.date === formattedDay);
        return {
            day: dayOfWeek,
            present: todaysAttendance.filter(a => a.status === 'present').length,
            absent: todaysAttendance.filter(a => a.status === 'absent').length,
            tardy: todaysAttendance.filter(a => a.status === 'tardy').length
        }
    });

    return chartData;
  }, [attendance]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance - This Week</CardTitle>
        <CardDescription>A summary of student attendance for the current week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} margin={{ top: 20, right: 20, bottom: 0, left: -20}}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="present" fill="var(--color-present)" radius={4} />
              <Bar dataKey="tardy" fill="var(--color-tardy)" radius={4} />
              <Bar dataKey="absent" fill="var(--color-absent)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
