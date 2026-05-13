'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getApiClient } from '@/lib/api-client';
import { Trash2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface PriceCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

const columns: ColumnDef<PriceCategory>[] = [
  { accessorKey: 'name', header: 'Name', cell: i => <span className="font-medium">{String(i.getValue())}</span> },
  { accessorKey: 'description', header: 'Description', cell: i => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
  { accessorKey: 'is_active', header: 'Active', cell: i => <span className="text-sm">{i.getValue() ? 'Yes' : 'No'}</span> },
];

export default function PriceCategoriesPage() {
  const api = getApiClient();
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PriceCategory | null>(null);
  const [form, setForm] = useState({ name: '', description: '', is_active: true });
  const { canAny } = usePermission();
  const canEdit = canAny(['accounts.price_categories.override', 'admin.*']);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/price-categories');
        const list = Array.isArray(data) ? data : (data as { data?: PriceCategory[] }).data ?? [];
        setCategories(list);
      } catch (err) {
        console.error('Failed to load price categories', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/price-categories', form);
      const { data } = await api.get('/price-categories');
      const list = Array.isArray(data) ? data : (data as { data?: PriceCategory[] }).data ?? [];
      setCategories(list);
      setOpenAdd(false);
      setForm({ name: '', description: '', is_active: true });
    } catch (err: any) {
      alert('❌ Failed to create price category: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      console.error('Failed to create price category', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setSubmitting(true);
    try {
      await api.patch(`/price-categories/${selectedCategory.id}`, form);
      const { data } = await api.get('/price-categories');
      const list = Array.isArray(data) ? data : (data as { data?: PriceCategory[] }).data ?? [];
      setCategories(list);
      setOpenEdit(false);
      setSelectedCategory(null);
      setForm({ name: '', description: '', is_active: true });
    } catch (err: any) {
      alert('❌ Failed to update price category: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      console.error('Failed to update price category', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price category?')) return;
    try {
      await api.delete(`/price-categories/${id}`);
      const { data } = await api.get('/price-categories');
      const list = Array.isArray(data) ? data : (data as { data?: PriceCategory[] }).data ?? [];
      setCategories(list);
    } catch (err: any) {
      alert('❌ Failed to delete price category: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      console.error('Failed to delete price category', err);
    }
  };

  const openEditDialog = (category: PriceCategory) => {
    setSelectedCategory(category);
    setForm({ name: category.name, description: category.description || '', is_active: category.is_active });
    setOpenEdit(true);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Price Categories"
          description="Manage price categories for ledgers. Only users with override/adjust privilege can edit."
        />
        <PermissionGuard permission="accounts.price_categories.create">
          <Button onClick={() => setOpenAdd(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold">
            + Add Price Category
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        columns={[
          ...columns,
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <div className="flex gap-2">
                <Button onClick={() => openEditDialog(row.original)} size="sm" variant="outline" disabled={!canEdit}>Edit</Button>
                <Button onClick={() => handleDelete(row.original.id)} size="sm" variant="ghost" disabled={!canEdit}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ),
          },
        ]}
        data={categories}
      />

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Price Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={submitting || !canEdit} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={submitting || !canEdit} />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                disabled={submitting || !canEdit}
              />
              <Label htmlFor="is_active">Is Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAdd(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting || !canEdit}>
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Price Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={submitting || !canEdit} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={submitting || !canEdit} />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                disabled={submitting || !canEdit}
              />
              <Label htmlFor="is_active">Is Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting || !canEdit}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}