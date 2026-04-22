'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface ItemGroup {
  id: string;
  code: string;
  name: string;
  category: string;
  item_count: number;
  status: string;
}

const GROUPS: ItemGroup[] = [
  { id: '1',  code: 'GRP-001', name: 'Structural Steel',       category: 'Raw Steel',      item_count: 8,  status: 'active' },
  { id: '2',  code: 'GRP-002', name: 'Sheet Metal',             category: 'Raw Steel',      item_count: 6,  status: 'active' },
  { id: '3',  code: 'GRP-003', name: 'Electrical Conductors',   category: 'Copper',         item_count: 4,  status: 'active' },
  { id: '4',  code: 'GRP-004', name: 'Aluminium Profiles',      category: 'Aluminium',      item_count: 5,  status: 'active' },
  { id: '5',  code: 'GRP-005', name: 'Pressure Pipes',          category: 'Pipes',          item_count: 9,  status: 'active' },
  { id: '6',  code: 'GRP-006', name: 'Drainage Pipes',          category: 'Pipes',          item_count: 7,  status: 'active' },
  { id: '7',  code: 'GRP-007', name: 'OPC Cement',              category: 'Cement',         item_count: 3,  status: 'active' },
  { id: '8',  code: 'GRP-008', name: 'Protective Coatings',     category: 'Coatings',       item_count: 11, status: 'active' },
  { id: '9',  code: 'GRP-009', name: 'Structural Fasteners',    category: 'Fasteners',      item_count: 18, status: 'active' },
  { id: '10', code: 'GRP-010', name: 'Float Glass',             category: 'Glass',          item_count: 4,  status: 'active' },
  { id: '11', code: 'GRP-011', name: 'Industrial Rubber',       category: 'Rubber',         item_count: 5,  status: 'inactive' },
];

const columns: ColumnDef<ItemGroup>[] = [
  { accessorKey: 'code',       header: 'Code',       cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',       header: 'Group Name', cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'category',   header: 'Category',   cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'item_count', header: 'Items',      cell: i => <span className="font-bold tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'status',     header: 'Status',     cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function GroupsPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Item Groups"
        description="Group inventory items for reporting and categorisation"
        actions={
          <PermissionGuard permission="inventory.products.create">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Add Group</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={GROUPS} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
