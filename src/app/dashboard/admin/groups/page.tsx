'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';

interface UserGroup {
  id: string;
  name: string;
  role: string;
  members: number;
  department: string;
  status: string;
}

const columns: ColumnDef<UserGroup>[] = [
  { accessorKey: 'name',       header: 'Group Name',  cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'role',       header: 'Default Role', cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'department', header: 'Department',  cell: i => <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#e8f0fe', color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'members',    header: 'Members',     cell: i => <span className="font-bold tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'status',     header: 'Status',      cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function GroupsPage() {
  const api = getApiClient();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'members', desc: true }]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/groups');
        const list = Array.isArray(data) ? data : data.data ?? [];
        setGroups(list);
      } catch (err) {
        console.error('Failed to load groups', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Groups"
        description="Organise users into teams and departments"
        actions={
          <PermissionGuard permission="admin.*">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Create Group</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={groups} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
