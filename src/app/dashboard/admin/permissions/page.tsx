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
import { Copy, Trash2 } from 'lucide-react';

interface Permission { id: string; name: string; module: string; description: string; created_at: string; }

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'module', desc: false }]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newPerm, setNewPerm] = useState({ name: '', module: '', description: '' });
  const [saving, setSaving] = useState(false);
  const api = getApiClient();

  const fetchPermissions = useCallback(async () => {
    try {
      const { data } = await api.get('/permissions');
      setPermissions(Array.isArray(data) ? data : data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const createPermission = async () => {
    if (!newPerm.name || !newPerm.module) return;
    setSaving(true);
    try {
      await api.post('/permissions', newPerm);
      await fetchPermissions();
      setCreateOpen(false);
      setNewPerm({ name: '', module: '', description: '' });
    } finally {
      setSaving(false);
    }
  };

  const deletePermission = async (id: string) => {
    if (!confirm('Delete this permission?')) return;
    await api.delete(`/permissions/${id}`);
    setPermissions(prev => prev.filter(p => p.id !== id));
  };

  const modules = Array.from(new Set(permissions.map(p => p.module))).sort();
  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] = acc[p.module] || []).push(p);
    return acc;
  }, {});

  const columns: ColumnDef<Permission>[] = [
    { accessorKey: 'name', header: 'Permission', cell: i => <span className="font-mono text-sm text-gray-700">{String(i.getValue())}</span> },
    { accessorKey: 'module', header: 'Module', cell: i => <span className="text-xs px-2 py-0.5 rounded bg-gray-100 font-medium">{String(i.getValue())}</span> },
    { accessorKey: 'description', header: 'Description', cell: i => <span className="text-sm text-gray-500">{String(i.getValue() ?? '—')}</span> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <PermissionGuard permission="admin.*">
          <button onClick={() => deletePermission(row.original.id)} className="text-red-500 hover:text-red-700">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="System permissions and access controls"
        actions={
          <PermissionGuard permission="admin.*">
            <Button onClick={() => setCreateOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Add Permission</Button>
          </PermissionGuard>
        }
      />

      <div className="space-y-8">
        {modules.map(module => (
          <div key={module}>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">{module}</h3>
            <DataTable columns={columns} data={grouped[module] || []} isLoading={false} sorting={sorting} onSortingChange={setSorting} />
          </div>
        ))}
      </div>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader><SheetTitle>Add Permission</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Module *</Label>
              <select value={newPerm.module} onChange={e => setNewPerm(p => ({ ...p, module: e.target.value }))} className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">Select module</option>
                {['sales', 'inventory', 'accounts', 'reports', 'audit', 'kyc', 'market', 'dashboard', 'admin'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Permission Name *</Label>
              <Input value={newPerm.name} onChange={e => setNewPerm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. create, approve, view" className="mt-1.5" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={newPerm.description} onChange={e => setNewPerm(p => ({ ...p, description: e.target.value }))} placeholder="What does this permission do?" className="mt-1.5" />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={createPermission} disabled={saving || !newPerm.name} style={{ background: '#FF9900', color: '#0f1111' }} className="w-full font-semibold">
              {saving ? 'Creating...' : 'Create Permission'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
