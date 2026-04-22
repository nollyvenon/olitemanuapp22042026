'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface OrderData {
  id: string;
  order_number: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: string;
}

const SAMPLE_ORDERS: OrderData[] = [
  {
    id: '1',
    order_number: 'ORD-001',
    customer: 'ABC Manufacturing',
    date: '2026-04-20',
    items: 5,
    total: 15000,
    status: 'approved',
  },
  {
    id: '2',
    order_number: 'ORD-002',
    customer: 'XYZ Industries',
    date: '2026-04-19',
    items: 3,
    total: 8500,
    status: 'submitted',
  },
  {
    id: '3',
    order_number: 'ORD-003',
    customer: 'Global Tech',
    date: '2026-04-18',
    items: 7,
    total: 22000,
    status: 'draft',
  },
];

const columns: ColumnDef<OrderData>[] = [
  {
    accessorKey: 'order_number',
    header: 'Order #',
    cell: (info) => <span className="font-medium">{String(info.getValue())}</span>,
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: 'items',
    header: 'Items',
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: (info) => `$${(info.getValue() as number).toLocaleString()}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue() as string} />,
  },
];

export default function SalesOrdersPage() {
  const [isLoading] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="View and manage all sales orders"
        actions={
          <PermissionGuard permission="sales.orders.create">
            <Button>Create Order</Button>
          </PermissionGuard>
        }
      />

      <DataTable
        columns={columns}
        data={SAMPLE_ORDERS}
        isLoading={isLoading}
        searchKey="order_number"
        searchPlaceholder="Search orders..."
      />
    </div>
  );
}
