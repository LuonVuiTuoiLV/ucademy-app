'use client';
import Swal from 'sweetalert2';

import { deleteCoupon } from '@/modules/coupon/actions';
import { TableActionItem } from '@/shared/components/common';

interface DeleteCouponModalProps {
  code: string;
}
const DeleteCouponModal = ({ code }: DeleteCouponModalProps) => {
  const handleDeleteCoupon = async (code: string) => {
    try {
      Swal.fire({
        title: 'Bạn có chắc muốn xóa mã giảm giá?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa luôn.',
        cancelButtonText: 'Hủy.',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteCoupon(code);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <TableActionItem
      type="delete"
      onClick={() => handleDeleteCoupon(code)}
    />
  );
};

export default DeleteCouponModal;
