'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';

type Row = { id: string; credit_note_number?: string; amount: string | number; date: string };

export default function CreditNotesPage() {
  const api = getApiClient();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    void api.get('/credit-notes').then((r) => {
      const d = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
      setRows(d);
    });
  }, [api]);

  return (
    <PermissionGuard permission="accounts.credit_notes.read">
      <div className="space-y-4">
        <PageHeader title="Credit Notes" />
        <table className="w-full text-sm border-collapse">
          <thead><tr className="border-b"><th className="p-2 text-left">#</th><th className="p-2 text-left">Amount</th><th className="p-2 text-left">Date</th></tr></thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id} className="border-b">
                <td className="p-2 font-mono">{x.credit_note_number}</td>
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
