'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { FileBarChart, TrendingUp, Users, Package } from 'lucide-react';

const REPORT_CARDS = [
  {
    icon: Package,
    title: 'Inventory Report',
    description: 'Stock levels, valuation, and low stock summary across all store centers.',
    href: '/dashboard/reports/inventory',
    color: '#146eb4',
    stats: [{ label: 'Total Items', value: '856' }, { label: 'Low Stock', value: '5' }, { label: 'Stock Value', value: '$6.1M' }],
  },
  {
    icon: TrendingUp,
    title: 'Stock Movements',
    description: 'Receipts, issues, transfers, and adjustments over any date range.',
    href: '/dashboard/reports/movements',
    color: '#FF9900',
    stats: [{ label: 'Movements (Apr)', value: '1,841' }, { label: 'Receipts', value: '612' }, { label: 'Issues', value: '984' }],
  },
  {
    icon: Users,
    title: 'Aging Report',
    description: 'Outstanding debtor and creditor balances segmented by aging bucket.',
    href: '/dashboard/reports/aging',
    color: '#cc0c39',
    stats: [{ label: 'Total Debtors', value: '$1.87M' }, { label: 'Overdue 30d+', value: '$948K' }, { label: 'Overdue 60d+', value: '$387K' }],
  },
  {
    icon: FileBarChart,
    title: 'Sales Report',
    description: 'Order volume, revenue, and top customers by period.',
    href: '/dashboard/sales/orders',
    color: '#067d62',
    stats: [{ label: 'Orders (Apr)', value: '241' }, { label: 'Revenue', value: '$3.2M' }, { label: 'Avg Order', value: '$3,879' }],
  },
];

export default function ReportsPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Financial, inventory, and operational analytics" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.href}
              onClick={() => router.push(card.href)}
              className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
              style={{ border: '1px solid #d5d9d9', borderTop: `3px solid ${card.color}` }}
            >
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: card.color + '18' }}>
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: '#0f1111' }}>{card.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#767676' }}>{card.description}</p>
                  </div>
                </div>
                <div className="flex gap-4 pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
                  {card.stats.map(s => (
                    <div key={s.label}>
                      <div className="text-xs" style={{ color: '#767676' }}>{s.label}</div>
                      <div className="text-sm font-bold tabular-nums" style={{ color: '#0f1111' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
