import { Heading } from '@/components/common';
import { getCouponByCode } from '@/lib/actions/coupon.actions';
import UpdateCouponForm from './UpdateCouponForm';

const page = async ({
  searchParams,
}: {
  searchParams: {
    code: string;
  };
}) => {
  searchParams = await searchParams;
  const couponDetails = await getCouponByCode({ code: searchParams.code });
  if (!couponDetails) return null;
  return (
    <div>
      <Heading className="mb-10">Tạo mới mã giảm giá</Heading>
      <UpdateCouponForm data={couponDetails}></UpdateCouponForm>
    </div>
  );
};

export default page;
