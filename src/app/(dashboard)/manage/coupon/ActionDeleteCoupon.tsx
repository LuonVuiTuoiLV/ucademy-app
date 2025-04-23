'use client';
import { TableActionIcon } from '@/components/common';
import { deleteCoupon } from '@/lib/actions/coupon.actions';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
const ActionDeleteCoupon = ({ code }: { code: string }) => {
  const handleDeleteCoupon = async (code: string) => {
    try {
      Swal.fire({
        title: 'Bạn có chắc muốn xóa coupon không ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Đóng',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteCoupon(code);
          toast.success('Xóa khóa học thành công');
        }
      });
    } catch (error) {
      console.log(' error:', error);
    }
  };
  return (
    <TableActionIcon
      type="delete"
      onClick={() => handleDeleteCoupon(code)}
    ></TableActionIcon>
  );
};

export default ActionDeleteCoupon;
