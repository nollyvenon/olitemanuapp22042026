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

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'invoice_date', desc: true }]);

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

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/invoices');
        const invoicesList = Array.isArray(data) ? data : data.data ?? [];
        setInvoices(invoicesList);
      } catch (error) {
        console.error('Failed to load invoices', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">
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
    </div>
  );
}
