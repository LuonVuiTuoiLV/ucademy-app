import { Heading } from '@/components/common';
import CourseUpdateContent from '@/components/course/CourseUpdateContent';
import { getCourseBySlug } from '@/lib/actions/course.actions';

const page = async ({ searchParams }: { searchParams: { slug: string } }) => {
  const params = await searchParams;
  const findCourse = await getCourseBySlug({ slug: params.slug });
  if (!findCourse) return null;
  return (
    <>
      <Heading className="mb-10">
        Nội dung:<strong className="text-primary">{findCourse.title}</strong>
      </Heading>
      <CourseUpdateContent
        course={JSON.parse(JSON.stringify(findCourse))}
      ></CourseUpdateContent>
    </>
  );
};

export default page;
