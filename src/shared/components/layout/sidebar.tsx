'use client';
import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useMemo } from 'react';

import { IconUsers } from '@/shared/components/icons';
import { menuItems } from '@/shared/constants';
import { useUserContext } from '@/shared/contexts';

import { MenuItem, ModeToggle } from '../common';
import { SparklesText } from '../ui/sparkles-text';

function Sidebar() {
  const { userId } = useAuth();
  const { isLoadingUser, userInfo } = useUserContext();

  const filteredMenuItems = useMemo(() => {
    if (isLoadingUser) {
      // Nếu đang tải thông tin user, có thể hiện tất cả hoặc không hiện gì tùy UX
      return []; // Hoặc có thể trả về các mục không phải manage
    }
    if (userInfo?.role === 'ADMIN') {
      return menuItems; // Admin thấy tất cả
    }

    // Người dùng thường hoặc chưa đăng nhập chỉ thấy các mục không phải quản lý
    return menuItems.filter((item) => !item.isManageItem);
  }, [userInfo, isLoadingUser]);

  return (
    <div className="borderDarkMode bgDarkMode fixed inset-y-0 left-0 hidden w-[300px] flex-col border-r p-5 lg:flex">
      <Link
        className="mb-5 inline-flex items-center gap-2 self-start text-2xl font-bold"
        href="/"
      >
        <span
          className="flex size-10 items-center justify-center rounded-full bg-primary text-white"
          style={{ lineHeight: '1' }}
        >
          <span className="text-xl font-bold">U</span>
        </span>

        <SparklesText className="text-2xl">Ucademy</SparklesText>
      </Link>
      <ul className="flex flex-col gap-2">
        {filteredMenuItems.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            title={item.title}
            url={item.url}
          />
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-end gap-2">
        <ModeToggle />
        {userId ? (
          <UserButton />
        ) : (
          <Link
            className="flex size-10 items-center justify-center rounded-lg bg-primary p-1 text-white"
            href="/sign-in"
          >
            <IconUsers />
          </Link>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
