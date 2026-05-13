'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, UserPlus, Upload, BookOpen } from 'lucide-react';

const ACTIONS = [
  { label: 'Create Sales Order',    shortcut: 'Alt+O', key: 'o', icon: ShoppingCart, href: '/dashboard/sales/orders',         color: '#FF9900', bg: '#FF990018' },
  { label: 'Add Customer',          shortcut: 'Alt+C', key: 'c', icon: UserPlus,     href: '/dashboard/kyc/applications',     color: '#067d62', bg: '#067d6218' },
  { label: 'Upload Price List',     shortcut: 'Alt+P', key: 'p', icon: Upload,       href: '/dashboard/accounts/price-lists', color: '#146eb4', bg: '#146eb418' },
  { label: 'Create Stock Journal',  shortcut: 'Alt+J', key: 'j', icon: BookOpen,     href: '/dashboard/inventory/journals/create',   color: '#c45500', bg: '#c4550018' },
];

export function QuickActions() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const action = ACTIONS.find(a => a.key === e.key.toLowerCase());
      if (action) { e.preventDefault(); router.push(action.href); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #d5d9d9' }}>
      <div className="px-5 py-3 font-semibold text-sm" style={{ background: '#232f3e', color: '#FF9900' }}>
        Quick Actions
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {ACTIONS.map(a => {
          const Icon = a.icon;
          return (
            <button
              key={a.href}
              onClick={() => router.push(a.href)}
              className="flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:shadow-sm hover:-translate-y-0.5"
              style={{ background: a.bg, border: `1px solid ${a.color}20` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: a.color + '22' }}>
                <Icon className="w-4 h-4" style={{ color: a.color }} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold leading-tight" style={{ color: '#0f1111' }}>{a.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#aab7c4' }}>{a.shortcut}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
