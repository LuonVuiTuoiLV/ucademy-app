'use server';

import { FilterQuery } from 'mongoose';
import { revalidatePath } from 'next/cache';

import {
  CourseStatus,
  ITEMS_PER_PAGES_ROOT,
  RatingStatus,
} from '@/shared/constants';
import { connectToDatabase } from '@/shared/lib/mongoose';
import {
  CourseModel,
  LectureModel,
  LessonModel,
  RatingModel,
  UserModel,
} from '@/shared/schemas';
import {
  CourseItemData,
  CourseLessonData,
  CreateCourseParams,
  QueryFilter,
  UpdateCourseParams,
} from '@/shared/types';

export async function fetchCourses(params: QueryFilter): Promise<
  | {
      courseList: CourseItemData[] | undefined;
      total: number;
    }
  | undefined
> {
  try {
    connectToDatabase();
    const {
      limit = ITEMS_PER_PAGES_ROOT,
      page = 1,
      search,
      status: statusParam,
      isFree,
    } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof CourseModel> = {};
    if (statusParam) {
      query.status = statusParam;
    } else {
      query.status = CourseStatus.APPROVED;
    }
    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }];
    }
    if (isFree === true) {
      query.is_free = true;
    } else if (isFree === false) {
      query.$or = [{ is_free: false }, { is_free: { $exists: false } }];
    }
    const courseList = await CourseModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .lean();

    const total = await CourseModel.countDocuments(query);

    return {
      courseList: JSON.parse(JSON.stringify(courseList)),
      total,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function fetchCoursesOfUser(
  userId: string,
): Promise<CourseItemData[] | undefined> {
  try {
    connectToDatabase();
    const findUser = await UserModel.findOne({ clerkId: userId }).populate({
      path: 'courses',
      model: CourseModel,
      match: {
        status: CourseStatus.APPROVED,
      },
      populate: {
        path: 'lectures',
        model: LectureModel,
        select: 'lessons',
        populate: {
          path: 'lessons',
          model: LessonModel,
          select: 'slug',
        },
      },
    });

    if (!findUser) return;
    const courses = JSON.parse(JSON.stringify(findUser.courses));

    return courses;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchCourseBySlug({
  slug,
}: {
  slug: string;
}): Promise<CourseItemData | undefined> {
  try {
    connectToDatabase();
    const findCourse = await CourseModel.findOne({ slug })
      .populate({
        path: 'lectures',
        model: LectureModel,
        select: '_id title',
        match: {
          _destroy: false,
        },
        populate: {
          path: 'lessons',
          model: LessonModel,
          match: {
            _destroy: false,
          },
          options: {
            sort: {
              order: 1,
            },
          },
        },
      })
      .populate({
        path: 'rating',
        model: RatingModel,
        match: {
          status: RatingStatus.ACTIVE,
        },
      })
      .lean();

    return JSON.parse(JSON.stringify(findCourse));
  } catch (error) {
    console.log(error);
  }
}
export async function getAllCoursesPublic(
  params: QueryFilter,
): Promise<CourseItemData[] | undefined> {
  try {
    connectToDatabase();
    const { limit = 10, page = 1, search } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof CourseModel> = {};

    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }];
    }
    query.status = CourseStatus.COMING_SOON;
    const courses = await CourseModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.log(error);
  }
}
export async function createCourse(params: CreateCourseParams) {
  try {
    connectToDatabase();
    const existCourse = await CourseModel.findOne({ slug: params.slug });

    if (existCourse) {
      return {
        success: false,
        message: 'Đường dẫn khóa học đã tồn tại!',
      };
    }
    const course = await CourseModel.create(params);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(course)),
    };
  } catch (error) {
    console.log(error);
  }
}
export async function updateCourse(params: UpdateCourseParams): Promise<{
  success: boolean;
  message?: string;
  data?: any; // Kiểu dữ liệu của updatedCourse
  error?: string;
}> {
  try {
    connectToDatabase(); // Đảm bảo hàm này await nếu nó là async
    const findCourse = await CourseModel.findOne({ slug: params.slug });

    if (!findCourse) {
      return { success: false, error: 'Khóa học không tồn tại.', data: null };
    }

    const updatedCourse = await CourseModel.findOneAndUpdate(
      { slug: params.slug },
      { $set: params.updateData },
      { new: true },
    );

    if (!updatedCourse) {
      return {
        success: false,
        error: 'Cập nhật khóa học thất bại.',
        data: null,
      };
    }

    revalidatePath(params.path || '/');
    return {
      success: true,
      message: 'Cập nhật khóa học thành công!',
      data: JSON.parse(JSON.stringify(updatedCourse)),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Lỗi server khi cập nhật khóa học.',
      data: null,
    };
  }
}
export async function updateCourseView({ slug }: { slug: string }) {
  try {
    connectToDatabase();
    await CourseModel.findOneAndUpdate(
      { slug },
      {
        $inc: { views: 1 },
      },
    );
  } catch (error) {
    console.log(error);
  }
}
export async function getCourseLessonsInfo({
  slug,
}: {
  slug: string;
}): Promise<CourseLessonData | undefined> {
  try {
    connectToDatabase();
    const course: CourseItemData = await CourseModel.findOne({ slug })
      .select('lectures')
      .populate({
        model: LectureModel,
        path: 'lectures',
        select: 'lessons',
        populate: {
          model: LessonModel,
          path: 'lessons',
          select: 'duration',
        },
      });
    const lessons =
      course?.lectures.flatMap((lecture) => lecture.lessons) || [];
    const duration =
      lessons.reduce(
        (accumulator: number, current) => accumulator + current.duration,
        0,
      ) || 0;

    return {
      duration,
      lessons: lessons.length,
    };
  } catch (error) {
    console.log(error);
  }
}
