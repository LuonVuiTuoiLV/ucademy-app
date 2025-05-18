'use client';

import { CourseGrid } from '@/shared/components/common';
import { CouponItemData } from '@/shared/types';

import CouponCard from './coupon-card';

export interface CouponContainerProps {
  coupons?: CouponItemData[];
  totalPages: number;
  total: number;
}
const CouponContainer = ({ coupons }: CouponContainerProps) => {
  return (
    <>
      <CourseGrid>
        {!!coupons &&
          coupons.map((coupon) => (
            <CouponCard
              key={coupon._id || coupon.code}
              coupon={coupon}
            />
          ))}
      </CourseGrid>
    </>
  );
};

export default CouponContainer;
