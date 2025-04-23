import {
  IconComment,
  IconCoupon,
  IconExplore,
  IconOrder,
  IconPlay,
  IconStudy,
  IconUsers,
} from '@/components/icons';
import { TMenuItem } from '@/components/types';
import {
  ECouponType,
  ECourseLevel,
  ECourseStatus,
  EOrderStatus,
} from '@/components/types/enums';
import { z } from 'zod';

export const menuItems: TMenuItem[] = [
  {
    url: '/',
    title: 'Khám phá',
    icon: <IconPlay className="size-5" />,
  },
  {
    url: '/study',
    title: 'Khu vực học tập',
    icon: <IconStudy className="size-5" />,
  },
  {
    url: '/manage/course',
    title: 'Quản lý khóa học',
    icon: <IconExplore className="size-5" />,
  },
  {
    url: '/manage/member',
    title: 'Quản lý thành viên',
    icon: <IconUsers className="size-5" />,
  },
  {
    url: '/manage/order',
    title: 'Quản lý đơn hàng',
    icon: <IconOrder className="size-5" />,
  },
  {
    url: '/manage/coupon',
    title: 'Quản lý coupon',
    icon: <IconCoupon className="size-5" />,
  },
  {
    url: '/manage/comment',
    title: 'Quản lý bình luận',
    icon: <IconComment className="size-5" />,
  },
];

export const courseStatus: {
  title: string;
  value: ECourseStatus;
  className?: string;
}[] = [
  {
    title: 'Đã duyệt',
    value: ECourseStatus.APPROVED,
    className: 'text-green-500 bg-green-500',
  },
  {
    title: 'Chờ duyệt',
    value: ECourseStatus.PENDING,
    className: 'text-orange-500 bg-orange-500',
  },
  {
    title: 'Từ chối',
    value: ECourseStatus.REJECTED,
    className: 'text-red-500 bg-red-500',
  },
];

export const courseLevel: {
  title: string;
  value: ECourseLevel;
}[] = [
  {
    title: 'Dễ',
    value: ECourseLevel.BEGINNER,
  },
  {
    title: 'Trung bình',
    value: ECourseLevel.INTERMEDIATE,
  },
  {
    title: 'Khó',
    value: ECourseLevel.ADVANCED,
  },
];
export const courseLevelTitle: Record<ECourseLevel, string> = {
  [ECourseLevel.BEGINNER]: 'Dễ',
  [ECourseLevel.INTERMEDIATE]: 'Trung bình',
  [ECourseLevel.ADVANCED]: 'Khó',
};
export const commonClassNames = {
  status:
    'border border-current rounded-md font-medium px-3 py-1 text-xs bg-opacity-10 whitespace-nowrap',
  action:
    'flex rounded-md size-8 border items-center justify-center p-2 text-gray-500 hover:border-opacity-60  dark:hover:text-white dark:bg-transparent borderDarkMode dark:hover:border-opacity-20',
  paginationButton:
    'size-10 rounded-md borderDarkMode bgDarkMode border flex items-center justify-center hover:border-primary hover:text-primary transition-all p-2.5',
  btnPrimary:
    'flex items-center justify-center w-full h-12 mt-10 font-bold text-white rounded-lg bg-primary button-primary',
};

export const editorOptions = (field: any, theme: any) => ({
  initialValue: '',
  onBlur: field.onBlur,
  onEditorChange: (content: any) => field.onChange(content),
  init: {
    codesample_global_prismjs: true,
    skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
    height: 300,
    menubar: false,
    plugins: [
      // Core editing features
      'anchor',
      'autolink',
      'charmap',
      'codesample',
      'emoticons',
      'image',
      'link',
      'lists',
      'media',
      'searchreplace',
      'table',
      'visualblocks',
      'wordcount',
      // Your account includes a free trial of TinyMCE premium features
      // Try the most popular premium features until Apr 18, 2025:
      'checklist',
      'mediaembed',
      'casechange',
      'formatpainter',
      'pageembed',
      'a11ychecker',
      'tinymcespellchecker',
      'permanentpen',
      'powerpaste',
      'advtable',
      'advcode',
      'editimage',
      'advtemplate',
      'ai',
      'mentions',
      'tinycomments',
      'tableofcontents',
      'footnotes',
      'mergetags',
      'autocorrect',
      'typography',
      'inlinecss',
      'markdown',
      'importword',
      'exportword',
      'exportpdf',
    ],
    toolbar:
      'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    content_style:
      "@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap');body { font-family: Manrope,Helvetica,Arial,sans-serif; font-size:14px; line-height: 2; padding-bottom: 32px; } img { max-width: 100%; height: auto; display: block; margin: 0 auto; };",
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Author name',
    mergetags_list: [
      { value: 'First.Name', title: 'First Name' },
      { value: 'Email', title: 'Email' },
    ],
    ai_request: (request, respondWith) =>
      respondWith.string(() =>
        Promise.reject('See docs to implement AI Assistant')
      ),
  },
});

export const lastLessonKey = 'lastLesson';

export const orderStatus: {
  title: string;
  value: EOrderStatus;
  className?: string;
}[] = [
  {
    title: 'Đã duyệt',
    value: EOrderStatus.COMPLETED,
    className: 'text-green-500 bg-green-500',
  },
  {
    title: 'Chờ duyệt',
    value: EOrderStatus.PENDING,
    className: 'text-orange-500 bg-orange-500',
  },
  {
    title: 'Đã hủy',
    value: EOrderStatus.CANCELED,
    className: 'text-red-500 bg-red-500',
  },
];
export const couponTypes: {
  title: string;
  value: ECouponType;
}[] = [
  {
    title: 'Phần trăm',
    value: ECouponType.PERCENT,
  },
  {
    title: 'Giá trị',
    value: ECouponType.AMOUNT,
  },
];
export const couponFormSchema = z.object({
  title: z.string({ message: 'Tiêu đề không được để trống' }),
  code: z
    .string({ message: 'Mã giảm giá không được để trống' })
    .min(3, 'Mã giảm giá có ít nhất 3 ký tự')
    .max(10, 'Mã giảm giá không được quá 10 ký tự'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  active: z.boolean().optional(),
  value: z.string().optional(),
  type: z.enum([ECouponType.AMOUNT, ECouponType.PERCENT]),
  courses: z.array(z.string()).optional(),
  limit: z.number().optional(),
});
