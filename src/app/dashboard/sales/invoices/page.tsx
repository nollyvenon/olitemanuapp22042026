'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApiClient } from '@/lib/api-client';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  total: number;
  status: string;
  order?: {
    creator?: {
      name: string;
      locations?: Array<{ name: string; city?: string }>;
    };
  };
}

const fmt = (v: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });

interface Order {
  id: string;
  order_number: string;
  status: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'invoice_date', desc: true }]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [depots, setDepots] = useState<Array<{ name: string }>>([]);
  const [territories, setTerritories] = useState<Array<{ city: string }>>([]);
  const [filters, setFilters] = useState({
    depot: '',
    territory: '',
    dateFrom: '',
    dateTo: '',
  });
  const [formData, setFormData] = useState({
    order_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const api = getApiClient();

  const exportData = () => {
    const headers = ['Invoice #', 'Customer', 'Initiator', 'Depot', 'Territory', 'Issue Date', 'Due Date', 'Total', 'Status'];
    const rows = invoices.map(i => [
      i.invoice_number,
      i.customer_name,
      i.order?.creator?.name ?? '-',
      i.order?.creator?.locations?.[0]?.name ?? '-',
      i.order?.creator?.locations?.[0]?.city ?? '-',
      fmtDate(i.invoice_date),
      fmtDate(i.due_date),
      i.total,
      i.status
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
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportExcel = async () => {
    const { headers, rows } = exportData();
    try {
      const { data } = await api.post('/export/excel', {
        headers,
        rows,
        filename: `invoices-${new Date().toISOString().split('T')[0]}.xlsx`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const exportPDF = async () => {
    const { headers, rows } = exportData();
    try {
      const { data } = await api.post('/export/pdf', {
        headers,
        rows,
        title: 'Sales Invoices Report',
        filename: `invoices-${new Date().toISOString().split('T')[0]}.pdf`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.order_id) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/invoices', {
        order_id: formData.order_id,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
      });
      setInvoices([data, ...invoices]);
      setShowCreateDialog(false);
      setFormData({
        order_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to create invoice', error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [invoicesRes, ordersRes] = await Promise.all([
          api.get('/invoices?include=order,order.creator,order.creator.locations'),
          api.get('/orders?status=AUTHORIZED'),
        ]);
        let invoicesList = Array.isArray(invoicesRes.data) ? invoicesRes.data : invoicesRes.data.data ?? [];
        const ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.data ?? [];

        // Extract unique depots and territories
        const depotsSet = new Set<string>();
        const territoriesSet = new Set<string>();
        invoicesList.forEach(i => {
          if (i.order?.creator?.locations?.[0]?.name) depotsSet.add(i.order.creator.locations[0].name);
          if (i.order?.creator?.locations?.[0]?.city) territoriesSet.add(i.order.creator.locations[0].city);
        });
        setDepots(Array.from(depotsSet).map(name => ({ name })));
        setTerritories(Array.from(territoriesSet).map(city => ({ city })));

        // Apply filters
        invoicesList = applyFilters(invoicesList);
        setInvoices(invoicesList);
        setOrders(ordersList.filter((o: any) => o.status === 'AUTHORIZED' && !o.invoice_id));
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters, api]);

  const applyFilters = (invoicesList: Invoice[]) => {
    return invoicesList.filter(invoice => {
      if (filters.depot && invoice.order?.creator?.locations?.[0]?.name !== filters.depot) return false;
      if (filters.territory && invoice.order?.creator?.locations?.[0]?.city !== filters.territory) return false;
      if (filters.dateFrom && new Date(invoice.invoice_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(invoice.invoice_date) > new Date(filters.dateTo)) return false;
      return true;
    });
  };

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'invoice_number', header: 'Invoice #',    cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
    { accessorKey: 'customer_name',       header: 'Customer',     cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
    { id: 'initiator', header: 'Initiator', cell: ({ row }) => <span className="text-sm" style={{ color: '#0f1111' }}>{row.original.order?.creator?.name ?? '-'}</span> },
    { id: 'depot', header: 'Depot', cell: ({ row }) => <span className="text-xs" style={{ color: '#767676' }}>{row.original.order?.creator?.locations?.[0]?.name ?? '-'}</span> },
    { accessorKey: 'invoice_date',     header: 'Issue Date',   cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtDate(String(i.getValue()))}</span> },
    { accessorKey: 'due_date',       header: 'Due Date',     cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtDate(String(i.getValue()))}</span> },
    { accessorKey: 'total',         header: 'Total',       cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
    { accessorKey: 'status', header: 'Status', cell: i => <StatusBadge status={String(i.getValue())} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Sales Invoices"
          description="Track invoice payments and outstanding balances"
        />
        <div className="flex gap-2">
          <PermissionGuard permission="sales.invoices.export">
            {invoices.length > 0 && (
              <div className="flex gap-1">
                <Button onClick={exportCSV} variant="outline" className="text-xs">📄 CSV</Button>
                <Button onClick={exportExcel} variant="outline" className="text-xs">📊 Excel</Button>
                <Button onClick={exportPDF} variant="outline" className="text-xs">📑 PDF</Button>
              </div>
            )}
          </PermissionGuard>
          <PermissionGuard permission="sales.invoices.create">
            <Button
              onClick={() => setShowCreateDialog(true)}
              style={{ background: '#FF9900', color: '#0f1111' }}
              className="font-semibold hover:opacity-90"
            >
              + Create Invoice
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          onClick={() => setFilters({ depot: '', territory: '', dateFrom: '', dateTo: '' })}
          variant="outline"
          className="text-xs"
        >
          Clear Filters
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={loading}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/sales/invoices/${row.id}`)}
      />

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Authorized Order</label>
              <select
                value={formData.order_id}
                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select an order</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>{o.order_number}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Invoice Date</label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                onClick={() => setShowCreateDialog(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !formData.order_id}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
