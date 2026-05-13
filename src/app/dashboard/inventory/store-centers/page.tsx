'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';

interface Location {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  trade_linked?: boolean;
}

const emptyForm = { name: '', city: '', state: '', country: '' };

export default function StoreCentersPage() {
  const api = getApiClient();
  const [locations, setLocations] = useState<Location[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState<'new' | 'adjust'>('new');
  const [editId, setEditId] = useState('');

  const load = useCallback(async () => {
    const { data } = await api.get('/locations');
    const list = Array.isArray(data) ? data : data.data ?? [];
    setLocations(list);
  }, [api]);

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const openCreate = () => {
    setMode('new');
    setEditId('');
    setForm(emptyForm);
    setOpen(true);
  };

  const hydrateEdit = (id: string) => {
    if (!id) {
      setEditId('');
      setForm(emptyForm);
      return;
    }
    const L = locations.find((x) => x.id === id);
    if (!L) return;
    setEditId(id);
    setForm({ name: L.name, city: L.city ?? '', state: L.state ?? '', country: L.country ?? '' });
  };

  const openAdjustRow = (id: string) => {
    setMode('adjust');
    hydrateEdit(id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'adjust' && editId) await api.patch(`/locations/${editId}`, form);
      else await api.post('/locations', form);
      setOpen(false);
      setForm(emptyForm);
      setEditId('');
      setMode('new');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (row: Location) => {
    if (row.trade_linked) return;
    if (!confirm('Delete only if never linked to trade. OK?')) return;
    try {
      await api.delete(`/locations/${row.id}`);
      await load();
    } catch {
      alert('Delete blocked or failed');
    }
  };

  const exportData = () => {
    const headers = ['Name', 'City', 'State', 'Country'];
    const rows = locations.map((l) => [l.name, l.city || '-', l.state || '-', l.country || '-']);
    return { headers, rows };
  };

  const exportCSV = () => {
    const { headers, rows } = exportData();
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `store-centers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportExcel = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post(
        '/export/excel',
        { headers, rows, filename: `store-centers-${new Date().toISOString().split('T')[0]}.xlsx` },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `store-centers-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export Excel file. Please try again.');
    }
  };

  const exportPDF = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post(
        '/export/pdf',
        { headers, rows, title: 'Store Centers Report', filename: `store-centers-${new Date().toISOString().split('T')[0]}.pdf` },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `store-centers-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export PDF file. Please try again.');
    }
  };

  const columns: ColumnDef<Location>[] = [
    { accessorKey: 'name', header: 'Name', cell: (i) => <span className="font-medium text-sm">{String(i.getValue())}</span> },
    { accessorKey: 'city', header: 'City', cell: (i) => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
    { accessorKey: 'state', header: 'State', cell: (i) => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
    {
      id: 'act',
      header: '',
      cell: ({ row }) => (
        <PermissionGuard permissions={['accounts.ledger.read', 'inventory.products.create', 'admin.*']}>
          <div className="flex gap-2">
            <button type="button" className="text-xs text-blue-600" onClick={() => openAdjustRow(row.original.id)}>
              Adjust
            </button>
            <button type="button" className="text-xs text-red-600 disabled:opacity-40" disabled={!!row.original.trade_linked} onClick={() => del(row.original)}>
              Delete
            </button>
          </div>
        </PermissionGuard>
      ),
    },
  ];

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Centers"
        description="Stock Center: locations tied to inventory categories and groups. Centers not linked to trade may be deleted."
        actions={
          <div className="flex gap-2">
            <PermissionGuard permission="inventory.locations.export">
              {locations.length > 0 && (
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
            <PermissionGuard permissions={['accounts.ledger.read', 'inventory.products.create', 'admin.*']}>
              <Button onClick={openCreate} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold">
                Create Store Center
              </Button>
            </PermissionGuard>
          </div>
        }
      />
      <DataTable columns={columns} data={locations} sorting={sorting} onSortingChange={setSorting} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Store Center</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={mode === 'new'} onChange={() => { setMode('new'); setEditId(''); setForm(emptyForm); }} />
                New center
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={mode === 'adjust'} onChange={() => setMode('adjust')} />
                Adjust existing
              </label>
            </div>
            {mode === 'adjust' && (
              <div>
                <Label>Store center</Label>
                <select className="mt-1 w-full border rounded p-2 text-sm" value={editId} required onChange={(e) => hydrateEdit(e.target.value)}>
                  <option value="">Select…</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={submitting} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} disabled={submitting} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || (mode === 'adjust' && !editId)}>
                {submitting ? 'Saving…' : mode === 'adjust' ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
