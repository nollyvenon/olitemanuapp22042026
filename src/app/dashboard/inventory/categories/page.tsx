'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';

interface StockGroup {
  id: string;
  name: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  groups?: StockGroup[];
}

const columns: ColumnDef<Category>[] = [
  { accessorKey: 'name', header: 'Name', cell: i => <span className="font-medium text-sm">{String(i.getValue())}</span> },
  { accessorKey: 'description', header: 'Description', cell: i => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
  {
    id: 'groups',
    header: 'Groups',
    cell: i => {
      const cat = i.row.original;
      return <span className="text-sm">{cat.groups?.length || 0} groups</span>;
    }
  },
];

export default function CategoriesPage() {
  const api = getApiClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/stock/categories');
        const list = Array.isArray(data) ? data : data.data ?? [];
        setCategories(list);
      } catch (err) {
        console.error('Failed to load categories', err);
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
      await api.post('/stock/categories', form);
      setOpen(false);
      setForm({ name: '', description: '' });
      const { data } = await api.get('/stock/categories');
      const list = Array.isArray(data) ? data : data.data ?? [];
      setCategories(list);
    } catch (err) {
      console.error('Failed to create category', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Categories"
        description="Organise inventory items by category"
        actions={
          <PermissionGuard permission="inventory.products.create">
            <Button onClick={() => setOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold">
              + Add Category
            </Button>
          </PermissionGuard>
        }
      />

      <div className="border rounded-lg overflow-hidden">
        {categories.map(cat => (
          <div key={cat.id}>
            <div
              className="flex items-center gap-3 p-4 border-b bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {cat.groups && cat.groups.length > 0 && (
                  expandedId === cat.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{cat.name}</p>
                <p className="text-xs text-gray-600">{cat.description || '—'}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{cat.groups?.length || 0} groups</span>
            </div>

            {expandedId === cat.id && cat.groups && cat.groups.length > 0 && (
              <div className="bg-white">
                {cat.groups.map(group => (
                  <div key={group.id} className="flex items-center gap-3 p-4 pl-12 border-b text-sm hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium">{group.name}</p>
                      <p className="text-xs text-gray-600">{group.description || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
