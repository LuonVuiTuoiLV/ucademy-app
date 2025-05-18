import AdminUpdateUserPage from '@/modules/user/pages/update/update-information-page';
import { Heading } from '@/shared/components/common';

export interface UpdateUserPageRootProps {
  searchParams: {
    slug: string;
  };
}

function UpdateUserPageRoot({ searchParams }: UpdateUserPageRootProps) {
  return (
    <>
      <Heading>Cập Nhật Thông Tin Người Dùng</Heading>
      <AdminUpdateUserPage userId={searchParams.slug} />
    </>
  );
}

export default UpdateUserPageRoot;
