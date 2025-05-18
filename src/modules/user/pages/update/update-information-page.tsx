import { notFound } from 'next/navigation';

import { getUserByIdForAdmin } from '@/modules/user/actions'; // Server action mới để lấy user chi tiết

import UpdateUserDetailContainer from './components';

export interface UpdateUserPageProps {
  userId: string;
}
export default async function AdminUpdateUserPage({
  userId,
}: UpdateUserPageProps) {
  const userDetail = await getUserByIdForAdmin(userId); // Gọi action lấy user

  if (!userDetail) {
    notFound();
  }

  return <UpdateUserDetailContainer initialUserData={userDetail} />;
}
