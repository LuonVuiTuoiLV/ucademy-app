import { BadgeStatusVariant } from '@/shared/types';
import { cn } from '@/shared/utils';

interface BadgeStatusProps {
  title?: string;
  onClick?: () => void;
  variant?: BadgeStatusVariant;
  className?: string;
}

const BadgeStatus = ({
  className = '',
  onClick,
  title,
  variant = 'default',
}: BadgeStatusProps) => {
  const variantsClassNames: Record<BadgeStatusVariant, string> = {
    default: '',
    success: 'text-green-500',
    warning: 'text-orange-500',
    danger: 'text-red-500',
    admin: 'text-green-500',
    user: 'text-orange-500',
    expert: 'text-red-500',
    banned: 'text-red-500',
    green:
      'border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span
      className={cn(
        'whitespace-nowrap rounded-md border border-current bg-opacity-10 px-3 py-1 text-xs font-medium',
        variantsClassNames[variant],
        className,
      )}
      onClick={onClick}
    >
      {title}
    </span>
  );
};

export default BadgeStatus;
