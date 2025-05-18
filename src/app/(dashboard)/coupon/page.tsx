import { CouponPage } from '@/modules/coupon/pages/dashboard';
import { Heading } from '@/shared/components/common';
import { QuerySearchParams } from '@/shared/types';

const CouponPageRoot = ({ searchParams }: QuerySearchParams) => {
  return (
    <>
      <Heading>Săn mã giảm giá</Heading>
      <CouponPage searchParams={searchParams} />
    </>
  );
};

export default CouponPageRoot;
