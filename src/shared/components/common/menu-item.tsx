import React from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import ActiveLink from './active-link';

interface MenuItemProps {
  url: string;
  title: string;
  icon: React.ReactNode;
  onlyIcon?: boolean;
  isNew?: boolean;
  isHot?: boolean;
}

const MenuItem = ({
  icon,
  onlyIcon,
  title = '',
  url = '/',
  isNew,
  isHot,
}: MenuItemProps) => {
  if (onlyIcon) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {
            <li>
              <ActiveLink
                url={url}
                checkNew={isNew}
                checkHot={isHot}
                onlyIcon
              >
                {icon}
                {onlyIcon ? null : title}
              </ActiveLink>
            </li>
          }
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="mb-2"
        >
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{title}</p>
            {isNew && (
              <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-xs text-white">
                New
              </span>
            )}
            {isHot && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                Hot
              </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <li>
      <ActiveLink
        url={url}
        checkNew={isNew}
        checkHot={isHot}
      >
        {icon}
        {onlyIcon ? null : title}
      </ActiveLink>
    </li>
  );
};

export default MenuItem;
