'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  IconPlay,
  IconStar,
  IconStudy,
  IconUsers,
} from '@/shared/components/icons';
import { useUserContext } from '@/shared/contexts';
import { CourseItemData } from '@/shared/types';

import { LassLessonData } from '@/modules/course/types';
import ShiningButton from '@/shared/components/ui/shinning';
import { lastLessonKey } from '@/shared/constants';
import Image from 'next/image';
import ButtonEnroll from './button-enroll';
import CouponForm from './coupon-form';

interface CourseWidgetProps {
  data: CourseItemData;
  duration: string;
}
const CourseWidget = ({ data, duration }: CourseWidgetProps) => {
  const [price, setPrice] = useState<number>(data.price);
  const [coupon, setCoupon] = useState('');
  const { userInfo } = useUserContext();

  const isAlreadyEnrolled = userInfo?.courses
    ? JSON.parse(JSON.stringify(userInfo?.courses)).includes(data._id)
    : false;
  const [lastLesson, setLastLesson] = useState<LassLessonData[]>([]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    const lesson = localStorage
      ? JSON.parse(localStorage?.getItem(lastLessonKey) || '[]') || []
      : [];

    setLastLesson(lesson);
  }, []);

  const firstLessonUrl = data.lectures[0].lessons[0].slug;
  const lastURL =
    lastLesson.find((element) => element.course === data.slug)?.lesson ||
    `/${data.slug}/lesson?slug=${firstLessonUrl}`;

  if (isAlreadyEnrolled)
    return (
      <div className="sticky right-0 top-5 flex flex-col gap-5">
        <div className="relative flex flex-col rounded-lg border border-white bg-white/30 p-3 backdrop-blur-xl transition-all dark:border-white/10 dark:bg-grayDarkest">
          <div className="rounded-lg bg-white p-3 dark:bg-grayDarker">
            <div className="borderDarkMode relative mx-auto mb-5 size-24 rounded-full border">
              <Image
                alt="Ảnh đại diện"
                className="h-full w-full rounded-full object-cover"
                height={96}
                width={96}
                src={userInfo?.avatar || ''}
              />
              <IconStar className="absolute bottom-0 right-0 size-5 fill-[#ff979a]" />
            </div>
            <div className="text-center">
              Xin chào{' '}
              <strong className="text-base italic">{userInfo?.username}</strong>{' '}
            </div>
            <div className="text-center">
              Bạn đã sở hữu khóa học này rồi. Vui lòng vào{' '}
              <Link
                className="font-bold text-primary"
                href="/study"
              >
                Khu vực học tập
              </Link>{' '}
              để học hoặc
            </div>
            <Link
              className="mt-5 flex h-12 w-full items-center justify-center rounded-lg"
              href={lastURL}
            >
              <ShiningButton>Nhấn vào đây</ShiningButton>
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <>
      <div className="bgDarkMode borderDarkMode rounded-lg border p-5">
        <div className="mb-3 flex items-center gap-2">
          {data.is_free ? (
            ''
          ) : (
            <>
              <strong className="text-lg font-bold text-primary lg:text-2xl">
                {price.toLocaleString('en-EN')}
              </strong>
              <span className="text-sm text-slate-400 line-through lg:text-lg">
                {data.sale_price.toLocaleString('en-EN')}
              </span>
              <span className="ml-auto inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-bold text-primary lg:text-lg">
                -{Math.floor((data.price / data.sale_price) * 100)}%
              </span>
            </>
          )}
        </div>
        <h3 className="mb-3 text-sm font-bold">Khóa học gồm có:</h3>
        <ul className="mb-5 flex flex-col gap-2 text-sm text-slate-500">
          <li className="flex items-center gap-2">
            <IconPlay className="size-4" />
            <span>Video Full HD</span>
          </li>
          <li className="flex items-center gap-2">
            <IconUsers className="size-4" />
            <span>Có nhóm hỗ trợ</span>
          </li>
          <li className="flex items-center gap-2">
            <IconStudy className="size-4" />
            <span>Tài liệu kèm theo</span>
          </li>
        </ul>
        <ButtonEnroll
          amount={price}
          coupon={coupon}
          courseId={data ? JSON.parse(JSON.stringify(data._id)) : null}
          status={data.status}
          isFree={data.is_free}
        />
        {!data.is_free && (
          <CouponForm
            courseId={data ? JSON.parse(JSON.stringify(data._id)) : null}
            originalPrice={data.price}
            setCouponId={setCoupon}
            setPrice={setPrice}
          />
        )}
      </div>
    </>
  );
};

export default CourseWidget;
