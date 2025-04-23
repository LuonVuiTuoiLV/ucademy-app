import PageNotFound from '@/app/not-found';
import { getOrderDetails } from '@/lib/actions/order.actions';

const OrderDetails = async ({
  params,
}: {
  params: {
    code: string;
  };
}) => {
  params = await params;
  const orderDetails = await getOrderDetails({
    code: params.code,
  });
  if (!orderDetails) return <PageNotFound></PageNotFound>;
  return (
    <div className="flex flex-col gap-5">
      <p>
        Cảm ơn bạn đã mua khóa học{' '}
        <strong className="text-primary">{orderDetails.course.title}</strong>{' '}
        với số tiền là{' '}
        <strong className="text-primary">{orderDetails.total}</strong>
      </p>
      <p>
        Bạn vui lòng thanh toán theo thông tin tài khoản dưới đây với nội dung{' '}
        <strong className="text-primary">{orderDetails.code}</strong>
      </p>
    </div>
  );
};

export default OrderDetails;
