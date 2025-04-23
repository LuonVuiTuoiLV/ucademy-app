import Heading from '@/components/common/Heading';
import CourseUpdate from '@/components/course/CourseUpdate';

import { getCourseBySlug } from '@/lib/actions/course.actions';

const page = async ({ searchParams }: { searchParams: { slug: string } }) => {
  const params = await searchParams;
  const findCourse = await getCourseBySlug({ slug: params.slug });
  if (!findCourse) return null;
  return (
    <>
      <Heading className="mb-8">Cập nhật khóa học</Heading>
      <CourseUpdate
        data={JSON.parse(JSON.stringify(findCourse))}
      ></CourseUpdate>
    </>
  );
};

export default page;
