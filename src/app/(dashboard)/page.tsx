import { CourseGrid, Heading } from '@/components/common';
import CourseItem from '@/components/course/CourseItem';
import { getAllCoursesPublic } from '@/lib/actions/course.actions';

const page = async () => {
  const courses = (await getAllCoursesPublic({})) || [];

  return (
    <div className="">
      <Heading>Khám phá</Heading>
      <CourseGrid>
        {courses.length > 0 &&
          courses?.map((item) => (
            <CourseItem key={item.slug} data={item}></CourseItem>
          ))}
      </CourseGrid>
    </div>
  );
};

export default page;
