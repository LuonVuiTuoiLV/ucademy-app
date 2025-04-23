import { Heading } from '@/components/common';
import { getUserCourses } from '@/lib/actions/user.actions';
import StudyCourses from './StudyCourses';

const page = async () => {
  const courses = await getUserCourses();
  return (
    <div className="">
      <Heading>Khu vực học tập</Heading>
      <StudyCourses
        courses={courses ? JSON.parse(JSON.stringify(courses)) : []}
      ></StudyCourses>
    </div>
  );
};

export default page;
