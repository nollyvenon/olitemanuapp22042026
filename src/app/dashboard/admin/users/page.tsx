'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
  enrichGroupPermissions,
  normalizeGroup,
  normalizePermission,
  unwrapList,
  effectivePermissionKeys,
} from '@/lib/admin-access';
import { Edit, Trash2 } from 'lucide-react';

interface Group { id: string; name: string; }
interface User { id: string; name: string; email: string; is_active: boolean; groups: Group[]; }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editGroups, setEditGroups] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);
  const [editNewPassword, setEditNewPassword] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formGroups, setFormGroups] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const api = getApiClient();

  const fetchUsers = useCallback(async () => {
    const { data } = await api.get('/users');
    setUsers(Array.isArray(data) ? data : data.data ?? []);
    setLoading(false);
  }, [api]);

  const loadGroups = useCallback(async () => {
    const [gr, pr] = await Promise.all([api.get('/groups'), api.get('/permissions')]);
    const perms = unwrapList<unknown>(pr.data).map(normalizePermission).filter(Boolean) as PermissionRow[];
    const raw = unwrapList<unknown>(gr.data).map(normalizeGroup).filter(Boolean) as GroupRow[];
    setGroups(enrichGroupPermissions(raw, perms));
  }, [api]);

  useEffect(() => {
    fetchUsers();
    loadGroups();
  }, [fetchUsers, loadGroups]);

  const editEffectiveCount = useMemo(
    () => effectivePermissionKeys(groups, editGroups).size,
    [groups, editGroups]
  );
  const createEffectiveCount = useMemo(
    () => effectivePermissionKeys(groups, formGroups).size,
    [groups, formGroups]
  );

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditGroups(user.groups?.map(g => g.id) ?? []);
    setEditActive(user.is_active);
    setEditNewPassword('');
    setError('');
  };

  const saveUser = async () => {
    if (!editUser) return;
    if (!editGroups.length) { setError('Select at least one group'); return; }
    setSaving(true);
    setError('');
    try {
      await api.patch(`/users/${editUser.id}`, {
        is_active: editActive,
        group_ids: editGroups,
        ...(editNewPassword ? { password: editNewPassword } : {}),
      });
      await fetchUsers();
      setEditUser(null);
      setEditNewPassword('');
    } finally { setSaving(false); }
  };

  const createUser = async () => {
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required'); return; }
    if (!formGroups.length) { setError('Select at least one group'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post('/users', { ...form, group_ids: formGroups });
      await fetchUsers();
      setCreateOpen(false);
      setForm({ name: '', email: '', password: '' });
      setFormGroups([]);
    } catch (e: any) {
      setError(e.response?.data?.message ?? e.response?.data?.error ?? 'Failed to create user');
    } finally { setSaving(false); }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    await api.delete(`/users/${id}`);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleGroup = (id: string, sel: string[], set: (v: string[]) => void) =>
    set(sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);

  const columns: ColumnDef<User>[] = [
    {
      id: 'avatar', header: '',
      cell: ({ row }) => {
        const initials = row.original.name.split(' ').map(n => n[0]).join('').toUpperCase();
        return <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: '#FF9900', color: '#0f1111' }}>{initials}</div>;
      },
    },
    { accessorKey: 'name', header: 'Name', cell: i => <span className="font-semibold text-sm">{String(i.getValue())}</span> },
    { accessorKey: 'email', header: 'Email', cell: i => <span className="text-xs text-gray-500">{String(i.getValue())}</span> },
    {
      id: 'groups', header: 'Groups',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.groups?.length ? row.original.groups.map(g => (
            <span key={g.id} className="px-1.5 py-0.5 text-xs rounded bg-blue-50 text-blue-700 font-medium">{g.name}</span>
          )) : <span className="text-xs text-gray-400">None</span>}
        </div>
      ),
    },
    { accessorKey: 'is_active', header: 'Status', cell: i => <StatusBadge status={i.getValue() ? 'active' : 'inactive'} /> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <PermissionGuard permission="users.update">
          <div className="flex items-center gap-3">
            <button onClick={() => openEdit(row.original)} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800">
              <Edit className="h-3 w-3" /> Edit
            </button>
            <PermissionGuard permission="users.delete">
              <button onClick={() => deleteUser(row.original.id)} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </PermissionGuard>
          </div>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage system users, roles, and access"
        actions={
          <PermissionGuard permission="users.create">
            <Button onClick={() => { setCreateOpen(true); setError(''); }} style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Add User</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={users} isLoading={loading} sorting={sorting} onSortingChange={setSorting} searchKey="name" />

      {/* Edit user sheet */}
      <Sheet open={!!editUser} onOpenChange={o => !o && setEditUser(null)}>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader><SheetTitle>Edit User — {editUser?.name}</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-5">
            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-2 flex items-center gap-3">
                <button onClick={() => setEditActive(true)} className={`px-3 py-1.5 rounded text-xs font-semibold border ${editActive ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600'}`}>Active</button>
                <button onClick={() => setEditActive(false)} className={`px-3 py-1.5 rounded text-xs font-semibold border ${!editActive ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-600'}`}>Inactive</button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">New password (optional)</Label>
              <Input
                type="password"
                className="mt-1.5"
                value={editNewPassword}
                onChange={(e) => setEditNewPassword(e.target.value)}
                placeholder="Leave blank to keep"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Assign groups *</Label>
              <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto">
                {groups.map((g) => (
                  <label key={g.id} className="flex items-center justify-between gap-2 cursor-pointer text-sm hover:bg-gray-50 px-2 py-1.5 rounded">
                    <span className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={editGroups.includes(g.id)}
                        onChange={() => toggleGroup(g.id, editGroups, setEditGroups)}
                        className="accent-amber-500 h-3.5 w-3.5 shrink-0"
                      />
                      <span className="truncate">{g.name}</span>
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">{g.permissions.length} perms</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Effective permission keys (union): {editEffectiveCount}</p>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={saveUser} disabled={saving} style={{ background: '#FF9900', color: '#0f1111' }} className="w-full font-semibold">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Create user sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader><SheetTitle>Add User</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-4">
            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" className="mt-1.5" /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@company.com" className="mt-1.5" /></div>
            <div><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" className="mt-1.5" /></div>
            <div>
              <Label>Assign groups *</Label>
              <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto border rounded-md p-2">
                {groups.map((g) => (
                  <label key={g.id} className="flex items-center justify-between gap-2 cursor-pointer text-sm hover:bg-gray-50 px-2 py-1.5 rounded">
                    <span className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={formGroups.includes(g.id)}
                        onChange={() => toggleGroup(g.id, formGroups, setFormGroups)}
                        className="accent-amber-500 h-3.5 w-3.5 shrink-0"
                      />
                      <span className="truncate">{g.name}</span>
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">{g.permissions.length} perms</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Effective permission keys (union): {createEffectiveCount}</p>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={createUser} disabled={saving} style={{ background: '#FF9900', color: '#0f1111' }} className="w-full font-semibold">
              {saving ? 'Creating...' : 'Create User'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
