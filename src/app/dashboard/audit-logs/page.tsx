'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { getApiClient } from '@/lib/api-client';

interface AuditLog {
  id: string;
  user_id: string;
  user: string;
  action: string;
  module: string;
  target: string;
  ip: string;
  timestamp: string;
  result: string;
  name:string;
}

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  APPROVE: { bg: '#e8f8f5', color: '#067d62' },
  CREATE: { bg: '#e8f0fe', color: '#146eb4' },
  SUBMIT: { bg: '#e8f0fe', color: '#146eb4' },
  RECEIVE: { bg: '#e8f8f5', color: '#067d62' },
  POST: { bg: '#e8f8f5', color: '#067d62' },
  TRANSFER: { bg: '#fff8e7', color: '#c45500' },
  REJECT: { bg: '#fdecea', color: '#cc0c39' },
  LOGIN: { bg: '#f4f6f8', color: '#555555' },
  ISSUE: { bg: '#fff8e7', color: '#c45500' },
};

const fmtTime = (s: string) =>
  new Date(s).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

const columns: ColumnDef<AuditLog>[] = [
  { id: 'user_id', header: 'User ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.user_id}</span> },
  { accessorKey: 'user', header: 'User', cell: (i) => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(i.getValue())}</span> },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: (i) => {
      const a = String(i.getValue());
      const s = ACTION_COLORS[a] ?? { bg: '#f4f6f8', color: '#555555' };
      return (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={s}>
          {a}
        </span>
      );
    },
  },
  {
    accessorKey: 'module',
    header: 'Module',
    cell: (i) => (
      <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#e8f0fe', color: '#146eb4' }}>
        {String(i.getValue())}
      </span>
    ),
  },
  { accessorKey: 'target', header: 'Target', cell: (i) => <span className="font-mono text-xs" style={{ color: '#555555' }}>{String(i.getValue())}</span> },
  { accessorKey: 'ip', header: 'IP Address', cell: (i) => <span className="font-mono text-xs" style={{ color: '#767676' }}>{String(i.getValue())}</span> },
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: (i) => <span className="text-xs tabular-nums" style={{ color: '#767676' }}>{fmtTime(String(i.getValue()))}</span>,
  },
  {
    accessorKey: 'result',
    header: 'Result',
    cell: (i) => {
      const r = String(i.getValue());
      return (
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: r === 'success' ? '#e8f8f5' : '#fdecea',
            color: r === 'success' ? '#067d62' : '#cc0c39',
          }}
        >
          {r}
        </span>
      );
    },
  },
];

function mapRow(raw: Record<string, unknown>, i: number): AuditLog {
  const action = String(raw.action_type ?? raw.action ?? '—').toUpperCase();
  return {
    id: String(raw.id ?? i),
    user_id: String(raw.user_id ?? raw.userId ?? raw.actor_id ?? '—'),
    user: String(raw.user_name ?? raw.user?.name ?? raw.user ?? '—'),
    action,
    module: String(raw.entity_type ?? raw.module ?? '—'),
    target: String(raw.entity_id ?? raw.target ?? raw.reference ?? '—'),
    ip: String(raw.ip_address ?? raw.ip ?? '—'),
    timestamp: String(raw.created_at ?? raw.timestamp ?? new Date().toISOString()),
    result: String(raw.result ?? (raw.success === false ? 'failed' : 'success')),
  };
}

export default function AuditLogsPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const { data } = await api.get('/audit-logs', { params: { limit: 500 } });
      const list = Array.isArray(data) ? data : (data.data ?? []);
      setRows((Array.isArray(list) ? list : []).map((r: Record<string, unknown>, i: number) => mapRow(r, i)));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Complete trail of all system activity and user actions" />
      <DataTable columns={columns} data={rows} isLoading={loading} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}
