'use server';

import { TCouponParams, TCreateOrderParams } from '@/components/types';
import { EOrderStatus } from '@/components/types/enums';
import Coupon from '@/database/coupon.model';
import Course from '@/database/course.model';
import Order from '@/database/order.model';
import User from '@/database/user.model';
import mongoose, { FilterQuery } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '../mongoose';

interface OrderLean {
  _id: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: EOrderStatus;
}

export async function fetchOrders(params: any) {
  try {
    connectToDatabase();
    const { page = 1, limit = 10, search, status } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof Order> = {};
    if (search) {
      query.$or = [{ code: { $regex: search, $options: 'i' } }];
    }
    if (status) {
      query.status = status;
    }
    const orders = await Order.find(query)
      .populate({
        model: Course,
        select: 'title',
        path: 'course',
      })
      .populate({
        model: User,
        select: 'name',
        path: 'user',
      })
      .populate({
        model: Coupon,
        path: 'coupon',
        select: 'code',
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.log('🚀 ~ fetchOrders ~ error:', error);
  }
}
export async function createOrder(params: TCreateOrderParams) {
  try {
    connectToDatabase();
    const findOrder = await Order.findOne({
      course: params.course,
      user: params.user,
    });

    if (findOrder) {
      const order = JSON.parse(JSON.stringify(findOrder));
      if (order?.status == EOrderStatus.PENDING) {
        // Trả về thông tin lỗi cùng với mã đơn hàng
        return {
          error: true,
          message: 'Đơn hàng đã tồn tại',
          code: order.code,
        };
      }
    }
    const orderParams = { ...params };
    if (orderParams.coupon === '' || !orderParams.coupon) {
      delete orderParams.coupon;
    }

    const newOrder = await Order.create(orderParams);

    if (params.coupon && params.coupon !== '') {
      await Coupon.findByIdAndUpdate(params.coupon, {
        $inc: { used: 1 },
      });
    }
    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    console.log('🚀 ~ createOrder ~ error:', error);
  }
}
export async function updateOrder({
  orderId,
  status,
}: {
  orderId: string;
  status: EOrderStatus;
}) {
  try {
    await connectToDatabase();

    // Tìm order, chỉ lấy course._id và user._id, không cần populate toàn bộ object
    const findOrder = await Order.findById(orderId)
      .select('course user status')
      .lean<OrderLean>(); // Sử dụng .lean() để lấy plain object, cải thiện hiệu suất
    if (!findOrder) return;
    if (findOrder.status === EOrderStatus.CANCELED) return;

    // Cập nhật status của order
    await Order.findByIdAndUpdate(orderId, { status });

    // Nếu order chuyển từ PENDING sang COMPLETED, thêm course vào user.courses
    if (
      status === EOrderStatus.COMPLETED &&
      findOrder.status === EOrderStatus.PENDING
    ) {
      const courseId = findOrder.course;

      // Cập nhật mảng courses của user bằng $push
      await User.findByIdAndUpdate(
        findOrder.user,
        {
          $addToSet: { courses: courseId }, // Sử dụng $addToSet để tránh trùng lặp
        },
        { new: true } // Trả về document sau khi cập nhật
      );
    }

    // Nếu order chuyển từ COMPLETED sang CANCELED, xóa course khỏi user.courses
    if (
      status === EOrderStatus.CANCELED &&
      findOrder.status === EOrderStatus.COMPLETED
    ) {
      const courseId = findOrder.course;

      await User.findByIdAndUpdate(
        findOrder.user,
        {
          $pull: { courses: courseId }, // Sử dụng $pull để xóa course khỏi mảng
        },
        { new: true } // Trả về document sau khi cập nhật
      );
    }
    // Revalidate cache để làm mới dữ liệu
    revalidatePath('/manage/order');
  } catch (error) {
    return { success: false, message: 'Error updating order', error };
  }
}
export async function getOrderDetails({ code }: { code: string }) {
  try {
    connectToDatabase();
    const order = await Order.findOne({
      code,
    }).populate({
      path: 'course',
      select: 'title',
    });
    return JSON.parse(JSON.stringify(order));
  } catch (error) {}
}

export async function getValidateOrder(
  params: any
): Promise<TCouponParams | undefined> {
  try {
    connectToDatabase();
    const findCoupon = await Order.findOne({
      course: params.courseId,
    }).populate({
      path: 'course',
      select: '_id',
    });
    const order = JSON.parse(JSON.stringify(findCoupon));
    const orderCourses = order?.course.map((course: any) => course._id);
    console.log(' orderCourses:', orderCourses);
    let iSActive = true;
    if (!orderCourses.includes(params.courseId)) iSActive = false;
    if (order?.status == EOrderStatus.PENDING) iSActive = false;

    return iSActive ? order : undefined;
  } catch (error) {
    console.log(' error:', error);
  }
}
