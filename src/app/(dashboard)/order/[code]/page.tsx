import Link from 'next/link';

import PageNotFound from '@/app/not-found';
import { getOrderDetails } from '@/modules/order/actions/order.actions';
import { Heading } from '@/shared/components/common';
import { Table, TableBody, TableCell, TableRow } from '@/shared/components/ui';
import { cn } from '@/shared/utils';

interface OrderDetailsPageRootProps {
  params: {
    code: string;
  };
}

const OrderDetailsPageRoot = async ({ params }: OrderDetailsPageRootProps) => {
  const orderDetails = await getOrderDetails({
    code: params.code,
  });

  if (!orderDetails) return <PageNotFound />;
  const paymentInfo = [
    { label: 'Số tài khoản', value: '1016945073' },
    { label: 'Tên tài khoản', value: 'NGUYỄN LONG VŨ' },
    { label: 'Ngân hàng', value: 'Ngân hàng VCB' },
    {
      label: 'Số tiền cần thanh toán',
      value: `${orderDetails.total.toLocaleString('vi-VN')} VND`,
    },
  ];

  return (
    <div className="bgDarkMode flex flex-col gap-5 rounded-md p-5">
      <Heading>Hướng dẫn mua khóa học</Heading>

      <p>
        Cám ơn bạn đã mua khóa học{' '}
        <strong className="text-primary">{orderDetails.course.title}</strong>{' '}
        với số tiền là{' '}
        <strong className="text-primary">{orderDetails.total}</strong>
      </p>
      <p>
        Bạn vui lòng thanh toán vào thông tin tài khoản dưới đây với nội dung
        chuyển khoản là{' '}
        <strong className="text-primary">{orderDetails.code}</strong>
      </p>
      <div className="max-w-[400px]">
        <div className="relative w-full overflow-auto rounded-lg">
          <Table>
            <TableBody>
              {paymentInfo.map((item, index) => (
                <TableRow key={item.label}>
                  {' '}
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right',
                      index === paymentInfo.length - 1 &&
                        'font-bold text-primary',
                    )}
                  >
                    {item.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div>
        Nếu bạn cần hỗ trợ, vui lòng liên hệ Admin qua fb cá nhân:{' '}
        <Link
          className="text-primary underline"
          href="https://www.facebook.com/lala.loll.798/"
          target="_blank"
        >
          LuonVuiTuoi
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailsPageRoot;
