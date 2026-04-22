'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Data ──────────────────────────────────────────────────────────────────────

const DAILY = [
  { label: 'Apr 15', sales: 82400, revenue: 61200 },
  { label: 'Apr 16', sales: 91300, revenue: 68900 },
  { label: 'Apr 17', sales: 76500, revenue: 54200 },
  { label: 'Apr 18', sales: 103200, revenue: 79800 },
  { label: 'Apr 19', sales: 88700, revenue: 65100 },
  { label: 'Apr 20', sales: 115400, revenue: 91600 },
  { label: 'Apr 21', sales: 98300, revenue: 74500 },
  { label: 'Apr 22', sales: 121700, revenue: 96200 },
];

const WEEKLY = [
  { label: 'Wk 14', sales: 524000, revenue: 389000 },
  { label: 'Wk 15', sales: 611000, revenue: 452000 },
  { label: 'Wk 16', sales: 578000, revenue: 418000 },
  { label: 'Wk 17', sales: 703000, revenue: 531000 },
  { label: 'Wk 18', sales: 821000, revenue: 634000 },
];

const MONTHLY = [
  { label: 'Nov', sales: 1820000, revenue: 1340000 },
  { label: 'Dec', sales: 2210000, revenue: 1690000 },
  { label: 'Jan', sales: 1940000, revenue: 1420000 },
  { label: 'Feb', sales: 2380000, revenue: 1780000 },
  { label: 'Mar', sales: 2640000, revenue: 1960000 },
  { label: 'Apr', sales: 2820000, revenue: 2110000 },
];

const REVENUE_BREAKDOWN = [
  { label: 'Manufacturing', q1: 480000, q2: 520000, q3: 610000, q4: 590000 },
  { label: 'Raw Materials', q1: 210000, q2: 240000, q3: 280000, q4: 265000 },
  { label: 'Services', q1: 140000, q2: 165000, q3: 190000, q4: 175000 },
  { label: 'Exports', q1: 95000,  q2: 120000, q3: 140000, q4: 130000 },
];

const CATEGORY_DATA = [
  { name: 'Manufacturing', value: 38, color: '#FF9900' },
  { name: 'Raw Materials', value: 24, color: '#146eb4' },
  { name: 'Services',      value: 18, color: '#067d62' },
  { name: 'Exports',       value: 12, color: '#c45500' },
  { name: 'Other',         value: 8,  color: '#8d6e63' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
      ? `$${(v / 1_000).toFixed(0)}K`
      : `$${v}`;

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #d5d9d9' }}>
      <div className="px-5 py-3 font-semibold text-sm" style={{ background: '#232f3e', color: '#FF9900' }}>
        {title}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

type Period = 'daily' | 'weekly' | 'monthly';

const PERIOD_DATA: Record<Period, typeof DAILY> = { daily: DAILY, weekly: WEEKLY, monthly: MONTHLY };

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg shadow-xl text-xs overflow-hidden" style={{ background: '#232f3e', border: '1px solid #37475a', minWidth: 140 }}>
      <div className="px-3 py-2 font-bold" style={{ background: '#131921', color: '#FF9900' }}>{label}</div>
      <div className="px-3 py-2 space-y-1.5">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: '#aab7c4' }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-bold" style={{ color: '#ffffff' }}>{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg shadow-xl text-xs overflow-hidden" style={{ background: '#232f3e', border: '1px solid #37475a' }}>
      <div className="px-3 py-2">
        <p className="font-bold" style={{ color: d.payload.color }}>{d.name}</p>
        <p style={{ color: '#aab7c4' }}>{d.value}% of revenue</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AnalyticsSection() {
  const [period, setPeriod] = useState<Period>('monthly');
  const data = useMemo(() => PERIOD_DATA[period], [period]);

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold" style={{ color: '#0f1111' }}>Analytics</h2>
          <p className="text-xs mt-0.5" style={{ color: '#767676' }}>Sales trends, revenue breakdown and category distribution</p>
        </div>
        {/* Period toggle */}
        <div className="flex rounded overflow-hidden text-xs font-semibold" style={{ border: '1px solid #d5d9d9' }}>
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 capitalize transition-colors"
              style={period === p
                ? { background: '#FF9900', color: '#0f1111' }
                : { background: '#ffffff', color: '#555555' }
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Line chart (full width) */}
      <SectionCard title="Sales vs Revenue Over Time">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#767676' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#767676' }} axisLine={false} tickLine={false} width={56} />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Line
              type="monotone" dataKey="sales" name="Total Sales"
              stroke="#FF9900" strokeWidth={2.5} dot={{ r: 4, fill: '#FF9900', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#FF9900', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone" dataKey="revenue" name="Net Revenue"
              stroke="#067d62" strokeWidth={2.5} dot={{ r: 4, fill: '#067d62', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#067d62', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Row 2: Bar + Pie side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart — 3 cols */}
        <div className="lg:col-span-3">
          <SectionCard title="Revenue Breakdown by Category">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={REVENUE_BREAKDOWN} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#767676' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#767676' }} axisLine={false} tickLine={false} width={56} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="q1" name="Q1" fill="#FF9900" radius={[2, 2, 0, 0]} />
                <Bar dataKey="q2" name="Q2" fill="#febd69" radius={[2, 2, 0, 0]} />
                <Bar dataKey="q3" name="Q3" fill="#146eb4" radius={[2, 2, 0, 0]} />
                <Bar dataKey="q4" name="Q4" fill="#232f3e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Donut chart — 2 cols */}
        <div className="lg:col-span-2">
          <SectionCard title="Category Distribution">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={CATEGORY_DATA} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={95}
                  dataKey="value" nameKey="name"
                  paddingAngle={2} strokeWidth={0}
                  animationBegin={0} animationDuration={800}
                >
                  {CATEGORY_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-1 space-y-1.5">
              {CATEGORY_DATA.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2" style={{ color: '#555555' }}>
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-bold tabular-nums" style={{ color: '#0f1111' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
