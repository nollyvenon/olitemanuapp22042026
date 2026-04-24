'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const api = getApiClient();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/v1/accounts/creditors', { params: { store_center_id: 'default' } });
        setVendors(res.data);
      } catch (error) {
        console.error('Failed to load', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <Button>Add Vendor</Button>
      </div>
      {loading ? <Card className="p-6">Loading...</Card> : (
        <div className="space-y-3">
          {vendors.map((v) => (
            <Link key={v.id} href={`/dashboard/accounts/creditors/${v.id}`}>
              <Card className="p-4 hover:bg-gray-50">
                <h3 className="font-semibold">Balance: ${v.current_balance}</h3>
                <p className="text-sm text-gray-600">{v.storeCenter?.name}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
