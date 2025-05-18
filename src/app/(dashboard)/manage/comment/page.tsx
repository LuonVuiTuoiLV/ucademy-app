import { CommentManagePage } from '@/modules/comment/pages/comment-manage-page';
import { QuerySearchParams } from '@/shared/types';

export interface CommentPageRootProps {}

function CommentPageRoot({ searchParams }: QuerySearchParams) {
  return <CommentManagePage searchParams={searchParams} />;
}

export default CommentPageRoot;
