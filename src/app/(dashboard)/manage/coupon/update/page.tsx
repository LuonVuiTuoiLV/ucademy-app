import { UpdateCouponPage } from '@/modules/coupon/pages';
import { Heading } from '@/shared/components/common';

export interface UpdateCouponPageRootProps {
  searchParams: {
    code: string;
  };
}

function UpdateCouponPageRoot({ searchParams }: UpdateCouponPageRootProps) {
  return (
    <>
      <Heading>Cập Nhật Mã Giảm Giá</Heading>
      <UpdateCouponPage code={searchParams.code} />;
    </>
  );
}

export default UpdateCouponPageRoot;
