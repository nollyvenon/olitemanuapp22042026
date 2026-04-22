'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';

interface ApprovedOrder {
  id: string;
  order_number: string;
  customer: string;
  approved_by: string;
  approved_date: string;
  items: number;
  total: number;
  invoiced: boolean;
}

const ORDERS: ApprovedOrder[] = [
  { id: '1',  order_number: 'ORD-00241', customer: 'Apex Steel Ltd',       approved_by: 'James Okafor',  approved_date: '2026-04-22', items: 8,  total: 284500, invoiced: true },
  { id: '2',  order_number: 'ORD-00239', customer: 'Crestline Industries', approved_by: 'Sarah Mensah',  approved_date: '2026-04-21', items: 12, total: 512000, invoiced: true },
  { id: '3',  order_number: 'ORD-00235', customer: 'Meridian Logistics',   approved_by: 'James Okafor',  approved_date: '2026-04-19', items: 9,  total: 430700, invoiced: true },
  { id: '4',  order_number: 'ORD-00233', customer: 'Fortis Polymers',      approved_by: 'Emeka Bello',   approved_date: '2026-04-18', items: 7,  total: 156800, invoiced: false },
  { id: '5',  order_number: 'ORD-00231', customer: 'Ironclad Metals',      approved_by: 'Sarah Mensah',  approved_date: '2026-04-17', items: 11, total: 341200, invoiced: true },
  { id: '6',  order_number: 'ORD-00228', customer: 'Vanguard Plastics',    approved_by: 'Emeka Bello',   approved_date: '2026-04-16', items: 4,  total: 93700,  invoiced: true },
  { id: '7',  order_number: 'ORD-00224', customer: 'Delta Agro Supplies',  approved_by: 'James Okafor',  approved_date: '2026-04-14', items: 5,  total: 142300, invoiced: false },
  { id: '8',  order_number: 'ORD-00221', customer: 'Zenith Rubber Co',     approved_by: 'Sarah Mensah',  approved_date: '2026-04-12', items: 6,  total: 98700,  invoiced: false },
];

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

const columns: ColumnDef<ApprovedOrder>[] = [
  { accessorKey: 'order_number',  header: 'Order #',        cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'customer',      header: 'Customer',       cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'approved_by',   header: 'Approved By',    cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'approved_date', header: 'Approved Date',  cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'items',         header: 'Items',          cell: i => <span className="tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'total',         header: 'Total',          cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'invoiced',      header: 'Invoiced',       cell: i => <StatusBadge status={i.getValue() ? 'paid' : 'pending'} label={i.getValue() ? 'Invoiced' : 'Not Invoiced'} /> },
];

export default function ApprovedOrdersPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'approved_date', desc: true }]);

  return (
    <div className="space-y-6">
      <PageHeader title="Approved Orders" description="All orders that have been approved and are ready for invoicing" />
      <DataTable
        columns={columns}
        data={ORDERS}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/sales/orders/${row.id}`)}
      />
    </div>
  );
}
