import { LectureItemData } from './lecture.type';
import {
  CouponModelProps,
  CourseModelProps,
  RatingModelProps,
  UserModelProps,
} from './models';

export interface RatingItemData
  extends Omit<RatingModelProps, 'course' | 'user'> {
  course: CourseItemData;
  user: UserItemData;
}

export interface CourseItemData
  extends Omit<CourseModelProps, 'lectures' | 'rating'> {
  lectures: LectureItemData[];
  rating: RatingItemData[];
}
export interface CouponItemData extends Omit<CouponModelProps, 'courses'> {
  courses: CourseItemData[];
}
export interface UserItemData extends Omit<UserModelProps, 'courses'> {
  courses: CourseItemData[];
  banned?: string;
}
