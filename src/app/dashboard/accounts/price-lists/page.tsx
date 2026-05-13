'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface PriceList {
  id: string;
  code: string;
  name: string;
  currency: string;
  customer_segment: string;
  item_count: number;
  effective_from: string;
  effective_to: string;
  status: string;
}

const PRICE_LISTS: PriceList[] = [
  { id: '1', code: 'PL-2026-STD',  name: 'Standard Price List 2026',    currency: 'NGN', customer_segment: 'General',    item_count: 248, effective_from: '2026-01-01', effective_to: '2026-12-31', status: 'active' },
  { id: '2', code: 'PL-2026-PREM', name: 'Premium Customer 2026',        currency: 'NGN', customer_segment: 'Premium',    item_count: 248, effective_from: '2026-01-01', effective_to: '2026-12-31', status: 'active' },
  { id: '3', code: 'PL-2026-EXP',  name: 'Export Price List 2026',       currency: 'NGN', customer_segment: 'Export',     item_count: 120, effective_from: '2026-01-01', effective_to: '2026-12-31', status: 'active' },
  { id: '4', code: 'PL-2026-WHB',  name: 'Wholesale Bulk 2026',          currency: 'NGN', customer_segment: 'Wholesale',  item_count: 180, effective_from: '2026-01-01', effective_to: '2026-06-30', status: 'active' },
  { id: '5', code: 'PL-2025-STD',  name: 'Standard Price List 2025',     currency: 'NGN', customer_segment: 'General',    item_count: 231, effective_from: '2025-01-01', effective_to: '2025-12-31', status: 'inactive' },
  { id: '6', code: 'PL-Q2-PROMO',  name: 'Q2 2026 Promotional Prices',   currency: 'NGN', customer_segment: 'All',        item_count: 48,  effective_from: '2026-04-01', effective_to: '2026-06-30', status: 'active' },
];

const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });

const columns: ColumnDef<PriceList>[] = [
  { accessorKey: 'code',             header: 'Code',             cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'name',             header: 'Price List',       cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'currency',         header: 'Currency',         cell: i => <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#e8f0fe', color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'customer_segment', header: 'Segment',          cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'item_count',       header: 'Items',            cell: i => <span className="font-bold tabular-nums">{String(i.getValue())}</span> },
  { accessorKey: 'effective_from',   header: 'Effective From',   cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtDate(String(i.getValue()))}</span> },
  { accessorKey: 'effective_to',     header: 'Effective To',     cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtDate(String(i.getValue()))}</span> },
  { accessorKey: 'status',           header: 'Status',           cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function PriceListsPage() {
  const api = getApiClient();
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'effective_from', desc: true }]);
  
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/price-lists');
        const list = Array.isArray(data) ? data : (data as { data?: PriceList[] }).data ?? [];
        setPriceLists(list);
      } catch (err) {
        console.error('Failed to load price lists', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Price Lists"
        description="Manage customer pricing tiers and promotional rates"
        actions={
          <PermissionGuard permission="accounts.ledger.create">
            <Button style={{ background: '#FF9900', color: '#0f1111' }} className="font-semibold hover:opacity-90">+ New Price List</Button>
          </PermissionGuard>
        }
      />
      <DataTable columns={columns} data={priceLists} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
