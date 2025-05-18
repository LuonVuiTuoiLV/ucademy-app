import { BadgeStatusVariant } from '../types';
import { UserRole, UserStatus } from './enums';

export const userStatus: {
  title: string;
  value: UserStatus;
  className?: string;
  variant?: BadgeStatusVariant;
}[] = [
  {
    title: 'Đang hoạt động',
    value: UserStatus.ACTIVE,
    className: 'text-green-500 bg-green-500',
    variant: 'success',
  },
  {
    title: 'Dừng hoat động',
    value: UserStatus.UNACTIVE,
    className: 'text-orange-500 bg-orange-500',
    variant: 'warning',
  },
  {
    title: 'Chặn',
    value: UserStatus.BANNED,
    className: 'text-red-500 bg-red-500',
    variant: 'danger',
  },
];
export const userRole: {
  title: string;
  value: UserRole;
  className?: string;
  variant?: BadgeStatusVariant;
}[] = [
  {
    title: 'Admin',
    value: UserRole.ADMIN,
    className: 'text-green-500 bg-green-500',
    variant: 'admin',
  },
  {
    title: 'Người dùng',
    value: UserRole.USER,
    className: 'text-orange-500 bg-orange-500',
    variant: 'user',
  },
  {
    title: 'Chuyên gia',
    value: UserRole.EXPERT,
    className: 'text-red-500 bg-red-500',
    variant: 'expert',
  },
];
