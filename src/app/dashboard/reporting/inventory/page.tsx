'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiClient } from '@/lib/api-client';

type Cat = { id: string; name: string; groups?: { id: string; name: string }[] };
type ItemRow = { id: string; name: string; sku?: string; group_id?: string };
type Row = {
  id: string;
  sku: string;
  name: string;
  category_name: string;
  group_name: string;
  opening_balance: string | number;
  inwards: string | number;
  outwards: string | number;
  closing_balance: string | number;
};

export default function UnifiedInventoryReportPage() {
  const api = getApiClient();
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [locId, setLocId] = useState('');
  const [catId, setCatId] = useState('');
  const [grpId, setGrpId] = useState('');
  const [itemId, setItemId] = useState('');
  const [from, setFrom] = useState(() => new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [txnOnly, setTxnOnly] = useState(false);
  const [noZero, setNoZero] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [lr, cr, ir] = await Promise.all([
          api.get('/locations'),
          api.get('/stock/categories'),
          api.get('/stock/items'),
        ]);
        const ls = Array.isArray(lr.data) ? lr.data : lr.data?.data ?? [];
        const cs = Array.isArray(cr.data) ? cr.data : cr.data?.data ?? [];
        const it = Array.isArray(ir.data) ? ir.data : ir.data?.data ?? [];
        setLocations(ls);
        setCats(cs);
        setItems(it);
        if (ls[0]?.id) setLocId(ls[0].id);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [api]);

  const grps = useMemo(() => {
    if (!catId) return cats.flatMap((c) => c.groups ?? []);
    const c = cats.find((x) => x.id === catId);
    return c?.groups ?? [];
  }, [cats, catId]);

  const itemOpts = useMemo(() => {
    let list = items;
    if (grpId) list = list.filter((i) => i.group_id === grpId);
    else if (catId) {
      const gids = new Set(grps.map((g) => g.id));
      list = list.filter((i) => i.group_id && gids.has(i.group_id));
    }
    return list;
  }, [items, grpId, catId, grps]);

  const run = async () => {
    if (!locId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/inventory-reports/unified', {
        params: {
          location_id: locId,
          from,
          to,
          category_id: catId || undefined,
          group_id: grpId || undefined,
          item_id: itemId || undefined,
          transaction_only: txnOnly || undefined,
          exclude_zero: noZero || undefined,
        },
      });
      setRows(data?.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory balance report</h1>
        <p className="text-sm text-gray-600 mt-1">Opening, inwards, outwards, closing by location and period</p>
      </div>
      <Card className="p-6 space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <select value={locId} onChange={(e) => setLocId(e.target.value)} className="w-full px-3 py-2 rounded text-sm border border-[#d5d9d9]">
              <option value="">Select</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={catId}
              onChange={(e) => {
                setCatId(e.target.value);
                setGrpId('');
                setItemId('');
              }}
              className="w-full px-3 py-2 rounded text-sm border border-[#d5d9d9]"
            >
              <option value="">All</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Group</label>
            <select
              value={grpId}
              onChange={(e) => {
                setGrpId(e.target.value);
                setItemId('');
              }}
              className="w-full px-3 py-2 rounded text-sm border border-[#d5d9d9]"
            >
              <option value="">All</option>
              {grps.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Item</label>
            <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="w-full px-3 py-2 rounded text-sm border border-[#d5d9d9]">
              <option value="">All</option>
              {itemOpts.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 pt-8 text-sm">
            <input type="checkbox" checked={txnOnly} onChange={(e) => setTxnOnly(e.target.checked)} />
            Only items with movement in range
          </label>
          <label className="flex items-center gap-2 pt-8 text-sm">
            <input type="checkbox" checked={noZero} onChange={(e) => setNoZero(e.target.checked)} />
            Hide zero closing balance
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" onClick={run} disabled={loading || !locId} style={{ background: '#FF9900', color: '#0f1111' }}>{loading ? 'Loading…' : 'Run'}</Button>
          <Button type="button" variant="outline" onClick={() => window.print()} disabled={!rows.length}>Print</Button>
        </div>
      </Card>
      {rows.length > 0 && (
        <Card className="p-4 overflow-x-auto">
          <div className="text-xs text-gray-600 mb-4">{rows.length} rows</div>
          <table className="w-full text-sm">
            <thead style={{ background: '#f4f6f8', borderBottom: '1px solid #d5d9d9' }}>
              <tr>
                <th className="text-left py-2 px-3 font-semibold">SKU</th>
                <th className="text-left py-2 px-3 font-semibold">Item</th>
                <th className="text-left py-2 px-3 font-semibold">Category</th>
                <th className="text-left py-2 px-3 font-semibold">Group</th>
                <th className="text-right py-2 px-3 font-semibold">Opening</th>
                <th className="text-right py-2 px-3 font-semibold">In</th>
                <th className="text-right py-2 px-3 font-semibold">Out</th>
                <th className="text-right py-2 px-3 font-semibold">Closing</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2 px-3 font-mono text-xs">{r.sku}</td>
                  <td className="py-2 px-3">{r.name}</td>
                  <td className="py-2 px-3 text-xs text-gray-600">{r.category_name}</td>
                  <td className="py-2 px-3 text-xs text-gray-600">{r.group_name}</td>
                  <td className="text-right py-2 px-3 font-mono tabular-nums">{Number(r.opening_balance).toLocaleString()}</td>
                  <td className="text-right py-2 px-3 font-mono tabular-nums">{Number(r.inwards).toLocaleString()}</td>
                  <td className="text-right py-2 px-3 font-mono tabular-nums">{Number(r.outwards).toLocaleString()}</td>
                  <td className="text-right py-2 px-3 font-mono tabular-nums">{Number(r.closing_balance).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
