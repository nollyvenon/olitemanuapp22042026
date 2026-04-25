'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { InsightBanner } from '@/components/intelligence/InsightBanner';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/data-table/DataTable';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, AlertTriangle, Target } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface RevenueData {
  by_product: any[];
  by_region: any[];
  by_officer: any[];
  growth_trends: any[];
  margins: any[];
  top_products: any[];
  declining_products: any[];
  leakage: any[];
  forecast: Record<string, number>;
  recommendations: string[];
}

export default function RevenueIntelligence() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/revenue');
        setData(data);
      } catch (error) {
        console.error('Failed to load revenue intelligence', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const totalRevenue = data.by_product.reduce((sum: number, p: any) => sum + p.revenue, 0);
  const avgMargin = (data.margins.reduce((sum: number, p: any) => sum + p.margin_pct, 0) / data.margins.length).toFixed(1);
  const topProduct = data.top_products[0];
  const totalLeakage = data.leakage.reduce((sum: number, l: any) => sum + l.amount, 0);

  const productColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Product', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'sku', header: 'SKU', cell: ({ getValue }) => <span className="text-xs text-gray-600">{String(getValue())}</span> },
    { accessorKey: 'revenue', header: 'Revenue (₦)', cell: ({ getValue }) => <span className="font-bold">{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
    { accessorKey: 'orders', header: 'Orders', cell: ({ getValue }) => <span>{getValue()}</span> },
  ];

  const regionColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'region', header: 'Region', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'revenue', header: 'Revenue (₦)', cell: ({ getValue }) => <span className="font-bold">{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
    { accessorKey: 'orders', header: 'Orders', cell: ({ getValue }) => <span>{getValue()}</span> },
    { accessorKey: 'customers', header: 'Customers', cell: ({ getValue }) => <span>{getValue()}</span> },
  ];

  const marginColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Product', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'revenue', header: 'Revenue (₦)', cell: ({ getValue }) => <span className="font-bold text-green-600">{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
    { accessorKey: 'margin_pct', header: 'Margin %', cell: ({ getValue }) => <span className="font-bold">{(getValue() as number).toFixed(1)}%</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue Intelligence Report"
        description="Comprehensive revenue analysis by product, region, and officer with growth trends and recommendations"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue (90d)"
          value={totalRevenue}
          format="currency"
          change={0}
          icon={DollarSign}
          accentColor="#FF9900"
        />
        <KpiCard
          title="Avg Margin"
          value={parseFloat(avgMargin as any)}
          format="number"
          change={0}
          icon={TrendingUp}
          accentColor="#067d62"
          subLabel={`${avgMargin}% average`}
        />
        <KpiCard
          title="Top Product"
          value={topProduct?.revenue || 0}
          format="currency"
          change={0}
          icon={Target}
          accentColor="#146eb4"
          subLabel={topProduct?.name}
        />
        <KpiCard
          title="Revenue Leakage"
          value={totalLeakage}
          format="currency"
          change={0}
          icon={AlertTriangle}
          accentColor="#cc0c39"
          subLabel={`${data.leakage.length} issues detected`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Revenue by Region</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.by_region.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#FF9900" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Revenue Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.growth_trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#067d62" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Top Products by Revenue</h3>
        <DataTable columns={productColumns} data={data.by_product.slice(0, 10)} />
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Profit Margins by Product</h3>
        <DataTable columns={marginColumns} data={data.margins.slice(0, 10)} />
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Revenue by Region</h3>
        <DataTable columns={regionColumns} data={data.by_region} />
      </Card>

      {data.declining_products.length > 0 && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-lg text-amber-900 mb-4">⚠ Declining Products</h3>
          <div className="space-y-3">
            {data.declining_products.map((p: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-amber-200">
                <div className="flex justify-between">
                  <span className="font-medium">{p.name} ({p.sku})</span>
                  <span className="text-amber-600 font-bold">{p.decline_pct}% decline</span>
                </div>
                <p className="text-sm text-amber-700 mt-1">{p.action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.leakage.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="font-semibold text-lg text-red-900 mb-4">🚨 Revenue Leakage Detected</h3>
          <div className="space-y-3">
            {data.leakage.map((l: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-red-200">
                <div className="flex justify-between">
                  <span className="font-medium">{l.type}</span>
                  <span className="text-red-600 font-bold">₦{Number(l.amount).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{l.impact}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-lg text-blue-900 mb-4">📈 Revenue Forecast</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-700">Next 7 Days</p>
            <p className="text-2xl font-bold text-blue-600">₦{Number(data.forecast.next_7d).toLocaleString('en-NG', {maximumFractionDigits: 0})}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Next 30 Days</p>
            <p className="text-2xl font-bold text-blue-600">₦{Number(data.forecast.next_30d).toLocaleString('en-NG', {maximumFractionDigits: 0})}</p>
          </div>
        </div>
      </Card>

      {data.recommendations.length > 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="font-semibold text-lg text-green-900 mb-4">✓ Recommendations</h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec: string, i: number) => (
              <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                <span className="text-green-600 mt-1">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
