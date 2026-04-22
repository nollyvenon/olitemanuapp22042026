'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

interface Setting {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'select' | 'toggle';
  options?: string[];
}

const SETTINGS: Setting[] = [
  { key: 'company_name',    label: 'Company Name',         value: 'Olite Manufacturing Ltd', type: 'text' },
  { key: 'base_currency',   label: 'Base Currency',        value: 'USD',                     type: 'select', options: ['USD', 'NGN', 'EUR', 'GBP'] },
  { key: 'fiscal_year',     label: 'Fiscal Year Start',    value: 'January',                 type: 'select', options: ['January', 'April', 'July', 'October'] },
  { key: 'tax_rate',        label: 'Default Tax Rate (%)', value: '7.5',                     type: 'text' },
  { key: 'credit_days',     label: 'Default Credit Days',  value: '30',                      type: 'text' },
  { key: 'invoice_prefix',  label: 'Invoice Prefix',       value: 'INV-',                    type: 'text' },
  { key: 'order_prefix',    label: 'Order Prefix',         value: 'ORD-',                    type: 'text' },
  { key: 'reorder_notify',  label: 'Low Stock Alerts',     value: 'true',                    type: 'toggle' },
  { key: 'email_notify',    label: 'Email Notifications',  value: 'true',                    type: 'toggle' },
  { key: 'auto_approve',    label: 'Auto-approve Invoices < $1,000', value: 'false',         type: 'toggle' },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(SETTINGS.map(s => [s.key, s.value]))
  );

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="Configure global application preferences" />

      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #d5d9d9' }}>
        <div className="px-5 py-3 font-semibold text-sm" style={{ background: '#232f3e', color: '#FF9900' }}>
          General Configuration
        </div>
        <div className="divide-y divide-[#f0f0f0]">
          {SETTINGS.map(s => (
            <div key={s.key} className="flex items-center justify-between px-5 py-4 gap-4">
              <label className="text-sm font-medium" style={{ color: '#0f1111' }}>{s.label}</label>
              {s.type === 'toggle' ? (
                <button
                  onClick={() => setValues(v => ({ ...v, [s.key]: v[s.key] === 'true' ? 'false' : 'true' }))}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: values[s.key] === 'true' ? '#FF9900' : '#d5d9d9' }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ transform: values[s.key] === 'true' ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              ) : s.type === 'select' ? (
                <select
                  value={values[s.key]}
                  onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                  className="text-sm px-3 py-1.5 rounded outline-none"
                  style={{ border: '1px solid #d5d9d9', color: '#0f1111', background: '#fff' }}
                >
                  {s.options!.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={values[s.key]}
                  onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                  className="text-sm px-3 py-1.5 rounded w-56 outline-none focus:ring-2 focus:ring-[#FF9900]"
                  style={{ border: '1px solid #d5d9d9', color: '#0f1111' }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 flex justify-end" style={{ background: '#f4f6f8', borderTop: '1px solid #d5d9d9' }}>
          <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
