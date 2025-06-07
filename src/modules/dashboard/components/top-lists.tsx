// Ví dụ: src/components/dashboard/TopLists.tsx
import {
  getCourseStatusStats,
  getTopRatedCourses,
  getTopSellingCourses,
} from '@/modules/dashboard/actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import Link from 'next/link';
import CourseStatusPieChart from './chartpie-legend';

// Component con để hiển thị một danh sách
const TopListItem = ({
  index,
  title,
  link,
  metric,
}: {
  index: number;
  title: string;
  link: string;
  metric: string;
}) => (
  <li className="flex items-center justify-between py-2">
    <div className="flex items-center gap-3">
      <span className="flex size-6 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        {index + 1}
      </span>
      <Link
        href={link}
        className="font-medium hover:underline"
      >
        {title}
      </Link>
    </div>
    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
      {metric}
    </span>
  </li>
);

async function TopLists() {
  const [sellingData, ratedData, courseStatusData] = await Promise.all([
    getTopSellingCourses(5),
    getTopRatedCourses(5),
    getCourseStatusStats(),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Khóa học Bán chạy</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {sellingData?.data?.map((course, index) => (
              <TopListItem
                key={course.slug}
                index={index}
                title={course.title}
                link={`/manage/course/update?slug=${course.slug}`}
                metric={`${course.salesCount} lượt bán`}
              />
            ))}
            {sellingData?.data?.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
            )}
          </ul>
        </CardContent>
      </Card>
      {/* 2. Top Khóa học được đánh giá cao nhất */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Khóa học Đánh giá cao</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {ratedData?.data?.map((course, index) => {
              const ratingText =
                typeof course.averageRating === 'number'
                  ? `${course.averageRating.toFixed(1)}/5`
                  : 'Chưa có đánh giá';

              return (
                <TopListItem
                  key={course.slug || index} // Thêm index để key luôn tồn tại
                  index={index}
                  title={course.title}
                  link={`/manage/course/update?slug=${course.slug}`}
                  metric={`${ratingText} (${course.ratingCount || 0} lượt)`}
                />
              );
            })}
            {ratedData?.data?.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
            )}
          </ul>
        </CardContent>
      </Card>
      <CourseStatusPieChart stats={courseStatusData?.data || []} />
    </div>
  );
}
export default TopLists;
