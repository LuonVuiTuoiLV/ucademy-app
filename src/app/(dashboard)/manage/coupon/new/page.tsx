import { CreateCouponPage } from '@/modules/coupon/pages';
import { Heading } from '@/shared/components/common';

export interface CreateCouponPageRootProps {}

function CreateCouponPageRoot(_props: CreateCouponPageRootProps) {
  return (
    <>
      <Heading>Tạo Mã Giảm Giá</Heading>
      <CreateCouponPage />
    </>
  );
}

export default CreateCouponPageRoot;
