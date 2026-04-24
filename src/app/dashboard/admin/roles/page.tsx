'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';
import { Edit, Trash2 } from 'lucide-react';

interface Permission { id: string; name: string; module: string; }
interface Group { id: string; name: string; description: string; is_active: boolean; users_count: number; permissions: Permission[]; }

export default function RolesPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const api = getApiClient();

  const fetchGroups = useCallback(async () => {
    const { data } = await api.get('/groups');
    setGroups(Array.isArray(data) ? data : data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGroups();
    api.get('/permissions').then(({ data }) => setAllPerms(Array.isArray(data) ? data : data.data ?? []));
  }, []);

  const openEdit = (group: Group) => { setEditGroup(group); setSelectedPerms(group.permissions?.map(p => p.id) ?? []); };

  const savePermissions = async () => {
    if (!editGroup) return;
    setSaving(true);
    try { await api.post(`/groups/${editGroup.id}/permissions`, { permission_ids: selectedPerms }); await fetchGroups(); setEditGroup(null); }
    finally { setSaving(false); }
  };

  const createGroup = async () => {
    if (!newGroup.name) return;
    setSaving(true);
    try { await api.post('/groups', newGroup); await fetchGroups(); setCreateOpen(false); setNewGroup({ name: '', description: '' }); }
    finally { setSaving(false); }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm('Delete this group? This cannot be undone.')) return;
    await api.delete(`/groups/${id}`);
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const togglePerm = (id: string) => setSelectedPerms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const grouped = allPerms.reduce<Record<string, Permission[]>>((acc, p) => { (acc[p.module] = acc[p.module] || []).push(p); return acc; }, {});

  const columns: ColumnDef<Group>[] = [
    { accessorKey: 'name', header: 'Group', cell: i => <span className="font-semibold text-sm">{String(i.getValue())}</span> },
    { accessorKey: 'description', header: 'Description', cell: i => <span className="text-sm text-gray-500">{String(i.getValue() ?? '—')}</span> },
    { id: 'permissions', header: 'Permissions', cell: ({ row }) => <span className="font-bold text-blue-600">{row.original.permissions?.length ?? 0}</span> },
    { accessorKey: 'users_count', header: 'Members', cell: i => <span className="font-bold">{String(i.getValue() ?? 0)}</span> },
    { accessorKey: 'is_active', header: 'Status', cell: i => <StatusBadge status={i.getValue() ? 'active' : 'inactive'} /> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <PermissionGuard permission="admin.*">
          <div className="flex items-center gap-3">
            <button onClick={() => openEdit(row.original)} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800">
              <Edit className="h-3 w-3" /> Permissions
            </button>
            <button onClick={() => deleteGroup(row.original.id)} className="text-red-500 hover:text-red-700">
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
        title="Roles & Groups"
        description="Manage permission sets and access levels"
        actions={
          <PermissionGuard permission="admin.*">
            <Button onClick={() => setCreateOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Create Group</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={groups} isLoading={loading} sorting={sorting} onSortingChange={setSorting} />

      <Sheet open={!!editGroup} onOpenChange={o => !o && setEditGroup(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader><SheetTitle>Permissions — {editGroup?.name}</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-5 pb-20">
            {Object.entries(grouped).map(([module, perms]) => (
              <div key={module}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{module}</p>
                <div className="space-y-1">
                  {perms.map(p => (
                    <label key={p.id} className="flex items-center gap-2.5 cursor-pointer text-sm hover:bg-gray-50 px-2 py-1.5 rounded">
                      <input type="checkbox" checked={selectedPerms.includes(p.id)} onChange={() => togglePerm(p.id)} className="accent-amber-500 h-3.5 w-3.5" />
                      <span className="font-mono text-xs text-gray-700">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button onClick={savePermissions} disabled={saving} style={{ background: '#FF9900', color: '#0f1111' }} className="w-full font-semibold">
              {saving ? 'Saving...' : `Save Permissions (${selectedPerms.length} selected)`}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader><SheetTitle>Create Group</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-4">
            <div><Label>Group Name *</Label><Input value={newGroup.name} onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Warehouse Staff" className="mt-1.5" /></div>
            <div><Label>Description</Label><Input value={newGroup.description} onChange={e => setNewGroup(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" className="mt-1.5" /></div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={createGroup} disabled={saving || !newGroup.name} style={{ background: '#FF9900', color: '#0f1111' }} className="w-full font-semibold">
              {saving ? 'Creating...' : 'Create Group'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
