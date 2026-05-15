'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface Manual {
  id: string;
  title: string;
  slug: string;
  category: { name: string };
  type: 'user' | 'admin';
  status: 'draft' | 'published' | 'archived';
  excerpt: string;
  view_count: number;
  helpful_count: number;
}

export default function DocumentationPage() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editManual, setEditManual] = useState<Manual | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newManual, setNewManual] = useState<{ title: string; slug: string; category_id: string; type: 'user' | 'admin'; excerpt: string; status: 'draft' }>({ title: '', slug: '', category_id: '', type: 'user', excerpt: '', status: 'draft' });
  const api = getApiClient();

  const fetchManuals = useCallback(async () => {
    try {
      const { data } = await api.get('/documentation/manuals?per_page=100');
      setManuals(Array.isArray(data) ? data : data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchManuals();
  }, [fetchManuals]);

  const publishManual = async (id: string) => {
    try {
      await api.patch(`/documentation/manuals/${id}`, { status: 'published', published_at: new Date().toISOString() });
      await fetchManuals();
    } catch (err) {
      console.error('Failed to publish', err);
    }
  };

  const archiveManual = async (id: string) => {
    try {
      await api.patch(`/documentation/manuals/${id}`, { status: 'archived' });
      await fetchManuals();
    } catch (err) {
      console.error('Failed to archive', err);
    }
  };

  const deleteManual = async (id: string) => {
    if (!confirm('Delete this manual?')) return;
    try {
      await api.delete(`/documentation/manuals/${id}`);
      setManuals(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const createManual = async () => {
    if (!newManual.title || !newManual.slug) return;
    setSaving(true);
    try {
      await api.post('/documentation/manuals', { ...newManual, content: '<p>Start editing...</p>' });
      await fetchManuals();
      setCreateOpen(false);
      setNewManual({ title: '', slug: '', category_id: '', type: 'user', excerpt: '', status: 'draft' });
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnDef<Manual>[] = [
    { accessorKey: 'title', header: 'Title', cell: i => <span className="font-semibold">{String(i.getValue())}</span> },
    { accessorKey: 'type', header: 'Type', cell: i => <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">{String(i.getValue())}</span> },
    { accessorKey: 'status', header: 'Status', cell: i => <span className={`text-xs px-2 py-1 rounded ${String(i.getValue()) === 'published' ? 'bg-green-100 text-green-700' : String(i.getValue()) === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{String(i.getValue())}</span> },
    { accessorKey: 'view_count', header: 'Views', cell: i => <span className="text-sm font-medium">{String(i.getValue())}</span> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <PermissionGuard permission="admin.*">
          <div className="flex items-center gap-2">
            <button onClick={() => row.original.status !== 'published' ? publishManual(row.original.id) : archiveManual(row.original.id)} className={`text-xs font-medium ${row.original.status === 'published' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}>
              {row.original.status === 'published' ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => deleteManual(row.original.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentation Management"
        description="Create and manage user and admin documentation"
        actions={
          <PermissionGuard permission="admin.*">
            <Button onClick={() => setCreateOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Create Manual</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={manuals} isLoading={loading} sorting={sorting} onSortingChange={setSorting} />

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader><SheetTitle>Create Documentation</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-4">
            <div><Label>Title *</Label><Input value={newManual.title} onChange={e => setNewManual(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Creating Sales Orders" className="mt-1.5" /></div>
            <div><Label>URL Slug *</Label><Input value={newManual.slug} onChange={e => setNewManual(p => ({ ...p, slug: e.target.value }))} placeholder="e.g. creating-sales-orders" className="mt-1.5" /></div>
            <div><Label>Type *</Label><select value={newManual.type}  className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="user">User Guide</option>
              <option value="admin">Admin Guide</option>
            </select></div>
            <div><Label>Excerpt</Label><Input value={newManual.excerpt} onChange={e => setNewManual(p => ({ ...p, excerpt: e.target.value }))} placeholder="Brief summary" className="mt-1.5" /></div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={createManual} disabled={saving} style={{ background: '#FF9900', color: '#0f1111' }} className="w-full font-semibold">
              {saving ? 'Creating...' : 'Create Manual'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
