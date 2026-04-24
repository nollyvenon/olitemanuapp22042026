'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';

export default function OverviewPage() {
  const [stats, setStats] = useState({ orders: 0, inventory: 0, ledgers: 0, kyc: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        console.log('[Overview] Loading stats...');

        const [orders, inventory, ledgers, kyc] = await Promise.all([
          api.get('/orders').then(res => res.data.length || 0).catch(() => 0),
          api.get('/stock/items').then(res => res.data.length || 0).catch(() => 0),
          api.get('/stock/ledger').then(res => res.data.length || 0).catch(() => 0),
          api.get('/kyc').then(res => res.data.length || 0).catch(() => 0),
        ]);

        setStats({ orders, inventory, ledgers, kyc });
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
