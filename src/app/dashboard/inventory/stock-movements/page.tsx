'use client';

import { useState, useEffect } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { getApiClient } from '@/lib/api-client';

interface StockMovement {
  id: string;
  ref: string;
  item_code: string;
  item_name: string;
  movement_type: string;
  from_store?: string;
  to_store?: string;
  qty: number;
  unit: string;
  date: string;
  direction: 'in' | 'out';
}

const columns: ColumnDef<StockMovement>[] = [
  { accessorKey: 'ref',           header: 'Ref #',         cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'item_code',     header: 'Item Code',     cell: i => <span className="font-mono text-xs" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'item_name',     header: 'Item',          cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'movement_type', header: 'Type',          cell: i => <StatusBadge status={String(i.getValue()).toLowerCase().replace(' ', '-')} label={String(i.getValue())} /> },
  {
    id: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const { from_store, to_store, movement_type } = row.original;
      if (movement_type === 'Transfer') return <span className="text-xs" style={{ color: '#555555' }}>{from_store} → {to_store}</span>;
      return <span className="text-xs" style={{ color: '#555555' }}>{from_store ?? to_store}</span>;
    },
  },
  {
    accessorKey: 'qty',
    header: 'Qty',
    cell: ({ row }) => (
      <span className="font-bold tabular-nums" style={{ color: row.original.direction === 'in' ? '#067d62' : '#cc0c39' }}>
        {row.original.direction === 'in' ? '+' : '-'}{row.original.qty.toLocaleString()} {row.original.unit}
      </span>
    ),
  },
  { accessorKey: 'date', header: 'Date', cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
];

export default function StockMovementsPage() {
  const api = getApiClient();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/stock/journals');
        const list = Array.isArray(data) ? data : data.data ?? [];
        setMovements(list);
      } catch (err) {
        console.error('Failed to load movements', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Movements" description="All inventory receipts, issues, transfers and adjustments" />
      <DataTable columns={columns} data={movements} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
