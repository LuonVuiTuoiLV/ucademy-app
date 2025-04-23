'use client';
import { menuItems } from '@/constants';
import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ActiveLink, ModeToggle } from '../common';
import { IconUsers } from '../icons';
import { TMenuItem } from '../types';

const Sidebar = () => {
  const { userId } = useAuth();
  return (
    <div className="hidden lg:flex flex-col p-5 border-r borderDarkMode bgDarkMode fixed top-0 left-0 bottom-0 w-[300px]">
      <Link
        href="/ "
        className="font-bold text-3xl inline-flex items-baseline gap-0.5 mb-5 h-10 self-start pl-3"
      >
        <span className="text-primary">U</span>
        cademy
      </Link>
      <ul className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <MenuItem
            key={item.title}
            url={item.url}
            title={item.title}
            icon={item.icon}
          ></MenuItem>
        ))}
      </ul>
      <div className="flex items-center justify-end gap-5 mt-auto">
        <ModeToggle />
        {!userId ? (
          <Link
            href="/sign-in"
            className="size-10 rounded-lg bg-primary text-white flex items-center justify-center p-1"
          >
            <IconUsers></IconUsers>
          </Link>
        ) : (
          <UserButton></UserButton>
        )}
      </div>
    </div>
  );
};

export function MenuItem({ url = '/', title = '', icon, onlyIcon }: TMenuItem) {
  return (
    <li>
      <ActiveLink url={url}>
        {icon}
        {onlyIcon ? null : title}
      </ActiveLink>
    </li>
  );
}

export default Sidebar;
