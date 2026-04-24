'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function MovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    item_id: '',
    store_center_id: '',
  });
  const api = getApiClient();

  useEffect(() => {
    const load = async () => {
      try {
        const [itemRes, centerRes] = await Promise.all([
          api.get('/api/v1/inventory/items'),
          api.get('/api/v1/inventory/store-centers'),
        ]);
        setItems(itemRes.data.data);
        setCenters(centerRes.data.data);
      } catch (error) {
        console.error('Failed to load', error);
      }
    };
    load();
  }, [api]);

  const loadMovements = async () => {
    if (!filters.item_id || !filters.store_center_id) {
      alert('Please select item and store');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/api/v1/reporting/inventory/movements', { params: filters });
      setMovements(res.data.data);
    } catch (error) {
      console.error('Failed to load', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Link href="/dashboard/reporting"><Button variant="outline" className="mb-6">← Back</Button></Link>
      
      <Card className="p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6">Stock Movements</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Item *</label>
            <select value={filters.item_id} onChange={(e) => setFilters({...filters, item_id: e.target.value})} className="w-full p-2 border rounded">
              <option value="">Select item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Store *</label>
            <select value={filters.store_center_id} onChange={(e) => setFilters({...filters, store_center_id: e.target.value})} className="w-full p-2 border rounded">
              <option value="">Select store</option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>{center.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Start</label>
            <Input type="date" value={filters.start_date} onChange={(e) => setFilters({...filters, start_date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End</label>
            <Input type="date" value={filters.end_date} onChange={(e) => setFilters({...filters, end_date: e.target.value})} />
          </div>
          <div className="flex items-end">
            <Button onClick={loadMovements} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Load'}
            </Button>
          </div>
        </div>
      </Card>

      {movements.length > 0 && (
        <Card className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-left py-2">From</th>
                <th className="text-left py-2">To</th>
                <th className="text-left py-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov: any) => (
                <tr key={mov.id} className="border-b">
                  <td className="py-2">{new Date(mov.journal_date).toLocaleDateString()}</td>
                  <td className="py-2 capitalize">{mov.type.replace('_', ' ')}</td>
                  <td className="text-right py-2">{mov.quantity}</td>
                  <td className="py-2 text-sm text-gray-600">{mov.from_store_id ? '...' : '-'}</td>
                  <td className="py-2 text-sm text-gray-600">{mov.to_store_id ? '...' : '-'}</td>
                  <td className="py-2 text-sm text-gray-600">{mov.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
