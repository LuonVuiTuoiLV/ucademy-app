import { QuerySearchParams } from '@/shared/types';

import { ITEMS_PER_PAGE } from '@/shared/constants';
import { fetchCourses } from '../../actions';
import CourseManageContainer from './components';

export interface CourseManagePageProps {}

async function CourseManagePage({ searchParams }: QuerySearchParams) {
  const data = await fetchCourses({
    page: searchParams.page || 1,
    limit: ITEMS_PER_PAGE,
    search: searchParams.search,
    status: searchParams.status,
  });
  if (!data) return null;
  const { courseList, total } = data;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  console.log(' courseList:', courseList);
  return (
    <CourseManageContainer
      courses={courseList}
      total={total}
      totalPages={totalPages}
    />
  );
}

export default CourseManagePage;
