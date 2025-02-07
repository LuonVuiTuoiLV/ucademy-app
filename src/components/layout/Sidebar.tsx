import { menuItems } from '@/constants';
import { UserButton } from '@clerk/nextjs';
import { ActiveLink } from '../common';
import { ModeToggle } from '../common/ModeToggle';
import { TMenuItem } from '../types';
const Sidebar = () => {
	return (
		<div className="flex flex-col p-5 bg-white border-r dark:bg-grayDarker dark:border-opacity-10 border-r-gray-200">
			<a href="/ " className="inline-block mb-5 text-3xl font-bold">
				<span className="text-primary">U</span>
				cademy
			</a>
			<ul className="flex flex-col gap-2">
				{menuItems.map((item) => (
					<MenuItem
						key={item.title}
						url={item.url}
						title={item.title}
						icon={item.icon}
					></MenuItem>
				))}
			</ul>
			<div className="flex items-center justify-end gap-5 mt-auto">
				<ModeToggle></ModeToggle>
				<UserButton></UserButton>
			</div>
		</div>
	);
};

function MenuItem({ url = '/', title = '', icon }: TMenuItem) {
	return (
		<li>
			<ActiveLink url={url}>
				{icon}
				{title}
			</ActiveLink>
		</li>
	);
}

export default Sidebar;
