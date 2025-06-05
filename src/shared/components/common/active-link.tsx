'use client';
import { cn } from '@/shared/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ActiveLinkProps {
  url: string;
  children: React.ReactNode;
  checkNew?: boolean;
  checkHot?: boolean;
  onlyIcon?: boolean;
}
const ActiveLink = ({
  children,
  url,
  checkNew,
  checkHot,
  onlyIcon,
}: ActiveLinkProps) => {
  const pathname = usePathname();
  const isActive = url === pathname;

  return (
    <Link
      href={url}
      className={cn(
        'flex items-center gap-3 rounded-md p-3 text-base font-medium text-slate-600 transition-all dark:text-grayDark',
        isActive && 'svg-animate bg-primary/10 font-semibold !text-primary',
        onlyIcon ? 'hover:!bg-primary/10 hover:!text-primary' : '',
      )}
    >
      {children}
      {!onlyIcon && (
        <>
          {checkNew && (
            <span className="ml-auto inline-flex w-11 justify-center rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
              New
            </span>
          )}
          {checkHot && (
            <span className="ml-auto inline-flex w-11 justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              Hot
            </span>
          )}
        </>
      )}
    </Link>
  );
};

export default ActiveLink;
