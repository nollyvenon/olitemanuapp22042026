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
// import { usePermission } from '@/hooks/usePermission';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface Territory {
  id: string;
  name: string;
  description?: string;
  ledgers_count: number;
}

const columns: ColumnDef<Territory>[] = [
  { accessorKey: 'name', header: 'Name', cell: i => <span className="font-medium">{String(i.getValue())}</span> },
  { accessorKey: 'description', header: 'Description', cell: i => <span className="text-sm text-gray-600">{String(i.getValue() || '—')}</span> },
  { accessorKey: 'ledgers_count', header: 'Linked Ledgers', cell: i => <span className="text-sm">{String(i.getValue())}</span> },
];

export default function TerritoriesPage() {
  const api = getApiClient();
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const { canAny } = usePermission();
  const canEdit = canAny(['accounts.territories.override', 'admin.*']);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/territories');
        const list = Array.isArray(data) ? data : (data as { data?: Territory[] }).data ?? [];
        setTerritories(list);
      } catch (err) {
        console.error('Failed to load territories', err);
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
      await api.post('/territories', form);
      const { data } = await api.get('/territories');
      const list = Array.isArray(data) ? data : (data as { data?: Territory[] }).data ?? [];
      setTerritories(list);
      setOpenAdd(false);
      setForm({ name: '', description: '' });
    } catch (err: any) {
      alert('❌ Failed to create territory: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      console.error('Failed to create territory', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTerritory) return;
    setSubmitting(true);
    try {
      await api.patch(`/territories/${selectedTerritory.id}`, form);
      const { data } = await api.get('/territories');
      const list = Array.isArray(data) ? data : (data as { data?: Territory[] }).data ?? [];
      setTerritories(list);
      setOpenEdit(false);
      setSelectedTerritory(null);
      setForm({ name: '', description: '' });
    } catch (err: any) {
      alert('❌ Failed to update territory: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      console.error('Failed to update territory', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this territory?')) return;
    try {
      await api.delete(`/territories/${id}`);
      const { data } = await api.get('/territories');
      const list = Array.isArray(data) ? data : (data as { data?: Territory[] }).data ?? [];
      setTerritories(list);
    } catch (err: any) {
      alert('❌ Failed to delete territory: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      console.error('Failed to delete territory', err);
    }
  };

  const openEditDialog = (territory: Territory) => {
    setSelectedTerritory(territory);
    setForm({ name: territory.name, description: territory.description || '' });
    setOpenEdit(true);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Territories"
          description="Manage account domicile territories. Only users with override/adjust privilege can edit."
        />
        <PermissionGuard permission="accounts.territories.create">
          <Button onClick={() => setOpenAdd(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold">
            + Add Territory
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
                <Button onClick={() => handleDelete(row.original.id)} size="sm" variant="ghost" disabled={!canEdit || row.original.ledgers_count > 0}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ),
          },
        ]}
        data={territories}
      />

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Territory</DialogTitle>
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
            <DialogTitle>Edit Territory</DialogTitle>
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