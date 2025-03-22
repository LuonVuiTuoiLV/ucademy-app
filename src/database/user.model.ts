import { EUserRole, EUserStatus } from '@/components/types/enums';
import { Document, Schema, model, models } from 'mongoose';

export interface IUser extends Document {
	_id: string;
	clerkId: string;
	name: string;
	username: string;
	email: string;
	avatar: string;
	courses: Schema.Types.ObjectId[];
	status: EUserStatus;
	role: EUserRole;
	created_at: Date;
}
const userSchema = new Schema<IUser>({
	clerkId: {
		type: String,
	},
	name: {
		type: String,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	avatar: {
		type: String,
	},
	courses: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Course',
		},
	],
	created_at: {
		type: Date,
		default: Date.now,
	},
	role: {
		type: String,
		enum: Object.values(EUserRole),
		default: EUserRole.USER,
	},
	status: {
		type: String,
		enum: Object.values(EUserStatus),
		default: EUserStatus.ACTIVE,
	},
});
const User = models.User || model<IUser>('User', userSchema);
// models: là một đối tượng trg mongo chứa tất cả model đã đăng kí trước đó.
// model: đăng kí đối tượng
export default User;
