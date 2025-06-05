'use server';
import { FilterQuery } from 'mongoose';
import { revalidatePath } from 'next/cache';

import { createNotification } from '@/modules/notification/actions';
import { OrderStatus } from '@/shared/constants';
import { connectToDatabase } from '@/shared/lib/mongoose';
import {
  CouponModel,
  CourseModel,
  OrderModel,
  UserModel,
} from '@/shared/schemas';
import { NotificationType, QueryFilter } from '@/shared/types';
import {
  CreateOrderParams,
  OrderItemData,
  UpdateOrderParams,
} from '@/shared/types/order.type';
import { UserItemData } from '@/shared/types/user.type';

interface FetchOrdersResponse {
  total: number;
  orders: OrderItemData[];
}
export async function fetchOrders(
  params: QueryFilter,
): Promise<FetchOrdersResponse | undefined> {
  try {
    connectToDatabase();
    const { limit = 10, page = 1, search, status } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof CourseModel> = {};

    if (search) {
      query.$or = [{ code: { $regex: search, $options: 'i' } }];
    }
    if (status) {
      query.status = status;
    }
    const orders = await OrderModel.find(query)
      .populate({
        model: CourseModel,
        select: 'title',
        path: 'course',
      })
      .populate({
        path: 'user',
        model: UserModel,
        select: 'name',
      })
      .populate({
        path: 'coupon',
        model: CouponModel,
        select: 'code',
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    const total = await OrderModel.countDocuments(query);

    return {
      orders: JSON.parse(JSON.stringify(orders)),
      total,
    };
  } catch (error) {
    console.log(error);
  }
}
export async function createOrder(params: CreateOrderParams) {
  try {
    connectToDatabase();

    const { user: userId, course: courseId, status: requestedStatus } = params;

    if (requestedStatus !== OrderStatus.COMPLETED) {
      const existingOrder = (await OrderModel.findOne({
        user: userId,
        course: courseId,
        status: { $ne: OrderStatus.CANCELED },
      }).lean()) as { user?: string; status?: OrderStatus } | null;

      if (existingOrder) {
        let message = 'Bạn đã đặt mua khóa học này rồi.';
        if (existingOrder.status === OrderStatus.PENDING) {
          message =
            'Đơn hàng cho khóa học này của bạn đang chờ xử lý. Vui lòng kiểm tra trong mục "Đơn hàng của tôi".';
        } else if (existingOrder.status === OrderStatus.COMPLETED) {
          message = 'Bạn đã sở hữu khóa học này. Hãy vào khu vực học tập!';
        }
        return {
          success: false,
          error: message,
          message: message,
        };
      }
    }

    if (!params.coupon || params.coupon.trim() === '') {
      delete params.coupon;
    }

    const orderDataToCreate = {
      ...params,
      status: requestedStatus || OrderStatus.PENDING,
    };

    const newOrderDoc = await OrderModel.create(orderDataToCreate);

    if (!newOrderDoc) {
      return {
        success: false,
        error: 'Không thể tạo đơn hàng. Vui lòng thử lại.',
      };
    }
    const newOrder = JSON.parse(JSON.stringify(newOrderDoc));

    if (params.coupon) {
      await CouponModel.findByIdAndUpdate(params.coupon, {
        $inc: { used: 1 },
      });
    }
    if (newOrder.status === OrderStatus.COMPLETED) {
      // Logic ghi danh và gửi thông báo cho khóa học miễn phí (như đã có)
      const userToUpdate = await UserModel.findById(userId);
      const courseDetailsForNotif = (await CourseModel.findById(courseId)
        .select('title slug')
        .lean()) as { title?: string; slug?: string } | null;

      if (userToUpdate && courseDetailsForNotif) {
        if (
          !userToUpdate.courses
            .map((c: { toString: () => any }) => c.toString())
            .includes(courseId)
        ) {
          userToUpdate.courses.push(courseId as any);
          await userToUpdate.save();
          revalidatePath('/study');

          if (courseDetailsForNotif.title && courseDetailsForNotif.slug) {
            await createNotification({
              recipientId: userId,
              type: NotificationType.COURSE_ENROLLMENT_COMPLETED,
              message: `Chúc mừng! Bạn đã ghi danh thành công khóa học "${courseDetailsForNotif.title}". Hãy bắt đầu học ngay!`,
              link: `/study`,
              senderId: 'SYSTEM',
            });
          }
        }
      }
    } else if (newOrder.status === OrderStatus.PENDING) {
      const courseDetailsForNotif = (await CourseModel.findById(courseId)
        .select('title slug')
        .lean()) as { title?: string; slug?: string } | null;
      if (courseDetailsForNotif?.title) {
        await createNotification({
          recipientId: userId,
          type: NotificationType.ORDER_PENDING, // Tạo một NotificationType mới
          message: `Đơn hàng cho khóa học "${courseDetailsForNotif.title}" của bạn đã được tạo và đang chờ xác nhận. Mã đơn: ${newOrder.code}`,
          link: `/order/${newOrder.code}`, // Link đến trang chi tiết đơn hàng của user
          senderId: 'SYSTEM',
        });
      }
    }

    return {
      success: true,
      data: newOrder,
      message: 'Đặt hàng thành công! Đơn hàng của bạn đang chờ xử lý.',
    };
  } catch (error) {
    console.log(error);
  }
}

export async function updateOrder({ orderId, status }: UpdateOrderParams) {
  try {
    connectToDatabase();
    const findOrder: OrderItemData = await OrderModel.findById(orderId)
      .populate({
        path: 'course',
        model: CourseModel,
        select: '_id',
      })
      .populate({
        path: 'user',
        model: UserModel,
        select: '_id',
      });

    if (!findOrder) return;
    if (findOrder.status === OrderStatus.CANCELED) return;
    const findUser: UserItemData | null = await UserModel.findById(
      findOrder.user._id,
    );

    if (!findUser) return;

    await OrderModel.findByIdAndUpdate(orderId, {
      status,
    });
    if (
      status === OrderStatus.COMPLETED &&
      findOrder.status === OrderStatus.PENDING
    ) {
      findUser.courses.push(findOrder.course._id as any);
      await findUser.save();
    }
    if (
      status === OrderStatus.CANCELED &&
      findOrder.status === OrderStatus.COMPLETED
    ) {
      findUser.courses = findUser.courses.filter(
        (element) => element.toString() !== findOrder.course._id.toString(),
      );
      await findUser.save();
    }
    revalidatePath('/manage/order');

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
  }
}
export async function getOrderDetails({
  code,
}: {
  code: string;
}): Promise<OrderItemData | undefined> {
  try {
    connectToDatabase();
    const order = await OrderModel.findOne({
      code,
    }).populate({
      path: 'course',
      select: 'title',
    });

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.log(error);
  }
}
