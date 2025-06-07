// src/components/dashboard/SectionCards.tsx (hoặc đường dẫn của bạn)
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton'; // Dùng cho trạng thái loading
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { getDashboardStats } from '../actions';

// Helper để format số (ví dụ)
const formatNumber = (num: number) =>
  new Intl.NumberFormat('vi-VN').format(num);
const formatCurrency = (num: number, currency = 'VND') =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(num);

// --- Component con cho mỗi thẻ thống kê ---
const StatCard = ({
  title,
  value,
  change,
  description,
  footerText,
  unit = '',
}: {
  title: string;
  value: string | number;
  change: number;
  description: string;
  footerText: string;
  unit?: string;
}) => {
  const isTrendingUp = change >= 0;
  return (
    <Card>
      <CardHeader className="relative pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl tabular-nums lg:text-3xl">
          {value}
          {unit && <span className="text-base font-medium">{unit}</span>}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge
            variant={isTrendingUp ? 'success' : 'destructive'} // Sử dụng variant khác nhau
            className="flex gap-1 rounded-lg text-xs"
          >
            {isTrendingUp ? (
              <TrendingUpIcon className="size-3" />
            ) : (
              <TrendingDownIcon className="size-3" />
            )}
            {isTrendingUp ? '+' : ''}
            {change.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 pt-0 text-sm">
        <div className="flex items-center gap-1 font-medium text-gray-600 dark:text-gray-400">
          {description}
          {isTrendingUp ? (
            <TrendingUpIcon className="size-4 text-green-500" />
          ) : (
            <TrendingDownIcon className="size-4 text-red-500" />
          )}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {footerText}
        </div>
      </CardFooter>
    </Card>
  );
};

// --- Component chính (giờ là Server Component) ---
async function SectionCards() {
  const stats = await getDashboardStats();

  if (!stats) {
    // Trạng thái lỗi hoặc loading, hiển thị skeleton
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-8 w-3/5" />
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 pt-0">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Tạo mảng dữ liệu cho các thẻ dựa trên kết quả từ action
  const cardData = [
    {
      title: 'Tổng doanh thu',
      value: formatNumber(stats.totalRevenue.value),
      unit: ' VNĐ',
      change: stats.totalRevenue.change,
      description: 'So với 6 tháng trước',
      footerText: 'Thống kê trong 6 tháng qua',
    },
    {
      title: 'Người dùng mới',
      value: formatNumber(stats.newUsers.value),
      unit: ` (Tổng: ${formatNumber(stats.newUsers.total)})`,
      change: stats.newUsers.change,
      description: 'So với 7 ngày trước',
      footerText: 'Số người đăng ký mới trong tuần',
    },
    {
      title: 'Đơn hàng mới',
      value: formatNumber(stats.newOrders.value),
      unit: ` (Chờ xử lý: ${formatNumber(stats.newOrders.pendingCount)})`,
      change: stats.newOrders.change,
      description: 'So với hôm qua',
      footerText: 'Số đơn hàng mới trong 24 giờ qua',
    },
    {
      title: 'Tổng số khóa học',
      value: formatNumber(stats.totalCourses.value),
      unit: ` (Chờ duyệt: ${formatNumber(stats.totalCourses.pendingCount)})`,
      change: stats.totalCourses.change,
      description: 'So với tháng trước',
      footerText: 'Số khóa học đang hoạt động',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          unit={card.unit}
          change={card.change}
          description={card.description}
          footerText={card.footerText}
        />
      ))}
    </div>
  );
}
export default SectionCards;
