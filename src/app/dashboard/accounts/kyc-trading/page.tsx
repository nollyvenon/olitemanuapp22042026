'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { getApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { unwrapList } from '@/lib/admin-access';

interface Row {
  id: string;
  ref?: string;
  applicant?: string;
  status?: string;
}

export default function AccountsKycTradingPage() {
  const api = getApiClient();
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    const { data } = await api.get('/kyc/applications', { params: { status: 'approved' } });
    const list = unwrapList<Row>(data);
    setRows(
      list.length
        ? list
        : (Array.isArray(data) ? data : (data as { data?: Row[] })?.data ?? []).filter(
            (r: Row) => String(r.status).toLowerCase() === 'approved'
          )
    );
  }, [api]);

  useEffect(() => {
    load().catch(() => setRows([]));
  }, [load]);

  const trade = async (kid: string) => {
    if (!confirm('Mark as traded / ledger ready?')) return;
    await api.post(`/kyc/applications/${kid}/trade`).catch(() => {});
    await load();
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="KYC for trading" description="Approved KYC for account department." />
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between border rounded p-3 gap-2">
            <div>
              <p className="font-mono text-xs">{r.ref ?? r.id}</p>
              <p className="text-sm font-medium">{r.applicant ?? '—'}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/kyc/applications/${r.id}`}
                className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium"
              >
                Open
              </Link>
              <Button size="sm" className="bg-amber-600 text-white" onClick={() => trade(r.id)}>
                Trade
              </Button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-gray-500">No approved KYC</p>}
      </div>
    </div>
  );
}
