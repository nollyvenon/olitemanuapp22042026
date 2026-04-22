'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface Invoice {
  id: string;
  invoice_number: string;
  customer: string;
  order_ref: string;
  issue_date: string;
  due_date: string;
  amount: number;
  paid: number;
  status: string;
}

const INVOICES: Invoice[] = [
  { id: '1',  invoice_number: 'INV-00184', customer: 'Apex Steel Ltd',       order_ref: 'ORD-00241', issue_date: '2026-04-22', due_date: '2026-05-22', amount: 284500, paid: 284500, status: 'paid' },
  { id: '2',  invoice_number: 'INV-00183', customer: 'Nova Chemicals',        order_ref: 'ORD-00240', issue_date: '2026-04-22', due_date: '2026-05-22', amount: 91200,  paid: 0,      status: 'pending' },
  { id: '3',  invoice_number: 'INV-00182', customer: 'Crestline Industries',  order_ref: 'ORD-00239', issue_date: '2026-04-21', due_date: '2026-05-21', amount: 512000, paid: 256000, status: 'processing' },
  { id: '4',  invoice_number: 'INV-00181', customer: 'Meridian Logistics',    order_ref: 'ORD-00235', issue_date: '2026-04-19', due_date: '2026-05-19', amount: 430700, paid: 430700, status: 'paid' },
  { id: '5',  invoice_number: 'INV-00180', customer: 'Fortis Polymers',       order_ref: 'ORD-00233', issue_date: '2026-04-18', due_date: '2026-05-18', amount: 156800, paid: 0,      status: 'pending' },
  { id: '6',  invoice_number: 'INV-00179', customer: 'Ironclad Metals',       order_ref: 'ORD-00231', issue_date: '2026-04-17', due_date: '2026-04-17', amount: 341200, paid: 0,      status: 'overdue' },
  { id: '7',  invoice_number: 'INV-00178', customer: 'Eurotech Components',   order_ref: 'ORD-00229', issue_date: '2026-04-16', due_date: '2026-04-16', amount: 219300, paid: 0,      status: 'overdue' },
  { id: '8',  invoice_number: 'INV-00177', customer: 'Vanguard Plastics',     order_ref: 'ORD-00228', issue_date: '2026-04-16', due_date: '2026-05-16', amount: 93700,  paid: 93700,  status: 'paid' },
  { id: '9',  invoice_number: 'INV-00176', customer: 'Titan Fabrication Ltd', order_ref: 'ORD-00227', issue_date: '2026-04-15', due_date: '2026-03-15', amount: 387500, paid: 0,      status: 'overdue' },
  { id: '10', invoice_number: 'INV-00175', customer: 'Pacific Fibre Co',      order_ref: 'ORD-00230', issue_date: '2026-04-17', due_date: '2026-05-17', amount: 44600,  paid: 44600,  status: 'paid' },
];

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const columns: ColumnDef<Invoice>[] = [
  { accessorKey: 'invoice_number', header: 'Invoice #',    cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'customer',       header: 'Customer',     cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'order_ref',      header: 'Order Ref',    cell: i => <span className="text-xs" style={{ color: '#767676' }}>{String(i.getValue())}</span> },
  { accessorKey: 'issue_date',     header: 'Issue Date',   cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtDate(String(i.getValue()))}</span> },
  { accessorKey: 'due_date',       header: 'Due Date',     cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtDate(String(i.getValue()))}</span> },
  { accessorKey: 'amount',         header: 'Amount',       cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
  {
    id: 'balance',
    header: 'Balance',
    cell: ({ row }) => {
      const bal = row.original.amount - row.original.paid;
      return <span className="font-semibold tabular-nums" style={{ color: bal > 0 ? '#cc0c39' : '#067d62' }}>{fmt(bal)}</span>;
    },
  },
  { accessorKey: 'status', header: 'Status', cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function InvoicesPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'issue_date', desc: true }]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Invoices"
        description="Track invoice payments and outstanding balances"
        actions={
          <PermissionGuard permission="sales.invoices.create">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">
              + Create Invoice
            </Button>
          </PermissionGuard>
        }
      />
      <DataTable
        columns={columns}
        data={INVOICES}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/sales/invoices/${row.id}`)}
      />
    </div>
  );
}
