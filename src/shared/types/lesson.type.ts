import { LessonModelProps } from './models';

export interface LessonItemData
  extends Omit<LessonModelProps, 'course' | 'lecture'> {
  course: string;
  lecture: string;
}
export type CreateLessonParams = {
  lecture: string;
  course: string;
  title?: string;
  order?: number;
  path?: string;
  slug?: string;
};
export type UpdateLessonParams = {
  lessonId: string;
  updateData: {
    title?: string;
    slug?: string;
    duration?: number;
    video_url?: string;
    content?: string;
    _destroy?: boolean;
  };
  path?: string;
};
