'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface Journal {
  id: string;
  ref: string;
  type: string;
  store: string;
  date: string;
  items: number;
  total_qty: number;
  created_by: string;
  status: string;
}

const JOURNALS: Journal[] = [
  { id: '1',  ref: 'JNL-00512', type: 'Stock Receipt',   store: 'Lagos Main',    date: '2026-04-22', items: 8,  total_qty: 1240, created_by: 'Tunde Adeyemi',  status: 'posted' },
  { id: '2',  ref: 'JNL-00511', type: 'Stock Issue',     store: 'Abuja Hub',     date: '2026-04-22', items: 4,  total_qty: 380,  created_by: 'Fatima Aliyu',   status: 'posted' },
  { id: '3',  ref: 'JNL-00510', type: 'Transfer In',     store: 'Lagos Main',    date: '2026-04-21', items: 6,  total_qty: 720,  created_by: 'Tunde Adeyemi',  status: 'posted' },
  { id: '4',  ref: 'JNL-00509', type: 'Transfer Out',    store: 'Port Harcourt', date: '2026-04-21', items: 6,  total_qty: 720,  created_by: 'Chidi Okonkwo',  status: 'posted' },
  { id: '5',  ref: 'JNL-00508', type: 'Stock Receipt',   store: 'Kano Regional', date: '2026-04-20', items: 3,  total_qty: 450,  created_by: 'Ibrahim Musa',   status: 'posted' },
  { id: '6',  ref: 'JNL-00507', type: 'Adjustment',      store: 'Lagos Main',    date: '2026-04-20', items: 2,  total_qty: 40,   created_by: 'Tunde Adeyemi',  status: 'pending' },
  { id: '7',  ref: 'JNL-00506', type: 'Stock Issue',     store: 'Lagos Main',    date: '2026-04-19', items: 9,  total_qty: 1840, created_by: 'Tunde Adeyemi',  status: 'posted' },
  { id: '8',  ref: 'JNL-00505', type: 'Return to Store', store: 'Abuja Hub',     date: '2026-04-18', items: 2,  total_qty: 85,   created_by: 'Fatima Aliyu',   status: 'pending' },
];

const columns: ColumnDef<Journal>[] = [
  { accessorKey: 'ref',        header: 'Reference',   cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'type',       header: 'Type',        cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'store',      header: 'Store',       cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'date',       header: 'Date',        cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'items',      header: 'Lines',       cell: i => <span className="tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'total_qty',  header: 'Total Qty',   cell: i => <span className="font-bold tabular-nums">{(i.getValue() as number).toLocaleString()}</span> },
  { accessorKey: 'created_by', header: 'Created By',  cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'status',     header: 'Status',      cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function JournalsPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Journals"
        description="Stock receipts, issues, transfers and adjustments"
        actions={
          <PermissionGuard permission="inventory.stock.movement">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ New Journal</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={JOURNALS} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
