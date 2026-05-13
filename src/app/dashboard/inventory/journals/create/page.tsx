'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { getApiClient } from '@/lib/api-client';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

export default function CreateStockJournalPage() {
  const api = getApiClient();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [journalType, setJournalType] = useState('add');
  const [form, setForm] = useState({ item_id: '', location_id: '', to_location_id: '', quantity: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      const [iRes, lRes] = await Promise.all([api.get('/stock/items'), api.get('/locations')]);
      const itemsList = Array.isArray(iRes.data) ? iRes.data : iRes.data.data ?? [];
      const locationsList = Array.isArray(lRes.data) ? lRes.data : lRes.data.data ?? [];
      setItems(itemsList);
      setLocations(locationsList);
    })();
  }, [api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const endpoint = journalType === 'add' ? '/stock/journals/add' : journalType === 'transfer' ? '/stock/journals/transfer' : '/stock/journals/remove';
      const payload =
        journalType === 'transfer'
          ? { item_id: form.item_id, from_location: form.location_id, to_location: form.to_location_id, quantity: parseInt(form.quantity, 10), notes: form.notes }
          : { item_id: form.item_id, location_id: form.location_id, quantity: parseInt(form.quantity, 10), notes: form.notes };
      await api.post(endpoint, payload);
      setJournalType('add');
      setForm({ item_id: '', location_id: '', to_location_id: '', quantity: '', notes: '' });
    } catch (err: unknown) {
      const x = err as { response?: { data?: { error?: string; message?: string } } };
      setError(x.response?.data?.error || x.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PermissionGuard permission="inventory.stock.movement">
      <div className="space-y-6 p-6 max-w-lg">
        <PageHeader title="Create Stock Journal" description="Receipt one-way: destination store only. Issue one-way: source store only. Transfer: source and destination. Inventory balance changes here or via authorized order invoice flow." />
        <Link href="/dashboard/inventory/journals/view" className="text-sm text-blue-600 underline">
          View journals
        </Link>
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4">
          <div>
            <Label>Movement Type *</Label>
            <div className="flex gap-4 mt-2 flex-wrap">
              <label className="flex items-center gap-2">
                <input type="radio" value="add" checked={journalType === 'add'} onChange={(e) => setJournalType(e.target.value)} disabled={submitting} />
                Receipt
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="transfer" checked={journalType === 'transfer'} onChange={(e) => setJournalType(e.target.value)} disabled={submitting} />
                Transfer
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="remove" checked={journalType === 'remove'} onChange={(e) => setJournalType(e.target.value)} disabled={submitting} />
                Issue
              </label>
            </div>
          </div>
          <div>
            <Label>Item *</Label>
            <select value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })} className="w-full p-2 border rounded" required disabled={submitting}>
              <option value="">Select item</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.sku} - {i.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>{journalType === 'add' ? 'Destination store center *' : 'Source store center *'}</Label>
            <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className="w-full p-2 border rounded" required disabled={submitting}>
              <option value="">Select location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          {journalType === 'transfer' && (
            <div>
              <Label>Destination store center *</Label>
              <select value={form.to_location_id} onChange={(e) => setForm({ ...form, to_location_id: e.target.value })} className="w-full p-2 border rounded" required disabled={submitting}>
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <Label>Quantity *</Label>
            <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required disabled={submitting} />
          </div>
          <div>
            <Label>Notes</Label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} disabled={submitting} className="w-full border rounded px-3 py-2 text-sm" rows={3} />
          </div>
          <Button type="submit" disabled={submitting} className="w-full" style={{ background: '#FF9900', color: '#0f1111' }}>
            {submitting ? 'Saving…' : 'Submit'}
          </Button>
        </form>
      </div>
    </PermissionGuard>
  );
}
