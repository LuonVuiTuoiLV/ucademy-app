import React from 'react';

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
