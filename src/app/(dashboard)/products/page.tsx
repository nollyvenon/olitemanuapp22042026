'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const api = getApiClient();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/v1/inventory/items', { params: { search } });
        setProducts(res.data.data);
      } catch (error) {
        console.error('Failed to load', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api, search]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button>Add Product</Button>
      </div>
      <div className="mb-6">
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading ? <Card className="p-6">Loading...</Card> : (
        <div className="space-y-3">
          {products.map((p) => (
            <Link key={p.id} href={`/dashboard/products/${p.id}`}>
              <Card className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-gray-600">{p.code} • ${p.price}</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
