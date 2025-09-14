
'use client';

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

const chartData = [
  { day: 'Mon', present: 0, absent: 0, tardy: 0 },
  { day: 'Tue', present: 0, absent: 0, tardy: 0 },
  { day: 'Wed', present: 0, absent: 0, tardy: 0 },
  { day: 'Thu', present: 0, absent: 0, tardy: 0 },
  { day: 'Fri', present: 0, absent: 0, tardy: 0 },
];

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

export default function AttendanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance - This Week</CardTitle>
        <CardDescription>A summary of student attendance for the current week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 0, left: -20}}>
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
