'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  qty_on_hand: number;
  reorder_level: number;
  unit_cost: number;
  stock_value: number;
  status: string;
}

const ITEMS: InventoryItem[] = [
  { id: '1',  code: 'STL-HRC-3MM',  name: 'Steel Coil HRC 3mm',       category: 'Raw Steel',      unit: 'Ton',  qty_on_hand: 12,  reorder_level: 200, unit_cost: 890,   stock_value: 10680,   status: 'low_stock' },
  { id: '2',  code: 'ALU-SHT-5MM',  name: 'Aluminium Sheet 5mm',      category: 'Aluminium',      unit: 'Kg',   qty_on_hand: 38,  reorder_level: 100, unit_cost: 4.2,   stock_value: 159.6,   status: 'low_stock' },
  { id: '3',  code: 'COP-WIR-2.5',  name: 'Copper Wire 2.5mm',        category: 'Copper',         unit: 'Kg',   qty_on_hand: 54,  reorder_level: 150, unit_cost: 9.8,   stock_value: 529.2,   status: 'low_stock' },
  { id: '4',  code: 'PLY-18MM-STD', name: 'Plywood 18mm Standard',    category: 'Wood Products',  unit: 'Sheet',qty_on_hand: 312, reorder_level: 100, unit_cost: 28,    stock_value: 8736,    status: 'active' },
  { id: '5',  code: 'PVC-PIPE-50',  name: 'PVC Pipe 50mm',            category: 'Pipes',          unit: 'Metre',qty_on_hand: 840, reorder_level: 200, unit_cost: 3.5,   stock_value: 2940,    status: 'active' },
  { id: '6',  code: 'CEM-OPC-50',   name: 'Cement OPC 50kg',          category: 'Cement',         unit: 'Bag',  qty_on_hand: 1240,reorder_level: 500, unit_cost: 18,    stock_value: 22320,   status: 'active' },
  { id: '7',  code: 'STL-ROD-16',   name: 'Steel Rod 16mm',           category: 'Raw Steel',      unit: 'Ton',  qty_on_hand: 287, reorder_level: 100, unit_cost: 780,   stock_value: 223860,  status: 'active' },
  { id: '8',  code: 'PAI-EPX-5L',   name: 'Epoxy Paint 5L',           category: 'Coatings',       unit: 'Can',  qty_on_hand: 0,   reorder_level: 50,  unit_cost: 42,    stock_value: 0,       status: 'out_of_stock' },
  { id: '9',  code: 'BLT-M12-SS',   name: 'Bolt M12 Stainless Steel', category: 'Fasteners',      unit: 'Box',  qty_on_hand: 620, reorder_level: 100, unit_cost: 12,    stock_value: 7440,    status: 'active' },
  { id: '10', code: 'GLS-CLR-6MM',  name: 'Clear Float Glass 6mm',    category: 'Glass',          unit: 'Sqm',  qty_on_hand: 145, reorder_level: 80,  unit_cost: 24,    stock_value: 3480,    status: 'active' },
  { id: '11', code: 'RUB-SHT-5MM',  name: 'Rubber Sheet 5mm',         category: 'Rubber',         unit: 'Sqm',  qty_on_hand: 73,  reorder_level: 100, unit_cost: 18,    stock_value: 1314,    status: 'low_stock' },
  { id: '12', code: 'INS-FBR-25MM', name: 'Fibre Glass Insulation',   category: 'Insulation',     unit: 'Roll', qty_on_hand: 88,  reorder_level: 50,  unit_cost: 35,    stock_value: 3080,    status: 'active' },
];

const fmt = (v: number, decimals = 0) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);

const columns: ColumnDef<InventoryItem>[] = [
  { accessorKey: 'code',        header: 'Code',        cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',        header: 'Item Name',   cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'category',    header: 'Category',    cell: i => <span className="text-xs" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'unit',        header: 'Unit',        cell: i => <span className="text-xs">{String(i.getValue())}</span> },
  {
    accessorKey: 'qty_on_hand',
    header: 'Qty on Hand',
    cell: ({ row }) => {
      const isLow = row.original.qty_on_hand <= row.original.reorder_level;
      const isOut = row.original.qty_on_hand === 0;
      return <span className="font-bold tabular-nums" style={{ color: isOut ? '#cc0c39' : isLow ? '#c45500' : '#067d62' }}>{row.original.qty_on_hand.toLocaleString()}</span>;
    },
  },
  { accessorKey: 'reorder_level', header: 'Reorder Lvl', cell: i => <span className="tabular-nums text-sm" style={{ color: '#767676' }}>{(i.getValue() as number).toLocaleString()}</span> },
  { accessorKey: 'unit_cost',     header: 'Unit Cost',   cell: i => <span className="tabular-nums text-sm">{fmt(i.getValue() as number, 2)}</span> },
  { accessorKey: 'stock_value',   header: 'Stock Value', cell: i => <span className="font-bold tabular-nums">{fmt(i.getValue() as number)}</span> },
  { accessorKey: 'status',        header: 'Status',      cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function InventoryItemsPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'status', desc: false }]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Items"
        description="Manage stock levels, costs, and reorder points"
        actions={
          <PermissionGuard permission="inventory.products.create">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">
              + Add Item
            </Button>
          </PermissionGuard>
        }
      />
      <DataTable
        columns={columns}
        data={ITEMS}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/inventory/items/${row.id}`)}
      />
    </div>
  );
}
