import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				'flex outline-none h-10 rounded-md p-3 w-full text-sm border border-gray-200 focus:!border-primary transition-all dark:border-opacity-10 bg-white dark:bg-grayDarker font-medium min-h-20 resize-none',
				className
			)}
			ref={ref}
			{...props}
		/>
	);
});
Textarea.displayName = 'Textarea';

export { Textarea };
