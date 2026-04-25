'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { usePermission } from '@/hooks/usePermission';
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
  const { can } = usePermission();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/stock/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete category', err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description || '' });
    setOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    try {
      await api.patch(`/stock/categories/${editingId}`, form);
      setCategories(categories.map(c => c.id === editingId ? { ...c, ...form } : c));
      setOpen(false);
      setEditingId(null);
      setForm({ name: '', description: '' });
    } catch (err) {
      console.error('Failed to update category', err);
    } finally {
      setSubmitting(false);
    }
  };

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

  const exportData = () => {
    const headers = ['Name', 'Description', 'Groups Count'];
    const rows = categories.map(c => [c.name, c.description || '-', c.groups?.length || 0]);
    return { headers, rows };
  };

  const exportCSV = () => {
    const { headers, rows } = exportData();
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportExcel = async () => {
    const { headers, rows } = exportData();
    try {
      const { data } = await api.post('/export/excel', {
        headers,
        rows,
        filename: `categories-${new Date().toISOString().split('T')[0]}.xlsx`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `categories-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const exportPDF = async () => {
    const { headers, rows } = exportData();
    try {
      const { data } = await api.post('/export/pdf', {
        headers,
        rows,
        title: 'Inventory Categories Report',
        filename: `categories-${new Date().toISOString().split('T')[0]}.pdf`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `categories-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Categories"
        description="Organise inventory items by category"
        actions={
          <div className="flex gap-2">
            <PermissionGuard permission="inventory.categories.export">
              {categories.length > 0 && (
                <div className="flex gap-1">
                  <Button onClick={exportCSV} variant="outline" className="text-xs">📄 CSV</Button>
                  <Button onClick={exportExcel} variant="outline" className="text-xs">📊 Excel</Button>
                  <Button onClick={exportPDF} variant="outline" className="text-xs">📑 PDF</Button>
                </div>
              )}
            </PermissionGuard>
            <PermissionGuard permission="inventory.products.create">
              <Button onClick={() => setOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold">
                + Add Category
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      <div className="border rounded-lg overflow-hidden">
        {categories.map(cat => (
          <div key={cat.id}>
            <div
              className="flex items-center gap-3 p-4 border-b bg-gray-50 hover:bg-gray-100"
            >
              <div
                className="w-6 h-6 flex items-center justify-center cursor-pointer"
                onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
              >
                {cat.groups && cat.groups.length > 0 && (
                  expandedId === cat.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}>
                <p className="font-medium text-sm">{cat.name}</p>
                <p className="text-xs text-gray-600">{cat.description || '—'}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{cat.groups?.length || 0} groups</span>
              <div className="flex gap-2">
                {can('inventory.categories.edit') && (
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {can('inventory.categories.delete') && (
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
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

      <Dialog open={open} onOpenChange={(newOpen) => { setOpen(newOpen); if (!newOpen) { setEditingId(null); setForm({ name: '', description: '' }); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingId ? handleSaveEdit : handleSubmit} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={submitting} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={submitting} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditingId(null); setForm({ name: '', description: '' }); }} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
