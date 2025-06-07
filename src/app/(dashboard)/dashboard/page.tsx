import {
  getCourseStatusStats,
  getRevenueAndUserStats,
} from '@/modules/dashboard/actions';
import { ActionItems } from '@/modules/dashboard/components';
import RevenueUserChart from '@/modules/dashboard/components/revenue-user-chart';
import SectionCards from '@/modules/dashboard/components/section-cards';
import TopLists from '@/modules/dashboard/components/top-lists';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { SiteHeader } from '@/shared/components/ui/site-header';

export default async function Page() {
  const [revenueAndUserData, courseStatusData] = await Promise.all([
    getRevenueAndUserStats(30), // Lấy dữ liệu cho 30 ngày
    getCourseStatusStats(),
  ]);
  return (
    <SidebarProvider>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <SectionCards />
              </div>
              <div className="px-4 lg:px-6">
                <RevenueUserChart
                  initialData={revenueAndUserData?.data || []}
                />
                <TopLists></TopLists>
                <ActionItems></ActionItems>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
