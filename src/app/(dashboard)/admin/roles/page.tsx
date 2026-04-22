'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions_count: number;
  users_count: number;
  status: string;
}

const ROLES: Role[] = [
  { id: '1', name: 'Admin',           description: 'Full system access',                          permissions_count: 64, users_count: 1,  status: 'active' },
  { id: '2', name: 'Sales Manager',   description: 'Approve orders, manage invoices',              permissions_count: 28, users_count: 1,  status: 'active' },
  { id: '3', name: 'Sales Rep',       description: 'Create orders and view customers',             permissions_count: 14, users_count: 2,  status: 'active' },
  { id: '4', name: 'Store Manager',   description: 'Full inventory and stock movement access',     permissions_count: 22, users_count: 2,  status: 'active' },
  { id: '5', name: 'Store Clerk',     description: 'View inventory and log movements',             permissions_count: 10, users_count: 2,  status: 'active' },
  { id: '6', name: 'Accountant',      description: 'Manage vouchers, debtors, creditors',         permissions_count: 18, users_count: 1,  status: 'active' },
  { id: '7', name: 'KYC Officer',     description: 'Review and approve KYC applications',         permissions_count: 8,  users_count: 1,  status: 'active' },
  { id: '8', name: 'Viewer',          description: 'Read-only access to all modules',             permissions_count: 6,  users_count: 0,  status: 'inactive' },
];

const columns: ColumnDef<Role>[] = [
  { accessorKey: 'name',               header: 'Role Name',     cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'description',        header: 'Description',   cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'permissions_count',  header: 'Permissions',   cell: i => <span className="font-bold tabular-nums" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'users_count',        header: 'Users',         cell: i => <span className="font-bold tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'status',             header: 'Status',        cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function RolesPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'users_count', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Define permission sets and access levels"
        actions={
          <PermissionGuard permission="admin.*">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Create Role</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={ROLES} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
