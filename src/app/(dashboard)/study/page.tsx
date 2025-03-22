import { CourseGrid } from '@/components/common';
import CourseItem from '@/components/course/CourseItem';

import Heading from '@/components/typography/Heading';

const page = () => {
	return (
		<div className="">
			<Heading>Khu vực học tập</Heading>
			<CourseGrid>
				<CourseItem />
				<CourseItem />
				<CourseItem />
			</CourseGrid>
		</div>
	);
};

export default page;
