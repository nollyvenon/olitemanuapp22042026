'use client';

import { KpiSection } from '@/components/dashboard/KpiSection';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AlertsSection } from '@/components/dashboard/AlertsSection';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0f1111' }}>Operations Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: '#555555' }}>Real-time manufacturing overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#e8f8f5', color: '#067d62', border: '1px solid #067d62' }}>
          <span className="w-2 h-2 rounded-full bg-[#067d62] animate-pulse" />
          Live
        </div>
      </div>

      {/* KPI Section */}
      <KpiSection />

      {/* Analytics Section */}
      <AnalyticsSection />

      {/* Alerts */}
      <AlertsSection />

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Bottom row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #d5d9d9' }}>
          <div className="px-5 py-3 font-semibold text-sm" style={{ background: '#232f3e', color: '#FF9900' }}>System Health</div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { label: 'API Server', status: 'Online', color: '#067d62' },
              { label: 'Database', status: 'Healthy', color: '#146eb4' },
              { label: 'Queue Worker', status: 'Running', color: '#FF9900' },
              { label: 'Scheduler', status: 'Active', color: '#c45500' },
              { label: 'Storage', status: '68% used', color: '#febd69' },
              { label: 'Cache', status: 'Warm', color: '#8d6e63' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded" style={{ background: item.color + '12', border: `1px solid ${item.color}30` }}>
                <span className="text-sm font-medium" style={{ color: '#555555' }}>{item.label}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: item.color + '20', color: item.color }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
