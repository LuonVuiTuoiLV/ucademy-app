import PageNotFound from '@/app/not-found';
import LessonContent from '@/components/lesson/LessonContent';
import { ECourseStatus } from '@/components/types/enums';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { courseLevelTitle } from '@/constants';
import { getCourseBySlug } from '@/lib/actions/course.actions';
import { getUserInfo } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs/server';
import Image from 'next/image';
import AlreadyEnroll from './AlreadyEnroll';
import CourseWidget from './CourseWidget';

const page = async ({ params }: { params: { slug: string } }) => {
  params = await params;
  const data = await getCourseBySlug({ slug: params.slug });
  if (!data) return null;
  if (data.status !== ECourseStatus.APPROVED)
    return <PageNotFound></PageNotFound>;
  const { userId } = await auth();
  const findUser = await getUserInfo({ userId: userId || '' });
  const userCourse = findUser?.courses.map((c) => c.toString());
  const videoId = data.intro_url?.split('v=')[1];
  const lectures = data.lectures || [];
  return (
    <div className="grid xl:grid-cols-[minmax(0,2fr),minmax(0,1fr)] gap-10 min-h-screen">
      <div className="">
        <div className="relative aspect-video mb-5">
          {data.intro_url ? (
            <>
              <iframe
                width="935"
                height="526"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="NA TRA: Kẻ thách thức SỐ MỆNH và ĐỊNH KIẾN"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="w-full h-full object-fill"
              ></iframe>
            </>
          ) : (
            <Image
              alt=""
              src={data.image}
              fill
              className="w-full h-full object-cover rounded-lg"
            ></Image>
          )}
        </div>
        <h1 className="font-bold text-3xl mb-5">{data.title}</h1>
        <BoxSection title="Mô tả">
          <div className="leading-normal">{data.desc}</div>
        </BoxSection>
        <BoxSection title="Thông tin">
          <div className="grid grid-cols-4 gap-5 mb-10">
            <BoxInfo title="Bài học">100</BoxInfo>
            <BoxInfo title="Lượt xem">{data.views.toLocaleString()}</BoxInfo>
            <BoxInfo title="Trình độ">{courseLevelTitle[data.level]}</BoxInfo>
            <BoxInfo title="Thời lượng">100h45p</BoxInfo>
          </div>
        </BoxSection>
        <BoxSection title="Nội dung khóa học">
          <LessonContent lectures={lectures} course="" slug=""></LessonContent>
        </BoxSection>
        <BoxSection title="Yêu cầu">
          {data.info.requirements.map((r, index) => (
            <div className="mb-3 flex items-center gap-2" key={index}>
              <span className="flex items-center justify-center size-5 bg-primary text-white p-1 rounded-lg flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </span>
              <span>{r}</span>
            </div>
          ))}
        </BoxSection>
        <BoxSection title="Lợi ích">
          {data.info.benefits.map((b, index) => (
            <div className="mb-3 flex items-center gap-2" key={index}>
              <span className="flex items-center justify-center size-5 bg-primary text-white p-1 rounded-lg flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </span>
              <span>{b}</span>
            </div>
          ))}
        </BoxSection>
        <BoxSection title="Q/A">
          {data.info.qa.map((qa, index) => (
            <Accordion type="single" collapsible key={index}>
              <AccordionItem value={qa.question}>
                <AccordionTrigger>{qa.question}</AccordionTrigger>
                <AccordionContent>{qa.answer}</AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </BoxSection>
      </div>
      <div>
        {userCourse?.includes(data._id.toString()) ? (
          <AlreadyEnroll></AlreadyEnroll>
        ) : (
          <CourseWidget
            data={data ? JSON.parse(JSON.stringify(data)) : null}
            findUser={findUser ? JSON.parse(JSON.stringify(findUser)) : null}
          ></CourseWidget>
        )}
      </div>
    </div>
  );
};

function BoxInfo({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg p-5">
      <h4 className="text-sm text-slate-400 font-normal">{title}</h4>
      <h3 className="font-bold">{children}</h3>
    </div>
  );
}

function BoxSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <h2 className="font-bold text-xl mb-5">{title}</h2>
      <div className="mb-10 ">{children}</div>
    </>
  );
}
export default page;
