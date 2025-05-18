import { ITEMS_PER_PAGE } from '@/shared/constants';
import { QuerySearchParams } from '@/shared/types';

import { fetchComments } from '../../actions';
import CommentManageContainer from './components';

export interface OrderManagePageProps {}

async function CommentManagePage({ searchParams }: QuerySearchParams) {
  const comment = await fetchComments({
    page: searchParams?.page || 1,
    limit: ITEMS_PER_PAGE,
    search: searchParams?.search,
    status: searchParams?.status,
  });

  return <CommentManageContainer comments={comment} />;
}

export default CommentManagePage;
