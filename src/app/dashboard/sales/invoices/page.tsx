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
}

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
  const [formData, setFormData] = useState({
    order_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const api = getApiClient();

  const exportCSV = () => {
    const headers = ['Invoice #', 'Customer', 'Issue Date', 'Due Date', 'Total', 'Status'];
    const rows = invoices.map(i => [i.invoice_number, i.customer_name, fmtDate(i.invoice_date), fmtDate(i.due_date), i.total, i.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
          api.get('/invoices'),
          api.get('/orders?status=AUTHORIZED'),
        ]);
        const invoicesList = Array.isArray(invoicesRes.data) ? invoicesRes.data : invoicesRes.data.data ?? [];
        const ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.data ?? [];
        setInvoices(invoicesList);
        setOrders(ordersList.filter((o: any) => o.status === 'AUTHORIZED' && !o.invoice_id));
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'invoice_number', header: 'Invoice #',    cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
    { accessorKey: 'customer_name',       header: 'Customer',     cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
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
          {invoices.length > 0 && (
            <Button onClick={exportCSV} variant="outline" className="text-xs">📥 Export CSV</Button>
          )}
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
