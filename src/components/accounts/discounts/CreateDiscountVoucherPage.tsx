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
type Inv = { id: string; invoice_number: string; status: string };

export default function CreateDiscountVoucherPage() {
  const router = useRouter();
  const api = getApiClient();
  const { today, allowPast } = useVoucherTxnDate('accounts.discount_vouchers.backdate');
  const [custs, setCusts] = useState<Opt[]>([]);
  const [leds, setLeds] = useState<Opt[]>([]);
  const [invs, setInvs] = useState<Inv[]>([]);
  const [form, setForm] = useState({ customer_id: '', ledger_account_id: '', invoice_id: '', amount: '', reason: '', date: today });
  const [err, setErr] = useState('');
  const [sub, setSub] = useState(false);

  useEffect(() => {
    void (async () => {
      const [cr, lr, ir] = await Promise.all([
        api.get('/customers'),
        api.get('/ledgers?type=debtor'),
        api.get('/invoices'),
      ]);
      const c = Array.isArray(cr.data) ? cr.data : cr.data?.data ?? [];
      const l = Array.isArray(lr.data) ? lr.data : lr.data?.data ?? [];
      const inv = Array.isArray(ir.data) ? ir.data : ir.data?.data ?? [];
      setCusts(c.map((x: Opt) => ({ id: x.id, name: x.name })));
      setLeds(l.map((x: Opt) => ({ id: x.id, name: `${x.name}${x.account_number ? ` (${x.account_number})` : ''}` })));
      setInvs(
        inv
          .filter((i: Inv) => i.status !== 'reversed' && i.status !== 'cancelled')
          .map((i: Inv) => ({ id: i.id, invoice_number: i.invoice_number, status: i.status })),
      );
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
      await api.post('/discount-vouchers', {
        customer_id: form.customer_id,
        ledger_account_id: form.ledger_account_id,
        invoice_id: form.invoice_id || undefined,
        amount: Number(form.amount),
        reason: form.reason || undefined,
        date: form.date,
      });
      router.push('/dashboard/accounts/discounts');
    } catch (x: unknown) {
      const m = x as { response?: { data?: { error?: string } } };
      setErr(m.response?.data?.error ?? 'Failed');
    } finally {
      setSub(false);
    }
  }

  return (
    <PermissionGuard permission="accounts.discount_vouchers.create">
      <div className="space-y-6">
        <PageHeader title="Add Discount Voucher" description="Reduce invoice total when linked." />
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
          <div>
            <Label>Invoice (optional)</Label>
            <select className="w-full rounded border px-2 py-2 text-sm" value={form.invoice_id} onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}>
              <option value="">None</option>
              {invs.map((i) => <option key={i.id} value={i.id}>{i.invoice_number} ({i.status})</option>)}
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
