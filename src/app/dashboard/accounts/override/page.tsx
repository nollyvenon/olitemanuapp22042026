'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { unwrapList } from '@/lib/admin-access';

type TxnType = 'Approved Sales Order' | 'Journal voucher' | 'Payment' | 'Receipt' | 'Other';

type OrderRow = { id: string; order_number?: string; status?: string; total?: number; customer_name?: string };

export default function AccountsOverridePage() {
  const api = getApiClient();
  const [type, setType] = useState<TxnType>('Approved Sales Order');
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [sel, setSel] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<{ id: string; user_name?: string; action_type?: string; created_at?: string; description?: string }[]>([]);
  const [err, setErr] = useState('');

  const loadOrders = useCallback(async () => {
    const { data } = await api.get('/orders');
    const list = Array.isArray(data) ? data : (data as { data?: OrderRow[] }).data ?? [];
    setRows(list ?? []);
  }, [api]);

  const load = useCallback(async () => {
    setErr('');
    if (type === 'Approved Sales Order') await loadOrders();
    else setRows([]);
  }, [type, loadOrders]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    api
      .get('/audit-logs', { params: { limit: 80 } })
      .then(({ data }) => {
        const raw = unwrapList<{ id: string; user_name?: string; action_type?: string; created_at?: string; description?: string }>(data);
        setLogs(raw.filter((r) => /override|adjust/i.test(String(r.action_type ?? '') + String(r.description ?? ''))));
      })
      .catch(() => setLogs([]));
  }, [api, busy]);

  const pending = useMemo(() => {
    if (type !== 'Approved Sales Order') return [];
    return rows.filter((r) => ['APPROVED', 'AUTHORIZED'].includes(String(r.status)));
  }, [rows, type]);

  const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

  const submit = async () => {
    const wc = wordCount(reason);
    if (!sel.trim() || wc < 1 || wc > 500) {
      setErr(wc > 500 ? 'Reason max 500 words' : 'Reason required');
      return;
    }
    if (!confirm('OK=YES submit override, Cancel=NO to edit.')) return;
    setBusy(true);
    setErr('');
    try {
      if (type !== 'Approved Sales Order') {
        setErr('Other types: enter ID for future API; use Approved Sales Order to post now.');
        return;
      }
      await api.post(`/orders/${sel}/override`, { override_reason: reason.trim() });
      setReason('');
      setSel('');
      await load();
    } catch {
      setErr('Override failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PermissionGuard permission="accounts.ledger.read">
      <div className="space-y-6 p-6 max-w-4xl">
        <PageHeader title="Override / Adjustment" description="Select type, transaction, state reason (max 500 words), then override. Record appears in audit trail." />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div>
          <Label>Transaction type</Label>
          <select className="mt-1 w-full border rounded p-2 text-sm" value={type} onChange={(e) => { setType(e.target.value as TxnType); setSel(''); }}>
            <option>Approved Sales Order</option>
            <option>Journal voucher</option>
            <option>Payment</option>
            <option>Receipt</option>
            <option>Other</option>
          </select>
        </div>
        {type === 'Approved Sales Order' ? (
          <div className="border rounded overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2">Pick</th>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Order #</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-left p-2">Edit</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2">
                      <input type="radio" name="aso" checked={sel === r.id} onChange={() => setSel(r.id)} />
                    </td>
                    <td className="p-2 font-mono text-xs">{r.id}</td>
                    <td className="p-2">{r.order_number ?? '—'}</td>
                    <td className="p-2">{r.status}</td>
                    <td className="p-2">{r.customer_name ?? '—'}</td>
                    <td className="p-2 text-right tabular-nums">{r.total != null ? `₦${r.total}` : '—'}</td>
                    <td className="p-2">
                      <Link href={`/dashboard/sales/orders/${r.id}`} className="text-blue-600 underline text-xs">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pending.length === 0 && <p className="p-3 text-sm text-gray-500">No approved / authorized orders listed.</p>}
          </div>
        ) : (
          <div>
            <Label>Transaction ID</Label>
            <Input className="mt-1" value={sel} onChange={(e) => setSel(e.target.value)} placeholder="Enter transaction ID" />
          </div>
        )}
        <div>
          <Label>Override reason (max 500 words)</Label>
          <textarea className="mt-1 w-full border rounded p-2 text-sm min-h-[140px]" value={reason} onChange={(e) => setReason(e.target.value)} />
          <p className="text-xs text-gray-500 mt-1">
            {wordCount(reason)}/500 words
          </p>
        </div>
        <Button disabled={busy || !sel.trim() || !reason.trim()} onClick={submit} className="bg-amber-600 text-white">
          {busy ? '…' : 'Override'}
        </Button>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Recent override / adjustment (audit)</p>
          <div className="border rounded max-h-48 overflow-y-auto text-xs">
            {logs.length === 0 ? (
              <p className="p-2 text-gray-500">No rows</p>
            ) : (
              logs.map((l) => (
                <div key={l.id} className="border-b p-2 flex justify-between gap-2">
                  <span>{l.user_name ?? '—'}</span>
                  <span className="text-gray-600 shrink-0">{l.created_at ?? ''}</span>
                  <span className="truncate">{l.action_type ?? l.description ?? ''}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <p className="text-sm">
          <Link href="/dashboard/sales/orders" className="text-blue-600 underline">
            Orders list
          </Link>
        </p>
      </div>
    </PermissionGuard>
  );
}
