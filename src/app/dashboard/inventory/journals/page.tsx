'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

const columns: ColumnDef<Journal>[] = [
  { accessorKey: 'ref',        header: 'Reference',   cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'type',       header: 'Type',        cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'store',      header: 'Store',       cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'date',       header: 'Date',        cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'items',      header: 'Lines',       cell: i => <span className="tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'total_qty',  header: 'Total Qty',   cell: i => <span className="font-bold tabular-nums">{(i.getValue() as number).toLocaleString()}</span> },
  { accessorKey: 'created_by', header: 'Created By',  cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'status',     header: 'Status',      cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function JournalsPage() {
  const api = getApiClient();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [journalType, setJournalType] = useState('add');
  const [form, setForm] = useState({ item_id: '', location_id: '', to_location_id: '', quantity: '', notes: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [jRes, iRes, lRes] = await Promise.all([
          api.get('/stock/journals'),
          api.get('/stock/items'),
          api.get('/locations'),
        ]);
        const journalsList = Array.isArray(jRes.data) ? jRes.data : jRes.data.data ?? [];
        setJournals(journalsList);
        const itemsList = Array.isArray(iRes.data) ? iRes.data : iRes.data.data ?? [];
        setItems(itemsList);
        const locationsList = Array.isArray(lRes.data) ? lRes.data : lRes.data.data ?? [];
        setLocations(locationsList);
      } catch (err) {
        console.error('Failed to load journals', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = journalType === 'add' ? '/stock/journals/add' : journalType === 'transfer' ? '/stock/journals/transfer' : '/stock/journals/remove';
      const payload = journalType === 'transfer'
        ? { item_id: form.item_id, from_location_id: form.location_id, to_location_id: form.to_location_id, quantity: parseInt(form.quantity), notes: form.notes }
        : { item_id: form.item_id, location_id: form.location_id, quantity: parseInt(form.quantity), notes: form.notes };
      await api.post(endpoint, payload);
      setOpen(false);
      setJournalType('add');
      setForm({ item_id: '', location_id: '', to_location_id: '', quantity: '', notes: '' });
      const { data } = await api.get('/stock/journals');
      const journalsList = Array.isArray(data) ? data : data.data ?? [];
      setJournals(journalsList);
    } catch (err) {
      console.error('Failed to create journal', err);
    } finally {
      setSubmitting(false);
    }
  };

  const exportData = () => {
    const headers = ['Reference', 'Type', 'Store', 'Date', 'Lines', 'Total Qty', 'Created By', 'Status'];
    const rows = journals.map(j => [
      j.ref,
      j.type,
      j.store,
      new Date(j.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }),
      j.items,
      j.total_qty,
      j.created_by,
      j.status
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
    a.download = `journals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportExcel = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post('/export/excel', {
        headers,
        rows,
        filename: `journals-${new Date().toISOString().split('T')[0]}.xlsx`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journals-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export Excel file. Please try again.');
      console.error('Export failed', error);
    }
  };

  const exportPDF = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post('/export/pdf', {
        headers,
        rows,
        title: 'Inventory Journals Report',
        filename: `journals-${new Date().toISOString().split('T')[0]}.pdf`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journals-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export PDF file. Please try again.');
      console.error('Export failed', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Journals"
        description="Stock receipts, issues, transfers and adjustments"
        actions={
          <div className="flex gap-2">
            <PermissionGuard permission="inventory.journals.export">
              {journals.length > 0 && (
                <div className="flex gap-1">
                  <Button onClick={exportCSV} variant="outline" className="text-xs">📄 CSV</Button>
                  <Button onClick={exportExcel} variant="outline" className="text-xs">📊 Excel</Button>
                  <Button onClick={exportPDF} variant="outline" className="text-xs">📑 PDF</Button>
                </div>
              )}
            </PermissionGuard>
            <PermissionGuard permission="inventory.stock.movement">
              <Button onClick={() => setOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ New Journal</Button>
            </PermissionGuard>
          </div>
        }
      />
      <DataTable columns={columns} data={journals} sorting={sorting} onSortingChange={setSorting} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Stock Movement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Movement Type *</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2"><input type="radio" value="add" checked={journalType === 'add'} onChange={(e) => setJournalType(e.target.value)} disabled={submitting} /> Receipt</label>
                <label className="flex items-center gap-2"><input type="radio" value="transfer" checked={journalType === 'transfer'} onChange={(e) => setJournalType(e.target.value)} disabled={submitting} /> Transfer</label>
                <label className="flex items-center gap-2"><input type="radio" value="remove" checked={journalType === 'remove'} onChange={(e) => setJournalType(e.target.value)} disabled={submitting} /> Issue</label>
              </div>
            </div>
            <div>
              <Label>Item *</Label>
              <select value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })} className="w-full p-2 border rounded" required disabled={submitting}>
                <option value="">Select item</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>)}
              </select>
            </div>
            <div>
              <Label>{journalType === 'transfer' ? 'From Location' : 'Location'} *</Label>
              <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className="w-full p-2 border rounded" required disabled={submitting}>
                <option value="">Select location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            {journalType === 'transfer' && (
              <div>
                <Label>To Location *</Label>
                <select value={form.to_location_id} onChange={(e) => setForm({ ...form, to_location_id: e.target.value })} className="w-full p-2 border rounded" required disabled={submitting}>
                  <option value="">Select location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <Label>Quantity *</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required disabled={submitting} />
            </div>
            <div>
              <Label>Notes</Label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} disabled={submitting} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" rows={3} placeholder="Add any notes..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
