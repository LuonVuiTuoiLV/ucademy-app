'use client';

import CourseItem from '@/modules/course/components/course-item';
import { CourseGrid } from '@/shared/components/common';
import { CourseItemData } from '@/shared/types';

export interface ComingSoonPageContainerProps {
  courses: CourseItemData[];
}

function ComingSoonPageContainer({ courses }: ComingSoonPageContainerProps) {
  return (
    <CourseGrid>
      {courses.map((item) => {
        return (
          <CourseItem
            key={item.slug}
            cta="Sắp ra mắt"
            data={item}
          />
        );
      })}
    </CourseGrid>
  );
}

export default ComingSoonPageContainer;
