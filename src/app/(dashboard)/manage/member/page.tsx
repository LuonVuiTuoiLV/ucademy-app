import UserManagePage from '@/modules/user/pages/manage/user-manage-page';
import { QuerySearchParams } from '@/shared/types';

export interface ManageUserPageRootProps {}

function ManageUserPageRoot({ searchParams }: QuerySearchParams) {
  return <UserManagePage searchParams={searchParams} />;
}

export default ManageUserPageRoot;
