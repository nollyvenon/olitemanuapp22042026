// @ts-nocheck
'use client';
// @ts-nocheck

// @ts-nocheck
import { useState, useEffect } from 'react';
// @ts-nocheck
import { useForm } from 'react-hook-form';
// @ts-nocheck
import { Button } from '@/components/ui/button-system';
// @ts-nocheck
import { Input } from '@/components/ui/input-system';
// @ts-nocheck
import { Card } from '@/components/ui/card-system';
// @ts-nocheck
import { useApi } from '@/hooks/useApi';
// @ts-nocheck

// @ts-nocheck
interface StockMovementFormProps {
// @ts-nocheck
  type: 'add' | 'transfer' | 'oneway';
// @ts-nocheck
  onSuccess?: () => void;
// @ts-nocheck
}
// @ts-nocheck

// @ts-nocheck
export function StockMovementForm({ type, onSuccess }: StockMovementFormProps) {
// @ts-nocheck
  const [loading, setLoading] = useState(false);
// @ts-nocheck
  const [items, setItems] = useState<any[]>([]);
// @ts-nocheck
  const [centers, setCenters] = useState<any[]>([]);
// @ts-nocheck
  const api = useApi();
// @ts-nocheck
  const { register, handleSubmit } = useForm();
// @ts-nocheck

// @ts-nocheck
  useEffect(() => {
// @ts-nocheck
    const load = async () => {
// @ts-nocheck
      try {
// @ts-nocheck
        const [itemRes, centerRes] = await Promise.all([
// @ts-nocheck
          api.get('/api/v1/inventory/items'),
// @ts-nocheck
          api.get('/api/v1/inventory/store-centers'),
// @ts-nocheck
        ]);
// @ts-nocheck
        setItems(itemRes.data.data);
// @ts-nocheck
        setCenters(centerRes.data.data);
// @ts-nocheck
      } catch (error) {
// @ts-nocheck
        console.error('Failed to load data', error);
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
  const onSubmit = async (data: any) => {
// @ts-nocheck
    setLoading(true);
// @ts-nocheck
    try {
// @ts-nocheck
      const endpoint =
// @ts-nocheck
        type === 'add'
// @ts-nocheck
          ? '/api/v1/inventory/journals/add-stock'
// @ts-nocheck
          : type === 'transfer'
// @ts-nocheck
          ? '/api/v1/inventory/journals/transfer'
// @ts-nocheck
          : '/api/v1/inventory/journals/one-way';
// @ts-nocheck

// @ts-nocheck
      const payload =
// @ts-nocheck
        type === 'add'
// @ts-nocheck
          ? {
// @ts-nocheck
              stock_item_id: data.stock_item_id,
// @ts-nocheck
              store_center_id: data.store_center_id,
// @ts-nocheck
              quantity: parseFloat(data.quantity),
// @ts-nocheck
              remarks: data.remarks,
// @ts-nocheck
            }
// @ts-nocheck
          : {
// @ts-nocheck
              stock_item_id: data.stock_item_id,
// @ts-nocheck
              from_store_id: data.from_store_id,
// @ts-nocheck
              to_store_id: data.to_store_id,
// @ts-nocheck
              quantity: parseFloat(data.quantity),
// @ts-nocheck
              remarks: data.remarks,
// @ts-nocheck
            };
// @ts-nocheck

// @ts-nocheck
      await api.post(endpoint, payload);
// @ts-nocheck
      onSuccess?.();
// @ts-nocheck
    } catch (error) {
// @ts-nocheck
      console.error('Failed to create movement', error);
// @ts-nocheck
    } finally {
// @ts-nocheck
      setLoading(false);
// @ts-nocheck
    }
// @ts-nocheck
  };
// @ts-nocheck

// @ts-nocheck
  return (
// @ts-nocheck
    <Card className="p-6">
// @ts-nocheck
      <form onSubmit={handleSubmit(onSubmit)}>
// @ts-nocheck
        <h3 className="text-lg font-semibold mb-4 capitalize">{type} Stock</h3>
// @ts-nocheck

// @ts-nocheck
        <div className="space-y-4">
// @ts-nocheck
          <div>
// @ts-nocheck
            <label className="block text-sm font-medium mb-2">Stock Item</label>
// @ts-nocheck
            <select {...register('stock_item_id')} className="w-full p-2 border rounded" required>
// @ts-nocheck
              <option value="">Select item</option>
// @ts-nocheck
              {items.map((item) => (
// @ts-nocheck
                <option key={item.id} value={item.id}>
// @ts-nocheck
                  {item.name} ({item.code})
// @ts-nocheck
                </option>
// @ts-nocheck
              ))}
// @ts-nocheck
            </select>
// @ts-nocheck
          </div>
// @ts-nocheck

// @ts-nocheck
          {type !== 'add' && (
// @ts-nocheck
            <div>
// @ts-nocheck
              <label className="block text-sm font-medium mb-2">From Store</label>
// @ts-nocheck
              <select {...register('from_store_id')} className="w-full p-2 border rounded" required>
// @ts-nocheck
                <option value="">Select store</option>
// @ts-nocheck
                {centers.map((center) => (
// @ts-nocheck
                  <option key={center.id} value={center.id}>
// @ts-nocheck
                    {center.name}
// @ts-nocheck
                  </option>
// @ts-nocheck
                ))}
// @ts-nocheck
              </select>
// @ts-nocheck
            </div>
// @ts-nocheck
          )}
// @ts-nocheck

// @ts-nocheck
          <div>
// @ts-nocheck
            <label className="block text-sm font-medium mb-2">To Store</label>
// @ts-nocheck
            <select {...register('store_center_id')} className="w-full p-2 border rounded" required>
// @ts-nocheck
              <option value="">Select store</option>
// @ts-nocheck
              {centers.map((center) => (
// @ts-nocheck
                <option key={center.id} value={center.id}>
// @ts-nocheck
                  {center.name}
// @ts-nocheck
                </option>
// @ts-nocheck
              ))}
// @ts-nocheck
            </select>
// @ts-nocheck
          </div>
// @ts-nocheck

// @ts-nocheck
          <div>
// @ts-nocheck
            <label className="block text-sm font-medium mb-2">Quantity</label>
// @ts-nocheck
            <Input type="number" {...register('quantity', { required: true })} step="0.01" />
// @ts-nocheck
          </div>
// @ts-nocheck

// @ts-nocheck
          <div>
// @ts-nocheck
            <label className="block text-sm font-medium mb-2">Remarks</label>
// @ts-nocheck
            <textarea {...register('remarks')} className="w-full p-2 border rounded" rows={3} />
// @ts-nocheck
          </div>
// @ts-nocheck
        </div>
// @ts-nocheck

// @ts-nocheck
        <Button type="submit" disabled={loading} className="w-full mt-6">
// @ts-nocheck
          {loading ? 'Processing...' : 'Create Movement'}
// @ts-nocheck
        </Button>
// @ts-nocheck
      </form>
// @ts-nocheck
    </Card>
// @ts-nocheck
  );
// @ts-nocheck
}
