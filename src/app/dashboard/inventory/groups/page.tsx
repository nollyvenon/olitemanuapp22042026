'use client';

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

const getColumns = (onDelete: (catId: string, groupId: string) => void): ColumnDef<ItemGroup>[] => [
  { accessorKey: 'category_name', header: 'Category',   cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',          header: 'Group Name', cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'description',   header: 'Description', cell: i => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <RowActions
        id={row.original.id}
        editPermission="inventory.groups.edit"
        deletePermission="inventory.groups.delete"
        onDelete={() => onDelete(row.original.category_id || '', row.original.id)}
      />
    ),
  },
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

  const handleDelete = async (categoryId: string, groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await api.delete(`/stock/categories/${categoryId}/groups/${groupId}`);
      setGroups(groups.filter(g => g.id !== groupId));
    } catch (err) {
      console.error('Failed to delete group', err);
    }
  };

  const exportData = () => {
    const headers = ['Category', 'Group Name', 'Description'];
    const rows = groups.map(g => [g.category_name || '-', g.name, g.description || '-']);
    return { headers, rows };
  };

  const exportCSV = () => {
    const { headers, rows } = exportData();
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
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
      const response = await api.post('/export/excel', {
        headers,
        rows,
        filename: `groups-${new Date().toISOString().split('T')[0]}.xlsx`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `groups-${new Date().toISOString().split('T')[0]}.xlsx`;
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
        title: 'Item Groups Report',
        filename: `groups-${new Date().toISOString().split('T')[0]}.pdf`
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `groups-${new Date().toISOString().split('T')[0]}.pdf`;
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
        title="Item Groups"
        description="Group inventory items for reporting and categorisation"
        actions={
          <div className="flex gap-2">
            <PermissionGuard permission="inventory.groups.export">
              {groups.length > 0 && (
                <div className="flex gap-1">
                  <Button onClick={exportCSV} variant="outline" className="text-xs">📄 CSV</Button>
                  <Button onClick={exportExcel} variant="outline" className="text-xs">📊 Excel</Button>
                  <Button onClick={exportPDF} variant="outline" className="text-xs">📑 PDF</Button>
                </div>
              )}
            </PermissionGuard>
            <PermissionGuard permission="inventory.products.create">
              <Button onClick={() => setOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Add Group</Button>
            </PermissionGuard>
          </div>
        }
      />
      <DataTable columns={getColumns(handleDelete)} data={groups} sorting={sorting} onSortingChange={setSorting} />

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
