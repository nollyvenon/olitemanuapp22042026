'use client';

import { useEffect, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuthStore } from '@/store/auth.store';

interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  groups: Array<{ id: string; name: string }>;
}

const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const columns: ColumnDef<User>[] = [
  {
    id: 'avatar',
    header: '',
    cell: ({ row }) => {
      const initials = row.original.name.split(' ').map(n => n[0]).join('').toUpperCase();
      return <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#FF9900', color: '#0f1111' }}>{initials}</div>;
    },
  },
  { accessorKey: 'name',       header: 'Name',        cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'email',      header: 'Email',       cell: i => <span className="text-xs" style={{ color: '#767676' }}>{String(i.getValue())}</span> },
  {
    id: 'groups',
    header: 'Groups',
    cell: ({ row }) => (
      <span className="text-xs">{row.original.groups?.map((g: any) => g.name).join(', ') || 'N/A'}</span>
    ),
  },
  { accessorKey: 'is_active',  header: 'Status',      cell: i => <StatusBadge status={String(i.getValue()) === 'true' ? 'active' : 'inactive'} /> },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <AuthGuard requiredPermissions={['users.read']}>
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage system users and access"
          actions={
            <PermissionGuard permission="users.create">
              <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Invite User</Button>
            </PermissionGuard>
          }
        />
        {loading ? <div>Loading...</div> : <DataTable columns={columns} data={users} sorting={sorting} onSortingChange={setSorting} />}
      </div>
    </AuthGuard>
  );
}
