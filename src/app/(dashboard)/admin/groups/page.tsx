'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface UserGroup {
  id: string;
  name: string;
  role: string;
  members: number;
  department: string;
  status: string;
}

const GROUPS: UserGroup[] = [
  { id: '1', name: 'Management',         role: 'Admin',         members: 2,  department: 'Executive',    status: 'active' },
  { id: '2', name: 'Sales Team Lagos',   role: 'Sales Rep',     members: 5,  department: 'Sales',        status: 'active' },
  { id: '3', name: 'Sales Team Abuja',   role: 'Sales Rep',     members: 3,  department: 'Sales',        status: 'active' },
  { id: '4', name: 'Warehouse Ops',      role: 'Store Manager', members: 4,  department: 'Inventory',    status: 'active' },
  { id: '5', name: 'Finance Team',       role: 'Accountant',    members: 3,  department: 'Finance',      status: 'active' },
  { id: '6', name: 'Compliance Team',    role: 'KYC Officer',   members: 2,  department: 'Compliance',   status: 'active' },
  { id: '7', name: 'Archived Staff',     role: 'Viewer',        members: 7,  department: 'N/A',          status: 'inactive' },
];

const columns: ColumnDef<UserGroup>[] = [
  { accessorKey: 'name',       header: 'Group Name',  cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'role',       header: 'Default Role', cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'department', header: 'Department',  cell: i => <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#e8f0fe', color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'members',    header: 'Members',     cell: i => <span className="font-bold tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'status',     header: 'Status',      cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function GroupsPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'members', desc: true }]);
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
      <DataTable columns={columns} data={GROUPS} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
