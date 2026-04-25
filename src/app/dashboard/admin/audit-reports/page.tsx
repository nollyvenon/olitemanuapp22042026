'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/DataTable';
import { getApiClient } from '@/lib/api-client';
import { AlertCircle, AlertTriangle, Activity, Lock } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface AuditData {
  transactions: any[];
  logs: any[];
  overrides: any[];
  suspicious: any[];
  summary: any[];
}

export default function AuditReports() {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ start_date: '', end_date: '', type: '', status: '', user_id: '', action: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const [trans, act, ovr, susp] = await Promise.all([
          api.get('/analytics/audit/transactions', { params: filters }),
          api.get('/analytics/audit/activity', { params: filters }),
          api.get('/analytics/audit/overrides', { params: filters }),
          api.get('/analytics/audit/suspicious')
        ]);
        setData({
          transactions: trans.data.transactions || [],
          logs: act.data.logs || [],
          overrides: ovr.data.overrides || [],
          suspicious: susp.data.suspicious || [],
          summary: susp.data.summary || []
        });
      } catch (error) {
        console.error('Failed to load audit reports', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const summary = data.summary[0] || {};

  const txnCols: ColumnDef<any, any>[] = [
    { accessorKey: 'reference', header: 'Reference', cell: ({ getValue }) => <span className="font-mono text-xs">{String(getValue())}</span> },
    { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <span className="text-xs font-semibold">{String(getValue())}</span> },
    { accessorKey: 'amount', header: 'Amount (₦)', cell: ({ getValue, row }) => <span className={row.original.flag === 'high_value' ? 'text-red-600 font-bold' : ''}>{Number(getValue()).toLocaleString('en-NG')}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className="text-xs bg-gray-100 px-2 py-1 rounded">{String(getValue())}</span> },
    { accessorKey: 'transaction_date', header: 'Date', cell: ({ getValue }) => <span className="text-xs">{new Date(String(getValue())).toLocaleString()}</span> },
    { accessorKey: 'user_name', header: 'User', cell: ({ getValue }) => <span className="text-xs">{String(getValue() || 'System')}</span> },
  ];

  const logCols: ColumnDef<any, any>[] = [
    { accessorKey: 'user_name', header: 'User', cell: ({ getValue }) => <span className="font-medium text-xs">{String(getValue())}</span> },
    { accessorKey: 'action', header: 'Action', cell: ({ getValue }) => <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{String(getValue())}</span> },
    { accessorKey: 'entity_type', header: 'Entity', cell: ({ getValue }) => <span className="text-xs">{String(getValue())}</span> },
    { accessorKey: 'ip_address', header: 'IP', cell: ({ getValue, row }) => <span className={row.original.location_flag === 'new_ip' ? 'text-orange-600 font-bold text-xs' : 'text-xs'}>{String(getValue())}</span> },
    { accessorKey: 'created_at', header: 'Timestamp', cell: ({ getValue }) => <span className="text-xs">{new Date(String(getValue())).toLocaleString()}</span> },
  ];

  const ovrCols: ColumnDef<any, any>[] = [
    { accessorKey: 'user_name', header: 'User', cell: ({ getValue }) => <span className="font-medium text-xs">{String(getValue())}</span> },
    { accessorKey: 'entity_type', header: 'Type', cell: ({ getValue }) => <span className="text-xs font-semibold text-red-600">{String(getValue())}</span> },
    { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => <span className="text-xs truncate">{String(getValue())}</span> },
    { accessorKey: 'frequency', header: 'Frequency', cell: ({ getValue }) => <span className={getValue() === 'high_frequency' ? 'text-red-600 font-bold text-xs' : 'text-xs'}>{String(getValue())}</span> },
    { accessorKey: 'created_at', header: 'Time', cell: ({ getValue }) => <span className="text-xs">{new Date(String(getValue())).toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Reports" description="Transaction history, user activity logs, and override tracking with suspicious activity detection" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Logs (24h)</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">{summary.logs_24h || 0}</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200">
          <p className="text-xs text-purple-600 font-semibold">Overrides (24h)</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">{summary.overrides_24h || 0}</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-xs text-green-600 font-semibold">Active Users (24h)</p>
          <p className="text-2xl font-bold text-green-900 mt-2">{summary.active_users_24h || 0}</p>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="text-xs text-amber-600 font-semibold">Transactions (24h)</p>
          <p className="text-2xl font-bold text-amber-900 mt-2">{summary.transactions_24h || 0}</p>
        </Card>
      </div>

      {data.suspicious.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-lg text-red-900">🚨 Suspicious Activity Detected</h3>
          </div>
          <div className="space-y-2">
            {data.suspicious.map((item: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-red-200 flex justify-between">
                <div>
                  <p className="font-semibold text-red-900 text-sm">{item.type}</p>
                  <p className="text-xs text-red-700">{item.user}: {item.detail}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${item.severity === 'critical' ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'}`}>{item.severity.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-lg">Transaction History (Last 500)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <input type="date" value={filters.start_date} onChange={(e) => setFilters({...filters, start_date: e.target.value})} className="text-xs border rounded px-2 py-1" placeholder="From" />
          <input type="date" value={filters.end_date} onChange={(e) => setFilters({...filters, end_date: e.target.value})} className="text-xs border rounded px-2 py-1" placeholder="To" />
          <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="text-xs border rounded px-2 py-1">
            <option value="">All Types</option>
            <option value="receipt">Receipt</option>
            <option value="debit_note">Debit Note</option>
          </select>
        </div>
        <DataTable columns={txnCols} data={data.transactions} />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-lg">User Activity Logs (Last 1000)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <input type="date" value={filters.start_date} onChange={(e) => setFilters({...filters, start_date: e.target.value})} className="text-xs border rounded px-2 py-1" />
          <input type="date" value={filters.end_date} onChange={(e) => setFilters({...filters, end_date: e.target.value})} className="text-xs border rounded px-2 py-1" />
          <select value={filters.action} onChange={(e) => setFilters({...filters, action: e.target.value})} className="text-xs border rounded px-2 py-1">
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="override">Override</option>
          </select>
        </div>
        <DataTable columns={logCols} data={data.logs} />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-lg">Override Tracking (Last 500)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4">
          <input type="date" value={filters.start_date} onChange={(e) => setFilters({...filters, start_date: e.target.value})} className="text-xs border rounded px-2 py-1" />
          <input type="date" value={filters.end_date} onChange={(e) => setFilters({...filters, end_date: e.target.value})} className="text-xs border rounded px-2 py-1" />
        </div>
        <DataTable columns={ovrCols} data={data.overrides} />
      </Card>
    </div>
  );
}
