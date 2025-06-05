import { CourseDashboardPage } from '@/modules/course/pages';
import { Heading } from '@/shared/components/common';
import { QuerySearchParams } from '@/shared/types';

function ExplorePage({ searchParams }: QuerySearchParams) {
  return (
    <>
      <Heading>Khám phá</Heading>
      <CourseDashboardPage searchParams={searchParams} />
    </>
  );
}

export default ExplorePage;
