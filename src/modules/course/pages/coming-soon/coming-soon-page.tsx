import { ITEMS_PER_PAGE } from '@/shared/constants';
import { QuerySearchParams } from '@/shared/types';
import { getAllCoursesPublic } from '../../actions';
import ComingSoonPageContainer from './components';

export interface ComingSoonPageProps {}

async function ComingSoonPage({ searchParams }: QuerySearchParams) {
  const courses = await getAllCoursesPublic({
    page: searchParams.page || 1,
    limit: ITEMS_PER_PAGE,
    search: searchParams.search,
    status: searchParams.status,
  });
  if (!courses) return null;
  return <ComingSoonPageContainer courses={courses} />;
}

export default ComingSoonPage;
