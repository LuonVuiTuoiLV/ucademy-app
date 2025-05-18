import React from 'react';

import { cn } from '@/shared/utils';

import { AuroraText } from '../ui/aurora-text';

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
}
const Heading = ({ children, className = '' }: HeadingProps) => {
  return (
    <h1 className={cn('text-2xl font-bold lg:text-3xl', className)}>
      <AuroraText>{children}</AuroraText>
    </h1>
  );
};

export default Heading;
