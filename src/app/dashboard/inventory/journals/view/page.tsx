'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';

interface Journal {
  id: string;
  ref: string;
  type: string;
  store: string;
  date: string;
  items: number;
  total_qty: number;
  created_by: string;
  status: string;
}

const columns: ColumnDef<Journal>[] = [
  { accessorKey: 'ref', header: 'Reference', cell: (i) => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'type', header: 'Type', cell: (i) => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'store', header: 'Store', cell: (i) => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'date', header: 'Date', cell: (i) => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'items', header: 'Lines', cell: (i) => <span className="tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'total_qty', header: 'Total Qty', cell: (i) => <span className="font-bold tabular-nums">{(i.getValue() as number).toLocaleString()}</span> },
  { accessorKey: 'created_by', header: 'Created By', cell: (i) => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'status', header: 'Status', cell: (i) => <StatusBadge status={String(i.getValue())} /> },
];

export default function ViewStockJournalPage() {
  const api = getApiClient();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const jRes = await api.get('/stock/journals');
        const d = jRes.data as { data?: Journal[] };
        const journalsList = Array.isArray(jRes.data) ? jRes.data : d?.data ?? [];
        setJournals(journalsList);
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  const exportData = () => {
    const headers = ['Reference', 'Type', 'Store', 'Date', 'Lines', 'Total Qty', 'Created By', 'Status'];
    const rows = journals.map((j) => [
      j.ref,
      j.type,
      j.store,
      new Date(j.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }),
      j.items,
      j.total_qty,
      j.created_by,
      j.status,
    ]);
    return { headers, rows };
  };

  const exportCSV = () => {
    const { headers, rows } = exportData();
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportExcel = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post('/export/excel', { headers, rows, filename: `journals-${new Date().toISOString().split('T')[0]}.xlsx` }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journals-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export Excel file.');
    }
  };

  const exportPDF = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post('/export/pdf', { headers, rows, title: 'Stock Journal Report', filename: `journals-${new Date().toISOString().split('T')[0]}.pdf` }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journals-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export PDF file.');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="View Stock Journal"
        description="Receipts, transfers, issues; stock also moves on authorized sales invoices."
        actions={
          <div className="flex gap-2 flex-wrap">
            <PermissionGuard permission="inventory.stock.movement">
              <Link href="/dashboard/inventory/journals/create">
                <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">
                  Create Stock Journal
                </Button>
              </Link>
            </PermissionGuard>
            <PermissionGuard permission="inventory.journals.export">
              {journals.length > 0 && (
                <div className="flex gap-1">
                  <Button onClick={exportCSV} variant="outline" className="text-xs">
                    📄 CSV
                  </Button>
                  <Button onClick={exportExcel} variant="outline" className="text-xs">
                    📊 Excel
                  </Button>
                  <Button onClick={exportPDF} variant="outline" className="text-xs">
                    📑 PDF
                  </Button>
                </div>
              )}
            </PermissionGuard>
          </div>
        }
      />
      <DataTable columns={columns} data={journals} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
