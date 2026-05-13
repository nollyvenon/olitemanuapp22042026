'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiClient } from '@/lib/api-client';
import { usePermission } from '@/hooks/usePermission';
import { Trash2, Plus } from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  unit_cost?: number | string;
}

interface Customer {
  id: string;
  name: string;
  company?: string;
}

interface OrderItem {
  product_name: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
}

const fmt = (v: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);

export default function NewOrderPage() {
  const router = useRouter();
  const api = getApiClient();

  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formStatus, setFormStatus] = useState<'manual_captured' | 'no_manual_form' | ''>('');
  const [manualFileName, setManualFileName] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ product_name: '', product_id: '', quantity: 1, unit_price: 0 }]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [onBehalf, setOnBehalf] = useState('');
  const [userOpts, setUserOpts] = useState<{ id: string; name: string }[]>([]);
  const { canAny } = usePermission();
  const canProxy = canAny(['sales.orders.approve', 'admin.*']);

  useEffect(() => {
        const load = async () => {
      try {
        const [itemsRes, customersRes] = await Promise.all([
          api.get('/stock/items'),
          api.get('/customers'),
        ]);
        const itemsList = Array.isArray(itemsRes.data) ? itemsRes.data : itemsRes.data.data ?? [];
        const customersList = Array.isArray(customersRes.data) ? customersRes.data : customersRes.data.data ?? [];
        setStockItems(itemsList);
        setCustomers(customersList);
      } catch (err: any) {
        alert(`Failed to load products and customers. Error: ${err?.response?.data?.message || err?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  useEffect(() => {
    if (!canProxy) return;
    api
      .get('/users')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data as { data?: { id: string; name: string }[] })?.data ?? [];
        setUserOpts(list.map((u: { id: string; name: string }) => ({ id: u.id, name: u.name })));
      })
      .catch(() => setUserOpts([]));
  }, [api, canProxy]);

  const updateItem = (idx: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { product_name: '', product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleProductChange = (productId: string, idx: number) => {
    const selectedProduct = stockItems.find(item => item.id === productId);
    if (selectedProduct) {
      const unitCost = typeof selectedProduct.unit_cost === 'string'
        ? parseFloat(selectedProduct.unit_cost)
        : (selectedProduct.unit_cost || 0);
      const updated = [...items];
      updated[idx] = {
        ...updated[idx],
        product_id: productId,
        product_name: selectedProduct.name,
        unit_price: unitCost,
      };
      setItems(updated);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Customer is required');
      return;
    }
    if (!formStatus) {
      setError('Form status is required');
      return;
    }
    if (formStatus === 'manual_captured' && !manualFileName) {
      setError('Attach manual order form');
      return;
    }
    if (!notes.trim()) {
      setError('Notes are required');
      return;
    }
    if (!expectedDelivery) {
      setError('Expected delivery date is required');
      return;
    }
    if (items.some((item) => !item.product_id || item.quantity < 1 || !(item.unit_price > 0))) {
      setError('Each line needs product, qty ≥ 1, and unit price > 0');
      return;
    }
    if (!confirm('Reviewed everything? OK = YES submit, Cancel = NO to edit.')) return;

    setSubmitting(true);
    try {
      const payload = {
        customer_id: customerId,
        form_status: formStatus,
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: expectedDelivery,
        notes: notes.trim(),
        manual_form_filename: formStatus === 'manual_captured' ? manualFileName : null,
        items: items.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        ...(onBehalf ? { on_behalf_user_id: onBehalf, created_as_proxy: true } : {}),
      };

      const { data } = await api.post('/orders', payload);
      router.push(`/dashboard/sales/orders/${data.id}`);
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

        <Card className="p-6 space-y-4">
          <h2 className="font-bold">Manual order form</h2>
          {!formStatus ? (
            <div className="space-y-3">
              <Button
                type="button"
                className="w-full bg-slate-700 text-white"
                onClick={() => document.getElementById('manual-scan')?.click()}
              >
                Click to capture manual order form
              </Button>
              <input
                id="manual-scan"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setManualFileName(f.name);
                    setFormStatus('manual_captured');
                  }
                }}
              />
              {manualFileName && <p className="text-xs text-green-700">{manualFileName}</p>}
              <Button type="button" variant="outline" className="w-full" onClick={() => { setFormStatus('no_manual_form'); setManualFileName(''); }}>
                No manual order form
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              {formStatus === 'manual_captured' ? `Manual captured: ${manualFileName || 'file'}` : 'No manual form selected'}
            </p>
          )}
        </Card>

        {!!formStatus && (
        <>
        <Card className="p-6 space-y-4">
          <h2 className="font-bold">Order Information</h2>

          <div>
            <Label className="text-sm font-medium">Customer *</Label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full mt-1.5 p-2 border border-gray-300 rounded"
              disabled={submitting}
              required
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.company ? `— ${c.company}` : ''}</option>
              ))}
            </select>
          </div>

          {canProxy && userOpts.length > 0 && (
            <div>
              <Label className="text-sm font-medium">On behalf of (optional)</Label>
              <select
                value={onBehalf}
                onChange={(e) => setOnBehalf(e.target.value)}
                className="w-full mt-1.5 p-2 border border-gray-300 rounded"
                disabled={submitting}
              >
                <option value="">—</option>
                {userOpts.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Expected Delivery Date *</Label>
            <Input
              type="date"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
              disabled={submitting}
              className="w-full mt-1.5"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Notes *</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              className="w-full mt-1.5 p-2 border border-gray-300 rounded text-sm"
              rows={3}
              placeholder="Any additional notes or special instructions..."
              required
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-bold">Order Items</h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 border border-gray-200 rounded">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs font-medium">Product</Label>
                  <select
                    value={item.product_id || ''}
                    onChange={(e) => handleProductChange(e.target.value, idx)}
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
                    disabled={submitting || !!item.product_id}
                    readOnly={!!item.product_id}
                    className="text-sm"
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
        </>
        )}
      </form>
    </div>
  );
}
