'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/data-table/DataTable';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Package, TrendingUp, Clock, AlertCircle, Zap } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface InventoryData {
  stock_levels: any[];
  movement_trends: any[];
  turnover_rates: any[];
  dead_stock: any[];
  fast_moving: any[];
  stockout_forecast: any[];
  reorder_recommendations: any[];
  redistribution: any[];
  low_stock_alerts: any[];
  excess_stock_alerts: any[];
}

export default function InventoryIntelligence() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/inventory-intelligence');
        setData(data);
      } catch (error) {
        console.error('Failed to load inventory intelligence', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const totalValue = data.stock_levels.reduce((sum: number, s: any) => sum + s.stock_value, 0);
  const avgTurnover = (data.turnover_rates.reduce((sum: number, t: any) => sum + (t.annual_turnover || 0), 0) / data.turnover_rates.length).toFixed(1);

  const stockColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Item', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'sku', header: 'SKU', cell: ({ getValue }) => <span className="text-xs text-gray-500">{String(getValue())}</span> },
    { accessorKey: 'current_stock', header: 'Current', cell: ({ getValue }) => <span className="font-bold">{getValue()}</span> },
    { accessorKey: 'optimal_stock', header: 'Optimal', cell: ({ getValue }) => <span className="text-gray-600">{Math.round(Number(getValue()))}</span> },
    { accessorKey: 'stock_value', header: 'Value (₦)', cell: ({ getValue }) => <span className="font-bold text-green-600">{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
  ];

  const turnoverColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Item', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'units_sold_90d', header: 'Sold (90d)', cell: ({ getValue }) => <span>{getValue()}</span> },
    { accessorKey: 'annual_turnover', header: 'Annual Turnover', cell: ({ getValue }) => <span className="font-bold">{Number(getValue()).toFixed(2)}x</span> },
  ];

  const forecastColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Item', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'current_stock', header: 'Stock', cell: ({ getValue }) => <span>{getValue()}</span> },
    { accessorKey: 'daily_rate', header: 'Daily Rate', cell: ({ getValue }) => <span>{Number(getValue()).toFixed(2)}</span> },
    { accessorKey: 'days_until_stockout', header: 'Days Left', cell: ({ getValue, row }) => <span className={`font-bold ${row.original.urgency === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>{getValue()}</span> },
  ];

  const reorderColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Item', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'current_stock', header: 'Current', cell: ({ getValue }) => <span>{getValue()}</span> },
    { accessorKey: 'recommended_qty', header: 'Reorder Qty', cell: ({ getValue }) => <span className="font-bold text-blue-600">{getValue()}</span> },
    { accessorKey: 'priority', header: 'Priority', cell: ({ getValue }) => <span className={`px-2 py-1 rounded text-xs font-semibold ${getValue() === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{String(getValue()).toUpperCase()}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Intelligence"
        description="Stock levels, movement trends, dead stock detection, stockout forecasting, and redistribution optimization"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Stock Value"
          value={totalValue}
          format="currency"
          change={0}
          icon={Package}
          accentColor="#067d62"
        />
        <KpiCard
          title="Fast-Moving Items"
          value={data.fast_moving.length}
          format="number"
          change={0}
          icon={Zap}
          accentColor="#FF9900"
        />
        <KpiCard
          title="Avg Turnover"
          value={parseFloat(avgTurnover as any)}
          format="number"
          change={0}
          icon={TrendingUp}
          accentColor="#146eb4"
          subLabel={`${avgTurnover}x annually`}
        />
        <KpiCard
          title="Critical Alerts"
          value={data.low_stock_alerts.length + data.stockout_forecast.filter((s: any) => s.urgency === 'critical').length}
          format="number"
          change={0}
          icon={AlertCircle}
          accentColor="#cc0c39"
        />
      </div>

      {data.stockout_forecast.filter((s: any) => s.urgency === 'critical').length > 0 && (
        <Card className="p-6 bg-red-50 border-red-300">
          <h3 className="font-semibold text-lg text-red-900 mb-3">🚨 Critical Stockouts</h3>
          <div className="space-y-2">
            {data.stockout_forecast.filter((s: any) => s.urgency === 'critical').map((s: any, i: number) => (
              <div key={i} className="flex justify-between p-2 bg-white rounded border border-red-200">
                <span className="font-medium">{s.name}</span>
                <span className="text-red-600 font-bold">{s.days_until_stockout} days until stockout</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Stock Movement Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.movement_trends.slice(0, 12)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="inward" fill="#067d62" name="Inward" />
              <Bar dataKey="outward" fill="#cc0c39" name="Outward" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Stock Levels Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.stock_levels.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current_stock" fill="#146eb4" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Current Stock Levels</h3>
        <DataTable columns={stockColumns} data={data.stock_levels.slice(0, 15)} />
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Turnover Rates (Fast-Moving Items)</h3>
        <DataTable columns={turnoverColumns} data={data.fast_moving} />
      </Card>

      {data.dead_stock.length > 0 && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-lg text-amber-900 mb-3">⚠ Dead Stock Detected</h3>
          <div className="space-y-2">
            {data.dead_stock.slice(0, 10).map((d: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-amber-200 flex justify-between">
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-xs text-amber-700">{d.days_inactive} days inactive • Locked value: ₦{Number(d.locked_value).toLocaleString('en-NG', {maximumFractionDigits: 0})}</p>
                </div>
                <span className="text-amber-600 font-bold text-sm">{d.action}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.stockout_forecast.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Stockout Forecast (Next 30 Days)</h3>
          <DataTable columns={forecastColumns} data={data.stockout_forecast} />
        </Card>
      )}

      {data.reorder_recommendations.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-lg text-blue-900 mb-4">📦 Reorder Recommendations</h3>
          <DataTable columns={reorderColumns} data={data.reorder_recommendations} />
        </Card>
      )}

      {data.low_stock_alerts.length > 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-lg text-yellow-900 mb-3">⚠ Low Stock Alerts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.low_stock_alerts.map((l: any, i: number) => (
              <div key={i} className="p-2 bg-white rounded border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-900">{l.name}</p>
                <p className="text-sm font-bold text-yellow-600">{l.current_stock}/{l.reorder_level}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.excess_stock_alerts.length > 0 && (
        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="font-semibold text-lg text-purple-900 mb-3">📈 Excess Stock</h3>
          <div className="space-y-2">
            {data.excess_stock_alerts.slice(0, 8).map((e: any, i: number) => (
              <div key={i} className="flex justify-between p-2 bg-white rounded border border-purple-200">
                <div className="text-sm">
                  <p className="font-medium text-purple-900">{e.name}</p>
                  <p className="text-xs text-purple-700">{e.current_stock} units (3x reorder)</p>
                </div>
                <span className="font-bold text-purple-600">₦{Number(e.stock_value).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.redistribution.length > 0 && (
        <Card className="p-6 bg-cyan-50 border-cyan-200">
          <h3 className="font-semibold text-lg text-cyan-900 mb-3">🔄 Redistribution Suggestions</h3>
          <div className="space-y-2">
            {data.redistribution.map((r: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-cyan-200">
                <p className="font-medium text-cyan-900">{r.from} → {r.to}</p>
                <p className="text-sm text-cyan-700 mt-1">{r.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
