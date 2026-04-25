'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';

interface KycApplication {
  id: string;
  ref: string;
  applicant: string;
  business_type: string;
  submitted_date: string;
  reviewed_by?: string;
  reviewed_date?: string;
  status: string;
}

const APPLICATIONS: KycApplication[] = [
  { id: '1',  ref: 'KYC-00241', applicant: 'Sunfield Manufacturing',   business_type: 'Manufacturer',  submitted_date: '2026-04-22', status: 'pending' },
  { id: '2',  ref: 'KYC-00240', applicant: 'Blazer Steel Works',        business_type: 'Distributor',   submitted_date: '2026-04-22', status: 'pending' },
  { id: '3',  ref: 'KYC-00239', applicant: 'Crescent Agro Ltd',         business_type: 'Agro-Processor', submitted_date: '2026-04-21', status: 'pending' },
  { id: '4',  ref: 'KYC-00238', applicant: 'Prime Logistics Co',         business_type: 'Logistics',     submitted_date: '2026-04-21', status: 'pending' },
  { id: '5',  ref: 'KYC-00237', applicant: 'Vortex Engineering',        business_type: 'Engineering',   submitted_date: '2026-04-20', status: 'approved', reviewed_by: 'James Okafor',  reviewed_date: '2026-04-21' },
  { id: '6',  ref: 'KYC-00236', applicant: 'Tropics Chemical Ltd',      business_type: 'Chemical',      submitted_date: '2026-04-20', status: 'approved', reviewed_by: 'Sarah Mensah',  reviewed_date: '2026-04-21' },
  { id: '7',  ref: 'KYC-00235', applicant: 'Horizon Textile Mills',     business_type: 'Textile',       submitted_date: '2026-04-19', status: 'rejected', reviewed_by: 'James Okafor',  reviewed_date: '2026-04-20' },
  { id: '8',  ref: 'KYC-00234', applicant: 'Sandstone Quarries',        business_type: 'Mining',        submitted_date: '2026-04-18', status: 'approved', reviewed_by: 'Emeka Bello',   reviewed_date: '2026-04-19' },
  { id: '9',  ref: 'KYC-00233', applicant: 'Delta Maritime Freight',    business_type: 'Freight',       submitted_date: '2026-04-17', status: 'rejected', reviewed_by: 'Sarah Mensah',  reviewed_date: '2026-04-18' },
  { id: '10', ref: 'KYC-00232', applicant: 'CloudBridge Tech',          business_type: 'Technology',    submitted_date: '2026-04-16', status: 'approved', reviewed_by: 'James Okafor',  reviewed_date: '2026-04-17' },
];

const fmtDate = (s?: string) => s ? new Date(s).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const columns: ColumnDef<KycApplication>[] = [
  { accessorKey: 'ref',           header: 'Ref #',            cell: i => <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'applicant',     header: 'Applicant',        cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  { accessorKey: 'business_type', header: 'Business Type',    cell: i => <span className="text-sm" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'submitted_date',header: 'Submitted',        cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtDate(String(i.getValue()))}</span> },
  { accessorKey: 'reviewed_by',   header: 'Reviewed By',      cell: i => <span className="text-sm" style={{ color: '#767676' }}>{String(i.getValue() ?? '—')}</span> },
  { accessorKey: 'reviewed_date', header: 'Reviewed Date',    cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtDate(i.getValue() as string | undefined)}</span> },
  { accessorKey: 'status',        header: 'Status',           cell: i => <StatusBadge status={String(i.getValue())} /> },
];

export default function KycApplicationsPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'submitted_date', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader title="KYC Applications" description="Customer onboarding and compliance verification" />
      <DataTable
        columns={columns}
        data={APPLICATIONS}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={row => router.push(`/dashboard/kyc/applications/${row.id}`)}
      />
    </div>
  );
}
