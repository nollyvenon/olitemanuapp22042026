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
  items?: Array<{ id: string; product_name?: string }>;
  total: number;
  status: string;
  form_status?: string;
  creator?: {
    name: string;
    locations?: Array<{
      name: string;
      city?: string;
    }>;
  };
  customer?: {
    name: string;
    company?: string;
  };
}

const fmt = (v: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);

export default function SalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'order_date', desc: true }]);
  const [depots, setDepots] = useState<Array<{ name: string }>>([]);
  const [territories, setTerritories] = useState<Array<{ city: string }>>([]);
  const [filters, setFilters] = useState({
    depot: '',
    territory: '',
    item: '',
    dateFrom: '',
    dateTo: '',
  });

  const exportData = () => {
    const headers = ['Order #', 'Customer', 'Initiator', 'Depot', 'Territory', 'Date', 'Items', 'Total', 'Status'];
    const rows = orders.map(o => [
      o.order_number,
      o.customer?.name || o.customer_name,
      o.creator?.name ?? '-',
      o.creator?.locations?.[0]?.name ?? '-',
      o.creator?.locations?.[0]?.city ?? '-',
      new Date(o.order_date).toLocaleDateString('en-NG'),
      o.items?.length ?? 0,
      o.total,
      o.status
    ]);
    return { headers, rows };
  };

  const exportCSV = () => {
    const { headers, rows } = exportData();
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportExcel = async () => {
    const { headers, rows } = exportData();
    const api = getApiClient();
    try {
      const { data } = await api.post('/export/excel', {
        headers,
        rows,
        filename: `orders-${new Date().toISOString().split('T')[0]}.xlsx`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const exportPDF = async () => {
    const { headers, rows } = exportData();
    const api = getApiClient();
    try {
      const { data } = await api.post('/export/pdf', {
        headers,
        rows,
        title: 'Sales Orders Report',
        filename: `orders-${new Date().toISOString().split('T')[0]}.pdf`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/orders?include=creator,creator.locations,customer');
        let ordersList = Array.isArray(data) ? data : data.data ?? [];

        // Extract unique depots and territories
        const depotsSet = new Set<string>();
        const territoriesSet = new Set<string>();
        ordersList.forEach((o: SalesOrder) => {
          if (o.creator?.locations?.[0]?.name) depotsSet.add(o.creator.locations[0].name);
          if (o.creator?.locations?.[0]?.city) territoriesSet.add(o.creator.locations[0].city);
        });
        setDepots(Array.from(depotsSet).map(name => ({ name })));
        setTerritories(Array.from(territoriesSet).map(city => ({ city })));

        // Apply filters
        ordersList = applyFilters(ordersList);
        setOrders(ordersList);
      } catch (error) {
        console.error('Failed to load orders', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  const applyFilters = (ordersList: SalesOrder[]) => {
    return ordersList.filter(order => {
      if (filters.depot && order.creator?.locations?.[0]?.name !== filters.depot) return false;
      if (filters.territory && order.creator?.locations?.[0]?.city !== filters.territory) return false;
      if (filters.item && !order.items?.some(item => item.id?.toLowerCase().includes(filters.item.toLowerCase()))) return false;
      if (filters.dateFrom && new Date(order.order_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(order.order_date) > new Date(filters.dateTo)) return false;
      return true;
    });
  };

  const columns: ColumnDef<SalesOrder>[] = [
    { accessorKey: 'order_number', header: 'Order #', cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
    { id: 'customer', header: 'Customer', cell: ({ row }) => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{row.original.customer?.name || row.original.customer_name || '-'}</span> },
    { id: 'initiator', header: 'Initiator', cell: ({ row }) => <span className="text-sm" style={{ color: '#0f1111' }}>{row.original.creator?.name ?? '-'}</span> },
    { id: 'depot', header: 'Depot', cell: ({ row }) => <span className="text-xs" style={{ color: '#767676' }}>{row.original.creator?.locations?.[0]?.name ?? '-'}</span> },
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
          <PermissionGuard permission="sales.orders.export">
            {orders.length > 0 && (
              <div className="flex gap-1">
                <Button onClick={exportCSV} variant="outline" className="text-xs">📄 CSV</Button>
                <Button onClick={exportExcel} variant="outline" className="text-xs">📊 Excel</Button>
                <Button onClick={exportPDF} variant="outline" className="text-xs">📑 PDF</Button>
              </div>
            )}
          </PermissionGuard>
          <PermissionGuard permission="sales.orders.create">
            <Button onClick={() => router.push('/dashboard/sales/orders/new')} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">
              + Create Order
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-medium block mb-1">Depot</label>
            <select
              value={filters.depot}
              onChange={(e) => setFilters({ ...filters, depot: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="">All Depots</option>
              {depots.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Territory</label>
            <select
              value={filters.territory}
              onChange={(e) => setFilters({ ...filters, territory: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="">All Territories</option>
              {territories.map(t => (
                <option key={t.city} value={t.city}>{t.city || 'Unknown'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Item Search</label>
            <input
              type="text"
              placeholder="Search items..."
              value={filters.item}
              onChange={(e) => setFilters({ ...filters, item: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>
        </div>
        <Button
          onClick={() => setFilters({ depot: '', territory: '', item: '', dateFrom: '', dateTo: '' })}
          variant="outline"
          className="text-xs"
        >
          Clear Filters
        </Button>
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
