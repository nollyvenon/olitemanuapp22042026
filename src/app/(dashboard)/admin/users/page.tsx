'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  last_login: string;
  status: string;
}

const USERS: User[] = [
  { id: '1',  name: 'James Okafor',    email: 'j.okafor@olite.com',    role: 'Admin',          department: 'Management',   last_login: '2026-04-22', status: 'active' },
  { id: '2',  name: 'Sarah Mensah',    email: 's.mensah@olite.com',    role: 'Sales Manager',  department: 'Sales',         last_login: '2026-04-22', status: 'active' },
  { id: '3',  name: 'Emeka Bello',     email: 'e.bello@olite.com',     role: 'Accountant',     department: 'Finance',       last_login: '2026-04-21', status: 'active' },
  { id: '4',  name: 'Tunde Adeyemi',   email: 't.adeyemi@olite.com',   role: 'Store Manager',  department: 'Inventory',     last_login: '2026-04-22', status: 'active' },
  { id: '5',  name: 'Fatima Aliyu',    email: 'f.aliyu@olite.com',     role: 'Store Manager',  department: 'Inventory',     last_login: '2026-04-20', status: 'active' },
  { id: '6',  name: 'Chidi Okonkwo',   email: 'c.okonkwo@olite.com',   role: 'Store Clerk',    department: 'Inventory',     last_login: '2026-04-19', status: 'active' },
  { id: '7',  name: 'Ibrahim Musa',    email: 'i.musa@olite.com',      role: 'Store Clerk',    department: 'Inventory',     last_login: '2026-04-18', status: 'active' },
  { id: '8',  name: 'Remi Olawale',    email: 'r.olawale@olite.com',   role: 'Sales Rep',      department: 'Sales',         last_login: '2026-04-17', status: 'active' },
  { id: '9',  name: 'Ngozi Eze',       email: 'n.eze@olite.com',       role: 'KYC Officer',    department: 'Compliance',    last_login: '2026-04-16', status: 'active' },
  { id: '10', name: 'Dayo Adebayo',    email: 'd.adebayo@olite.com',   role: 'Sales Rep',      department: 'Sales',         last_login: '2026-03-20', status: 'inactive' },
];

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
  { accessorKey: 'role',       header: 'Role',        cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'department', header: 'Department',  cell: i => <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#e8f0fe', color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'last_login', header: 'Last Login',  cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtDate(String(i.getValue()))}</span> },
  { accessorKey: 'status',     header: 'Status',      cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function UsersPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage system users and access"
        actions={
          <PermissionGuard permission="admin.*">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Invite User</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={USERS} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
