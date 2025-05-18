import { QuerySearchParams } from '@/shared/types';

import { fetchUsers } from '../../actions';
import UserManageContainer from './components';

export interface CourseManagePageProps {}

async function UserManagePage({ searchParams }: QuerySearchParams) {
  const users =
    (await fetchUsers({
      page: searchParams.page || 1,
      limit: 10,
      search: searchParams.search,
      status: searchParams.status,
    })) || [];

  return <UserManageContainer users={users} />;
}

export default UserManagePage;
