'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TActiveLinkProps } from '../types';

const ActiveLink = ({ url, children }: TActiveLinkProps) => {
	const pathname = usePathname();
	const isActive = url === pathname;

	return (
		<Link
			href={url}
			className={`flex items-center gap-3 p-3 transition-all text-base rounded-md dark:text-grayDark font-medium ${
				isActive
					? '!text-primary bg-primary bg-opacity-10 svg-animate font-semibold'
					: 'hover:!text-primary hover:!bg-primary hover:!bg-opacity-10'
			}`}
		>
			{children}
		</Link>
	);
};

export default ActiveLink;
