'use client';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/shared/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300',
  {
    variants: {
      variant: {
        default:
          'bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
        destructive:
          'bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90',
        outline: 'borderDarkMode bgDarkMode border',
        secondary:
          'whitespace-nowrap ring-offset-white transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 py-2 h-12 rounded-lg px-5 flex items-center justify-center bg-gradient-to-r from-[#cbabff] to-[#ff979a] text-white font-bold shadow-[0_0_1px_3px_rgb(203,_171,_255,0.2)] text-base w-full',
        ghost:
          'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        link: 'text-slate-900 underline-offset-4 hover:underline dark:text-slate-50',
        primary: 'button-primary bg-primary text-white',
        secondaryBtn: ' bg-primary text-white',
      },
      size: {
        default: 'h-12 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      isLoading,
      size,
      variant,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const child = isLoading ? (
      <div className="size-5 animate-spin rounded-full border-2 border-white border-y-transparent" />
    ) : (
      children
    );

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading}
        {...props}
      >
        {child}
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
