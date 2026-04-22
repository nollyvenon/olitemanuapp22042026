'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';

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

const DATA: AgingRow[] = [
  { id: '1',  account: 'DEB-002', name: 'Ironclad Metals',       type: 'Debtor',   current: 0,      days_30: 0,      days_60: 341200, days_90: 0,     days_90_plus: 0,     total: 341200 },
  { id: '2',  account: 'DEB-003', name: 'Eurotech Components',   type: 'Debtor',   current: 0,      days_30: 0,      days_60: 219300, days_90: 0,     days_90_plus: 0,     total: 219300 },
  { id: '3',  account: 'DEB-004', name: 'Titan Fabrication Ltd', type: 'Debtor',   current: 0,      days_30: 0,      days_60: 0,      days_90: 0,     days_90_plus: 387500,total: 387500 },
  { id: '4',  account: 'DEB-001', name: 'Apex Steel Ltd',        type: 'Debtor',   current: 284500, days_30: 0,      days_60: 0,      days_90: 0,     days_90_plus: 0,     total: 284500 },
  { id: '5',  account: 'DEB-005', name: 'Nova Chemicals',        type: 'Debtor',   current: 91200,  days_30: 0,      days_60: 0,      days_90: 0,     days_90_plus: 0,     total: 91200 },
  { id: '6',  account: 'DEB-009', name: 'Delta Agro Supplies',   type: 'Debtor',   current: 142300, days_30: 0,      days_60: 0,      days_90: 0,     days_90_plus: 0,     total: 142300 },
  { id: '7',  account: 'CRD-002', name: 'West Africa Chemicals', type: 'Creditor', current: 0,      days_30: 312400, days_60: 0,      days_90: 0,     days_90_plus: 0,     total: 312400 },
  { id: '8',  account: 'CRD-005', name: 'Global Aluminium',      type: 'Creditor', current: 211800, days_30: 50000,  days_60: 0,      days_90: 0,     days_90_plus: 0,     total: 261800 },
  { id: '9',  account: 'CRD-001', name: 'National Steel Corp',   type: 'Creditor', current: 842000, days_30: 0,      days_60: 0,      days_90: 0,     days_90_plus: 0,     total: 842000 },
];

const fmt = (v: number) => v === 0 ? <span style={{ color: '#d5d9d9' }}>—</span> : <span className="tabular-nums">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v)}</span>;

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
  { accessorKey: 'total',        header: 'Total',      cell: i => <span className="font-bold tabular-nums">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(i.getValue() as number)}</span> },
];

export default function AgingReportPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'total', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader title="Aging Report" description="Outstanding debtor and creditor balances by aging bucket" />
      <DataTable columns={columns} data={DATA} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
