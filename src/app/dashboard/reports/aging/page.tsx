'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/DataTable';
import { getApiClient } from '@/lib/api-client';

interface AgingRow {
  id: string;
  account: string;
  name: string;
  type: 'Debtor' | 'Creditor';
  current: number;
  days_30: number;
  days_60: number;
  days_90: number;
  days_90_plus: number;
  total: number;
}

const fmt = (v: number) => v === 0 ? <span style={{ color: '#d5d9d9' }}>—</span> : <span className="tabular-nums">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v)}</span>;

const columns: ColumnDef<AgingRow>[] = [
  { accessorKey: 'account',      header: 'Account #',  cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',         header: 'Name',       cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: i => {
      const t = String(i.getValue());
      return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: t === 'Debtor' ? '#e8f0fe' : '#fff8e7', color: t === 'Debtor' ? '#146eb4' : '#c45500' }}>{t}</span>;
    },
  },
  { accessorKey: 'current',      header: 'Current',    cell: i => fmt(i.getValue() as number) },
  { accessorKey: 'days_30',      header: '1–30 Days',  cell: i => <span style={{ color: (i.getValue() as number) > 0 ? '#c45500' : undefined }}>{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'days_60',      header: '31–60 Days', cell: i => <span style={{ color: (i.getValue() as number) > 0 ? '#FF9900' : undefined }}>{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'days_90',      header: '61–90 Days', cell: i => <span style={{ color: (i.getValue() as number) > 0 ? '#cc0c39' : undefined }}>{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'days_90_plus', header: '90+ Days',   cell: i => <span className="font-bold" style={{ color: (i.getValue() as number) > 0 ? '#cc0c39' : undefined }}>{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'total',        header: 'Total',      cell: i => <span className="font-bold tabular-nums">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(i.getValue() as number)}</span> },
];

export default function AgingReportPage() {
  const api = getApiClient();
  const [data, setData] = useState<AgingRow[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'total', desc: true }]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'Debtor' | 'Creditor'>('all');

  const exportCSV = () => {
    const headers = ['Account', 'Name', 'Type', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total'];
    const rows = filteredData.map(row => [row.account, row.name, row.type, row.current, row.days_30, row.days_60, row.days_90, row.days_90_plus, row.total]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aging-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredData = typeFilter === 'all' ? data : data.filter(row => row.type === typeFilter);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/reports/aging');
        const list = Array.isArray(data) ? data : data.data ?? [];
        setData(list);
      } catch (err) {
        console.error('Failed to load aging report', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  if (loading) return <div className="p-6">Loading...</div>;

  const agingBuckets = [
    { bucket: 'Current', debtor: 0, creditor: 0 },
    { bucket: '1-30 Days', debtor: 0, creditor: 0 },
    { bucket: '31-60 Days', debtor: 0, creditor: 0 },
    { bucket: '61-90 Days', debtor: 0, creditor: 0 },
    { bucket: '90+ Days', debtor: 0, creditor: 0 },
  ];

  data.forEach((row) => {
    if (row.current > 0) { agingBuckets[0][row.type === 'Debtor' ? 'debtor' : 'creditor'] += row.current; }
    if (row.days_30 > 0) { agingBuckets[1][row.type === 'Debtor' ? 'debtor' : 'creditor'] += row.days_30; }
    if (row.days_60 > 0) { agingBuckets[2][row.type === 'Debtor' ? 'debtor' : 'creditor'] += row.days_60; }
    if (row.days_90 > 0) { agingBuckets[3][row.type === 'Debtor' ? 'debtor' : 'creditor'] += row.days_90; }
    if (row.days_90_plus > 0) { agingBuckets[4][row.type === 'Debtor' ? 'debtor' : 'creditor'] += row.days_90_plus; }
  });

  const totalByType = data.reduce((acc, row) => {
    acc.debtors += row.type === 'Debtor' ? row.total : 0;
    acc.creditors += row.type === 'Creditor' ? row.total : 0;
    return acc;
  }, { debtors: 0, creditors: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Aging Report" description="Outstanding debtor and creditor balances by aging bucket" />
        <button onClick={exportCSV} className="px-4 py-2 rounded text-sm font-medium" style={{ background: '#067d62', color: '#fff' }}>
          📥 Export CSV
        </button>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'all' as const, label: 'All Accounts' },
          { key: 'Debtor' as const, label: 'Debtors Only' },
          { key: 'Creditor' as const, label: 'Creditors Only' },
        ].map(btn => (
          <button
            key={btn.key}
            onClick={() => setTypeFilter(btn.key)}
            className="px-3 py-1 rounded text-xs font-semibold transition-colors"
            style={{
              background: typeFilter === btn.key ? '#FF9900' : '#f4f6f8',
              color: typeFilter === btn.key ? '#0f1111' : '#555555',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-bold mb-4">Aging Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={agingBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#767676' }} />
              <YAxis tick={{ fontSize: 11, fill: '#767676' }} />
              <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="debtor" name="Debtors" fill="#146eb4" />
              <Bar dataKey="creditor" name="Creditors" fill="#FF9900" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">Total Balances</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ background: '#e8f0fe' }}>
              <p className="text-xs font-semibold text-gray-600">Total Debtors</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#146eb4' }}>${totalByType.debtors.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: '#fff8e7' }}>
              <p className="text-xs font-semibold text-gray-600">Total Creditors</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#FF9900' }}>${totalByType.creditors.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="text-xs text-gray-600 mb-4">
          Showing {filteredData.length} of {data.length} accounts
        </div>
        <DataTable columns={columns} data={filteredData} sorting={sorting} onSortingChange={setSorting} />
      </Card>
    </div>
  );
}
