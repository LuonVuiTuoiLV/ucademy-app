'use client';
import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useMemo } from 'react';

import { menuItems } from '@/shared/constants';
import { useUserContext } from '@/shared/contexts';

import { cn } from '@/shared/utils';
import { ChevronRight } from 'lucide-react';
import { MenuItem, ModeToggle } from '../common';
import { AnimatedGradientText } from '../ui';
import { SparklesText } from '../ui/sparkles-text';

function Sidebar() {
  const { userId } = useAuth();
  const { isLoadingUser, userInfo } = useUserContext();

  const filteredMenuItems = useMemo(() => {
    if (isLoadingUser) {
      return [];
    }
    if (userInfo?.role === 'ADMIN') {
      return menuItems;
    }

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
            isNew={item?.isNew}
            isHot={item?.isHot}
          />
        ))}
      </ul>
      <div className="ml-auto mt-auto flex items-center justify-end gap-2">
        <ModeToggle />
        {userId ? (
          <UserButton />
        ) : (
          <Link
            href="/sign-in"
            className="group relative ml-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]"
          >
            <span
              className={cn(
                'animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]',
              )}
              style={{
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'destination-out',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'subtract',
                WebkitClipPath: 'padding-box',
              }}
            />
            🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
            <AnimatedGradientText className="text-sm font-medium">
              Đăng nhập
            </AnimatedGradientText>
            <ChevronRight className="ml-1 size-4 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
