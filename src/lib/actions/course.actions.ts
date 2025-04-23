'use server';
import {
  TCourseUpdateParams,
  TCreateCourseParams,
  TGetAllCourseParams,
  TUpdateCourseParams,
} from '@/components/types';
import { ECourseStatus } from '@/components/types/enums';
import Course, { ICourse } from '@/database/course.model';
import Lecture from '@/database/lecture.model';
import Lesson from '@/database/lesson.model';
import { FilterQuery } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '../mongoose';

// fetching
export async function getAllCourses(
  params: TGetAllCourseParams
): Promise<ICourse[] | undefined> {
  try {
    connectToDatabase();
    const { page = 1, limit = 10, search, status } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof Course> = {};
    //$regex: search -> tương ứng giá trị gõ vào, $options: 'i' -> ko phân biệt hoa thường
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }];
    }
    const courses = await Course.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });
    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.log(' error:', error);
  }
}
export async function getAllCoursesPublic(
  params: TGetAllCourseParams
): Promise<ICourse[] | undefined> {
  try {
    connectToDatabase();
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof Course> = {};
    //$regex: search -> tương ứng giá trị gõ vào, $options: 'i' -> ko phân biệt hoa thường
    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }];
    }

    query.status = ECourseStatus.APPROVED;

    const courses = await Course.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });
    return courses;
  } catch (error) {
    console.log(' error:', error);
  }
}

export async function getCourseBySlug({
  slug,
}: {
  slug: string;
}): Promise<TCourseUpdateParams | undefined> {
  // Thêm Promise<ICourse | undefined> viết code truyền sẽ có gợi ý.
  try {
    connectToDatabase();
    // Đây là đường dẫn không phải là đường dẫn ID
    //-> Nên ko thể dùng findById
    // Có thể dùng find: find tạo ra list document - và khớp với filter của cta
    // mà đang cần tìm một cái -> findOne
    // sau này chức năng tìm kiếm nhiều có filter, phân trang
    const findCourse = await Course.findOne({ slug }).populate({
      path: 'lectures',
      model: Lecture,
      select: '_id title',
      match: {
        _destroy: false,
      },
      populate: {
        path: 'lessons',
        model: Lesson,
        match: {
          _destroy: false,
        },
      },
    });
    return findCourse;
  } catch (error) {
    console.log(' error:', error);
  }
}

// CRUD
export async function createCourse(params: TCreateCourseParams) {
  try {
    connectToDatabase();
    const existCourse = await Course.findOne({ slug: params.slug });
    if (existCourse) {
      return {
        success: false,
        message: 'Đường dẫn khóa học đã tồn tại!',
      };
    }
    const course = await Course.create(params);
    return {
      success: true,
      data: JSON.parse(JSON.stringify(course)),
    };
  } catch (error) {
    console.log(' error:', error);
  }
}

export async function updateCourse(params: TUpdateCourseParams) {
  try {
    connectToDatabase();
    const findCourse = await Course.findOne({ slug: params.slug });
    if (!findCourse) return;
    await Course.findOneAndUpdate({ slug: params.slug }, params.updateDate, {
      new: true, // new: true - Trả về bảng cập nhật mới nhất
    });
    revalidatePath(params.path || '/'); // refetch lại trang
    return {
      success: true,
      message: 'Cập nhật khóa học thành công!',
    };
  } catch (error) {
    console.log(' error:', error);
  }
}
