// src/components/dashboard/RevenueUserChart.tsx (Sửa lại từ ChartAreaInteractive)
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'; // Thêm YAxis

// Định nghĩa kiểu dữ liệu cho biểu đồ
interface ChartDataPoint {
  date: string;
  revenue: number;
  newUsers: number;
}

interface RevenueUserChartProps {
  initialData: ChartDataPoint[]; // Dữ liệu ban đầu
}

// Cấu hình màu sắc và tên
const chartConfig = {
  revenue: { label: 'Doanh thu', color: 'hsl(var(--chart-1))' },
  newUsers: { label: 'Người dùng mới', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

function RevenueUserChart({ initialData }: RevenueUserChartProps) {
  const [dataType, setDataType] = React.useState<'revenue' | 'newUsers'>(
    'revenue',
  );
  const [data, setData] = React.useState(initialData);

  // Thêm logic để fetch lại dữ liệu khi cần, ví dụ khi thay đổi khoảng thời gian
  // useEffect(() => { ... fetch lại dữ liệu ... }, [timeRange]);

  const activeChartData = chartConfig[dataType];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>
            {dataType === 'revenue'
              ? 'Thống kê Doanh thu'
              : 'Thống kê Người dùng mới'}
          </CardTitle>
          <CardDescription>30 ngày qua</CardDescription>
        </div>
        <Select
          value={dataType}
          onValueChange={(value) =>
            setDataType(value as 'revenue' | 'newUsers')
          }
        >
          <SelectTrigger
            className="w-[180px]"
            aria-label="Chọn loại dữ liệu"
          >
            <SelectValue placeholder="Chọn loại dữ liệu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Doanh thu</SelectItem>
            <SelectItem value="newUsers">Người dùng mới</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[250px] w-full items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id={`fill-${dataType}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={activeChartData.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={activeChartData.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('vi-VN', {
                    day: 'numeric',
                    month: 'short',
                  })
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  dataType === 'revenue'
                    ? `${(value / 1000000).toFixed(1)}M`
                    : value
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    }
                    indicator="dot"
                    formatter={(value, name) =>
                      name === 'revenue'
                        ? `${Number(value).toLocaleString('vi-VN')} VNĐ`
                        : value
                    }
                  />
                }
              />
              <Area
                dataKey={dataType} // dataKey động theo lựa chọn
                type="natural"
                fill={`url(#fill-${dataType})`}
                stroke={activeChartData.color}
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
export default RevenueUserChart;
