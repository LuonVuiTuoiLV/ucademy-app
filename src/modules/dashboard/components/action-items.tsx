// Ví dụ: src/components/dashboard/ActionItems.tsx
import {
  getPendingCourses,
  getPendingOrders,
  getPendingReviews,
} from '@/modules/dashboard/actions'; // Import các actions
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'; // Sử dụng Tabs của ShadCN UI
import { timeAgo } from '@/shared/helpers'; // Hàm định dạng thời gian
import Link from 'next/link';

// Component con để hiển thị một mục trong danh sách
const ActionItem = ({
  title,
  subTitle,
  time,
  link,
}: {
  title: string;
  subTitle: string;
  time: string;
  link: string;
}) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <div className="flex flex-col">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{subTitle}</p>
    </div>
    <div className="flex items-center gap-2">
      <p className="whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">
        {time}
      </p>
      <Link href={link}>
        <Button
          variant="outline"
          size="sm"
        >
          Xem
        </Button>
      </Link>
    </div>
  </div>
);

export async function ActionItems() {
  // Gọi các action song song để tăng tốc độ tải
  const [coursesResult, ordersResult, reviewsResult] = await Promise.all([
    getPendingCourses(),
    getPendingOrders(),
    getPendingReviews(),
  ]);

  const pendingCourses = coursesResult?.data || [];
  const pendingOrders = ordersResult?.data || [];
  const pendingReviews = reviewsResult?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Các mục cần hành động</CardTitle>
        <CardDescription>
          Các yêu cầu mới nhất đang chờ bạn xử lý.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="courses">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">
              Khóa học ({pendingCourses.length})
            </TabsTrigger>
            <TabsTrigger value="orders">
              Đơn hàng ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Bình luận ({pendingReviews.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="courses">
            {pendingCourses.length > 0 ? (
              <div className="divide-y">
                {pendingCourses.map(
                  (course: {
                    _id: string;
                    title: string;
                    author: { name: any };
                    created_at: string | Date;
                    slug: any;
                  }) => (
                    <ActionItem
                      key={course._id}
                      title={course.title}
                      subTitle={`bởi ${course.author?.name || 'Không rõ'}`}
                      time={timeAgo(course.created_at)}
                      link={`/manage/course/update?slug=${course.slug}`} // Link đến trang duyệt
                    />
                  ),
                )}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-gray-500">
                Không có khóa học nào chờ duyệt.
              </p>
            )}
          </TabsContent>
          <TabsContent value="orders">
            {pendingOrders.length > 0 ? (
              <div className="divide-y">
                {pendingOrders.map(
                  (order: {
                    _id: string;
                    code: any;
                    course: { title: any };
                    created_at: string | Date;
                  }) => (
                    <ActionItem
                      key={order._id}
                      title={`Đơn hàng ${order.code}`}
                      subTitle={`Khóa học: ${order.course?.title || 'N/A'}`}
                      time={timeAgo(order.created_at)}
                      link={`/manage/order`} // Link đến trang chi tiết đơn hàng
                    />
                  ),
                )}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-gray-500">
                Không có đơn hàng nào chờ xác nhận.
              </p>
            )}
          </TabsContent>
          <TabsContent value="reviews">
            {pendingReviews.length > 0 ? (
              <div className="divide-y">
                {pendingReviews.map(
                  (review: {
                    _id: string;
                    content: string;
                    user: { name: any };
                    course: { title: any };
                    created_at: string | Date;
                  }) => (
                    <ActionItem
                      key={review._id}
                      title={`"${review.content.substring(0, 30)}..."`}
                      subTitle={`bởi ${review.user?.name || 'Không rõ'} trong khóa học ${review.course?.title || 'N/A'}`}
                      time={timeAgo(review.created_at)}
                      link={`/manage/comment`} // Link đến trang quản lý bình luận
                    />
                  ),
                )}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-gray-500">
                Không có bình luận/đánh giá nào chờ kiểm duyệt.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
