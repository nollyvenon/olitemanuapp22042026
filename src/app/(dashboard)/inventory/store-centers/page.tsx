'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface StoreCenter {
  id: string;
  code: string;
  name: string;
  location: string;
  manager: string;
  item_count: number;
  stock_value: number;
  capacity_pct: number;
  status: string;
}

const STORES: StoreCenter[] = [
  { id: '1', code: 'STR-LGS-01', name: 'Lagos Main Warehouse',    location: 'Lagos, Nigeria',       manager: 'Tunde Adeyemi',  item_count: 312, stock_value: 2841200, capacity_pct: 74, status: 'active' },
  { id: '2', code: 'STR-ABJ-01', name: 'Abuja Distribution Hub',  location: 'Abuja, Nigeria',       manager: 'Fatima Aliyu',   item_count: 184, stock_value: 1342000, capacity_pct: 61, status: 'active' },
  { id: '3', code: 'STR-PH-01',  name: 'Port Harcourt Store',     location: 'Port Harcourt, Nigeria',manager: 'Chidi Okonkwo', item_count: 97,  stock_value: 784500,  capacity_pct: 42, status: 'active' },
  { id: '4', code: 'STR-KN-01',  name: 'Kano Regional Store',     location: 'Kano, Nigeria',        manager: 'Ibrahim Musa',   item_count: 63,  stock_value: 412300,  capacity_pct: 38, status: 'active' },
  { id: '5', code: 'STR-IB-01',  name: 'Ibadan Overflow Store',   location: 'Ibadan, Nigeria',      manager: 'Remi Olawale',   item_count: 28,  stock_value: 195800,  capacity_pct: 88, status: 'active' },
];

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

const columns: ColumnDef<StoreCenter>[] = [
  { accessorKey: 'code',         header: 'Code',           cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',         header: 'Store Name',     cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'location',     header: 'Location',       cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'manager',      header: 'Manager',        cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'item_count',   header: 'Items',          cell: i => <span className="font-bold tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'stock_value',  header: 'Stock Value',    cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
  {
    accessorKey: 'capacity_pct',
    header: 'Capacity',
    cell: ({ row }) => {
      const pct = row.original.capacity_pct;
      const color = pct >= 85 ? '#cc0c39' : pct >= 70 ? '#c45500' : '#067d62';
      return (
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full" style={{ background: '#f0f0f0' }}>
            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
          </div>
          <span className="text-xs font-semibold tabular-nums" style={{ color }}>{pct}%</span>
        </div>
      );
    },
  },
  { accessorKey: 'status', header: 'Status', cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function StoreCentersPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'stock_value', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Centers"
        description="Manage warehouse locations and stock distribution"
        actions={
          <PermissionGuard permission="inventory.products.create">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ Add Store</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={STORES} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
