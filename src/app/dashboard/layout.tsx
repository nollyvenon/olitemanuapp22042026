'use client';

import { useUIStore } from '@/store/ui.store';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AuthGuard } from '@/components/providers/AuthGuard';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background overflow-hidden">
        <AppSidebar />
        <div
          className={cn(
            'flex flex-col flex-1 min-w-0 transition-all duration-300',
            sidebarCollapsed ? 'ml-14' : 'ml-64'
          )}
        >
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-screen-xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
