import { cn } from '@/lib/utils';
import React from 'react';

const Heading = ({
	children,
	className = '',
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		// Để merge class ta dùng thư viện cn
		<div className={cn('font-bold text-2xl lg:text-3xl', className)}>
			{children}
		</div>
	);
};

export default Heading;
