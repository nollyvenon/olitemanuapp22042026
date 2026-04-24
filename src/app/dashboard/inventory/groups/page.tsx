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

interface ItemGroup {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
}

const columns: ColumnDef<ItemGroup>[] = [
  { accessorKey: 'category_name', header: 'Category',   cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',          header: 'Group Name', cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'description',   header: 'Description', cell: i => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
];

export default function GroupsPage() {
  const api = getApiClient();
  const [groups, setGroups] = useState<ItemGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', category_id: '', description: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const catsRes = await api.get('/stock/categories');
        const catsList = Array.isArray(catsRes.data) ? catsRes.data : catsRes.data.data ?? [];
        setCategories(catsList);

        // Extract groups from categories and add category name
        const allGroups: ItemGroup[] = [];
        catsList.forEach((cat: any) => {
          if (cat.groups && Array.isArray(cat.groups)) {
            allGroups.push(...cat.groups.map((g: any) => {
              console.log('[Groups] Group data:', { group: g, categoryName: cat.name, categoryId: cat.id });
              return { ...g, category_name: cat.name, category_id: cat.id };
            }));
          }
        });
        console.log('[Groups] Final groups:', allGroups);
        setGroups(allGroups);
      } catch (err) {
        console.error('Failed to load groups', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) return;
    setSubmitting(true);
    try {
      await api.post(`/stock/categories/${form.category_id}/groups`, { name: form.name, description: form.description });
      setOpen(false);
      setForm({ name: '', category_id: '', description: '' });
      const { data } = await api.get('/stock/categories');
      const catsList = Array.isArray(data) ? data : data.data ?? [];
      const allGroups: ItemGroup[] = [];
      catsList.forEach((cat: any) => {
        if (cat.groups && Array.isArray(cat.groups)) {
          allGroups.push(...cat.groups.map((g: any) => ({ ...g, category_name: cat.name, category_id: cat.id })));
        }
      });
      setGroups(allGroups);
    } catch (err) {
      console.error('Failed to create group', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Item Groups"
        description="Group inventory items for reporting and categorisation"
        actions={
          <PermissionGuard permission="inventory.products.create">
            <Button onClick={() => setOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Add Group</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={groups} sorting={sorting} onSortingChange={setSorting} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Category *</Label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full p-2 border rounded" required disabled={submitting}>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
