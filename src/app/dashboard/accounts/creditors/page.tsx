'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { getApiClient } from '@/lib/api-client';

interface Creditor {
  id: string;
  account_code: string;
  name: string;
  contact: string;
  payable: number;
  overdue: number;
  next_due: string;
  status: string;
}

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

const columns: ColumnDef<Creditor>[] = [
  { accessorKey: 'account_code', header: 'Account #',  cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',         header: 'Supplier',   cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'contact',      header: 'Contact',    cell: i => <span className="text-xs" style={{ color: '#767676' }}>{String(i.getValue())}</span> },
  { accessorKey: 'payable',      header: 'Payable',    cell: i => <span className="font-bold tabular-nums" style={{ color: '#cc0c39' }}>{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'overdue',      header: 'Overdue',    cell: i => <span className="font-bold tabular-nums" style={{ color: (i.getValue() as number) > 0 ? '#cc0c39' : '#767676' }}>{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'next_due',     header: 'Next Due',   cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'status',       header: 'Status',     cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function CreditorsPage() {
  const api = getApiClient();
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'overdue', desc: true }]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/accounts/creditors');
        const list = Array.isArray(data) ? data : data.data ?? [];
        setCreditors(list);
      } catch (err) {
        console.error('Failed to load creditors', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const exportCSV = () => {
    const headers = ['Account #', 'Supplier', 'Contact', 'Payable', 'Overdue', 'Next Due', 'Status'];
    const rows = creditors.map(c => [c.account_code, c.name, c.contact, c.payable, c.overdue, c.next_due, c.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creditors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Creditors" description="Supplier accounts payable and payment scheduling" />
        {creditors.length > 0 && <Button onClick={exportCSV} variant="outline" className="text-xs">📥 Export CSV</Button>}
      </div>
      <DataTable columns={columns} data={creditors} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
