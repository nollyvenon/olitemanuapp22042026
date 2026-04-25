'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface Voucher {
  id: string;
  voucher_number: string;
  type: string;
  party: string;
  date: string;
  amount: number;
  narration: string;
  created_by: string;
  status: string;
}

const VOUCHERS: Voucher[] = [
  { id: '1',  voucher_number: 'VCH-00391', type: 'Receipt',  party: 'Apex Steel Ltd',       date: '2026-04-22', amount: 284500, narration: 'Payment for INV-00184',         created_by: 'Emeka Bello',  status: 'posted' },
  { id: '2',  voucher_number: 'VCH-00390', type: 'Payment',  party: 'National Steel Corp',   date: '2026-04-22', amount: 150000, narration: 'Supplier payment April batch',   created_by: 'Sarah Mensah', status: 'posted' },
  { id: '3',  voucher_number: 'VCH-00389', type: 'Receipt',  party: 'Meridian Logistics',    date: '2026-04-21', amount: 430700, narration: 'Payment for INV-00181',         created_by: 'Emeka Bello',  status: 'posted' },
  { id: '4',  voucher_number: 'VCH-00388', type: 'Journal',  party: 'Internal',              date: '2026-04-21', amount: 48200,  narration: 'Depreciation April 2026',       created_by: 'James Okafor', status: 'posted' },
  { id: '5',  voucher_number: 'VCH-00387', type: 'Payment',  party: 'Premier Cement PLC',    date: '2026-04-20', amount: 98700,  narration: 'Cement supply Q2 advance',      created_by: 'Sarah Mensah', status: 'posted' },
  { id: '6',  voucher_number: 'VCH-00386', type: 'Receipt',  party: 'Vanguard Plastics',     date: '2026-04-19', amount: 93700,  narration: 'Payment for INV-00177',         created_by: 'Emeka Bello',  status: 'posted' },
  { id: '7',  voucher_number: 'VCH-00385', type: 'Journal',  party: 'Internal',              date: '2026-04-18', amount: 22400,  narration: 'Bad debt provision',            created_by: 'James Okafor', status: 'pending' },
  { id: '8',  voucher_number: 'VCH-00384', type: 'Payment',  party: 'Copper Tech Industries', date: '2026-04-17', amount: 62000,  narration: 'Wire supply March settlement',  created_by: 'Sarah Mensah', status: 'pending' },
];

const fmt = (v: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Receipt: { bg: '#e8f8f5', color: '#067d62' },
  Payment: { bg: '#fdecea', color: '#cc0c39' },
  Journal: { bg: '#e8f0fe', color: '#146eb4' },
};

const columns: ColumnDef<Voucher>[] = [
  { accessorKey: 'voucher_number', header: 'Voucher #',   cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: i => {
      const t = String(i.getValue());
      const s = TYPE_COLORS[t] ?? { bg: '#f4f6f8', color: '#555555' };
      return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={s}>{t}</span>;
    },
  },
  { accessorKey: 'party',      header: 'Party',       cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'date',       header: 'Date',        cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'amount',     header: 'Amount',      cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'narration',  header: 'Narration',   cell: i => <span className="text-xs truncate max-w-[200px] block" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'created_by', header: 'Created By',  cell: i => <span className="text-sm" style={{ color: '#767676' }}>{String(i.getValue())}</span> },
  { accessorKey: 'status',     header: 'Status',      cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function VouchersPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vouchers"
        description="Payment receipts, journals and financial transactions"
        actions={
          <PermissionGuard permission="accounts.voucher.create">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ New Voucher</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={VOUCHERS} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
