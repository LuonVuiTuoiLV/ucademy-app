import { ChartAreaInteractive } from '@/shared/components/chart-area-interactive';
import { SectionCards } from '@/shared/components/section-cards';
import { SiteHeader } from '@/shared/components/site-header';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';

export default function Page() {
  return (
    <SidebarProvider>
      {/* <AppSidebar variant="inset" /> */}
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <SectionCards />
              </div>
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
