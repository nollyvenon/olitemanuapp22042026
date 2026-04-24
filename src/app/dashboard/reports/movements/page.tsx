'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/DataTable';
import { getApiClient } from '@/lib/api-client';

interface MovementReport {
  id: string;
  ref: string;
  item: string;
  type: string;
  store: string;
  qty_in: number;
  qty_out: number;
  balance: number;
  date: string;
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Receipt:    { bg: '#e8f8f5', color: '#067d62' },
  Issue:      { bg: '#fff8e7', color: '#c45500' },
  Transfer:   { bg: '#e8f0fe', color: '#146eb4' },
  Adjustment: { bg: '#f4f6f8', color: '#555555' },
};

const columns: ColumnDef<MovementReport>[] = [
  { accessorKey: 'ref',     header: 'Ref #',    cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'item',    header: 'Item',     cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: i => {
      const t = String(i.getValue());
      const s = TYPE_COLORS[t] ?? { bg: '#f4f6f8', color: '#555555' };
      return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={s}>{t}</span>;
    },
  },
  { accessorKey: 'store',   header: 'Store',    cell: i => <span className="text-xs" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'qty_in',  header: 'Qty In',   cell: i => <span className="font-bold tabular-nums" style={{ color: (i.getValue() as number) > 0 ? '#067d62' : '#767676' }}>{(i.getValue() as number) > 0 ? `+${(i.getValue() as number).toLocaleString()}` : '—'}</span> },
  { accessorKey: 'qty_out', header: 'Qty Out',  cell: i => <span className="font-bold tabular-nums" style={{ color: (i.getValue() as number) > 0 ? '#cc0c39' : '#767676' }}>{(i.getValue() as number) > 0 ? `-${(i.getValue() as number).toLocaleString()}` : '—'}</span> },
  { accessorKey: 'balance', header: 'Balance',  cell: i => <span className="font-bold tabular-nums">{(i.getValue() as number).toLocaleString()}</span> },
  { accessorKey: 'date',    header: 'Date',     cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
];

export default function MovementsReportPage() {
  const api = getApiClient();
  const [data, setData] = useState<MovementReport[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const exportCSV = () => {
    const headers = ['Ref', 'Item', 'Type', 'Store', 'Qty In', 'Qty Out', 'Balance', 'Date'];
    const rows = filteredData.map(m => [m.ref, m.item, m.type, m.store, m.qty_in, m.qty_out, m.balance, m.date]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movements-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredData = data.filter(m => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (searchTerm && !m.item.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/reports/movements');
        const list = Array.isArray(data) ? data : data.data ?? [];
        setData(list);
      } catch (err) {
        console.error('Failed to load movements report', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Stock Movements Report" description="All inventory in/out activity with running balances" />
        <button onClick={exportCSV} className="px-4 py-2 rounded text-sm font-medium" style={{ background: '#067d62', color: '#fff' }}>
          📥 Export CSV
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 rounded text-sm"
          style={{ border: '1px solid #d5d9d9', width: '250px' }}
        />
        <div className="flex gap-2">
          {['all', 'Receipt', 'Issue', 'Transfer', 'Adjustment'].map(btn => (
            <button
              key={btn}
              onClick={() => setTypeFilter(btn)}
              className="px-3 py-1 rounded text-xs font-semibold transition-colors capitalize"
              style={{
                background: typeFilter === btn ? '#FF9900' : '#f4f6f8',
                color: typeFilter === btn ? '#0f1111' : '#555555',
              }}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-4">
        <div className="text-xs text-gray-600 mb-4">
          Showing {filteredData.length} of {data.length} movements
        </div>
        <DataTable columns={columns} data={filteredData} sorting={sorting} onSortingChange={setSorting} />
      </Card>
    </div>
  );
}
