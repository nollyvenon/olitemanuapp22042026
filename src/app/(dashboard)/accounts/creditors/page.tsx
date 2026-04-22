'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';

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

const CREDITORS: Creditor[] = [
  { id: '1', account_code: 'CRD-001', name: 'National Steel Corp',        contact: '+234 801 111 2222', payable: 842000,  overdue: 0,      next_due: '2026-05-15', status: 'active' },
  { id: '2', account_code: 'CRD-002', name: 'West Africa Chemicals Ltd',   contact: '+234 802 222 3333', payable: 312400,  overdue: 312400, next_due: '2026-04-01', status: 'suspended' },
  { id: '3', account_code: 'CRD-003', name: 'Premier Cement PLC',          contact: '+234 803 333 4444', payable: 198700,  overdue: 0,      next_due: '2026-05-20', status: 'active' },
  { id: '4', account_code: 'CRD-004', name: 'Copper Tech Industries',      contact: '+234 804 444 5555', payable: 94300,   overdue: 0,      next_due: '2026-05-10', status: 'active' },
  { id: '5', account_code: 'CRD-005', name: 'Global Aluminium Products',   contact: '+234 805 555 6666', payable: 261800,  overdue: 50000,  next_due: '2026-04-15', status: 'active' },
  { id: '6', account_code: 'CRD-006', name: 'Fastener World Nigeria',      contact: '+234 806 666 7777', payable: 44200,   overdue: 0,      next_due: '2026-05-30', status: 'active' },
  { id: '7', account_code: 'CRD-007', name: 'SafeCoat Paints Ltd',         contact: '+234 807 777 8888', payable: 38600,   overdue: 0,      next_due: '2026-06-01', status: 'active' },
];

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
  const [sorting, setSorting] = useState<SortingState>([{ id: 'overdue', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader title="Creditors" description="Supplier accounts payable and payment scheduling" />
      <DataTable columns={columns} data={CREDITORS} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
