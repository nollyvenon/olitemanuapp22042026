'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';

interface MovementReport {
  id: string;
  ref: string;
  item: string;
  type: string;
  store: string;
  qty_in: number;
  qty_out: number;
  balance: number;
  date: string;
}

const DATA: MovementReport[] = [
  { id: '1',  ref: 'MOV-01841', item: 'Steel Rod 16mm',          type: 'Receipt',    store: 'Lagos Main',    qty_in: 500,  qty_out: 0,   balance: 787,  date: '2026-04-22' },
  { id: '2',  ref: 'MOV-01840', item: 'Cement OPC 50kg',          type: 'Issue',      store: 'Lagos Main',    qty_in: 0,    qty_out: 120, balance: 1240, date: '2026-04-22' },
  { id: '3',  ref: 'MOV-01839', item: 'PVC Pipe 50mm',            type: 'Transfer',   store: 'Lagos → Abuja', qty_in: 200,  qty_out: 200, balance: 640,  date: '2026-04-21' },
  { id: '4',  ref: 'MOV-01838', item: 'Aluminium Sheet 5mm',      type: 'Receipt',    store: 'Port Harcourt', qty_in: 400,  qty_out: 0,   balance: 438,  date: '2026-04-21' },
  { id: '5',  ref: 'MOV-01837', item: 'Steel Coil HRC 3mm',       type: 'Issue',      store: 'Lagos Main',    qty_in: 0,    qty_out: 85,  balance: 12,   date: '2026-04-20' },
  { id: '6',  ref: 'MOV-01836', item: 'Bolt M12 Stainless Steel', type: 'Receipt',    store: 'Abuja Hub',     qty_in: 1200, qty_out: 0,   balance: 620,  date: '2026-04-20' },
  { id: '7',  ref: 'MOV-01835', item: 'Plywood 18mm Standard',    type: 'Issue',      store: 'Kano Regional', qty_in: 0,    qty_out: 48,  balance: 312,  date: '2026-04-19' },
  { id: '8',  ref: 'MOV-01834', item: 'Copper Wire 2.5mm',        type: 'Adjustment', store: 'Lagos Main',    qty_in: 30,   qty_out: 0,   balance: 54,   date: '2026-04-19' },
  { id: '9',  ref: 'MOV-01833', item: 'Clear Float Glass 6mm',    type: 'Issue',      store: 'Ibadan',        qty_in: 0,    qty_out: 60,  balance: 145,  date: '2026-04-18' },
];

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Receipt:    { bg: '#e8f8f5', color: '#067d62' },
  Issue:      { bg: '#fff8e7', color: '#c45500' },
  Transfer:   { bg: '#e8f0fe', color: '#146eb4' },
  Adjustment: { bg: '#f4f6f8', color: '#555555' },
};

const columns: ColumnDef<MovementReport>[] = [
  { accessorKey: 'ref',     header: 'Ref #',    cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'item',    header: 'Item',     cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: i => {
      const t = String(i.getValue());
      const s = TYPE_COLORS[t] ?? { bg: '#f4f6f8', color: '#555555' };
      return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={s}>{t}</span>;
    },
  },
  { accessorKey: 'store',   header: 'Store',    cell: i => <span className="text-xs" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'qty_in',  header: 'Qty In',   cell: i => <span className="font-bold tabular-nums" style={{ color: (i.getValue() as number) > 0 ? '#067d62' : '#767676' }}>{(i.getValue() as number) > 0 ? `+${(i.getValue() as number).toLocaleString()}` : '—'}</span> },
  { accessorKey: 'qty_out', header: 'Qty Out',  cell: i => <span className="font-bold tabular-nums" style={{ color: (i.getValue() as number) > 0 ? '#cc0c39' : '#767676' }}>{(i.getValue() as number) > 0 ? `-${(i.getValue() as number).toLocaleString()}` : '—'}</span> },
  { accessorKey: 'balance', header: 'Balance',  cell: i => <span className="font-bold tabular-nums">{(i.getValue() as number).toLocaleString()}</span> },
  { accessorKey: 'date',    header: 'Date',     cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
];

export default function MovementsReportPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader title="Stock Movements Report" description="All inventory in/out activity with running balances" />
      <DataTable columns={columns} data={DATA} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
