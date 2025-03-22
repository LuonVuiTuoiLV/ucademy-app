import PageNotFound from '@/app/not-found';
import { EUserRole } from '@/components/types/enums';
import { getUserInfo } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
	const { userId } = await auth();
	if (!userId) return redirect('/sign-in');
	const user = await getUserInfo({ userId });
	if (user && user.role !== EUserRole.ADMIN)
		return <PageNotFound></PageNotFound>;
	return <div>{children}</div>;
};

export default AdminLayout;
