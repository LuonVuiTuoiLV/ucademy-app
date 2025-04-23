import { commonClassNames } from '@/constants';
import { ICourse } from '@/database/course.model';
import Image from 'next/image';
import Link from 'next/link';
import { IconClock, IconEye, IconStar } from '../icons';

const CourseItem = ({
  data,
  cta,
  url = '',
}: {
  data: ICourse;
  cta?: string;
  url?: string;
}) => {
  const courseInfo = [
    {
      title: data.views,
      icon: (className?: string) => <IconEye className={className}></IconEye>,
    },
    {
      title: data.rating[0],
      icon: (className?: string) => <IconStar className={className}></IconStar>,
    },
    {
      title: '30h25',
      icon: (className?: string) => (
        <IconClock className={className}></IconClock>
      ),
    },
  ];
  const courseUrl = url ? url : `/course/${data.slug}`;

  console.log(' courseUrl:', courseUrl);
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-2xl dark:bg-grayDarker dark:border-opacity-10 flex flex-col">
      <Link href={courseUrl} className="block h-[180px] relative">
        <Image
          alt=""
          src={data.image}
          width={300}
          height={200}
          className="object-cover w-full h-full rounded-lg"
          sizes="@media (min-width:640px) 300px, 100vw"
          priority
        />
      </Link>
      <div className="pt-4 flex flex-col flex-1">
        <div className="mt-auto">
          <h3 className="mb-5 text-lg font-bold ">{data.title}</h3>
          <div className="flex items-center gap-3 mb-5 text-xs text-gray-500 dark:text-grayDark">
            {courseInfo.map((item, index) => (
              <div className="flex items-center gap-2" key={index}>
                {item.icon('size-4')}
                <span>{item.title}</span>
              </div>
            ))}

            <span className="ml-auto text-base font-bold text-primary">
              {data.price.toLocaleString()}đ
            </span>
          </div>
          <Link href={courseUrl} className={commonClassNames.btnPrimary}>
            {cta || 'Xem chi tiết'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseItem;
