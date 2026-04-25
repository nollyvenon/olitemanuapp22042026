'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';

interface SalesOrder {
  id: string;
  order_number: string;
  customer_name: string;
  order_date: string;
  items?: Array<{ id: string }>;
  total: number;
  status: string;
  form_status?: string;
}

const fmt = (v: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);

export default function SalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'order_date', desc: true }]);

  const exportCSV = () => {
    const headers = ['Order #', 'Customer', 'Date', 'Items', 'Total', 'Status'];
    const rows = orders.map(o => [o.order_number, o.customer_name, o.order_date, o.items?.length ?? 0, o.total, o.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/orders');
        const ordersList = Array.isArray(data) ? data : data.data ?? [];
        setOrders(ordersList);
      } catch (error) {
        console.error('Failed to load orders', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns: ColumnDef<SalesOrder>[] = [
    { accessorKey: 'order_number', header: 'Order #', cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
    { accessorKey: 'customer_name',     header: 'Customer',  cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
    { accessorKey: 'order_date',         header: 'Date',      cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
    { id: 'items', header: 'Items', cell: ({ row }) => <span className="tabular-nums">{row.original.items?.length ?? 0}</span> },
    { accessorKey: 'total',        header: 'Total',     cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
    { accessorKey: 'status',       header: 'Status',    cell: i => <StatusBadge status={String(i.getValue())} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Sales Orders"
          description="Manage and track all sales orders"
        />
        <div className="flex gap-2">
          {orders.length > 0 && (
            <Button onClick={exportCSV} variant="outline" className="text-xs">📥 Export CSV</Button>
          )}
          <PermissionGuard permission="sales.orders.create">
            <Button onClick={() => router.push('/dashboard/sales/orders/new')} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">
              + Create Order
            </Button>
          </PermissionGuard>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={orders}
        isLoading={loading}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/sales/orders/${row.id}`)}
      />
    </div>
  );
}
