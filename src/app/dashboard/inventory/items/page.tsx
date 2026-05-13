'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RowActions } from '@/components/shared/RowActions';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  group_id?: string;
  unit?: string;
  reorder_level?: number;
  unit_cost?: number;
  is_active?: boolean;
}

interface ItemGroup {
  id: string;
  name: string;
}

interface StockCategoryTree {
  id: string;
  name: string;
  groups?: ItemGroup[];
}

const fmt = (v: number, decimals = 0) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);

const getColumns = (router: ReturnType<typeof useRouter>, onDelete: (id: string) => void): ColumnDef<InventoryItem>[] => [
  { accessorKey: 'sku', header: 'SKU', cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name', header: 'Item Name', cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'unit', header: 'Unit', cell: i => <span className="text-xs">{String(i.getValue() || '-')}</span> },
  { accessorKey: 'reorder_level', header: 'Reorder Lvl', cell: i => <span className="tabular-nums text-sm">{String(i.getValue() || '-')}</span> },
  { accessorKey: 'unit_cost', header: 'Unit Cost', cell: i => <span className="tabular-nums text-sm">{fmt(Number(i.getValue()) || 0, 2)}</span> },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <RowActions
        id={row.original.id}
        detailPath={`/dashboard/inventory/items/${row.original.id}`}
        viewPermission="inventory.items.view"
        editPermission="inventory.items.edit"
        deletePermission="inventory.items.delete"
        onDelete={() => onDelete(row.original.id)}
      />
    ),
  },
];

export default function InventoryItemsPage() {
  const router = useRouter();
  const api = getApiClient();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<StockCategoryTree[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'new' | 'adjust'>('new');
  const [editItemId, setEditItemId] = useState('');
  const [formData, setFormData] = useState({ category_id: '', group_id: '', sku: '', name: '', unit: '', unit_cost: '', reorder_level: '' });

  const groupsInCat = categories.find((c) => c.id === formData.category_id)?.groups ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/stock/items/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [itemsRes, catsRes] = await Promise.all([
          api.get('/stock/items'),
          api.get('/stock/categories'),
        ]);
        const itemsList = Array.isArray(itemsRes.data) ? itemsRes.data : itemsRes.data.data ?? [];
        setItems(itemsList);
        // Extract groups from categories or use categories directly as groups
        const catsData = Array.isArray(catsRes.data) ? catsRes.data : catsRes.data.data ?? [];
        setCategories(catsData as StockCategoryTree[]);
      } catch (err) {
        console.error('Failed to load items', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const hydrateItem = (itemId: string) => {
    if (!itemId) {
      setEditItemId('');
      setFormData({ category_id: '', group_id: '', sku: '', name: '', unit: '', unit_cost: '', reorder_level: '' });
      return;
    }
    const row = items.find((x) => x.id === itemId);
    if (!row?.group_id) return;
    let catId = '';
    categories.forEach((c) => {
      if (c.groups?.some((g) => g.id === row.group_id)) catId = c.id;
    });
    setEditItemId(itemId);
    setFormData({
      category_id: catId,
      group_id: row.group_id || '',
      sku: row.sku,
      name: row.name,
      unit: row.unit || '',
      unit_cost: row.unit_cost != null ? String(row.unit_cost) : '',
      reorder_level: row.reorder_level != null ? String(row.reorder_level) : '',
    });
  };

  const openCreate = () => {
    setMode('new');
    setEditItemId('');
    setFormData({ category_id: '', group_id: '', sku: '', name: '', unit: '', unit_cost: '', reorder_level: '' });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'adjust' && editItemId) {
        await api.patch(`/stock/items/${editItemId}`, {
          group_id: formData.group_id,
          name: formData.name,
          unit: formData.unit,
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
          reorder_level: formData.reorder_level ? parseFloat(formData.reorder_level) : null,
        });
      } else {
        await api.post('/stock/items', {
          group_id: formData.group_id,
          sku: formData.sku,
          name: formData.name,
          unit: formData.unit,
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
          reorder_level: formData.reorder_level ? parseFloat(formData.reorder_level) : null,
        });
      }
      setOpen(false);
      setMode('new');
      setEditItemId('');
      setFormData({ category_id: '', group_id: '', sku: '', name: '', unit: '', unit_cost: '', reorder_level: '' });
      const { data } = await api.get('/stock/items');
      const itemsList = Array.isArray(data) ? data : data.data ?? [];
      setItems(itemsList);
    } catch (err) {
      console.error('Failed to save item', err);
    } finally {
      setSubmitting(false);
    }
  };

  const exportData = () => {
    const headers = ['SKU', 'Item Name', 'Unit', 'Reorder Level', 'Unit Cost'];
    const rows = items.map(i => [i.sku, i.name, i.unit || '-', i.reorder_level || '-', i.unit_cost || 0]);
    return { headers, rows };
  };

  const exportCSV = () => {
    const { headers, rows } = exportData();
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `items-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportExcel = async () => {
    const { headers, rows } = exportData();
    try {
      const response = await api.post('/export/excel', {
        headers,
        rows,
        filename: `items-${new Date().toISOString().split('T')[0]}.xlsx`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `items-${new Date().toISOString().split('T')[0]}.xlsx`;
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
        title: 'Inventory Items Report',
        filename: `items-${new Date().toISOString().split('T')[0]}.pdf`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `items-${new Date().toISOString().split('T')[0]}.pdf`;
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
      <div className="flex items-center justify-between">
        <PageHeader title="Stock Items" description="Subset of stock group; pick category then group." />
        <div className="flex gap-2">
          <PermissionGuard permission="inventory.items.export">
            {items.length > 0 && (
              <div className="flex gap-1">
                <Button onClick={exportCSV} variant="outline" className="text-xs">📄 CSV</Button>
                <Button onClick={exportExcel} variant="outline" className="text-xs">📊 Excel</Button>
                <Button onClick={exportPDF} variant="outline" className="text-xs">📑 PDF</Button>
              </div>
            )}
          </PermissionGuard>
          <PermissionGuard permission="inventory.products.create">
            <Button onClick={openCreate} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">
              Create Stock Item
            </Button>
          </PermissionGuard>
        </div>
      </div>
      <DataTable
        columns={getColumns(router, handleDelete)}
        data={items}
        sorting={sorting}
        onSortingChange={setSorting}
      />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setMode('new'); setEditItemId(''); setFormData({ category_id: '', group_id: '', sku: '', name: '', unit: '', unit_cost: '', reorder_level: '' }); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Stock Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 text-sm flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={mode === 'new'} onChange={() => { setMode('new'); setEditItemId(''); setFormData((f) => ({ ...f, sku: '', name: '', unit: '', unit_cost: '', reorder_level: '' })); }} />
                New item
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={mode === 'adjust'} onChange={() => setMode('adjust')} />
                Adjust existing
              </label>
            </div>
            {mode === 'adjust' && (
              <div>
                <Label>Item</Label>
                <select className="mt-1 w-full border rounded p-2 text-sm" value={editItemId} required onChange={(e) => hydrateItem(e.target.value)}>
                  <option value="">Select…</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.sku} — {it.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>Stock category *</Label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value, group_id: '' })}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
                disabled={submitting}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Stock group *</Label>
              <select
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
                disabled={submitting || !formData.category_id}
              >
                <option value="">Select group</option>
                {groupsInCat.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required={mode === 'new'}
                disabled={submitting || mode === 'adjust'}
              />
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div>
              <Label>Unit Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div>
              <Label>Reorder Level</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                disabled={submitting}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || (mode === 'adjust' && !editItemId)}>
                {submitting ? 'Saving…' : mode === 'adjust' ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
