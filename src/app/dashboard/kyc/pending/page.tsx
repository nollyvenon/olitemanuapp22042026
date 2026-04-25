'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/shared/PermissionGuard';

interface KycApplication {
  id: string;
  ref: string;
  applicant: string;
  business_type: string;
  submitted_date: string;
  days_pending: number;
}

const PENDING: KycApplication[] = [
  { id: '1',  ref: 'KYC-00241', applicant: 'Sunfield Manufacturing',   business_type: 'Manufacturer',   submitted_date: '2026-04-22', days_pending: 0 },
  { id: '2',  ref: 'KYC-00240', applicant: 'Blazer Steel Works',        business_type: 'Distributor',    submitted_date: '2026-04-22', days_pending: 0 },
  { id: '3',  ref: 'KYC-00239', applicant: 'Crescent Agro Ltd',         business_type: 'Agro-Processor', submitted_date: '2026-04-21', days_pending: 1 },
  { id: '4',  ref: 'KYC-00238', applicant: 'Prime Logistics Co',         business_type: 'Logistics',      submitted_date: '2026-04-21', days_pending: 1 },
];

const columns: ColumnDef<KycApplication>[] = [
  { accessorKey: 'ref',           header: 'Ref #',          cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'applicant',     header: 'Applicant',      cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'business_type', header: 'Business Type',  cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'submitted_date',header: 'Submitted',      cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  {
    accessorKey: 'days_pending',
    header: 'Days Pending',
    cell: i => {
      const d = i.getValue() as number;
      return <span className="font-bold tabular-nums" style={{ color: d >= 3 ? '#cc0c39' : d >= 1 ? '#c45500' : '#067d62' }}>{d}d</span>;
    },
  },
  { id: 'status', header: 'Status', cell: () => <StatusBadge status="pending" /> },
];

export default function KycPendingPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'days_pending', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending KYC"
        description="Applications awaiting review and approval"
        actions={<span className="text-sm font-semibold px-3 py-1.5 rounded" style={{ background: '#fff8e7', color: '#c45500' }}>{PENDING.length} pending</span>}
      />
      <DataTable
        columns={columns}
        data={PENDING}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/kyc/applications/${row.id}`)}
      />
    </div>
  );
}
