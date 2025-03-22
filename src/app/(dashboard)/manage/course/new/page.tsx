import Heading from '@/components/common/Heading';
import CourseAddNew from '@/components/course/CourseAddNew';
import { getUserInfo } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs/server';

const page = async () => {
	const { userId } = await auth();
	if (!userId) return null;
	const mongoUser = await getUserInfo({ userId });
	if (!mongoUser) return null;
	return (
		<div>
			<Heading>Tạo khóa học mới</Heading>
			<CourseAddNew user={JSON.parse(JSON.stringify(mongoUser))}></CourseAddNew>
		</div>
	);
};

export default page;
