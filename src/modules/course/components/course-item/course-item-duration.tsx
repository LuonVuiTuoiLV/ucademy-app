'use client';

import { useEffect, useState } from 'react';

import { IconClock } from '@/shared/components/icons';

import { useVideoDuration } from '@/shared/hooks/use-video-duration';
import { getCourseLessonsInfo } from '../../actions';

export interface CourseItemDurationProps {
  slug: string;
}

function CourseItemDuration({ slug }: CourseItemDurationProps) {
  const [duration, setDuration] = useState(0);
  const { formatDuration } = useVideoDuration();
  useEffect(() => {
    async function getDuration() {
      const response = await getCourseLessonsInfo({ slug });

      setDuration(response?.duration || 0);
    }
    getDuration();
  }, [slug]);

  return (
    <div className="flex items-center gap-2">
      <IconClock className="size-4" />
      <span>{formatDuration(duration)}</span>
    </div>
  );
}

export default CourseItemDuration;
