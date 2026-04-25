'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { InsightBanner } from '@/components/intelligence/InsightBanner';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/data-table/DataTable';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Percent, Warehouse } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface PerformanceData {
  records: any[];
  depot: any[];
  insights: any[];
  recommendations: string[];
  period: number;
}

export default function PerformanceIntelligence() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/performance?period=30');
        setData(data);
      } catch (error) {
        console.error('Failed to load performance intelligence', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const topRep = data.records[0];

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'rep_name', header: 'Rep Name', cell: i => <span className="font-semibold">{String(i.getValue())}</span> },
    { accessorKey: 'depot', header: 'Depot', cell: i => <span className="text-sm">{String(i.getValue())}</span> },
    { accessorKey: 'orders_captured', header: 'Orders', cell: i => <span className="text-center font-bold">{Number(i.getValue())}</span> },
    { accessorKey: 'orders_authorized', header: 'Authorized', cell: i => <span className="text-center">{Number(i.getValue())}</span> },
    { accessorKey: 'authorized_revenue', header: 'Revenue', cell: i => <span className="font-bold">₦{Number(i.getValue()).toLocaleString('en-NG')}</span> },
    { accessorKey: 'avg_order_value', header: 'Avg Value', cell: i => <span>₦{Number(i.getValue()).toLocaleString('en-NG')}</span> },
    { accessorKey: 'conversion_pct', header: 'Conversion %', cell: i => {
        const pct = Number(i.getValue());
        const color = pct < 50 ? 'text-red-600' : pct < 75 ? 'text-amber-600' : 'text-green-600';
        return <span className={`font-semibold ${color}`}>{pct.toFixed(1)}%</span>;
      }
    },
  ];

  const depotColumns: ColumnDef<any>[] = [
    { accessorKey: 'depot', header: 'Depot', cell: i => <span className="font-semibold">{String(i.getValue())}</span> },
    { accessorKey: 'city', header: 'City', cell: i => <span className="text-sm text-gray-600">{String(i.getValue())}</span> },
    { accessorKey: 'orders', header: 'Orders', cell: i => <span className="text-center">{Number(i.getValue())}</span> },
    { accessorKey: 'revenue', header: 'Revenue', cell: i => <span className="font-bold">₦{Number(i.getValue()).toLocaleString('en-NG')}</span> },
    { accessorKey: 'conversion_pct', header: 'Conversion %', cell: i => {
        const pct = Number(i.getValue());
        const color = pct < 50 ? 'bg-red-100 text-red-700' : pct < 75 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{pct.toFixed(1)}%</span>;
      }
    },
  ];

  const avgConversion = data.depot.length > 0 ? data.depot.reduce((sum, d) => sum + (d.conversion_pct ?? 0), 0) / data.depot.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Performance Intelligence" description="Sales rep rankings, conversion rates, and territory benchmarks" />

      {data.insights.length > 0 && <InsightBanner insights={data.insights} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Top Rep Revenue" value={topRep?.authorized_revenue ?? 0} format="currency" change={0} icon={TrendingUp} accentColor="#FF9900" />
        <KpiCard title="Avg Conversion" value={avgConversion} format="number" change={0} icon={Percent} accentColor="#146eb4" subLabel="%" />
        <KpiCard title="Total Reps" value={data.records.length} format="number" change={0} icon={Users} accentColor="#067d62" />
        <KpiCard title="Active Depots" value={data.depot.length} format="number" change={0} icon={Warehouse} accentColor="#cc0c39" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Revenue by Sales Rep (Top 10)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.records.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rep_name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="authorized_revenue" fill="#FF9900" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Conversion Rate by Depot (vs Team Avg: {avgConversion.toFixed(1)}%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.depot}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="depot" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="conversion_pct" fill="#146eb4" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Sales Rep Leaderboard
        </h3>
        <DataTable columns={columns} data={data.records} isLoading={false} />
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Depot Performance</h3>
        <DataTable columns={depotColumns} data={data.depot} isLoading={false} />
      </Card>

      {data.recommendations.length > 0 && (
        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="font-semibold text-lg mb-3 text-purple-900">Recommendations</h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-purple-800 flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
