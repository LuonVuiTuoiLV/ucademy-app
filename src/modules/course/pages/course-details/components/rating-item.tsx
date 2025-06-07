'use client';
import { useUserContext } from '@/shared/contexts';
import Image from 'next/image';

export interface RatingItemProps {
  rating: string;
}

function RatingItem({ rating }: RatingItemProps) {
  const { userInfo } = useUserContext();
  return (
    <div className="borderDarkMode bgDarkMode flex items-center gap-2 rounded-full border p-1 text-left text-sm font-medium">
      <Image
        alt=""
        width="40"
        height="40"
        src={userInfo?.avatar || ''}
        className="borderDarkMode size-8 flex-shrink-0 rounded-full border object-cover p-0.5"
      ></Image>
      <div className="flex-1">{rating}</div>
    </div>
  );
}

export default RatingItem;
