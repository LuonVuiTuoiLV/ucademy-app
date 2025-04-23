import { Heading } from '@/components/common';
import { getCourseBySlug } from '@/lib/actions/course.actions';
import { findAllLessons } from '@/lib/actions/lesson.actions';
import LessonSaveUrl from '../LessonSaveUrl';
import VideoPlayer from './VideoPlayer';

const page = async ({
  params,
  searchParams,
}: {
  params: {
    course: string;
  };
  searchParams: {
    slug: string;
  };
}) => {
  const paramsCourse = await params;
  const course = paramsCourse.course;

  const searchParamsSlug = await searchParams;
  const slug = searchParamsSlug.slug;

  const findCourse = await getCourseBySlug({ slug: course });
  if (!findCourse) return null;

  // id là object id nên biến về chuỗi thông thường để xử lý
  const courseId = findCourse?._id.toString();

  const lessonList = await findAllLessons({ course: courseId || '' });
  const lessonDetails = lessonList?.find((el) => el.slug === slug);
  if (!lessonDetails) return null;

  const currentLessonIndex =
    lessonList?.findIndex((el) => el.slug === slug) || 0;
  const nextLesson = lessonList?.[currentLessonIndex + 1];
  const prevLesson = lessonList?.[currentLessonIndex - 1];

  const videoUrl = lessonDetails.video_url?.split('v=').at(-1);

  return (
    <div className="mb-5">
      <LessonSaveUrl
        course={course}
        url={`/${course}/lesson?slug=${slug}`}
      ></LessonSaveUrl>
      {/* <iframe
          className="w-full h-full object-fill"
          src={`https://www.youtube.com/embed/${videoUrl}`}
        ></iframe> */}
      <VideoPlayer
        nextLesson={
          !nextLesson ? '' : `/${course}/lesson?slug=${nextLesson?.slug}`
        }
        prevLesson={
          !prevLesson ? '' : `/${course}/lesson?slug=${prevLesson?.slug}`
        }
      ></VideoPlayer>

      <Heading className="mb-10">{lessonDetails.title}</Heading>
      <div className="p-5 rounded-lg bgDarkMode border borderDarkMode entry-content">
        <div
          dangerouslySetInnerHTML={{ __html: lessonDetails.content || '' }}
        ></div>
      </div>
    </div>
  );
};

export default page;
