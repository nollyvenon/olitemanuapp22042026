'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';

type Row = { id: string; voucher_number?: string; amount: string | number; date: string };

export default function DiscountVouchersPage() {
  const api = getApiClient();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    void api.get('/discount-vouchers').then((r) => {
      const d = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
      setRows(d);
    });
  }, [api]);

  return (
    <PermissionGuard permission="accounts.discount_vouchers.read">
      <div className="space-y-4">
        <PageHeader title="Discount Vouchers" />
        <table className="w-full text-sm border-collapse">
          <thead><tr className="border-b"><th className="p-2 text-left">#</th><th className="p-2 text-left">Amount</th><th className="p-2 text-left">Date</th></tr></thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id} className="border-b">
                <td className="p-2 font-mono">{x.voucher_number}</td>
                <td className="p-2">{x.amount}</td>
                <td className="p-2">{String(x.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PermissionGuard>
  );
}
