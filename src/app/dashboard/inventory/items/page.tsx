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

const fmt = (v: number, decimals = 0) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);

const exportCSVItems = (items: InventoryItem[]) => {
  const headers = ['SKU', 'Item Name', 'Unit', 'Reorder Level', 'Unit Cost'];
  const rows = items.map(i => [i.sku, i.name, i.unit || '', i.reorder_level || '', fmt(i.unit_cost || 0, 2)]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `items-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

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
  const [groups, setGroups] = useState<ItemGroup[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ group_id: '', sku: '', name: '', unit: '', unit_cost: '', reorder_level: '' });

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
        const allGroups: ItemGroup[] = [];
        catsData.forEach((cat: any) => {
          if (cat.groups && Array.isArray(cat.groups)) {
            allGroups.push(...cat.groups);
          } else {
            // If category doesn't have groups, add it as a group itself
            allGroups.push({ id: cat.id, name: cat.name });
          }
        });
        setGroups(allGroups);
      } catch (err) {
        console.error('Failed to load items', err);
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
      await api.post('/stock/items', {
        group_id: formData.group_id,
        sku: formData.sku,
        name: formData.name,
        unit: formData.unit,
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
        reorder_level: formData.reorder_level ? parseFloat(formData.reorder_level) : null,
      });
      setOpen(false);
      setFormData({ group_id: '', sku: '', name: '', unit: '', unit_cost: '', reorder_level: '' });
      const { data } = await api.get('/stock/items');
      const itemsList = Array.isArray(data) ? data : data.data ?? [];
      setItems(itemsList);
    } catch (err) {
      console.error('Failed to create item', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Inventory Items"
          description="Manage stock levels, costs, and reorder points"
        />
        <div className="flex gap-2">
          {items.length > 0 && (
            <Button onClick={() => exportCSVItems(items)} variant="outline" className="text-xs">📥 Export CSV</Button>
          )}
          <Button
            onClick={() => setOpen(true)}
            style={{ background: '#FF9900', color: '#0f1111' }}
            className="font-semibold hover:opacity-90"
          >
            + Add Item
          </Button>
        </div>
      </div>
      <DataTable
        columns={getColumns(router, handleDelete)}
        data={items}
        sorting={sorting}
        onSortingChange={setSorting}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Group *</Label>
              <select
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={submitting}
              >
                <option value="">Select a group</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                disabled={submitting}
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
