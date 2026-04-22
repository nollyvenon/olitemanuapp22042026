'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card-system';
import { useApi } from '@/hooks/useApi';

export default function OverviewPage() {
  const [stats, setStats] = useState({ orders: 0, inventory: 0, ledgers: 0, kyc: 0 });
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, itemsRes, ledgersRes, kycRes] = await Promise.all([
          api.get('/api/v1/sales/approved-orders'),
          api.get('/api/v1/inventory/items'),
          api.get('/api/v1/accounts/debtors'),
          api.get('/api/v1/kyc/applications'),
        ]);
        setStats({
          orders: ordersRes.data.total || 0,
          inventory: itemsRes.data.total || 0,
          ledgers: ledgersRes.data.length || 0,
          kyc: kycRes.data.total || 0,
        });
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
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Approved Orders</p>
          <p className="text-4xl font-bold">{stats.orders}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Stock Items</p>
          <p className="text-4xl font-bold">{stats.inventory}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Active Ledgers</p>
          <p className="text-4xl font-bold">{stats.ledgers}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">KYC Applications</p>
          <p className="text-4xl font-bold">{stats.kyc}</p>
        </Card>
      </div>

      {loading && <Card className="p-6">Loading KPIs...</Card>}
    </div>
  );
}
