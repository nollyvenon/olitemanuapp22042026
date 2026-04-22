'use client';

import { DollarSign, TrendingUp, FileText, Package } from 'lucide-react';
import { KpiCard } from './KpiCard';

const KPI_DATA = [
  {
    title: 'Total Sales',
    value: 4821340,
    format: 'currency' as const,
    change: 14.2,
    icon: DollarSign,
    accentColor: '#FF9900',
    href: '/dashboard/sales/orders',
    subLabel: '1,243 orders this period',
  },
  {
    title: 'Revenue',
    value: 3267890,
    format: 'currency' as const,
    change: 8.7,
    icon: TrendingUp,
    accentColor: '#067d62',
    href: '/dashboard/reports',
    subLabel: 'Net after returns & discounts',
  },
  {
    title: 'Outstanding Invoices',
    value: 892450,
    format: 'currency' as const,
    change: -3.1,
    icon: FileText,
    accentColor: '#cc0c39',
    href: '/dashboard/sales/invoices',
    subLabel: '47 invoices overdue',
  },
  {
    title: 'Stock Value',
    value: 6134200,
    format: 'currency' as const,
    change: 2.4,
    icon: Package,
    accentColor: '#146eb4',
    href: '/dashboard/inventory/items',
    subLabel: '856 SKUs across 4 stores',
  },
];

interface KpiSectionProps {
  isLoading?: boolean;
}

export function KpiSection({ isLoading }: KpiSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold" style={{ color: '#0f1111' }}>Key Performance Indicators</h2>
          <p className="text-xs mt-0.5" style={{ color: '#767676' }}>
            vs. previous 30-day period · Click any card to view full report
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded font-medium" style={{ background: '#e8f8f5', color: '#067d62' }}>
          Last updated: just now
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} isLoading={isLoading} />
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-4 rounded-lg px-5 py-3 flex flex-wrap gap-x-8 gap-y-2" style={{ background: '#232f3e' }}>
        {[
          { label: 'Gross Margin', value: '67.8%', positive: true },
          { label: 'Avg Order Value', value: '$3,879', positive: true },
          { label: 'Collection Rate', value: '91.3%', positive: true },
          { label: 'Overdue Rate', value: '8.7%', positive: false },
          { label: 'Inventory Turnover', value: '4.2x', positive: true },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#aab7c4' }}>{stat.label}:</span>
            <span className="text-xs font-bold" style={{ color: stat.positive ? '#febd69' : '#ff6b6b' }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
