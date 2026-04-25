'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/data-table/DataTable';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Target, Award } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface SalesData {
  performance_metrics: any[];
  conversion_rates: any[];
  success_rates: any[];
  top_performers: any[];
  underperformers: any[];
  behavioral_patterns: any[];
  training_recommendations: any[];
  territory_adjustments: any[];
  leaderboard: any[];
}

export default function SalesPerformance() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/sales-performance');
        setData(data);
      } catch (error) {
        console.error('Failed to load sales performance', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const topRevenue = data.performance_metrics[0]?.authorized_revenue || 0;
  const totalOfficers = data.performance_metrics.length;
  const avgSuccess = (data.success_rates.reduce((s: number, r: any) => s + (r.success_rate || 0), 0) / data.success_rates.length).toFixed(1);

  const leaderboardColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'rank', header: 'Rank', cell: ({ getValue }) => <span className="font-bold text-lg">#{getValue()}</span> },
    { accessorKey: 'name', header: 'Officer', cell: ({ getValue }) => <span className="font-medium text-lg">{String(getValue())}</span> },
    { accessorKey: 'revenue', header: 'Revenue (₦)', cell: ({ getValue }) => <span className="font-bold text-green-600">{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
    { accessorKey: 'orders', header: 'Orders', cell: ({ getValue }) => <span className="font-bold">{getValue()}</span> },
    { accessorKey: 'success_rate', header: 'Success %', cell: ({ getValue }) => <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold">{Number(getValue()).toFixed(1)}%</span> },
    { accessorKey: 'customers', header: 'Customers', cell: ({ getValue }) => <span>{getValue()}</span> },
  ];

  const metricsColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Officer', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'total_orders', header: 'Orders', cell: ({ getValue }) => <span>{getValue()}</span> },
    { accessorKey: 'authorized_orders', header: 'Authorized', cell: ({ getValue }) => <span className="font-bold text-green-600">{getValue()}</span> },
    { accessorKey: 'auth_rate', header: 'Auth %', cell: ({ getValue }) => <span className="font-bold">{Number(getValue()).toFixed(1)}%</span> },
    { accessorKey: 'authorized_revenue', header: 'Revenue (₦)', cell: ({ getValue }) => <span className="font-bold">{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
  ];

  const conversionColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Officer', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'contacts', header: 'Contacts', cell: ({ getValue }) => <span>{getValue()}</span> },
    { accessorKey: 'customers_converted', header: 'Customers', cell: ({ getValue }) => <span className="font-bold">{getValue()}</span> },
    { accessorKey: 'conversion_rate', header: 'Rate %', cell: ({ getValue }) => <span className="font-bold text-purple-600">{Number(getValue()).toFixed(1)}%</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Performance Intelligence"
        description="Officer performance, conversion rates, success metrics with behavioral analysis and recommendations"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Top Officer Revenue"
          value={topRevenue}
          format="currency"
          change={0}
          icon={TrendingUp}
          accentColor="#FF9900"
        />
        <KpiCard
          title="Active Officers"
          value={totalOfficers}
          format="number"
          change={0}
          icon={Users}
          accentColor="#146eb4"
        />
        <KpiCard
          title="Avg Success Rate"
          value={parseFloat(avgSuccess as any)}
          format="number"
          change={0}
          icon={Target}
          accentColor="#067d62"
          subLabel={`${avgSuccess}% average`}
        />
        <KpiCard
          title="Top Performers"
          value={data.top_performers.length}
          format="number"
          change={0}
          icon={Award}
          accentColor="#FF9900"
        />
      </div>

      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200">
        <h3 className="font-bold text-xl mb-4 text-amber-900">🏆 Leaderboard</h3>
        <DataTable columns={leaderboardColumns} data={data.leaderboard} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Revenue by Officer</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.performance_metrics.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="authorized_revenue" fill="#FF9900" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Success Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.success_rates.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="success_rate" fill="#067d62" name="Success %" />
              <Bar dataKey="rejection_rate" fill="#cc0c39" name="Rejection %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Performance Metrics</h3>
        <DataTable columns={metricsColumns} data={data.performance_metrics} />
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Conversion Rates</h3>
        <DataTable columns={conversionColumns} data={data.conversion_rates} />
      </Card>

      {data.top_performers.length > 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="font-semibold text-lg text-green-900 mb-3">⭐ Top Performers</h3>
          <div className="space-y-2">
            {data.top_performers.map((p: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-green-200 flex justify-between">
                <div className="text-sm">
                  <p className="font-bold text-green-900">{p.name}</p>
                  <p className="text-xs text-green-700">{p.orders} orders • {p.customers} customers</p>
                </div>
                <span className="font-bold text-green-600">₦{Number(p.revenue).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.underperformers.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="font-semibold text-lg text-red-900 mb-3">⚠ Underperformers</h3>
          <div className="space-y-2">
            {data.underperformers.map((u: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-red-200">
                <div className="flex justify-between">
                  <p className="font-bold text-red-900">{u.name}</p>
                  <span className="text-red-600 font-bold">{Number(u.success_rate).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-red-700 mt-1">{u.concern}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.behavioral_patterns.length > 0 && (
        <Card className="p-6 bg-cyan-50 border-cyan-200">
          <h3 className="font-semibold text-lg text-cyan-900 mb-3">🔍 Behavioral Patterns</h3>
          <div className="space-y-2">
            {data.behavioral_patterns.map((p: any, i: number) => (
              <div key={i} className="p-2 bg-white rounded border border-cyan-200 flex justify-between">
                <span className="text-sm font-medium text-cyan-900">{p.name}</span>
                <span className="text-xs font-semibold px-2 py-1 bg-cyan-100 text-cyan-700 rounded">{p.pattern}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.training_recommendations.length > 0 && (
        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="font-semibold text-lg text-purple-900 mb-3">📚 Training Recommendations</h3>
          <div className="space-y-2">
            {data.training_recommendations.map((t: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-purple-200">
                <div className="flex justify-between">
                  <p className="font-medium text-purple-900">{t.name}</p>
                  <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded">URGENT</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">{t.training}</p>
                <p className="text-xs text-purple-600 mt-1">{t.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.territory_adjustments.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-lg text-blue-900 mb-3">🗺 Territory Adjustments</h3>
          <div className="space-y-2">
            {data.territory_adjustments.map((a: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-blue-200">
                <p className="font-medium text-blue-900">{a.name} - {a.location}</p>
                <p className="text-sm text-blue-700 mt-1">{a.action}</p>
                <p className="text-xs text-blue-600 mt-1">{a.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
