import {
  IconBlink,
  IconBuilding,
  IconComment,
  IconCoupon,
  IconExplore,
  IconMoney,
  IconOrder,
  IconPlay,
  IconStar,
  IconStudy,
  IconUser,
  IconUsers,
} from '../components/icons';
import { MenuField } from '../types';

export const menuItems: MenuField[] = [
  {
    url: '/dashboard',
    title: 'Dashboard',
    icon: <IconBuilding className="size-5" />,
    isManageItem: true,
  },
  {
    url: '/explore',
    title: 'Khám phá',
    icon: <IconPlay className="size-5" />,
  },
  {
    url: '/study',
    title: 'Khu vực học tập',
    icon: <IconStudy className="size-5" />,
  },
  {
    url: '/coupon',
    title: 'Săn mã giảm giá',
    icon: <IconMoney className="size-5" />,
    isNew: true,
  },
  {
    url: '/coming-soon',
    title: 'Sắp ra mắt',
    icon: <IconBlink className="size-5" />,
    isHot: true,
  },
  {
    url: '/user',
    title: 'Thông tin cá nhân',
    icon: <IconUser className="size-5" />,
  },
  {
    url: '/manage/course',
    title: 'Quản lý khóa học',
    icon: <IconExplore className="size-5" />,
    isManageItem: true,
  },
  {
    url: '/manage/member',
    title: 'Quản lý thành viên',
    icon: <IconUsers className="size-5" />,
    isManageItem: true,
  },
  {
    url: '/manage/order',
    title: 'Quản lý đơn hàng',
    icon: <IconOrder className="size-5" />,
    isManageItem: true,
  },
  {
    url: '/manage/coupon',
    title: 'Quản lý coupon',
    icon: <IconCoupon className="size-5" />,
    isManageItem: true,
  },
  {
    url: '/manage/rating',
    title: 'Quản lý đánh giá',
    icon: <IconStar className="size-5" />,
    isManageItem: true,
  },
  {
    url: '/manage/comment',
    title: 'Quản lý bình luận',
    icon: <IconComment className="size-5" />,
    isManageItem: true,
  },
];
