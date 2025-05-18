import { BadgeStatusVariant } from '../types';
import { CommentStatus } from './enums';

export const commentStatus: {
  title: string;
  value: CommentStatus;
  className?: string;
  variant?: BadgeStatusVariant;
}[] = [
  {
    title: 'Đã duyệt',
    value: CommentStatus.APPROVED,
    className: 'text-green-500 bg-green-500',
    variant: 'success',
  },
  {
    title: 'Chờ duyệt',
    value: CommentStatus.PENDING,
    className: 'text-orange-500 bg-orange-500',
    variant: 'warning',
  },
  {
    title: 'Từ chối',
    value: CommentStatus.REJECTED,
    className: 'text-red-500 bg-red-500',
    variant: 'danger',
  },
];
