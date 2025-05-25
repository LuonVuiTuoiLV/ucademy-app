import { fetchCourses } from '@/modules/course/actions'; // Đảm bảo đường dẫn đúng
import { ITEMS_PER_PAGES_ROOT } from '@/shared/constants';

import { QuerySearchParams } from '@/shared/types';
import CourseDashboardContainer from './components';

export default async function CourseDashboardPage({
  searchParams,
}: QuerySearchParams) {
  const currentPage = Number(searchParams?.page);
  const searchTerm = searchParams?.search || '';
  const isFreeFilter = searchParams?.isFree === 'true';
  const data = await fetchCourses({
    page: currentPage,
    limit: ITEMS_PER_PAGES_ROOT,
    search: searchTerm,
    isFree: isFreeFilter,
  });

  const courseList = data?.courseList || [];
  const totalCourses = data?.total || 0;
  const totalPages = Math.ceil(totalCourses / ITEMS_PER_PAGES_ROOT);

  return (
    <CourseDashboardContainer
      courseList={courseList}
      currentPage={currentPage}
      initialSearchTerm={searchTerm}
      totalCourses={totalCourses}
      totalPages={totalPages}
      initialIsFree={isFreeFilter}
    />
  );
}
