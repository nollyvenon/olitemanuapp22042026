'use client';

import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  target: string;
  ip: string;
  timestamp: string;
  result: string;
}

const LOGS: AuditLog[] = [
  { id: '1',  user: 'James Okafor',  action: 'APPROVE',  module: 'Sales',     target: 'ORD-00241',  ip: '196.45.12.88',  timestamp: '2026-04-22T14:32:11', result: 'success' },
  { id: '2',  user: 'Sarah Mensah',  action: 'CREATE',   module: 'Sales',     target: 'ORD-00240',  ip: '196.45.12.91',  timestamp: '2026-04-22T13:18:47', result: 'success' },
  { id: '3',  user: 'Tunde Adeyemi', action: 'RECEIVE',  module: 'Inventory', target: 'JNL-00512',  ip: '196.45.12.74',  timestamp: '2026-04-22T11:42:03', result: 'success' },
  { id: '4',  user: 'Emeka Bello',   action: 'POST',     module: 'Accounts',  target: 'VCH-00391',  ip: '196.45.12.83',  timestamp: '2026-04-22T10:55:19', result: 'success' },
  { id: '5',  user: 'Fatima Aliyu',  action: 'TRANSFER', module: 'Inventory', target: 'JNL-00509',  ip: '10.0.1.52',     timestamp: '2026-04-21T16:24:38', result: 'success' },
  { id: '6',  user: 'Ngozi Eze',     action: 'APPROVE',  module: 'KYC',       target: 'KYC-00237',  ip: '196.45.12.99',  timestamp: '2026-04-21T15:11:02', result: 'success' },
  { id: '7',  user: 'James Okafor',  action: 'REJECT',   module: 'KYC',       target: 'KYC-00235',  ip: '196.45.12.88',  timestamp: '2026-04-20T09:33:54', result: 'success' },
  { id: '8',  user: 'Dayo Adebayo',  action: 'LOGIN',    module: 'Auth',      target: 'session',    ip: '41.211.84.120', timestamp: '2026-04-20T08:12:44', result: 'failed' },
  { id: '9',  user: 'Sarah Mensah',  action: 'SUBMIT',   module: 'Sales',     target: 'ORD-00236',  ip: '196.45.12.91',  timestamp: '2026-04-20T07:59:28', result: 'success' },
  { id: '10', user: 'Ibrahim Musa',  action: 'ISSUE',    module: 'Inventory', target: 'JNL-00511',  ip: '10.0.2.18',     timestamp: '2026-04-19T17:41:15', result: 'success' },
];

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  APPROVE:  { bg: '#e8f8f5', color: '#067d62' },
  CREATE:   { bg: '#e8f0fe', color: '#146eb4' },
  SUBMIT:   { bg: '#e8f0fe', color: '#146eb4' },
  RECEIVE:  { bg: '#e8f8f5', color: '#067d62' },
  POST:     { bg: '#e8f8f5', color: '#067d62' },
  TRANSFER: { bg: '#fff8e7', color: '#c45500' },
  REJECT:   { bg: '#fdecea', color: '#cc0c39' },
  LOGIN:    { bg: '#f4f6f8', color: '#555555' },
  ISSUE:    { bg: '#fff8e7', color: '#c45500' },
};

const fmtTime = (s: string) => new Date(s).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

const columns: ColumnDef<AuditLog>[] = [
  { accessorKey: 'user',      header: 'User',      cell: i => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: i => {
      const a = String(i.getValue());
      const s = ACTION_COLORS[a] ?? { bg: '#f4f6f8', color: '#555555' };
      return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={s}>{a}</span>;
    },
  },
  { accessorKey: 'module',    header: 'Module',    cell: i => <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#e8f0fe', color: '#146eb4' }}>{String(i.getValue())}</span> },
  { accessorKey: 'target',    header: 'Target',    cell: i => <span className="font-mono text-xs" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'ip',        header: 'IP Address', cell: i => <span className="font-mono text-xs" style={{ color: '#767676' }}>{String(i.getValue())}</span> },
  { accessorKey: 'timestamp', header: 'Timestamp', cell: i => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtTime(String(i.getValue()))}</span> },
  {
    accessorKey: 'result',
    header: 'Result',
    cell: i => {
      const r = String(i.getValue());
      return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: r === 'success' ? '#e8f8f5' : '#fdecea', color: r === 'success' ? '#067d62' : '#cc0c39' }}>{r}</span>;
    },
  },
];

export default function AuditLogsPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Complete trail of all system activity and user actions" />
      <DataTable columns={columns} data={LOGS} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
