import { ECourseLevel, ECourseStatus } from '@/components/types/enums';
import { Document, model, models, Schema } from 'mongoose';

export interface ICourse extends Document {
	_id: string;
	title: string;
	image: string;
	intro_url: string;
	desc: string;
	price: number;
	sale_price: number;
	slug: string;
	status: ECourseStatus;
	author: Schema.Types.ObjectId;
	level: ECourseLevel;
	views: number;
	rating: number[];
	info: {
		requirements: string[];
		benefits: string[];
		qa: [
			{
				question: string;
				answer: string;
			}
		];
	};
	lectures: Schema.Types.ObjectId[];
	_destroy: boolean;
	created_at: Date;
}

const courseSchema = new Schema<ICourse>({
	title: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		default: '',
	},
	intro_url: {
		type: String,
		default: '',
	},
	desc: {
		type: String,
		default: '',
	},
	price: {
		type: Number,
		default: 0,
	},
	sale_price: {
		type: Number,
		default: 0,
	},
	status: {
		type: String,
		enum: Object.values(ECourseStatus),
		default: ECourseStatus.PENDING,
	},
	level: {
		type: String,
		enum: Object.values(ECourseLevel),
		default: ECourseLevel.BEGINNER,
	},
	lectures: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Lectute',
		},
	],
	rating: {
		type: [Number],
		default: [5],
	},
	views: {
		type: Number,
		default: 0,
	},
	info: {
		requirements: {
			type: [String],
		},
		benefits: {
			type: [String],
		},
		qa: [
			{
				question: {
					type: String,
				},
				answer: {
					type: String,
				},
			},
		],
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	_destroy: {
		type: Boolean,
		default: false,
	},
});
const Course = models.Course || model<ICourse>('Course', courseSchema);

export default Course;
