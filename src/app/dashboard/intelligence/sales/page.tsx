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
import { TrendingUp } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface SalesData {
  kpis: Record<string, { value: number; change_pct?: number; prior_value?: number }>;
  charts: { trend: any[]; pipeline: any[]; topCustomers: any[] };
  records: any[];
  insights: any[];
  recommendations: string[];
  period: number;
}

export default function SalesIntelligence() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/sales?period=30');
        setData(data);
      } catch (error) {
        console.error('Failed to load sales intelligence', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'order_number', header: 'Order #', cell: i => <span className="font-mono text-xs font-semibold text-blue-600">{String(i.getValue())}</span> },
    { accessorKey: 'customer_name', header: 'Customer', cell: i => <span className="text-sm">{String(i.getValue())}</span> },
    { accessorKey: 'status', header: 'Status', cell: i => <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded">{String(i.getValue())}</span> },
    { accessorKey: 'hours_stalled', header: 'Hours Stalled', cell: i => {
        const hours = Number(i.getValue());
        const color = hours > 72 ? 'text-red-600' : hours > 48 ? 'text-amber-600' : 'text-gray-600';
        return <span className={`font-semibold ${color}`}>{Math.round(hours)}h</span>;
      }
    },
    { accessorKey: 'total', header: 'Value', cell: i => <span className="font-bold">₦{Number(i.getValue()).toLocaleString('en-NG')}</span> },
    { accessorKey: 'creator_name', header: 'Creator', cell: i => <span className="text-sm">{String(i.getValue())}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Intelligence" description="Pipeline health, revenue trends, and stalled order tracking" />

      {data.insights.length > 0 && <InsightBanner insights={data.insights} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Authorized Revenue"
          value={data.kpis.authorized_revenue.value}
          format="currency"
          change={data.kpis.authorized_revenue.change_pct ?? 0}
          icon={TrendingUp}
          accentColor="#FF9900"
        />
        <KpiCard title="Pipeline Orders" value={Math.ceil(data.kpis.authorized_count?.value ?? 0)} format="number" change={0} icon={TrendingUp} accentColor="#146eb4" />
        <KpiCard
          title="Avg Order Value"
          value={data.kpis.avg_order_value.value}
          format="currency"
          change={data.kpis.avg_order_value.change_pct ?? 0}
          icon={TrendingUp}
          accentColor="#067d62"
        />
        <KpiCard title="Pipeline Value" value={data.kpis.pipeline_value.value} format="currency" change={0} icon={TrendingUp} accentColor="#cc0c39" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Revenue Trend (Daily)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.charts.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#FF9900" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Pipeline by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.pipeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#146eb4" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Stalled Orders (48h+)</h3>
        <DataTable columns={columns} data={data.records} isLoading={false} />
      </Card>

      {data.recommendations.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Recommendations</h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
