'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';

interface InventoryReport {
  id: string;
  code: string;
  name: string;
  category: string;
  store: string;
  qty: number;
  reorder: number;
  unit_cost: number;
  stock_value: number;
  status: string;
}

const DATA: InventoryReport[] = [
  { id: '1',  code: 'STL-ROD-16',   name: 'Steel Rod 16mm',          category: 'Raw Steel',    store: 'Lagos Main',     qty: 287,  reorder: 100, unit_cost: 780,  stock_value: 223860,  status: 'active' },
  { id: '2',  code: 'CEM-OPC-50',   name: 'Cement OPC 50kg',          category: 'Cement',       store: 'Lagos Main',     qty: 1240, reorder: 500, unit_cost: 18,   stock_value: 22320,   status: 'active' },
  { id: '3',  code: 'STL-HRC-3MM',  name: 'Steel Coil HRC 3mm',       category: 'Raw Steel',    store: 'Lagos Main',     qty: 12,   reorder: 200, unit_cost: 890,  stock_value: 10680,   status: 'low_stock' },
  { id: '4',  code: 'ALU-SHT-5MM',  name: 'Aluminium Sheet 5mm',      category: 'Aluminium',    store: 'Port Harcourt',  qty: 438,  reorder: 100, unit_cost: 4.2,  stock_value: 1839.6,  status: 'active' },
  { id: '5',  code: 'PVC-PIPE-50',  name: 'PVC Pipe 50mm',            category: 'Pipes',        store: 'Abuja Hub',      qty: 640,  reorder: 200, unit_cost: 3.5,  stock_value: 2240,    status: 'active' },
  { id: '6',  code: 'COP-WIR-2.5',  name: 'Copper Wire 2.5mm',        category: 'Copper',       store: 'Lagos Main',     qty: 54,   reorder: 150, unit_cost: 9.8,  stock_value: 529.2,   status: 'low_stock' },
  { id: '7',  code: 'PLY-18MM-STD', name: 'Plywood 18mm Standard',    category: 'Wood',         store: 'Kano Regional',  qty: 312,  reorder: 100, unit_cost: 28,   stock_value: 8736,    status: 'active' },
  { id: '8',  code: 'PAI-EPX-5L',   name: 'Epoxy Paint 5L',           category: 'Coatings',     store: 'Lagos Main',     qty: 0,    reorder: 50,  unit_cost: 42,   stock_value: 0,       status: 'out_of_stock' },
  { id: '9',  code: 'BLT-M12-SS',   name: 'Bolt M12 Stainless Steel', category: 'Fasteners',    store: 'Abuja Hub',      qty: 620,  reorder: 100, unit_cost: 12,   stock_value: 7440,    status: 'active' },
  { id: '10', code: 'GLS-CLR-6MM',  name: 'Clear Float Glass 6mm',    category: 'Glass',        store: 'Lagos Main',     qty: 145,  reorder: 80,  unit_cost: 24,   stock_value: 3480,    status: 'active' },
];

const fmt = (v: number, d = 0) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

const columns: ColumnDef<InventoryReport>[] = [
  { accessorKey: 'code',        header: 'Code',        cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',        header: 'Item',        cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'category',    header: 'Category',    cell: i => <span className="text-xs" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'store',       header: 'Store',       cell: i => <span className="text-xs" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'qty',         header: 'Qty',         cell: ({ row }) => <span className="font-bold tabular-nums" style={{ color: row.original.qty === 0 ? '#cc0c39' : row.original.qty <= row.original.reorder ? '#c45500' : '#067d62' }}>{row.original.qty.toLocaleString()}</span> },
  { accessorKey: 'reorder',     header: 'Reorder',     cell: i => <span className="tabular-nums text-sm" style={{ color: '#767676' }}>{(i.getValue() as number).toLocaleString()}</span> },
  { accessorKey: 'unit_cost',   header: 'Unit Cost',   cell: i => <span className="tabular-nums text-sm">{fmt(i.getValue() as number, 2)}</span> },
  { accessorKey: 'stock_value', header: 'Stock Value', cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'status',      header: 'Status',      cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function InventoryReportPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'stock_value', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Report" description="Stock levels, valuation and reorder status as at today" />
      <DataTable columns={columns} data={DATA} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
