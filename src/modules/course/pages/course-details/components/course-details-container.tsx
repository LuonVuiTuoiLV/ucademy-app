import Image from 'next/image';

import PageNotFound from '@/app/not-found';
import { getCourseLessonsInfo } from '@/modules/course/actions';
import { CourseOutline } from '@/shared/components/course';
import { courseLevelTitle, CourseStatus } from '@/shared/constants';
import { CourseItemData } from '@/shared/types';
import { CourseLessonData, CourseQAData } from '@/shared/types/course.type';

import { formatVideoDuration } from '@/shared/helpers';
import BenefitItem from './benefit-item';
import CourseWidget from './course-widget';
import QaItem from './qa-item';
import RatingItem from './rating-item';
import RequirementItem from './requirement-item';
import SectionInfoItem from './section-info-item';
import SectionItem from './section-item';

export interface CourseDetailsContainerProps {
  courseDetails: CourseItemData | undefined;
}

async function CourseDetailsContainer({
  courseDetails,
}: CourseDetailsContainerProps) {
  const isEmptyData =
    !courseDetails ||
    (courseDetails.status !== CourseStatus.COMING_SOON &&
      courseDetails.status !== CourseStatus.APPROVED);

  if (isEmptyData) return <PageNotFound />;
  const videoId = courseDetails.intro_url?.split('v=')[1];
  const ratings = courseDetails.rating.map((item) => item.content);
  const lessonInfo: CourseLessonData = (await getCourseLessonsInfo({
    slug: courseDetails.slug,
  })) || { duration: 0, lessons: 0 };
  const requirements = courseDetails.info.requirements || [];
  const benefits = courseDetails.info.benefits || [];
  const questionAnswers = courseDetails.info.qa || [];
  const courseDetailsMeta: {
    title: string;
    content: React.ReactNode;
  }[] = [
    {
      title: 'Bài học',
      content: lessonInfo.lessons,
    },
    {
      title: 'Lượt xem',
      content: courseDetails.views.toLocaleString(),
    },
    {
      title: 'Trình độ',
      content: courseLevelTitle[courseDetails.level],
    },
    {
      title: 'Thời lượng',
      content: formatVideoDuration(lessonInfo.duration),
    },
  ];

  const courseDetailsInfo: {
    title: string;
    content: React.ReactNode;
  }[] = [
    {
      title: 'Mô tả',
      content: <div className="leading-normal">{courseDetails.desc}</div>,
    },
    {
      title: 'Thông tin',
      content: (
        <div className="mb-10 grid grid-cols-4 gap-5">
          {courseDetailsMeta.map((item) => (
            <SectionInfoItem
              key={item.title}
              title={item.title}
            >
              {item.content}
            </SectionInfoItem>
          ))}
        </div>
      ),
    },
    {
      title: 'Nội dung khóa học',
      content: (
        <CourseOutline
          course=""
          lectures={courseDetails.lectures}
          slug=""
        />
      ),
    },
  ];

  // Thêm mục "Yêu cầu" CHỈ KHI requirements có nội dung
  if (requirements.length > 0) {
    courseDetailsInfo.push({
      title: 'Yêu cầu',
      content: requirements.map((item) => (
        <RequirementItem
          key={item} // Giả sử item là string duy nhất
          title={item}
        />
      )),
    });
  }

  // Thêm mục "Lợi ích" CHỈ KHI benefits có nội dung
  if (benefits.length > 0) {
    courseDetailsInfo.push({
      title: 'Lợi ích',
      content: benefits.map((item) => (
        <BenefitItem
          key={item} // Giả sử item là string duy nhất
          title={item}
        />
      )),
    });
  }

  // Thêm mục "Q.A" CHỈ KHI questionAnswers có nội dung
  if (questionAnswers.length > 0) {
    courseDetailsInfo.push({
      title: 'Q.A',
      content: (
        <div className="flex flex-col gap-5">
          {questionAnswers.map((item: CourseQAData) => (
            <QaItem
              key={item.question} // Giả sử item.question là duy nhất
              item={item}
            />
          ))}
        </div>
      ),
    });
  }

  return (
    <div className="grid min-h-screen items-start gap-10 lg:grid-cols-[2fr,1fr]">
      <div>
        <div className="relative mb-5 aspect-video">
          {courseDetails.intro_url ? (
            <>
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="size-full object-fill"
                height="480"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={courseDetails.title || 'Course Video'}
                width="853"
              />
            </>
          ) : (
            <Image
              fill
              alt={courseDetails.title || 'Course Image'}
              className="size-full rounded-lg object-cover"
              src={courseDetails.image}
            />
          )}
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {ratings.map((rating: string, index: number) => (
            <RatingItem
              key={index}
              rating={rating}
            />
          ))}
        </div>
        <h1 className="mb-5 text-3xl font-bold">{courseDetails?.title}</h1>
        {courseDetailsInfo.map((item) => (
          <SectionItem
            key={item.title}
            title={item.title}
          >
            {item.content}
          </SectionItem>
        ))}
      </div>
      <CourseWidget
        data={courseDetails}
        duration={formatVideoDuration(lessonInfo.duration)}
      />
    </div>
  );
}

export default CourseDetailsContainer;
