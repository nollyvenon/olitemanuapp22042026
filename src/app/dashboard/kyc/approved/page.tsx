'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';

interface KycApproved {
  id: string;
  ref: string;
  applicant: string;
  business_type: string;
  approved_by: string;
  approved_date: string;
  customer_account?: string;
}

const APPROVED: KycApproved[] = [
  { id: '5',  ref: 'KYC-00237', applicant: 'Vortex Engineering',       business_type: 'Engineering', approved_by: 'James Okafor', approved_date: '2026-04-21', customer_account: 'DEB-011' },
  { id: '6',  ref: 'KYC-00236', applicant: 'Tropics Chemical Ltd',     business_type: 'Chemical',    approved_by: 'Sarah Mensah', approved_date: '2026-04-21', customer_account: 'DEB-012' },
  { id: '8',  ref: 'KYC-00234', applicant: 'Sandstone Quarries',       business_type: 'Mining',      approved_by: 'Emeka Bello',  approved_date: '2026-04-19', customer_account: 'DEB-013' },
  { id: '10', ref: 'KYC-00232', applicant: 'CloudBridge Tech',         business_type: 'Technology',  approved_by: 'James Okafor', approved_date: '2026-04-17', customer_account: 'DEB-014' },
  { id: '11', ref: 'KYC-00231', applicant: 'Nexagen Pharmaceuticals',  business_type: 'Pharma',      approved_by: 'Sarah Mensah', approved_date: '2026-04-15', customer_account: 'DEB-015' },
];

const columns: ColumnDef<KycApproved>[] = [
  { accessorKey: 'ref',              header: 'Ref #',           cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'applicant',        header: 'Applicant',       cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'business_type',    header: 'Business Type',   cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'approved_by',      header: 'Approved By',     cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'approved_date',    header: 'Approved Date',   cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{new Date(String(i.getValue())).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  { accessorKey: 'customer_account', header: 'Customer Acct',  cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#067d62' }}>{String(i.getValue() ?? '—')}</span> },
  { id: 'status', header: 'Status',  cell: () => <StatusBadge status="approved" /> },
];

export default function KycApprovedPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'approved_date', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader title="Approved KYC" description="Successfully verified customers" />
      <DataTable
        columns={columns}
        data={APPROVED}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/kyc/applications/${row.id}`)}
      />
    </div>
  );
}
