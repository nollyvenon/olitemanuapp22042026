'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiClient } from '@/lib/api-client';
import { useVoucherTxnDate } from '@/hooks/useVoucherTxnDate';

type Opt = { id: string; name: string; account_number?: string };

export default function CreateCreditNotePage() {
  const router = useRouter();
  const api = getApiClient();
  const { today, allowPast } = useVoucherTxnDate('accounts.credit_notes.backdate');
  const [custs, setCusts] = useState<Opt[]>([]);
  const [leds, setLeds] = useState<Opt[]>([]);
  const [form, setForm] = useState({ customer_id: '', ledger_account_id: '', amount: '', reason: '', date: today });
  const [err, setErr] = useState('');
  const [sub, setSub] = useState(false);

  useEffect(() => {
    void (async () => {
      const [cr, lr] = await Promise.all([api.get('/customers'), api.get('/ledgers?type=debtor')]);
      const c = Array.isArray(cr.data) ? cr.data : cr.data?.data ?? [];
      const l = Array.isArray(lr.data) ? lr.data : lr.data?.data ?? [];
      setCusts(c.map((x: Opt) => ({ id: x.id, name: x.name })));
      setLeds(l.map((x: Opt) => ({ id: x.id, name: `${x.name}${x.account_number ? ` (${x.account_number})` : ''}` })));
    })();
  }, [api]);

  useEffect(() => setForm((f) => ({ ...f, date: today })), [today]);
  const bd = !!form.date && form.date < today && !allowPast;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (bd) return;
    setErr('');
    setSub(true);
    try {
      await api.post('/credit-notes', {
        customer_id: form.customer_id,
        ledger_account_id: form.ledger_account_id,
        amount: Number(form.amount),
        reason: form.reason || undefined,
        date: form.date,
      });
      router.push('/dashboard/accounts/credit-notes');
    } catch (x: unknown) {
      const m = x as { response?: { data?: { error?: string } } };
      setErr(m.response?.data?.error ?? 'Failed');
    } finally {
      setSub(false);
    }
  }

  return (
    <PermissionGuard permission="accounts.credit_notes.create">
      <div className="space-y-6">
        <PageHeader title="Add Credit Note" description="Credits debtor ledger balance." />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <form onSubmit={submit} className="max-w-xl space-y-3 rounded border p-4">
          <div>
            <Label>Customer *</Label>
            <select required className="w-full rounded border px-2 py-2 text-sm" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Select</option>
              {custs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Debtor ledger *</Label>
            <select required className="w-full rounded border px-2 py-2 text-sm" value={form.ledger_account_id} onChange={(e) => setForm({ ...form, ledger_account_id: e.target.value })}>
              <option value="">Select</option>
              {leds.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div><Label>Amount *</Label><Input required type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <div><Label>Reason</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
          <div>
            <Label>Date *</Label>
            <Input type="date" required min={allowPast ? undefined : today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={bd ? 'border-red-500' : ''} />
            {bd ? <p className="mt-1 text-xs text-red-600">Past dates need override permission.</p> : null}
          </div>
          <Button type="submit" disabled={sub || bd}>Save</Button>
        </form>
      </div>
    </PermissionGuard>
  );
}
