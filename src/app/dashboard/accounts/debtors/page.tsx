'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { getApiClient } from '@/lib/api-client';

interface Debtor {
  id: string;
  account_code: string;
  name: string;
  contact: string;
  credit_limit: number;
  balance: number;
  overdue: number;
  last_payment: string;
  status: string;
}

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

const columns: ColumnDef<Debtor>[] = [
  { accessorKey: 'account_code', header: 'Account #',     cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',         header: 'Customer',      cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'contact',      header: 'Contact',       cell: i => <span className="text-xs" style={{ color: '#767676' }}>{String(i.getValue())}</span> },
  { accessorKey: 'credit_limit', header: 'Credit Limit',  cell: i => <span className="tabular-nums text-sm">{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'balance',      header: 'Balance',       cell: i => <span className="font-bold tabular-nums" style={{ color: (i.getValue() as number) > 0 ? '#cc0c39' : '#067d62' }}>{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'overdue',      header: 'Overdue',       cell: i => <span className="font-bold tabular-nums" style={{ color: (i.getValue() as number) > 0 ? '#cc0c39' : '#767676' }}>{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'last_payment', header: 'Last Payment',  cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'status',       header: 'Status',        cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function DebtorsPage() {
  const router = useRouter();
  const api = getApiClient();
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'overdue', desc: true }]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/accounts/debtors');
        const list = Array.isArray(data) ? data : data.data ?? [];
        setDebtors(list);
      } catch (err) {
        console.error('Failed to load debtors', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const exportCSV = () => {
    const headers = ['Account #', 'Customer', 'Contact', 'Credit Limit', 'Balance', 'Overdue', 'Last Payment', 'Status'];
    const rows = debtors.map(d => [d.account_code, d.name, d.contact, d.credit_limit, d.balance, d.overdue, d.last_payment, d.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debtors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Debtors" description="Customer accounts receivable and credit management" />
        {debtors.length > 0 && <Button onClick={exportCSV} variant="outline" className="text-xs">📥 Export CSV</Button>}
      </div>
      <DataTable
        columns={columns}
        data={debtors}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/accounts/debtors/${row.id}`)}
      />
    </div>
  );
}
