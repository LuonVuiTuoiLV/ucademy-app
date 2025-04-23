import CourseManage from '@/components/course/CourseManage';
import { ECourseStatus } from '@/components/types/enums';
import { getAllCourses } from '@/lib/actions/course.actions';

const page = async ({
  searchParams,
}: {
  searchParams: {
    page: number;
    search: string;
    status: ECourseStatus;
  };
}) => {
  searchParams = await searchParams;
  const courses =
    (await getAllCourses({
      page: searchParams.page || 1,
      limit: 10,
      search: searchParams.search,
      status: searchParams.status,
    })) || [];
  return (
    <CourseManage courses={JSON.parse(JSON.stringify(courses))}></CourseManage>
  );
};

export default page;
