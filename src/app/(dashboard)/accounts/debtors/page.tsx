'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';

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

const DEBTORS: Debtor[] = [
  { id: '1',  account_code: 'DEB-001', name: 'Apex Steel Ltd',        contact: '+234 801 234 5678', credit_limit: 1000000, balance: 284500, overdue: 0,      last_payment: '2026-04-22', status: 'active' },
  { id: '2',  account_code: 'DEB-002', name: 'Ironclad Metals',        contact: '+234 802 345 6789', credit_limit: 800000,  balance: 341200, overdue: 341200, last_payment: '2026-03-01', status: 'suspended' },
  { id: '3',  account_code: 'DEB-003', name: 'Eurotech Components',    contact: '+234 803 456 7890', credit_limit: 500000,  balance: 219300, overdue: 219300, last_payment: '2026-03-15', status: 'suspended' },
  { id: '4',  account_code: 'DEB-004', name: 'Titan Fabrication Ltd',  contact: '+234 804 567 8901', credit_limit: 600000,  balance: 387500, overdue: 387500, last_payment: '2026-02-28', status: 'suspended' },
  { id: '5',  account_code: 'DEB-005', name: 'Nova Chemicals',         contact: '+234 805 678 9012', credit_limit: 300000,  balance: 91200,  overdue: 0,      last_payment: '2026-04-10', status: 'active' },
  { id: '6',  account_code: 'DEB-006', name: 'Fortis Polymers',        contact: '+234 806 789 0123', credit_limit: 400000,  balance: 156800, overdue: 0,      last_payment: '2026-04-15', status: 'active' },
  { id: '7',  account_code: 'DEB-007', name: 'Crestline Industries',   contact: '+234 807 890 1234', credit_limit: 750000,  balance: 256000, overdue: 0,      last_payment: '2026-04-21', status: 'active' },
  { id: '8',  account_code: 'DEB-008', name: 'Meridian Logistics',     contact: '+234 808 901 2345', credit_limit: 600000,  balance: 0,      overdue: 0,      last_payment: '2026-04-22', status: 'active' },
  { id: '9',  account_code: 'DEB-009', name: 'Delta Agro Supplies',    contact: '+234 809 012 3456', credit_limit: 200000,  balance: 142300, overdue: 0,      last_payment: '2026-04-08', status: 'active' },
  { id: '10', account_code: 'DEB-010', name: 'Pinnacle Exports',       contact: '+234 810 123 4567', credit_limit: 500000,  balance: 198400, overdue: 0,      last_payment: '2026-04-12', status: 'active' },
];

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
  const [sorting, setSorting] = useState<SortingState>([{ id: 'overdue', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader title="Debtors" description="Customer accounts receivable and credit management" />
      <DataTable
        columns={columns}
        data={DEBTORS}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/accounts/debtors/${row.id}`)}
      />
    </div>
  );
}
