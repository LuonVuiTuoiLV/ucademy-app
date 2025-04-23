import { ICoupon } from '@/database/coupon.model';
import { ICourse } from '@/database/course.model';
import { ILesson } from '@/database/lesson.model';
import { ECouponType } from './enums';

export type TActiveLinkProps = {
  url: string;
  children: React.ReactNode;
};

export type TMenuItem = {
  url: string;
  title: string;
  icon?: React.ReactNode;
  onlyIcon?: boolean;
};

// User
export type TCreateUserParams = {
  clerkId: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
};
// Course
export type TCreateCourseParams = {
  title: string;
  slug: string;
  author: string;
};
export type TUpdateCourseParams = {
  slug: string;
  updateDate: Partial<ICourse>;
  path?: string;
};

export type TUpdateCourseLecture = {
  _id: string;
  title: string;
  lessons: ILesson[];
};
export interface TCourseUpdateParams extends Omit<ICourse, 'lectures'> {
  lectures: TUpdateCourseLecture[];
}

export type TGetAllCourseParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

// Lecture
export type TCreateLectureParams = {
  course: string;
  title?: string;
  order?: number;
  path?: string;
};
export type TUpdateLectureParams = {
  lectureId: string;
  updateData: {
    title?: string;
    order?: number;
    _destroy?: boolean;
    path?: string;
  };
};
// Lesson
export type TCreateLessonParams = {
  lecture: string;
  course: string;
  title?: string;
  order?: number;
  path?: string;
  slug?: string;
};
export type TUpdateLessonParams = {
  lessonId: string;
  updateDate: {
    title?: string;
    slug?: string;
    duration?: number;
    video_url?: string;
    content?: string;
  };
  path?: string;
};
//History
export type TCreateHistoryParams = {
  course: string;
  lesson: string;
  checked: boolean | string;
  path: string;
};
//Order
export type TCreateOrderParams = {
  code: string;
  course: string;
  user: string;
  total?: number;
  amount?: number;
  discount?: number;
  coupon?: string;
};
//Coupon

export type TCreateCouponParams = {
  title: string;
  code: string;
  type: ECouponType;
  value?: number;
  start_date?: Date;
  end_date?: Date;
  active?: boolean;
  limit?: number;
  courses?: string[];
};
export type TUpdateCouponParams = {
  _id: string;
  updateData: Partial<TCreateCouponParams>;
};
export type TCouponParams = Omit<ICoupon, 'courses'> & {
  courses: {
    _id: string;
    title: string;
  }[];
};
//  Khi code ko có dạng d.ts - viết những type - khi built ra production - nó sẽ built tất cả code cta thành typescript - bởi vì typescript sẽ ko chạy đc trong môi trg trình duyệt - sẽ convert sang js - thì những type sẽ convert - nhưng cta ko muốn - bởi vì những type convert qa ko có tác dụng
// Bời vậy khi dùng d.ts -> chỉ có mục đích là share thôi - trong môi trg development - khi cta built sẽ ko dịch sang js
