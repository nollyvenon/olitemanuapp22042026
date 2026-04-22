'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';

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

const MOVEMENTS: StockMovement[] = [
  { id: '1',  ref: 'MOV-01841', item_code: 'STL-ROD-16',   item_name: 'Steel Rod 16mm',          movement_type: 'Receipt',  to_store: 'Lagos Main',    qty: 500,  unit: 'Ton',  date: '2026-04-22', direction: 'in' },
  { id: '2',  ref: 'MOV-01840', item_code: 'CEM-OPC-50',   item_name: 'Cement OPC 50kg',          movement_type: 'Issue',    from_store: 'Lagos Main',  qty: 120,  unit: 'Bag',  date: '2026-04-22', direction: 'out' },
  { id: '3',  ref: 'MOV-01839', item_code: 'PVC-PIPE-50',  item_name: 'PVC Pipe 50mm',            movement_type: 'Transfer', from_store: 'Lagos Main',  to_store: 'Abuja Hub',    qty: 200,  unit: 'Metre', date: '2026-04-21', direction: 'out' },
  { id: '4',  ref: 'MOV-01838', item_code: 'PVC-PIPE-50',  item_name: 'PVC Pipe 50mm',            movement_type: 'Transfer', from_store: 'Lagos Main',  to_store: 'Abuja Hub',    qty: 200,  unit: 'Metre', date: '2026-04-21', direction: 'in' },
  { id: '5',  ref: 'MOV-01837', item_code: 'ALU-SHT-5MM',  item_name: 'Aluminium Sheet 5mm',      movement_type: 'Receipt',  to_store: 'Port Harcourt', qty: 400,  unit: 'Kg',   date: '2026-04-21', direction: 'in' },
  { id: '6',  ref: 'MOV-01836', item_code: 'STL-HRC-3MM',  item_name: 'Steel Coil HRC 3mm',       movement_type: 'Issue',    from_store: 'Lagos Main',  qty: 85,   unit: 'Ton',  date: '2026-04-20', direction: 'out' },
  { id: '7',  ref: 'MOV-01835', item_code: 'BLT-M12-SS',   item_name: 'Bolt M12 Stainless Steel', movement_type: 'Receipt',  to_store: 'Abuja Hub',     qty: 1200, unit: 'Box',  date: '2026-04-20', direction: 'in' },
  { id: '8',  ref: 'MOV-01834', item_code: 'PLY-18MM-STD', item_name: 'Plywood 18mm Standard',    movement_type: 'Issue',    from_store: 'Kano Regional', qty: 48, unit: 'Sheet',date: '2026-04-19', direction: 'out' },
  { id: '9',  ref: 'MOV-01833', item_code: 'COP-WIR-2.5',  item_name: 'Copper Wire 2.5mm',        movement_type: 'Adjustment', to_store: 'Lagos Main',  qty: 30,   unit: 'Kg',   date: '2026-04-19', direction: 'in' },
  { id: '10', ref: 'MOV-01832', item_code: 'GLS-CLR-6MM',  item_name: 'Clear Float Glass 6mm',    movement_type: 'Issue',    from_store: 'Ibadan',      qty: 60,   unit: 'Sqm',  date: '2026-04-18', direction: 'out' },
];

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
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader title="Stock Movements" description="All inventory receipts, issues, transfers and adjustments" />
      <DataTable columns={columns} data={MOVEMENTS} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
