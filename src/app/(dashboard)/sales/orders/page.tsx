'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface SalesOrder {
  id: string;
  order_number: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: string;
}

const ORDERS: SalesOrder[] = [
  { id: '1',  order_number: 'ORD-00241', customer: 'Apex Steel Ltd',        date: '2026-04-22', items: 8,  total: 284500,  status: 'approved' },
  { id: '2',  order_number: 'ORD-00240', customer: 'Nova Chemicals',         date: '2026-04-22', items: 4,  total: 91200,   status: 'pending' },
  { id: '3',  order_number: 'ORD-00239', customer: 'Crestline Industries',   date: '2026-04-21', items: 12, total: 512000,  status: 'approved' },
  { id: '4',  order_number: 'ORD-00238', customer: 'Greenfield Agro',        date: '2026-04-21', items: 3,  total: 37800,   status: 'rejected' },
  { id: '5',  order_number: 'ORD-00237', customer: 'Pinnacle Exports',       date: '2026-04-20', items: 6,  total: 198400,  status: 'processing' },
  { id: '6',  order_number: 'ORD-00236', customer: 'BlueTech Fabricators',   date: '2026-04-20', items: 5,  total: 64300,   status: 'submitted' },
  { id: '7',  order_number: 'ORD-00235', customer: 'Meridian Logistics',     date: '2026-04-19', items: 9,  total: 430700,  status: 'approved' },
  { id: '8',  order_number: 'ORD-00234', customer: 'Sunridge Mining Co',     date: '2026-04-19', items: 2,  total: 22100,   status: 'cancelled' },
  { id: '9',  order_number: 'ORD-00233', customer: 'Fortis Polymers',        date: '2026-04-18', items: 7,  total: 156800,  status: 'approved' },
  { id: '10', order_number: 'ORD-00232', customer: 'Delta Agro Supplies',    date: '2026-04-18', items: 4,  total: 78500,   status: 'draft' },
  { id: '11', order_number: 'ORD-00231', customer: 'Ironclad Metals',        date: '2026-04-17', items: 11, total: 341200,  status: 'approved' },
  { id: '12', order_number: 'ORD-00230', customer: 'Pacific Fibre Co',       date: '2026-04-17', items: 3,  total: 44600,   status: 'submitted' },
  { id: '13', order_number: 'ORD-00229', customer: 'Eurotech Components',    date: '2026-04-16', items: 6,  total: 219300,  status: 'pending' },
  { id: '14', order_number: 'ORD-00228', customer: 'Vanguard Plastics',      date: '2026-04-16', items: 4,  total: 93700,   status: 'approved' },
  { id: '15', order_number: 'ORD-00227', customer: 'Titan Fabrication Ltd',  date: '2026-04-15', items: 8,  total: 387500,  status: 'processing' },
];

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

const columns: ColumnDef<SalesOrder>[] = [
  { accessorKey: 'order_number', header: 'Order #', cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'customer',     header: 'Customer',  cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'date',         header: 'Date',      cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'items',        header: 'Items',     cell: i => <span className="tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'total',        header: 'Total',     cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'status',       header: 'Status',    cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function SalesOrdersPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Manage and track all sales orders"
        actions={
          <PermissionGuard permission="sales.orders.create">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">
              + Create Order
            </Button>
          </PermissionGuard>
        }
      />
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
