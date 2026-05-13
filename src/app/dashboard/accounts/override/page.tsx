'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { getApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type TxnType = 'Approved Sales Order';

export default function AccountsOverridePage() {
  const api = getApiClient();
  const [type, setType] = useState<TxnType>('Approved Sales Order');
  const [rows, setRows] = useState<{ id: string; order_number?: string; status?: string; total?: number }[]>([]);
  const [sel, setSel] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get('/orders');
    const list = Array.isArray(data) ? data : (data as { data?: unknown[] }).data ?? [];
    setRows((list as { id: string; order_number?: string; status?: string; total?: number }[]) ?? []);
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!sel || !reason.trim()) return;
    if (!confirm('Submit override?')) return;
    setBusy(true);
    try {
      await api.post(`/orders/${sel}/override`, { override_reason: reason.slice(0, 500) });
      setReason('');
      setSel('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const pending = rows.filter((r) => ['APPROVED', 'SUBMITTED', 'UNDER_REVIEW'].includes(String(r.status)));

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <PageHeader title="Override / Adjustment" description="Approved Sales Order and other transaction overrides require a stated reason." />
      <div>
        <Label>Transaction type</Label>
        <select className="mt-1 w-full border rounded p-2 text-sm" value={type} onChange={(e) => setType(e.target.value as TxnType)}>
          <option>Approved Sales Order</option>
        </select>
      </div>
      <div>
        <Label>Select order</Label>
        <select className="mt-1 w-full border rounded p-2 text-sm" value={sel} onChange={(e) => setSel(e.target.value)}>
          <option value="">—</option>
          {pending.map((r) => (
            <option key={r.id} value={r.id}>
              {r.order_number ?? r.id} · {r.status} · {r.total != null ? `₦${r.total}` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Reason (max 500)</Label>
        <textarea className="mt-1 w-full border rounded p-2 text-sm min-h-[120px]" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
        <p className="text-xs text-gray-500 mt-1">{reason.length}/500</p>
      </div>
      <Button disabled={busy || !sel || !reason.trim()} onClick={submit} className="bg-amber-600 text-white">
        {busy ? '…' : 'Override'}
      </Button>
      <p className="text-sm">
        <Link href="/dashboard/sales/orders" className="text-blue-600 underline">
          Orders list
        </Link>
      </p>
    </div>
  );
}
