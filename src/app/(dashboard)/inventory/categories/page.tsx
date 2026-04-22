'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface Category {
  id: string;
  code: string;
  name: string;
  parent?: string;
  item_count: number;
  stock_value: number;
  status: string;
}

const CATEGORIES: Category[] = [
  { id: '1',  code: 'RAW-STL', name: 'Raw Steel',        item_count: 14, stock_value: 1842300, status: 'active' },
  { id: '2',  code: 'ALUM',    name: 'Aluminium',         item_count: 8,  stock_value: 423100,  status: 'active' },
  { id: '3',  code: 'COPP',    name: 'Copper',            item_count: 6,  stock_value: 312800,  status: 'active' },
  { id: '4',  code: 'WOOD',    name: 'Wood Products',     item_count: 11, stock_value: 284500,  status: 'active' },
  { id: '5',  code: 'PIPE',    name: 'Pipes & Fittings',  item_count: 22, stock_value: 198700,  status: 'active' },
  { id: '6',  code: 'CEM',     name: 'Cement & Binders',  item_count: 5,  stock_value: 342000,  status: 'active' },
  { id: '7',  code: 'COAT',    name: 'Coatings & Paints', item_count: 18, stock_value: 94200,   status: 'active' },
  { id: '8',  code: 'FAST',    name: 'Fasteners',         item_count: 34, stock_value: 56800,   status: 'active' },
  { id: '9',  code: 'GLASS',   name: 'Glass',             item_count: 7,  stock_value: 112400,  status: 'active' },
  { id: '10', code: 'RUBB',    name: 'Rubber',            item_count: 9,  stock_value: 87300,   status: 'inactive' },
];

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

const columns: ColumnDef<Category>[] = [
  { accessorKey: 'code',        header: 'Code',         cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',        header: 'Name',         cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'item_count',  header: 'Items',        cell: i => <span className="font-bold tabular-nums" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'stock_value', header: 'Stock Value',  cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'status',      header: 'Status',       cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function CategoriesPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'stock_value', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Categories"
        description="Organise inventory items by category"
        actions={
          <PermissionGuard permission="inventory.products.create">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Add Category</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={CATEGORIES} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
