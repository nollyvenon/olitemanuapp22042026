'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { InsightBanner } from '@/components/intelligence/InsightBanner';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart, ComposedChart } from 'recharts';
import { TrendingUp, ShoppingCart, AlertCircle, Package, AlertTriangle } from 'lucide-react';

interface ExecutiveData {
  kpis: Record<string, number>;
  trend: any[];
  cashflow: any[];
  aging: Record<string, number>;
  inventory: Record<string, number>;
  forecast: Record<string, number>;
  anomalies: any[];
  risks: string[];
}

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export default function ExecutiveDashboard() {
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/executive');
        setData(data);
      } catch (error) {
        console.error('Failed to load executive data', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const agingData = [
    { name: 'Current', value: data.aging.current, fill: '#067d62' },
    { name: '1-30', value: data.aging.d30, fill: '#febd69' },
    { name: '31-60', value: data.aging.d60, fill: '#c45500' },
    { name: '61-90', value: data.aging.d90, fill: '#FF9900' },
    { name: '90+', value: data.aging.d90plus, fill: '#cc0c39' },
  ];

  const inventoryData = [
    { name: 'In Stock', value: data.inventory.in_stock, fill: '#067d62' },
    { name: 'Low Stock', value: data.inventory.low_stock, fill: '#FF9900' },
    { name: 'Out of Stock', value: data.inventory.out_of_stock, fill: '#cc0c39' },
  ];

  const lastTrendDate = data.trend[data.trend.length - 1]?.date || new Date().toISOString().split('T')[0];
  const combinedTrend = [
    ...data.trend.map(r => ({ date: r.date, revenue: r.revenue, forecast: null })),
    ...Array.from({length: 7}, (_, i) => ({
      date: addDays(lastTrendDate, i + 1),
      revenue: null,
      forecast: data.forecast.next_7d / 7,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Command Center"
        description="Real-time business overview with anomaly detection and forecasting"
      />

      {data.anomalies.length > 0 && <InsightBanner insights={data.anomalies} />}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard
          title="Revenue (30d)"
          value={data.kpis.rev_current}
          format="currency"
          change={data.kpis.rev_change_pct}
          icon={TrendingUp}
          accentColor="#FF9900"
        />
        <KpiCard
          title="Pipeline"
          value={data.kpis.pipeline_value}
          format="currency"
          change={0}
          icon={ShoppingCart}
          accentColor="#146eb4"
          subLabel={`${data.kpis.pipeline_count} orders`}
        />
        <KpiCard
          title="Outstanding AR"
          value={data.kpis.total_outstanding}
          format="currency"
          change={0}
          icon={AlertCircle}
          accentColor="#cc0c39"
        />
        <KpiCard
          title="Stock Value"
          value={data.kpis.stock_value}
          format="currency"
          change={0}
          icon={Package}
          accentColor="#067d62"
        />
        <KpiCard
          title="Low Stock"
          value={data.kpis.low_stock}
          format="number"
          change={0}
          icon={AlertTriangle}
          accentColor="#c45500"
          subLabel={`${data.kpis.out_of_stock} out of stock`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Revenue Trend + 7-Day Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={combinedTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" fill="#FF9900" stroke="#FF9900" fillOpacity={0.3} name="Actual Revenue" />
              <Line type="monotone" dataKey="forecast" stroke="#cc0c39" strokeDasharray="5 5" name="7d Forecast (daily avg)" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Weekly Cash Flow (Collected vs Charged)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.cashflow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="collected" fill="#067d62" name="Collected" />
              <Bar dataKey="charged" fill="#cc0c39" name="Charged" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">AR Aging (₦)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#146eb4">
                {agingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Inventory Health</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={inventoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                {inventoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-lg text-amber-900">7-Day Forecast</h3>
          <div className="text-3xl font-bold text-amber-600 mt-2">₦{Number(data.forecast.next_7d || 0).toLocaleString('en-NG', {maximumFractionDigits: 0})}</div>
          <p className="text-xs text-amber-700 mt-1">Projected revenue (next 7 days)</p>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-lg text-blue-900">30-Day Forecast</h3>
          <div className="text-3xl font-bold text-blue-600 mt-2">₦{Number(data.forecast.next_30d || 0).toLocaleString('en-NG', {maximumFractionDigits: 0})}</div>
          <p className="text-xs text-blue-700 mt-1">Projected revenue (next 30 days)</p>
        </Card>
      </div>

      {data.risks.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="font-semibold text-lg text-red-900 mb-3">Active Risks & Recommendations</h3>
          <ul className="space-y-2">
            {data.risks.map((risk, i) => (
              <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                <span className="text-red-600 mt-1">⚠</span>
                {risk}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
