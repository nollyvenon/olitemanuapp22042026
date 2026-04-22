'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, XCircle, Clock, X, ChevronRight } from 'lucide-react';

type Severity = 'critical' | 'warning';
type AlertType = 'low-stock' | 'pending-approval' | 'failed-transaction';

interface Alert {
  id: string;
  type: AlertType;
  severity: Severity;
  title: string;
  description: string;
  href: string;
  time: string;
}

const ALERTS: Alert[] = [
  { id: 'a1', type: 'failed-transaction', severity: 'critical', title: 'Transaction Failed',        description: 'TXN-00829 — $142,000 payment gateway error', href: '/dashboard/sales/invoices',          time: '2m ago' },
  { id: 'a2', type: 'failed-transaction', severity: 'critical', title: 'Invoice Overdue',           description: '3 invoices past due > 30 days ($284,500 total)', href: '/dashboard/sales/invoices',      time: '1h ago' },
  { id: 'a3', type: 'low-stock',          severity: 'critical', title: 'Critical Stock Level',      description: 'Steel Coil HRC 3mm — 12 units remaining (reorder: 200)', href: '/dashboard/inventory/items', time: '4h ago' },
  { id: 'a4', type: 'low-stock',          severity: 'warning',  title: 'Low Stock Warning',         description: 'Aluminium Sheet 5mm — 38 units (reorder: 100)', href: '/dashboard/inventory/items',      time: '5h ago' },
  { id: 'a5', type: 'low-stock',          severity: 'warning',  title: 'Low Stock Warning',         description: 'Copper Wire 2.5mm — 54 units (reorder: 150)', href: '/dashboard/inventory/items',       time: '6h ago' },
  { id: 'a6', type: 'pending-approval',   severity: 'warning',  title: 'Orders Awaiting Approval',  description: '7 sales orders pending manager sign-off ($619,200)', href: '/dashboard/sales/orders',     time: '8h ago' },
  { id: 'a7', type: 'pending-approval',   severity: 'warning',  title: 'KYC Applications Pending',  description: '4 new KYC submissions require review', href: '/dashboard/kyc/applications',            time: '12h ago' },
];

const SEV: Record<Severity, { bg: string; border: string; iconColor: string; titleColor: string }> = {
  critical: { bg: '#fff5f5', border: '#cc0c39', iconColor: '#cc0c39', titleColor: '#cc0c39' },
  warning:  { bg: '#fffbf0', border: '#c45500', iconColor: '#c45500', titleColor: '#c45500' },
};

const TYPE_ICON: Record<AlertType, typeof AlertTriangle> = {
  'low-stock':          AlertTriangle,
  'pending-approval':   Clock,
  'failed-transaction': XCircle,
};

const TYPE_LABELS: Record<AlertType, string> = {
  'low-stock':          'Low Stock',
  'pending-approval':   'Pending Approval',
  'failed-transaction': 'Failed Transaction',
};

const FILTERS = [
  { key: 'all',                 label: 'All' },
  { key: 'critical',            label: 'Critical' },
  { key: 'low-stock',           label: 'Low Stock' },
  { key: 'pending-approval',    label: 'Pending' },
  { key: 'failed-transaction',  label: 'Failed' },
] as const;

type FilterKey = typeof FILTERS[number]['key'];

export function AlertsSection() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterKey>('all');

  const visible = ALERTS.filter(a => {
    if (dismissed.has(a.id)) return false;
    if (filter === 'all') return true;
    if (filter === 'critical') return a.severity === 'critical';
    return a.type === filter;
  });

  const criticalCount = ALERTS.filter(a => !dismissed.has(a.id) && a.severity === 'critical').length;

  return (
    <section>
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #d5d9d9' }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#232f3e' }}>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm" style={{ color: '#FF9900' }}>Alerts</span>
            {criticalCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#cc0c39', color: '#fff' }}>
                {criticalCount} critical
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                style={filter === f.key
                  ? { background: '#FF9900', color: '#0f1111' }
                  : { background: '#37475a', color: '#aab7c4' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-2">
          {visible.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: '#767676' }}>No alerts</div>
          ) : (
            visible.map(alert => {
              const s = SEV[alert.severity];
              const Icon = TYPE_ICON[alert.type];
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg px-4 py-3 transition-all"
                  style={{ background: s.bg, border: `1px solid ${s.border}30`, borderLeft: `3px solid ${s.border}` }}
                >
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: s.iconColor }} />
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => router.push(alert.href)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold" style={{ color: s.titleColor }}>{alert.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: s.border + '18', color: s.iconColor }}>
                        {TYPE_LABELS[alert.type]}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#555555' }}>{alert.description}</p>
                    <span className="text-[10px]" style={{ color: '#aab7c4' }}>{alert.time}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => router.push(alert.href)}
                      className="p-1 rounded hover:bg-black/5 transition-colors"
                      title="View"
                    >
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: s.iconColor }} />
                    </button>
                    <button
                      onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
                      className="p-1 rounded hover:bg-black/5 transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" style={{ color: '#aab7c4' }} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
