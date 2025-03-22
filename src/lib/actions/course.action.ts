'use server';
import { TCreateCourseParams, TUpdateCourseParams } from '@/components/types';
import Course, { ICourse } from '@/database/course.model';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '../mongoose';

// fetching
export async function getAllCourses(): Promise<ICourse[] | undefined> {
	try {
		connectToDatabase();
		const courses = await Course.find();
		return courses;
	} catch (error) {
		console.log(' error:', error);
	}
}

export async function getCourseBySlug({
	slug,
}: {
	slug: string;
}): Promise<ICourse | undefined> {
	// Thêm Promise<ICourse | undefined> viết code truyền sẽ có gợi ý.
	try {
		connectToDatabase();
		// Đây là đường dẫn không phải là đường dẫn ID
		//-> Nên ko thể dùng findById
		// Có thể dùng find: find tạo ra list document - và khớp với filter của cta
		// mà đang cần tìm một cái -> findOne
		// sau này chức năng tìm kiếm nhiều có filter, phân trang
		const findCourse = await Course.findOne({ slug });
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
		revalidatePath('/'); // refetch lại trang chủ
		return {
			success: true,
			message: 'Cập nhật khóa học thành công!',
		};
	} catch (error) {
		console.log(' error:', error);
	}
}
