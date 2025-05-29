// src/modules/notification/actions/notification.actions.ts
'use server';

import { connectToDatabase } from '@/shared/lib/mongoose';
import { NotificationModel } from '@/shared/schemas/notification.schema';
import {
  NotificationModelProps,
  NotificationType,
  PlainNotificationData,
} from '@/shared/types';
import { FilterQuery } from 'mongoose';
// Giả sử bạn cần UserModel để lấy thông tin người nhận nếu cần
// import { UserModel } from '@/shared/schemas';

export interface CreateNotificationParams {
  recipientId: string;
  type: NotificationType;
  message: string;
  link?: string;
  senderId?: string; // Có thể là ID của User hoặc một chuỗi như "SYSTEM"
}

export async function createNotification(
  params: CreateNotificationParams,
): Promise<NotificationModelProps | null> {
  try {
    await connectToDatabase();
    const notification = await NotificationModel.create({
      recipient: params.recipientId,
      type: params.type,
      message: params.message,
      link: params.link,
      sender: params.senderId, // Nếu là hệ thống, bạn có thể đặt giá trị cố định
    });
    // Không cần revalidatePath ở đây trừ khi có trang nào đó cache danh sách thông báo bằng revalidateTag
    return JSON.parse(JSON.stringify(notification));
  } catch (error) {
    console.error('Lỗi khi tạo thông báo:', error);
    return null;
  }
}

export interface GetUserNotificationsParams {
  userId: string;
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
}

export async function getUserNotifications(
  params: GetUserNotificationsParams,
): Promise<{
  notifications: PlainNotificationData[];
  total: number;
  totalPages: number;
  unreadCount?: number; // Số lượng chưa đọc trong số được lấy ra (tùy chọn)
} | null> {
  try {
    await connectToDatabase();
    const { userId, limit = 10, page = 1, unreadOnly } = params;
    const skip = (Number(page) - 1) * Number(limit);

    const query: FilterQuery<NotificationModelProps> = { recipient: userId };
    if (unreadOnly === true) {
      query.is_read = false;
    } else if (unreadOnly === false) {
      // Nếu muốn lọc các thông báo đã đọc (ít dùng)
      query.is_read = true;
    }

    const notifications = await NotificationModel.find(query)
      .sort({ created_at: -1 }) // Mới nhất lên đầu
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Sử dụng lean để tăng hiệu suất

    const total = await NotificationModel.countDocuments(query);
    const totalPages = Math.ceil(total / Number(limit));

    return {
      notifications: JSON.parse(JSON.stringify(notifications)), // .lean() đã trả về object, nhưng để chắc chắn
      total,
      totalPages,
    };
  } catch (error) {
    console.error('Lỗi khi lấy thông báo người dùng:', error);
    return null;
  }
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  try {
    await connectToDatabase();
    const count = await NotificationModel.countDocuments({
      recipient: userId,
      is_read: false,
    });
    return count;
  } catch (error) {
    console.error('Lỗi khi lấy số lượng thông báo chưa đọc:', error);
    return 0;
  }
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
): Promise<boolean> {
  try {
    await connectToDatabase();
    // Thêm điều kiện userId để đảm bảo người dùng chỉ đánh dấu thông báo của chính họ
    const result = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipient: userId, is_read: false }, // Chỉ cập nhật nếu chưa đọc
      { is_read: true },
      { new: true },
    );
    if (result) {
      // revalidatePath hoặc revalidateTag nếu cần cập nhật UI ngay lập tức ở đâu đó
    }
    return !!result;
  } catch (error) {
    console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(
  userId: string,
): Promise<boolean> {
  try {
    await connectToDatabase();
    await NotificationModel.updateMany(
      { recipient: userId, is_read: false },
      { is_read: true },
    );
    return true;
  } catch (error) {
    console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
    return false;
  }
}
