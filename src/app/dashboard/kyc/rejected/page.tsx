'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';

interface KycRejected {
  id: string;
  ref: string;
  applicant: string;
  business_type: string;
  rejected_by: string;
  rejected_date: string;
  reason: string;
}

const REJECTED: KycRejected[] = [
  { id: '7', ref: 'KYC-00235', applicant: 'Horizon Textile Mills',   business_type: 'Textile', rejected_by: 'James Okafor', rejected_date: '2026-04-20', reason: 'Incomplete documentation — CAC cert missing' },
  { id: '9', ref: 'KYC-00233', applicant: 'Delta Maritime Freight',  business_type: 'Freight', rejected_by: 'Sarah Mensah', rejected_date: '2026-04-18', reason: 'Director identification failed verification' },
  { id: '12',ref: 'KYC-00230', applicant: 'Nighthawk Electronics',   business_type: 'Electronics', rejected_by: 'Emeka Bello', rejected_date: '2026-04-14', reason: 'Bank statement inconsistency' },
];

const columns: ColumnDef<KycRejected>[] = [
  { accessorKey: 'ref',           header: 'Ref #',          cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'applicant',     header: 'Applicant',      cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'business_type', header: 'Business Type',  cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'rejected_by',   header: 'Rejected By',    cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'rejected_date', header: 'Rejected Date',  cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'reason',        header: 'Reason',         cell: i => <span className="text-xs" style={{ color: '#cc0c39' }}>{String(i.getValue())}</span> },
  { id: 'status', header: 'Status', cell: () => <StatusBadge status="rejected" /> },
];

export default function KycRejectedPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'rejected_date', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader title="Rejected KYC" description="Applications that failed verification" />
      <DataTable
        columns={columns}
        data={REJECTED}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/kyc/applications/${row.id}`)}
      />
    </div>
  );
}
