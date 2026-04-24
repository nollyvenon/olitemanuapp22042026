'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiClient } from '@/lib/api-client';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  unit?: string;
  unit_cost?: number;
  reorder_level?: number;
  is_active?: boolean;
}

interface StockBalance {
  location_id: string;
  location_name: string;
  quantity: number;
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const api = getApiClient();
  const id = params.id as string;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', unit_cost: '', reorder_level: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [itemRes, balanceRes] = await Promise.all([
          api.get(`/stock/items/${id}`),
          api.get(`/stock/ledger/${id}/balance`),
        ]);
        const itemData = itemRes.data.data || itemRes.data;
        setItem(itemData);
        setForm({ name: itemData.name, unit_cost: String(itemData.unit_cost || ''), reorder_level: String(itemData.reorder_level || '') });
        const balancesList = Array.isArray(balanceRes.data) ? balanceRes.data : balanceRes.data.data || [];
        setBalances(balancesList);
      } catch (err) {
        console.error('Failed to load item', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, api]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/stock/items/${id}`, {
        name: form.name,
        unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : null,
        reorder_level: form.reorder_level ? parseFloat(form.reorder_level) : null,
      });
      if (item) setItem({ ...item, name: form.name, unit_cost: parseFloat(form.unit_cost), reorder_level: parseFloat(form.reorder_level) });
      setEditing(false);
    } catch (err) {
      console.error('Failed to save item', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!item) return <div className="p-6">Item not found</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{item.name}</h1>
          <p className="text-gray-600 mt-1">{item.sku}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold">Item Information</h2>
        {!editing ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Unit</p>
                <p className="text-sm font-medium mt-1">{item.unit || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Unit Cost</p>
                <p className="text-sm font-medium mt-1">${item.unit_cost?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Reorder Level</p>
                <p className="text-sm font-medium mt-1">{item.reorder_level || '—'}</p>
              </div>
            </div>
            <Button onClick={() => setEditing(true)} variant="outline" className="w-full">
              Edit
            </Button>
          </>
        ) : (
          <>
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>Unit Cost</Label>
              <Input type="number" step="0.01" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} disabled={submitting} />
            </div>
            <div>
              <Label>Reorder Level</Label>
              <Input type="number" step="0.01" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} disabled={submitting} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setEditing(false)} variant="outline" disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold">Stock by Location</h2>
        {balances.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Location</th>
                <th className="text-right py-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.location_id} className="border-b">
                  <td className="py-2">{b.location_name || b.location_id}</td>
                  <td className="text-right py-2 font-bold">{b.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No stock found</p>
        )}
      </Card>
    </div>
  );
}
