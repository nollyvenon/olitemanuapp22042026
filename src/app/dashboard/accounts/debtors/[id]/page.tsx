'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getApiClient } from '@/lib/api-client';

interface DebtorDetail {
  id: string;
  account_code: string;
  name: string;
  contact: string;
  email?: string;
  credit_limit: number;
  balance: number;
  overdue: number;
  last_payment: string;
  status: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
}

const fmt = (v: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);


export default function DebtorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const api = getApiClient();
  const id = params.id as string;

  const [debtor, setDebtor] = useState<DebtorDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [debtorRes, transRes] = await Promise.all([
          api.get(`/accounts/debtors/${id}`),
          api.get(`/accounts/debtors/${id}/transactions`),
        ]);
        const debtorData = debtorRes.data.data || debtorRes.data;
        setDebtor(debtorData);
        const transList = Array.isArray(transRes.data) ? transRes.data : transRes.data.data || [];
        setTransactions(transList);
      } catch (err) {
        console.error('Failed to load debtor', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, api]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!debtor) return <div className="p-6">Debtor not found</div>;

  const availableCredit = debtor.credit_limit - debtor.balance;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{debtor.name}</h1>
          <p className="text-gray-600 mt-1">{debtor.account_code}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Credit Limit</p>
          <p className="text-lg font-bold mt-2">{fmt(debtor.credit_limit)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Balance</p>
          <p className="text-lg font-bold mt-2" style={{ color: debtor.balance > 0 ? '#cc0c39' : '#067d62' }}>{fmt(debtor.balance)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Overdue</p>
          <p className="text-lg font-bold mt-2" style={{ color: debtor.overdue > 0 ? '#cc0c39' : '#767676' }}>{fmt(debtor.overdue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 font-semibold">Available Credit</p>
          <p className="text-lg font-bold mt-2" style={{ color: availableCredit > 0 ? '#067d62' : '#cc0c39' }}>{fmt(availableCredit)}</p>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold">Account Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold">Contact</p>
            <p className="text-sm font-medium mt-1">{debtor.contact || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Email</p>
            <p className="text-sm font-medium mt-1">{debtor.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Last Payment</p>
            <p className="text-sm font-medium mt-1">{new Date(debtor.last_payment).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Status</p>
            <p className="text-sm font-medium mt-1 px-2 py-1 bg-gray-100 rounded w-fit">{debtor.status}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold">Transaction History</h2>
        {transactions.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Debit</th>
                <th className="text-right py-2">Credit</th>
                <th className="text-right py-2">Balance</th>
                <th className="text-left py-2">Ref</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="py-2 text-xs">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="py-2">{t.description}</td>
                  <td className="text-right py-2 font-medium" style={{ color: t.debit > 0 ? '#cc0c39' : 'inherit' }}>{t.debit > 0 ? fmt(t.debit) : '—'}</td>
                  <td className="text-right py-2 font-medium" style={{ color: t.credit > 0 ? '#067d62' : 'inherit' }}>{t.credit > 0 ? fmt(t.credit) : '—'}</td>
                  <td className="text-right py-2 font-bold">{fmt(t.balance)}</td>
                  <td className="py-2 text-xs font-mono">{t.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No transactions found</p>
        )}
      </Card>
    </div>
  );
}
