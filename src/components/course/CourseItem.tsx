import { ICourse } from '@/database/course.model';
import Image from 'next/image';
import Link from 'next/link';
import { IconClock, IconEye, IconStar } from '../icons';

const CourseItem = ({ data }: { data: ICourse }) => {
	const courseInfo = [
		{
			title: data.views,
			icon: (className?: string) => <IconEye className={className}></IconEye>,
		},
		{
			title: data.rating[0],
			icon: (className?: string) => <IconStar className={className}></IconStar>,
		},
		{
			title: '30h25',
			icon: (className?: string) => (
				<IconClock className={className}></IconClock>
			),
		},
	];
	return (
		<div className="p-4 bg-white border border-gray-200 rounded-2xl dark:bg-grayDarker dark:border-opacity-10">
			<Link href={`/course/${data.slug}`} className="block h-[180px] relative">
				<Image
					alt=""
					src="https://images.unsplash.com/photo-1542890886-40c9094e352a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTh8fHxlbnwwfHx8fHw%3D"
					width={300}
					height={200}
					className="object-cover w-full h-full rounded-lg"
					sizes="@media (min-width:640px) 300px, 100vw"
					priority
				/>
				{/* <span className="absolute z-10 inline-block px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-full top-3 right-3">
					New
				</span> */}
			</Link>
			<div className="pt-4">
				<h3 className="mb-5 text-lg font-bold">{data.title}</h3>
				<div className="flex items-center gap-3 mb-5 text-xs text-gray-500 dark:text-grayDark">
					{courseInfo.map((item, index) => (
						<div className="flex items-center gap-2" key={index}>
							{item.icon('size-4')}
							<span>{item.title}</span>
						</div>
					))}

					<span className="ml-auto text-base font-bold text-primary">
						{data.price}
					</span>
				</div>
				<Link
					href={`/course/${data.slug}`}
					className="flex items-center justify-center w-full h-12 mt-8 font-semibold text-white rounded-lg bg-primary"
				>
					Xem chi tiết
				</Link>
			</div>
		</div>
	);
};

export default CourseItem;
