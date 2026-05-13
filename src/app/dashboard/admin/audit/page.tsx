'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';
import { unwrapList } from '@/lib/admin-access';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  before_snapshot?: Record<string, any>;
  after_snapshot?: Record<string, any>;
  created_at: string;
  user?: { name: string };
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({ action_type: '', entity_type: '', from: '', to: '' });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  async function fetchLogs() {
    const api = getApiClient();
    const { data } = await api.get('/audit-logs', { params: Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });
    setLogs(unwrapList(data).length ? unwrapList(data) : (data as { data?: AuditLog[] }).data ?? []);
  }

  async function fetchStats() {
    try {
      const { data } = await getApiClient().get('/audit-statistics');
      setStats(data);
    } catch {
      setStats(null);
    }
  }

  async function handleExport(format: 'csv' | 'json') {
    const res = await getApiClient().post('/audit-logs/export', { ...filters, format }, { responseType: 'blob' });
    const blob = res.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs.${format}`;
    a.click();
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-sm text-gray-600">Total Actions</div>
            <div className="text-2xl font-bold">{stats.total_actions}</div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="text-sm text-gray-600">Today</div>
            <div className="text-2xl font-bold">{stats.actions_today}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Action Type"
          value={filters.action_type}
          onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Entity Type"
          value={filters.entity_type}
          onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={fetchLogs} className="bg-blue-600 text-white px-4 py-2 rounded">
          Search
        </button>
        <button onClick={() => handleExport('csv')} className="bg-green-600 text-white px-4 py-2 rounded">
          Export CSV
        </button>
        <button onClick={() => handleExport('json')} className="bg-purple-600 text-white px-4 py-2 rounded">
          Export JSON
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">User</th>
            <th className="border px-4 py-2 text-left">Action</th>
            <th className="border px-4 py-2 text-left">Entity</th>
            <th className="border px-4 py-2 text-left">Entity ID</th>
            <th className="border px-4 py-2 text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{log.user?.name || 'System'}</td>
              <td className="border px-4 py-2">{log.action_type}</td>
              <td className="border px-4 py-2">{log.entity_type}</td>
              <td className="border px-4 py-2 text-sm text-gray-600">{log.entity_id}</td>
              <td className="border px-4 py-2 text-sm">{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
