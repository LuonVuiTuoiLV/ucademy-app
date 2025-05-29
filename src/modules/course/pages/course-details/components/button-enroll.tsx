'use client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { createOrder } from '@/modules/order/actions/order.actions';
import { Button } from '@/shared/components/ui';
import { CourseStatus, OrderStatus } from '@/shared/constants';
import { useUserContext } from '@/shared/contexts';

interface ButtonEnrollProps {
  courseId: string;
  amount: number;
  coupon: string;
  status: CourseStatus;
  isFree: boolean;
}

const ButtonEnroll = ({
  amount,
  coupon,
  courseId,
  status,
  isFree,
}: ButtonEnrollProps) => {
  const { userInfo } = useUserContext();
  const router = useRouter();

  const createOrderCode = () => `DH-${Date.now().toString().slice(-6)}`;

  const handleEnrollCourse = async () => {
    if (!userInfo?._id) {
      toast.error('Vui lòng đăng nhập để ghi danh khóa học!');
      router.push('/login');
      return;
    }

    if (isFree && status === CourseStatus.APPROVED) {
      try {
        const newOrder = await createOrder({
          code: createOrderCode(),
          user: userInfo._id,
          course: courseId,
          total: 0,
          amount: 0,
          status: OrderStatus.COMPLETED,
        });

        if (newOrder.data?.code) {
          toast.success(
            'Ghi danh khóa học miễn phí thành công! Bắt đầu học ngay.',
          );
          router.push(`/study`);
        } else if (newOrder?.error) {
          toast.error(newOrder.error);
        } else {
          toast.error('Ghi danh khóa học miễn phí thất bại. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error(
          'Lỗi khi ghi danh khóa học miễn phí (qua createOrder):',
          error,
        );
        toast.error('Đã có lỗi xảy ra trong quá trình ghi danh.');
      }
    } else if (status !== CourseStatus.COMING_SOON) {
      try {
        toast.info('Đang tạo đơn hàng...');
        const newOrder = await createOrder({
          code: createOrderCode(),
          user: userInfo._id,
          course: courseId,
          total: amount,
          amount: amount,
          coupon,
        });

        if (newOrder.data?.code) {
          router.push(`/order/${newOrder.data.code}`);
        } else if (newOrder?.error) {
          toast.error(newOrder.error);
        } else {
          toast.error('Không thể tạo đơn hàng. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        toast.error('Đã có lỗi xảy ra khi tạo đơn hàng.');
      }
    }
  };

  let buttonText = 'Mua khóa học';
  let isDisabled = false;

  if (status === CourseStatus.COMING_SOON) {
    buttonText = 'Sắp ra mắt';
    isDisabled = true;
  } else if (isFree && status === CourseStatus.APPROVED) {
    buttonText = 'Lụm ngay';
  } else if (!isFree && status === CourseStatus.APPROVED) {
    buttonText = 'Mua khóa học';
  } else {
    buttonText = 'Không khả dụng';
    isDisabled = true;
  }

  return (
    <Button
      className="w-full"
      variant="secondary"
      onClick={handleEnrollCourse}
      disabled={isDisabled}
    >
      {buttonText}
    </Button>
  );
};

export default ButtonEnroll;
