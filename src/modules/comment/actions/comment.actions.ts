'use server';

import { FilterQuery } from 'mongoose';
import { revalidatePath } from 'next/cache';

import { CommentStatus } from '@/shared/constants';
import { connectToDatabase } from '@/shared/lib/mongoose';
import {
  CommentModel,
  CourseModel,
  LectureModel,
  LessonModel,
  UserModel,
} from '@/shared/schemas';
import {
  CommentItemData,
  CreateCommentParams,
  QueryFilter,
  QuerySortFilter,
  UpdateCommentParams,
} from '@/shared/types';

export async function createComment(
  params: CreateCommentParams,
): Promise<boolean | undefined> {
  try {
    connectToDatabase();
    const newComment = await CommentModel.create(params);

    revalidatePath(params.path || '/');
    if (!newComment) return false;

    return true;
  } catch (error) {
    console.log(error);
  }
}
export async function getCommentsByLesson(
  lessonId: string,
  sort: QuerySortFilter,
): Promise<CommentItemData[] | undefined> {
  try {
    connectToDatabase();
    const comments = await CommentModel.find<CommentItemData>({
      lesson: lessonId,
    })
      .sort({ created_at: sort === 'recent' ? -1 : 1 })
      .populate({
        path: 'user',
        model: UserModel,
        select: 'name avatar',
      });

    return JSON.parse(JSON.stringify(comments));
  } catch (error) {
    console.log(error);
  }
}
export async function fetchComments(
  params: QueryFilter,
): Promise<CommentItemData[] | undefined> {
  try {
    connectToDatabase();
    const { limit = 10, page = 1, search, status } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof CommentModel> = {};

    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }];
    }
    query.status = CommentStatus.APPROVED;
    if (status) {
      query.status = status;
    }
    const comments = await CommentModel.find(query)
      .populate({
        model: LessonModel,
        select: 'title lecture course slug',
        path: 'lesson',
        populate: [
          {
            path: 'lecture',
            model: LectureModel,
            select: 'title',
          },
          {
            path: 'course',
            model: CourseModel,
            select: 'slug',
          },
        ],
      })
      .populate({
        model: UserModel,
        select: 'name',
        path: 'user',
      })
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    return JSON.parse(JSON.stringify(comments));
  } catch (error) {
    console.log(error);
  }
}

export async function updateCommentStatus(params: UpdateCommentParams) {
  try {
    await connectToDatabase();

    const { commentId, path, updateData } = params;

    const originalComment = await CommentModel.findById(commentId)
      .populate<{ lesson: { _id: string; course: { _id: string } } }>({
        path: 'lesson',
        select: 'course', // Chỉ cần trường course từ lesson
        populate: {
          path: 'course',
          model: CourseModel,
          select: '_id', // Chỉ cần _id của course
        },
      })
      .populate<{ user: { _id: string } }>({
        path: 'user',
        model: UserModel,
        select: '_id', // Chỉ cần _id của user
      });

    if (!originalComment) {
      return { success: false, message: 'Không tìm thấy bình luận!' };
    }

    if (
      originalComment.status === CommentStatus.REJECTED &&
      updateData.status !== CommentStatus.PENDING
    ) {
      return {
        success: false,
        message: 'Không thể thay đổi trạng thái của bình luận đã từ chối.',
      };
    }

    const updatedComment = await CommentModel.findByIdAndUpdate(
      commentId,
      { status: updateData.status, _destroy: updateData._destroy },
      { new: true },
    );

    if (!updatedComment) {
      return { success: false, message: 'Cập nhật bình luận thất bại!' };
    }

    revalidatePath(path || '/manage/comment');

    return {
      success: true,
      message: 'Cập nhật trạng thái bình luận thành công!',
    };
  } catch (error) {
    console.error('Error updating comment status:', error);

    return { success: false, message: 'Có lỗi máy chủ xảy ra.' };
  }
}
