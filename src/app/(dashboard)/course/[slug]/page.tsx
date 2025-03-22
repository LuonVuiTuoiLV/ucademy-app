import PageNotFound from '@/app/not-found';
import { IconPlay, IconStudy, IconUsers } from '@/components/icons';
import { ECourseStatus } from '@/components/types/enums';
import { Button } from '@/components/ui/button';
import { courseLevelTitle } from '@/constants';
import { getCourseBySlug } from '@/lib/actions/course.action';
import Image from 'next/image';

const page = async ({ params }: { params: { slug: string } }) => {
	const data = await getCourseBySlug({ slug: params.slug });
	if (!data) return null;
	if (data.status !== ECourseStatus.APPROVED)
		return <PageNotFound></PageNotFound>;
	const videoId = data.intro_url?.split('v=')[1];
	return (
		<div className="grid lg:grid-cols-[2fr,1fr] gap-10">
			<div className="">
				<div className="relative aspect-video mb-5">
					{data.intro_url ? (
						<>
							<iframe
								width="935"
								height="526"
								src={`https://www.youtube.com/embed/${videoId}`}
								title="NA TRA: Kẻ thách thức SỐ MỆNH và ĐỊNH KIẾN"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								className="w-full h-full object-fill"
							></iframe>
						</>
					) : (
						<Image
							alt=""
							src={data.image}
							fill
							className="w-full h-full object-cover rounded-lg"
						></Image>
					)}
				</div>
				<h1 className="font-bold text-3xl mb-5">{data.title}</h1>
				<BoxSection title="Mô tả">
					<div className="leading-normal">{data.desc}</div>
				</BoxSection>
				<BoxSection title="Thông tin">
					<div className="grid grid-cols-4 gap-5 mb-10">
						<BoxInfo title="Bài học">100</BoxInfo>
						<BoxInfo title="Lượt xem">{data.views}</BoxInfo>
						<BoxInfo title="Trình độ">{courseLevelTitle[data.level]}</BoxInfo>
						<BoxInfo title="Thời lượng">100h45p</BoxInfo>
					</div>
				</BoxSection>
				<BoxSection title="Yêu cầu">
					{data.info.requirements.map((r, index) => (
						<div className="mb-3 flex items-center gap-2" key={index}>
							<span className="flex items-center justify-center size-5 bg-primary text-white p-1 rounded-lg flex-shrink-0">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M4.5 12.75l6 6 9-13.5"
									/>
								</svg>
							</span>
							<span>{r}</span>
						</div>
					))}
				</BoxSection>
				<BoxSection title="Lợi ích">
					{data.info.benefits.map((b, index) => (
						<div className="mb-3 flex items-center gap-2" key={index}>
							<span className="flex items-center justify-center size-5 bg-primary text-white p-1 rounded-lg flex-shrink-0">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M4.5 12.75l6 6 9-13.5"
									/>
								</svg>
							</span>
							<span>{b}</span>
						</div>
					))}
				</BoxSection>
				<BoxSection title="Q.A">
					{data.info.qa.map((qa, index) => (
						<div className="" key={index}>
							<div className="">{qa.question}</div>
							<div className="">{qa.answer}</div>
						</div>
					))}
				</BoxSection>
			</div>
			<div className="">
				<div className="bg-white dark:bg-grayDarker rounded-lg p-5">
					<div className="flex items-center gap-2 mb-3">
						<strong className="text-primary text-xl font-bold">
							{data.price}
						</strong>
						<span className="text-slate-400 dark:text-grayDark line-through text-sm">
							{data.sale_price}
						</span>
						<span className="ml-auto inline-block px-3 py-1 rounded-lg bg-primary text-primary bg-opacity-10 font-semibold text-sm">
							{Math.floor((data.price / data.sale_price) * 100)}%
						</span>
					</div>
					<h3 className="font-bold mb-3 text-sm">Khóa học gồm có</h3>
					<ul className="mb-5 flex flex-col gap-2 text-sm text-slate-500">
						<li className="flex items-center gap-2">
							<IconPlay className="size-4" />
							<span>30h học</span>
						</li>
						<li className="flex items-center gap-2">
							<IconPlay className="size-4" />
							<span>Video full HD</span>
						</li>
						<li className="flex items-center gap-2">
							<IconUsers className="size-4" />
							<span>Có nhóm hỗ trợ</span>
						</li>
						<li className="flex items-center gap-2">
							<IconStudy className="size-4" />
							<span>Tài liệu kèm theo</span>
						</li>
					</ul>
					<Button variant="primary" className="w-full">
						Mua khóa học
					</Button>
				</div>
			</div>
		</div>
	);
};

function BoxInfo({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-white rounded-lg p-5">
			<h4 className="text-sm text-slate-400 font-normal">{title}</h4>
			<h3 className="font-bold">{children}</h3>
		</div>
	);
}

function BoxSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<>
			<h2 className="font-bold text-xl mb-5">{title}</h2>
			<div className="mb-10 ">{children}</div>
		</>
	);
}
export default page;
