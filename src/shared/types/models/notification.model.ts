import { Document, Schema } from 'mongoose';

import { NotificationType } from '../notification.type';

export interface NotificationModelProps extends Document {
  _id: string;
  recipient: Schema.Types.ObjectId; // ID của người dùng nhận thông báo (ref: 'User')
  sender?: Schema.Types.ObjectId | string; // ID của người gửi (nếu là user) hoặc 'SYSTEM' (ref: 'User')
  type: NotificationType; // Loại thông báo
  message: string; // Nội dung thông báo
  link?: string; // Đường dẫn khi nhấp vào thông báo (ví dụ: /courses/slug-khoa-hoc)
  is_read: boolean; // Trạng thái đã đọc hay chưa
  created_at: Date;
  updated_at: Date;
}
