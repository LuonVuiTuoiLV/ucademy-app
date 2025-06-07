import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export function SectionCards() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="relative">
          <CardDescription>Tổng doanh thu</CardDescription>
          <CardTitle className="text-2xl tabular-nums lg:text-3xl">
            699.000 VNĐ
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              +12.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Xu hướng tăng trong tháng này <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Khách truy cập trong 6 tháng qua
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>Khách hàng mới</CardDescription>
          <CardTitle className="text-2xl tabular-nums lg:text-3xl">3</CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingDownIcon className="size-3" />
              -20%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Giảm 20% trong giai đoạn này <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Mua lại cần chú ý
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>Tài khoản đang hoạt động</CardDescription>
          <CardTitle className="text-2xl tabular-nums lg:text-3xl">3</CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              +12.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Giữ chân người dùng mạnh mẽ
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Tham gia vượt quá mục tiêu
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>Tốc độ tăng trưởng</CardDescription>
          <CardTitle className="text-2xl tabular-nums lg:text-3xl">
            4.5%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              +4.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Hiệu suất ổn định <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Đáp ứng dự báo tăng trưởng
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
