'use client';

import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

const chartData = [
  { grade: 'A', count: 45, fill: 'hsl(var(--chart-1))' },
  { grade: 'B', count: 30, fill: 'hsl(var(--chart-2))' },
  { grade: 'C', count: 15, fill: 'hsl(var(--chart-4))' },
  { grade: 'Incomplete', count: 10, fill: 'hsl(var(--muted))' },
];

const chartConfig = {
  count: {
    label: 'Students',
  },
  A: {
    label: 'A',
    color: 'hsl(var(--chart-1))',
  },
  B: {
    label: 'B',
    color: 'hsl(var(--chart-2))',
  },
  C: {
    label: 'C',
    color: 'hsl(var(--chart-4))',
  },
  Incomplete: {
    label: 'Incomplete',
    color: 'hsl(var(--muted))',
  },
};

export default function GradeOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
        <CardDescription>Overall performance snapshot.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="grade"
                innerRadius={60}
                strokeWidth={5}
              >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="grade" />}
                className="-mt-2"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
