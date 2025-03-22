import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					'flex outline-none h-10 rounded-md px-3 w-full text-sm border border-gray-200 focus:!border-primary transition-all dark:border-opacity-10 bg-white dark:bg-grayDarker font-medium',
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Input.displayName = 'Input';

export { Input };
