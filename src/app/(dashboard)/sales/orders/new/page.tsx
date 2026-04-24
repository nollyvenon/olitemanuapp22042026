'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiClient } from '@/lib/api-client';
import { Trash2, Plus } from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  sku: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

export default function NewOrderPage() {
  const router = useRouter();
  const api = getApiClient();

  const [customerName, setCustomerName] = useState('');
  const [formStatus, setFormStatus] = useState<'manual_captured' | 'no_manual_form' | ''>('');
  const [items, setItems] = useState<OrderItem[]>([{ product_name: '', quantity: 1, unit_price: 0 }]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/inventory/items');
        const itemsList = Array.isArray(data) ? data : data.data ?? [];
        setStockItems(itemsList);
      } catch (err) {
        console.error('Failed to load inventory items', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const updateItem = (idx: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { product_name: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const resolvePrice = async (productName: string, idx: number) => {
    if (!productName) return;
    try {
      const { data } = await api.get('/price-lists/price', { params: { item_id: productName } });
      const price = data.price || 0;
      updateItem(idx, 'unit_price', price);
    } catch (err) {
      console.error('Failed to resolve price', err);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!formStatus) {
      setError('Form status is required');
      return;
    }
    if (items.some(item => !item.product_name || item.quantity < 1 || item.unit_price < 0)) {
      setError('All items must have a product, quantity, and price');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_name: customerName,
        form_status: formStatus,
        order_date: new Date().toISOString().split('T')[0],
        items: items.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      const { data } = await api.post('/orders', payload);
      router.push(`/sales/orders/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Create New Order</h1>
        <p className="text-gray-600 mt-1">Add items and create a new sales order</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Customer & Form Status */}
        <Card className="p-6 space-y-4">
          <h2 className="font-bold">Order Information</h2>

          <div>
            <Label className="text-sm font-medium">Customer Name *</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Apex Steel Ltd"
              className="mt-1.5"
              disabled={submitting}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Form Status *</Label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="formStatus"
                  value="manual_captured"
                  checked={formStatus === 'manual_captured'}
                  onChange={(e) => setFormStatus(e.target.value as 'manual_captured')}
                  disabled={submitting}
                  className="accent-amber-500"
                />
                <span className="text-sm font-medium">Manual Form Captured</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="formStatus"
                  value="no_manual_form"
                  checked={formStatus === 'no_manual_form'}
                  onChange={(e) => setFormStatus(e.target.value as 'no_manual_form')}
                  disabled={submitting}
                  className="accent-amber-500"
                />
                <span className="text-sm font-medium">No Manual Form</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-6 space-y-4">
          <h2 className="font-bold">Order Items</h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 border border-gray-200 rounded">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs font-medium">Product</Label>
                  <select
                    value={item.product_name}
                    onChange={(e) => {
                      updateItem(idx, 'product_name', e.target.value);
                      if (e.target.value) {
                        resolvePrice(e.target.value, idx);
                      }
                    }}
                    disabled={submitting}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
                  >
                    <option value="">Select product...</option>
                    {stockItems.map(si => (
                      <option key={si.id} value={si.id}>{si.name} ({si.sku})</option>
                    ))}
                  </select>
                </div>

                <div className="w-20 space-y-1">
                  <Label className="text-xs font-medium">Qty</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    disabled={submitting}
                    className="text-sm"
                  />
                </div>

                <div className="w-28 space-y-1">
                  <Label className="text-xs font-medium">Unit Price</Label>
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    disabled={true}
                    className="text-sm bg-gray-50"
                  />
                </div>

                <div className="w-28 space-y-1">
                  <Label className="text-xs font-medium">Line Total</Label>
                  <div className="h-10 bg-gray-50 rounded px-2 py-1.5 text-sm font-semibold flex items-center">
                    {fmt(item.quantity * item.unit_price)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={submitting || items.length === 1}
                  className="mt-6 p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={addItem}
            disabled={submitting}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Card>

        {/* Summary */}
        <Card className="p-6">
          <div className="space-y-2 ml-auto w-56">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium tabular-nums">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (7.5%):</span>
              <span className="font-medium tabular-nums">{fmt(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base">
              <span className="font-bold">Total:</span>
              <span className="font-bold tabular-nums">{fmt(total)}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            style={{ background: '#FF9900', color: '#0f1111' }}
            className="flex-1 font-semibold hover:opacity-90"
          >
            {submitting ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}
