import { InformationPage } from '@/modules/user/pages/information';
import { Heading } from '@/shared/components/common';

const UserPageRoot = () => {
  return (
    <>
      <Heading>Thông tin cá nhân</Heading>
      <InformationPage />
    </>
  );
};

export default UserPageRoot;
