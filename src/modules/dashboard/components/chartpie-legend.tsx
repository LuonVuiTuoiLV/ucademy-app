// src/components/dashboard/CourseStatusPieChart.tsx (Sửa lại từ ChartPieLegend)
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import * as React from 'react';
import { Pie, PieChart } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/components/ui/chart';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { CourseStatus } from '@/shared/constants';

// Định nghĩa kiểu dữ liệu và cấu hình
interface CourseStatusStat {
  status: CourseStatus;
  count: number;
}
interface CourseStatusPieChartProps {
  stats: CourseStatusStat[];
}

// Cấu hình màu sắc và tên hiển thị cho từng trạng thái
const chartConfig = {
  count: { label: 'Số lượng' },
  [CourseStatus.APPROVED]: { label: 'Đã duyệt', color: 'hsl(var(--chart-2))' }, // Xanh lá
  [CourseStatus.PENDING]: { label: 'Chờ duyệt', color: 'hsl(var(--chart-3))' }, // Vàng/Cam
  [CourseStatus.COMING_SOON]: {
    label: 'Sắp ra mắt',
    color: 'hsl(var(--chart-4))',
  }, // Xanh dương
  [CourseStatus.REJECTED]: {
    label: 'Bị từ chối',
    color: 'hsl(var(--chart-1))',
  }, // Đỏ
} satisfies ChartConfig;

function CourseStatusPieChart({ stats }: CourseStatusPieChartProps) {
  const chartData = stats.map((item) => ({
    ...item,
    fill: chartConfig[item.status]?.color || 'hsl(var(--chart-5))', // Màu mặc định
  }));

  const totalCourses = React.useMemo(() => {
    return stats.reduce((acc, curr) => acc + curr.count, 0);
  }, [stats]);

  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle>Phân bổ Trạng thái Khóa học</CardTitle>
        <CardDescription>Tổng số: {totalCourses} khóa học</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {stats.length === 0 ? (
          <div className="mx-auto flex aspect-square max-h-[300px] w-full items-center justify-center">
            <Skeleton className="size-full rounded-full" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/3 *:justify-center lg:*:basis-1/4"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
export default CourseStatusPieChart;
