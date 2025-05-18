// Ví dụ: shared/components/coupon/CouponCard.tsx
'use client';

import { CheckIcon, ClipboardCopyIcon } from '@radix-ui/react-icons'; // Ví dụ icons
import React, { useState } from 'react';
import { toast } from 'react-toastify'; // Để hiển thị thông báo

import { Button } from '@/shared/components/ui/button'; // Button của bạn
import { CouponItemData } from '@/shared/types'; // Kiểu dữ liệu Coupon

interface CouponCardProps {
  coupon: CouponItemData;
  fromColor?: string;
  viaColor?: string;
  toColor?: string;
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  fromColor = '#4158D0',
  toColor = '#FFCC70',
  viaColor = '#C850C0',
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!coupon.code) {
      toast.error('Không có mã để sao chép.');

      return;
    }
    try {
      await navigator.clipboard.writeText(coupon.code);
      toast.success(`Đã sao chép mã: ${coupon.code}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500); // Reset trạng thái sau 2.5 giây
    } catch (error) {
      console.error('Lỗi khi sao chép:', error);
      toast.error('Không thể sao chép mã. Vui lòng thử lại.');
    }
  };

  return (
    <div
      className="hover:shadow-glow relative rounded-3xl bg-gradient-to-r p-0.5 transition-all duration-300 ease-out hover:brightness-150"
      style={{
        backgroundImage: `linear-gradient(to right, ${fromColor}, ${viaColor}, ${toColor})`,
      }}
    >
      <div className="relative size-full overflow-hidden rounded-[calc(1.5rem-2px)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 size-full rounded-[calc(1.5rem-2px)] bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FFCC70] opacity-60 blur-xl transition-all duration-500 ease-out group-hover:opacity-80 group-hover:blur-lg"
        />
        <div className="relative z-10 flex size-full flex-col items-center justify-between bg-blue-950/80 p-5 text-center backdrop-blur-sm">
          <div className="flex w-full flex-col items-center justify-center border-b border-gray-100/20 pb-4">
            <span className="mb-1 text-xl font-bold uppercase tracking-wider text-gray-50">
              {coupon.title || 'Giảm Giá Đặc Biệt'}{' '}
            </span>
            <span className="text-sm font-medium text-gray-200">
              {coupon.courses[0].title
                ? `Áp dụng cho: ${coupon.courses[0].title}`
                : 'Áp dụng cho nhiều khóa học'}{' '}
            </span>
          </div>

          <div className="my-6 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold text-white">
              {coupon.type === 'PERCENT'
                ? `${coupon.value}%`
                : `${coupon.value.toLocaleString('vi-VN')}đ`}
            </span>
            <span className="mt-1 text-xs text-gray-300">GIẢM GIÁ</span>
          </div>

          <Button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-center text-base font-semibold transition-all duration-200 ease-in-out hover:scale-105 focus:scale-105 active:scale-95"
            disabled={isCopied} // Vô hiệu hóa tạm thời sau khi copy
            variant="primary" // Hoặc variant khác bạn muốn
            onClick={handleCopyCode}
          >
            {isCopied ? (
              <>
                <CheckIcon className="size-5" /> Đã sao chép!
              </>
            ) : (
              <>
                <ClipboardCopyIcon className="size-5" /> Lấy Mã Ngay
              </>
            )}
          </Button>
          <p className="mt-3 text-xs text-gray-400">
            Mã: <strong className="text-gray-200">{coupon.code}</strong>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {coupon.limit > 0
              ? `Còn ${coupon.limit - coupon.used} lượt`
              : 'Không giới hạn lượt'}
          </p>
          {!!coupon.end_date && (
            <p className="mt-1 text-xs text-gray-400">
              Hết hạn: {new Date(coupon.end_date).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
