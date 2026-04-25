'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { ComposedChart, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, DollarSign } from 'lucide-react';

interface ForecastData {
  sales: any;
  inventory: any;
  cashflow: any;
}

export default function Forecasts() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const [sales, inv, cf] = await Promise.all([
          api.get('/analytics/forecast/sales'),
          api.get('/analytics/forecast/inventory'),
          api.get('/analytics/forecast/cashflow')
        ]);
        setData({
          sales: sales.data,
          inventory: inv.data,
          cashflow: cf.data
        });
      } catch (error) {
        console.error('Failed to load forecasts', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const combinedSales = [
    ...(data.sales.historical || []).map((h: any) => ({ date: h.date, historical: h.revenue, forecast: null })),
    ...(data.sales.forecast_7d || []).map((f: any, i: number) => ({ date: `+${i + 1}d`, historical: null, forecast: f.forecast }))
  ];

  const combinedInventory = [
    ...(data.inventory.historical || []).map((h: any) => ({ date: h.date, outflow: h.outflow })),
  ];

  const combinedCashflow = [
    ...(data.cashflow.inflow_historical || []).map((h: any, i: number) => ({ week: h.week || `W${i}`, inflow: h.collected })),
  ].map((item, i, arr) => ({
    ...item,
    outflow: (data.cashflow.outflow_historical || [])[i]?.due || 0
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecasting System"
        description="Time-series forecasts for sales, inventory, and cash flow"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-semibold text-blue-900">Sales Forecast</p>
          </div>
          <p className="text-xs text-blue-700">7/30/90-day projection using linear regression</p>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-green-900">Inventory Forecast</p>
          </div>
          <p className="text-xs text-green-700">Stock outflow trend + {(data.inventory.stockout_risk || []).length} stockout risks</p>
        </Card>

        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-900">Cash Flow Forecast</p>
          </div>
          <p className="text-xs text-amber-700">4-week inflow/outflow projection</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Sales Forecast (90-day history + 7-day projection)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={combinedSales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="historical" fill="#FF9900" name="Historical Revenue" />
            <Line dataKey="forecast" stroke="#cc0c39" strokeDasharray="5 5" name="7-day Forecast" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Inventory Outflow Forecast (90-day history + 7-day projection)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combinedInventory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="outflow" stroke="#067d62" name="Daily Outflow (units)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {(data.inventory.stockout_risk || []).length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="font-semibold text-lg text-red-900 mb-4">⚠️ Stockout Risk (Next 30 Days)</h3>
          <div className="space-y-2">
            {(data.inventory.stockout_risk || []).map((item: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-red-200 flex justify-between">
                <div>
                  <p className="font-medium text-red-900">{item.name}</p>
                  <p className="text-xs text-red-700">Current: {item.current_qty} units | Reorder: {item.reorder_level}</p>
                </div>
                <span className="text-sm font-bold text-red-600">{item.days_until_stockout} days</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Cash Flow Forecast (4-week projection)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={combinedCashflow}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="inflow" fill="#067d62" name="Collections (₦)" />
            <Bar dataKey="outflow" fill="#cc0c39" name="Payments Due (₦)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {data.cashflow.net_position_30d && (
        <Card className="p-6 bg-cyan-50 border-cyan-200">
          <h3 className="font-semibold text-lg text-cyan-900 mb-4">30-Day Net Cash Position</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-cyan-700">Inflow (30d)</p>
              <p className="text-2xl font-bold text-cyan-900">₦{((data.cashflow.net_position_30d[0]?.collected_30d || 0) / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-xs text-cyan-700">Outflow (30d)</p>
              <p className="text-2xl font-bold text-red-600">₦{((data.cashflow.net_position_30d[0]?.due_30d || 0) / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-xs text-cyan-700">Net Position</p>
              <p className={`text-2xl font-bold ${(data.cashflow.net_position_30d[0]?.net_position || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₦{((data.cashflow.net_position_30d[0]?.net_position || 0) / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
