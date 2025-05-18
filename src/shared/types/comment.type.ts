import { CommentStatus } from '../constants';
import { CommentModelProps } from './models';

export interface CreateCommentParams {
  content: string;
  lesson: string;
  user: string;
  level: number;
  parentId?: string;
  path?: string;
}
interface PopulatedLectureForComment {
  title: string; // Từ select: 'title' trong populate lecture
}

interface PopulatedCourseForComment {
  slug: string; // Từ select: 'slug' trong populate course
}

interface PopulatedLessonForComment {
  _id: string; // Sau stringify, ObjectId thường thành string
  title: string; // Từ select: 'title...' trong populate lesson
  slug: string; // Từ select: '...slug' trong populate lesson (nếu LessonModel có)
  lecture: PopulatedLectureForComment; // Đối tượng lecture đã populate
  course: PopulatedCourseForComment; // Đối tượng course đã populate
}

interface PopulatedUserForComment {
  name: string;
}

export interface CommentItemData {
  _id: string;
  content: string;
  status: CommentStatus;
  lesson: PopulatedLessonForComment; // Sử dụng kiểu lesson đã populate
  user: PopulatedUserForComment; // Sử dụng kiểu user đã populate
  created_at: string; // Date thường thành string sau stringify
  parentId?: string; // ObjectId cũng thành string
  level?: number; // Giữ lại nếu có trong CommentModelProps gốc và cần dùng
  _destroy?: boolean; // Giữ lại nếu có trong CommentModelProps gốc và cần dùng
}
export type UpdateCommentParams = {
  commentId: string;
  updateData: Partial<CommentModelProps>;
  path?: string;
};
