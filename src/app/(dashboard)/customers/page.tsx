// @ts-nocheck
'use client';
// @ts-nocheck
import { useState, useEffect } from 'react';
// @ts-nocheck
import { Button } from '@/components/ui/button';
// @ts-nocheck
import { Card } from '@/components/ui/card';
// @ts-nocheck
import { getApiClient } from '@/lib/api-client';
// @ts-nocheck
import Link from 'next/link';
// @ts-nocheck

// @ts-nocheck
export default function CustomersPage() {
// @ts-nocheck
  const [customers, setCustomers] = useState<any[]>([]);
// @ts-nocheck
  const [loading, setLoading] = useState(true);
// @ts-nocheck
  const api = getApiClient();
// @ts-nocheck

// @ts-nocheck
  useEffect(() => {
// @ts-nocheck
    const load = async () => {
// @ts-nocheck
      try {
// @ts-nocheck
        const res = await api.get('/api/v1/accounts/debtors', { params: { store_center_id: 'default' } });
// @ts-nocheck
        setCustomers(res.data);
// @ts-nocheck
      } catch (error) {
// @ts-nocheck
        console.error('Failed to load', error);
// @ts-nocheck
      } finally {
// @ts-nocheck
        setLoading(false);
// @ts-nocheck
      }
// @ts-nocheck
    };
// @ts-nocheck
    load();
// @ts-nocheck
  }, [api]);
// @ts-nocheck

// @ts-nocheck
  return (
// @ts-nocheck
    <div className="p-6">
// @ts-nocheck
      <div className="flex justify-between items-center mb-6">
// @ts-nocheck
        <h1 className="text-3xl font-bold">Customers</h1>
// @ts-nocheck
        <Link href="/dashboard/kyc/new"><Button>Add Customer</Button></Link>
// @ts-nocheck
      </div>
// @ts-nocheck
      {loading ? <Card className="p-6">Loading...</Card> : (
// @ts-nocheck
        <div className="space-y-3">
// @ts-nocheck
          {customers.map((c) => (
// @ts-nocheck
            <Link key={c.id} href={`/dashboard/accounts/debtors/${c.id}`}>
// @ts-nocheck
              <Card className="p-4 hover:bg-gray-50">
// @ts-nocheck
                <h3 className="font-semibold">Balance: ${c.current_balance}</h3>
// @ts-nocheck
                <p className="text-sm text-gray-600">{c.storeCenter?.name}</p>
// @ts-nocheck
              </Card>
// @ts-nocheck
            </Link>
// @ts-nocheck
          ))}
// @ts-nocheck
        </div>
// @ts-nocheck
      )}
// @ts-nocheck
    </div>
// @ts-nocheck
  );
// @ts-nocheck
}
