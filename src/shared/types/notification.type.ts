export enum NotificationType {
  NEW_COURSE_ENROLLMENT = 'NEW_COURSE_ENROLLMENT',
  COURSE_UPDATE = 'COURSE_UPDATE',
  NEW_PROMOTION = 'NEW_PROMOTION',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  COURSE_ENROLLMENT_COMPLETED = 'COURSE_ENROLLMENT_COMPLETED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_CANCELED = 'ORDER_CANCELED',
  FREE_COURSE = 'FREE_COURSE',
  PAID_COURSE_APPROVED = 'PAID_COURSE_APPROVED',
  ORDER_PENDING = 'ORDER_PENDING',
}
export interface PlainNotificationData {
  _id: string; // Luôn là string sau khi serialize
  recipient: string; // ID người nhận
  sender?: string; // ID người gửi hoặc 'SYSTEM'
  type: NotificationType;
  message: string;
  link?: string;
  is_read: boolean; // ✅ Sử dụng camelCase 'isRead' cho nhất quán với Mongoose schema
  created_at: string; // Date sẽ được serialize thành string (ISO date string)
  updated_at: string; // Date sẽ được serialize thành string
  // Thêm các trường dữ liệu khác mà client cần từ notification
}
