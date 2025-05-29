import { model, models, Schema } from 'mongoose';

import { NotificationModelProps, NotificationType } from '../types';

const notificationSchema = new Schema<NotificationModelProps>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sender: { type: Schema.Types.Mixed, ref: 'User' }, // Có thể là ObjectId (User) hoặc string ('SYSTEM')
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true,
  },
  message: { type: String, required: true },
  link: { type: String },
  is_read: { type: Boolean, default: false, index: true },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});
export const NotificationModel =
  models.Notification ||
  model<NotificationModelProps>('Notification', notificationSchema);
