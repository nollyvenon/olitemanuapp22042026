'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  type GroupRow,
  type PermissionRow,
  normalizeGroup,
  normalizePermission,
  selectedIdsForEditor,
  unwrapList,
  enrichGroupPermissions,
} from '@/lib/admin-access';
import { Edit, Trash2 } from 'lucide-react';

export default function AdminUserGroupsPage() {
  const api = getApiClient();
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [allPerms, setAllPerms] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [editGroup, setEditGroup] = useState<GroupRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editParents, setEditParents] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [permSearch, setPermSearch] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', parent_group_ids: [] as string[] });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [gr, pr] = await Promise.all([api.get('/groups'), api.get('/permissions')]);
      const rawPerms = unwrapList<unknown>(pr.data).map(normalizePermission).filter(Boolean) as PermissionRow[];
      setAllPerms(rawPerms);
      const rawGroups = unwrapList<unknown>(gr.data).map(normalizeGroup).filter(Boolean) as GroupRow[];
      setGroups(enrichGroupPermissions(rawGroups, rawPerms));
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'Failed to load groups');
      setGroups([]);
      setAllPerms([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (g: GroupRow) => {
    setEditGroup(g);
    setEditName(g.name);
    setEditDesc(g.description);
    setEditParents(g.parent_group_ids ?? []);
    setSelectedPerms(selectedIdsForEditor(g));
    setPermSearch('');
  };

  const grouped = useMemo(() => {
    return allPerms.reduce<Record<string, PermissionRow[]>>((acc, p) => {
      (acc[p.module] = acc[p.module] || []).push(p);
      return acc;
    }, {});
  }, [allPerms]);

  const filteredGrouped = useMemo(() => {
    const q = permSearch.trim().toLowerCase();
    if (!q) return grouped;
    const out: Record<string, PermissionRow[]> = {};
    for (const [mod, list] of Object.entries(grouped)) {
      const fl = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.module.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
      );
      if (fl.length) out[mod] = fl;
    }
    return out;
  }, [grouped, permSearch]);

  const togglePerm = (id: string) =>
    setSelectedPerms((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleModuleAll = (module: string, on: boolean) => {
    const ids = (grouped[module] ?? []).map((p) => p.id);
    setSelectedPerms((prev) => {
      const s = new Set(prev);
      for (const id of ids) {
        if (on) s.add(id);
        else s.delete(id);
      }
      return [...s];
    });
  };

  const parentOptions = useMemo(
    () => groups.filter((g) => !editGroup || g.id !== editGroup.id),
    [groups, editGroup]
  );

  const saveEdit = async () => {
    if (!editGroup) return;
    setSaving(true);
    setError('');
    try {
      try {
        await api.patch(`/groups/${editGroup.id}`, {
          name: editName,
          description: editDesc,
          parent_group_ids: editParents,
        });
      } catch {
        /* optional endpoint */
      }
      await api.post(`/groups/${editGroup.id}/permissions`, { permission_ids: selectedPerms });
      await load();
      setEditGroup(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const createGroup = async () => {
    if (!newGroup.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.post('/groups', {
        name: newGroup.name.trim(),
        description: newGroup.description.trim(),
        parent_group_ids: newGroup.parent_group_ids,
      });
      setCreateOpen(false);
      setNewGroup({ name: '', description: '', parent_group_ids: [] });
      await load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm('Delete this group?')) return;
    try {
      await api.delete(`/groups/${id}`);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch {
      setError('Delete failed');
    }
  };

  const columns: ColumnDef<GroupRow>[] = [
    { accessorKey: 'name', header: 'Group', cell: (i) => <span className="font-semibold text-sm">{String(i.getValue())}</span> },
    { accessorKey: 'description', header: 'Description', cell: (i) => <span className="text-sm text-gray-500">{String(i.getValue() || '—')}</span> },
    {
      id: 'nested',
      header: 'Linked groups',
      cell: ({ row }) => {
        const n = row.original.parent_group_ids?.length ?? 0;
        return <span className="text-xs text-gray-600">{n ? `${n} parent(s)` : '—'}</span>;
      },
    },
    {
      id: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const n = row.original.permissions?.length || row.original.permission_ids?.length || 0;
        return <span className="font-bold text-blue-600">{n}</span>;
      },
    },
    { accessorKey: 'users_count', header: 'Users', cell: (i) => <span className="font-bold">{String(i.getValue() ?? 0)}</span> },
    { accessorKey: 'is_active', header: 'Status', cell: (i) => <StatusBadge status={i.getValue() ? 'active' : 'inactive'} /> },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <PermissionGuard permission="admin.*">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openEdit(row.original)}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              <Edit className="h-3 w-3" /> Edit
            </button>
            <button type="button" onClick={() => deleteGroup(row.original.id)} className="text-red-500 hover:text-red-700">
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
        title="User groups & permissions"
        description="Each group defines a permission set. Users can belong to multiple groups; access is the union of those permissions. Optional parent links model group nesting when the API supports it."
        actions={
          <PermissionGuard permission="admin.*">
            <Button onClick={() => setCreateOpen(true)} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">
              + Create group
            </Button>
          </PermissionGuard>
        }
      />
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}
      <DataTable columns={columns} data={groups} isLoading={loading} sorting={sorting} onSortingChange={setSorting} searchKey="name" />

      <Sheet open={!!editGroup} onOpenChange={(o) => !o && setEditGroup(null)}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto flex flex-col">
          <SheetHeader>
            <SheetTitle>Edit group — {editGroup?.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 flex-1 overflow-y-auto pb-24">
            <div>
              <Label>Name</Label>
              <Input className="mt-1.5" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input className="mt-1.5" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
            <div>
              <Label>Member of groups (optional)</Label>
              <p className="text-xs text-gray-500 mt-1 mb-2">Links this group to parent groups when supported by the API.</p>
              <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                {parentOptions.length === 0 ? (
                  <span className="text-xs text-gray-400">No other groups</span>
                ) : (
                  parentOptions.map((g) => (
                    <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-amber-500"
                        checked={editParents.includes(g.id)}
                        onChange={() =>
                          setEditParents((prev) =>
                            prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id]
                          )
                        }
                      />
                      {g.name}
                    </label>
                  ))
                )}
              </div>
            </div>
            <div>
              <Label>Search permissions</Label>
              <Input
                className="mt-1.5"
                placeholder="Filter by name or module…"
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
              />
            </div>
            {Object.keys(filteredGrouped).length === 0 ? (
              <p className="text-sm text-gray-500">No permissions loaded. Check /permissions API.</p>
            ) : (
              Object.entries(filteredGrouped).map(([module, perms]) => {
                return (
                  <div key={module}>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{module}</p>
                      <div className="flex gap-2 shrink-0">
                        <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => toggleModuleAll(module, true)}>
                          All
                        </button>
                        <button type="button" className="text-xs text-gray-500 hover:underline" onClick={() => toggleModuleAll(module, false)}>
                          None
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {perms.map((p) => (
                        <label key={p.id} className="flex items-start gap-2.5 cursor-pointer text-sm hover:bg-gray-50 px-2 py-1.5 rounded">
                          <input
                            type="checkbox"
                            checked={selectedPerms.includes(p.id)}
                            onChange={() => togglePerm(p.id)}
                            className="accent-amber-500 h-3.5 w-3.5 mt-0.5"
                          />
                          <span>
                            <span className="font-mono text-xs text-gray-800">{p.name}</span>
                            {p.description ? <span className="block text-xs text-gray-500">{p.description}</span> : null}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button onClick={saveEdit} disabled={saving} style={{ background: '#FF9900', color: '#0f1111' }} className="w-full font-semibold">
              {saving ? 'Saving…' : `Save group & permissions (${selectedPerms.length})`}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Create user group</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                className="mt-1.5"
                value={newGroup.name}
                onChange={(e) => setNewGroup((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Warehouse staff"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                className="mt-1.5"
                value={newGroup.description}
                onChange={(e) => setNewGroup((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Member of groups (optional)</Label>
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                {groups.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-amber-500"
                      checked={newGroup.parent_group_ids.includes(g.id)}
                      onChange={() =>
                        setNewGroup((p) => ({
                          ...p,
                          parent_group_ids: p.parent_group_ids.includes(g.id)
                            ? p.parent_group_ids.filter((x) => x !== g.id)
                            : [...p.parent_group_ids, g.id],
                        }))
                      }
                    />
                    {g.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button
              onClick={createGroup}
              disabled={saving || !newGroup.name.trim()}
              style={{ background: '#FF9900', color: '#0f1111' }}
              className="w-full font-semibold"
            >
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
