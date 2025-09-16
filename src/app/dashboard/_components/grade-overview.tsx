
'use client';

import * as React from 'react';
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
import type { Grade } from '@/lib/types';

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

const gradeColors: { [key: string]: string } = {
  A: 'hsl(var(--chart-1))',
  B: 'hsl(var(--chart-2))',
  C: 'hsl(var(--chart-4))',
  Incomplete: 'hsl(var(--muted))',
  D: 'hsl(var(--chart-3))',
  F: 'hsl(var(--destructive))',
};

type GradeOverviewProps = {
    grades: Grade[];
}

export default function GradeOverview({ grades }: GradeOverviewProps) {
  const gradeDistribution = React.useMemo(() => {
    const counts: {[key: string]: number} = { A: 0, B: 0, C: 0, D: 0, F: 0, Incomplete: 0 };
    grades.forEach(grade => {
      if (grade.grade && grade.grade in counts) {
        counts[grade.grade]++;
      } else if (grade.grade === 'Incomplete') {
          counts['Incomplete']++;
      }
    });

    return Object.entries(counts).map(([grade, count]) => ({
      grade,
      count,
      fill: gradeColors[grade] || 'hsl(var(--muted))',
    })).filter(item => item.count > 0);
  }, [grades]);
  
  return (
    <Card className="backdrop-blur-sm bg-card/80">
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
                data={gradeDistribution}
                dataKey="count"
                nameKey="grade"
                innerRadius={60}
                strokeWidth={5}
              >
                {gradeDistribution.map((entry, index) => (
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
