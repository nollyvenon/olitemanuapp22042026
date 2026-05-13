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

interface StockGroupRow {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
  groups?: { id: string; name: string; description?: string }[];
}

function flattenGroups(catsList: Category[]): StockGroupRow[] {
  const allGroups: StockGroupRow[] = [];
  catsList.forEach((cat) => {
    if (cat.groups && Array.isArray(cat.groups)) {
      cat.groups.forEach((g) => {
        allGroups.push({ ...g, category_name: cat.name, category_id: cat.id });
      });
    }
  });
  return allGroups;
}

export default function GroupsPage() {
  const api = getApiClient();
  const [groups, setGroups] = useState<StockGroupRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'new' | 'adjust'>('new');
  const [editGroupId, setEditGroupId] = useState('');
  const [routeCatId, setRouteCatId] = useState('');
  const [form, setForm] = useState({ category_id: '', name: '', description: '' });

  const reload = useCallback(async () => {
    const catsRes = await api.get('/stock/categories');
    const catsList = Array.isArray(catsRes.data) ? catsRes.data : catsRes.data.data ?? [];
    setCategories(catsList);
    setGroups(flattenGroups(catsList));
  }, [api]);

  useEffect(() => {
    void (async () => {
      try {
        await reload();
      } finally {
        setLoading(false);
      }
    })();
  }, [reload]);

  const hydrateGroup = (gid: string) => {
    if (!gid) {
      setEditGroupId('');
      setRouteCatId('');
      setForm({ category_id: '', name: '', description: '' });
      return;
    }
    const row = groups.find((g) => g.id === gid);
    if (!row?.category_id) return;
    setEditGroupId(gid);
    setRouteCatId(row.category_id);
    setForm({ category_id: row.category_id, name: row.name, description: row.description || '' });
  };

  const openCreate = () => {
    setMode('new');
    setEditGroupId('');
    setRouteCatId('');
    setForm({ category_id: '', name: '', description: '' });
    setOpen(true);
  };

  const openAdjustRow = (row: StockGroupRow) => {
    setMode('adjust');
    setEditGroupId(row.id);
    setRouteCatId(row.category_id || '');
    setForm({ category_id: row.category_id || '', name: row.name, description: row.description || '' });
    setOpen(true);
  };

  const saveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) return;
    setSubmitting(true);
    try {
      if (mode === 'adjust' && editGroupId && routeCatId) {
        await api.patch(`/stock/categories/${routeCatId}/groups/${editGroupId}`, {
          name: form.name,
          description: form.description || undefined,
          ...(form.category_id !== routeCatId ? { category_id: form.category_id } : {}),
        });
      } else {
        await api.post(`/stock/categories/${form.category_id}/groups`, { name: form.name, description: form.description });
      }
      setOpen(false);
      setMode('new');
      setEditGroupId('');
      setRouteCatId('');
      setForm({ category_id: '', name: '', description: '' });
      await reload();
    } catch (err) {
      console.error('Failed to save group', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: StockGroupRow) => {
    if (!row.category_id) return;
    if (!confirm('Delete group only if no items linked?')) return;
    try {
      await api.delete(`/stock/categories/${row.category_id}/groups/${row.id}`);
      setGroups(groups.filter((g) => g.id !== row.id));
    } catch {
      alert('Delete blocked or failed');
    }
  };

  const columns: ColumnDef<StockGroupRow>[] = [
    { accessorKey: 'category_name', header: 'Category', cell: (i) => <span className="text-sm text-gray-600">{String(i.getValue())}</span> },
    { accessorKey: 'name', header: 'Group', cell: (i) => <span className="font-medium text-sm">{String(i.getValue())}</span> },
    { accessorKey: 'description', header: 'Description', cell: (i) => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <PermissionGuard permission="inventory.groups.edit">
            <button type="button" className="text-xs text-blue-600" onClick={() => openAdjustRow(row.original)}>
              Adjust
            </button>
          </PermissionGuard>
          <PermissionGuard permission="inventory.groups.delete">
            <button type="button" className="text-xs text-red-600" onClick={() => handleDelete(row.original)}>
              Delete
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const exportData = () => {
    const headers = ['Category', 'Group Name', 'Description'];
    const rows = groups.map((g) => [g.category_name || '-', g.name, g.description || '-']);
    return { headers, rows };
  };

  const exportCSV = () => {
    const { headers, rows } = exportData();
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `groups-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportExcel = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post('/export/excel', { headers, rows, filename: `groups-${new Date().toISOString().split('T')[0]}.xlsx` }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `groups-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export Excel file.');
    }
  };

  const exportPDF = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post('/export/pdf', { headers, rows, title: 'Stock Groups Report', filename: `groups-${new Date().toISOString().split('T')[0]}.pdf` }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `groups-${new Date().toISOString().split('T')[0]}.pdf`;
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
        title="Stock Groups"
        description="Subset of a stock category; items belong to a group."
        actions={
          <div className="flex gap-2">
            <PermissionGuard permission="inventory.groups.export">
              {groups.length > 0 && (
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
            <PermissionGuard permission="inventory.products.create">
              <Button onClick={openCreate} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">
                Create Stock Group
              </Button>
            </PermissionGuard>
          </div>
        }
      />
      <DataTable columns={columns} data={groups} sorting={sorting} onSortingChange={setSorting} />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setMode('new'); setEditGroupId(''); setRouteCatId(''); setForm({ category_id: '', name: '', description: '' }); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Stock Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveGroup} className="space-y-4">
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={mode === 'new'} onChange={() => { setMode('new'); setEditGroupId(''); setRouteCatId(''); setForm((f) => ({ ...f, name: '', description: '' })); }} />
                New group
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={mode === 'adjust'} onChange={() => setMode('adjust')} />
                Adjust existing
              </label>
            </div>
            {mode === 'adjust' && (
              <div>
                <Label>Group</Label>
                <select className="mt-1 w-full border rounded p-2 text-sm" value={editGroupId} required onChange={(e) => hydrateGroup(e.target.value)}>
                  <option value="">Select…</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.category_name} — {g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>Stock category *</Label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full p-2 border rounded mt-1" required disabled={submitting}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={submitting} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={submitting} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || (mode === 'adjust' && (!editGroupId || !routeCatId))}>
                {submitting ? 'Saving…' : mode === 'adjust' ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
