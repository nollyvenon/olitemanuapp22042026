'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { InsightBanner } from '@/components/intelligence/InsightBanner';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/data-table/DataTable';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, DollarSign, Clock, TrendingDown } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface CollectionsData {
  kpis: Record<string, { count: number; value: number }>;
  records: any[];
  charts: { weekly_collections: any[] };
  insights: any[];
  recommendations: string[];
}

export default function CollectionsIntelligence() {
  const [data, setData] = useState<CollectionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/collections');
        setData(data);
      } catch (error) {
        console.error('Failed to load collections intelligence', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const agingData = [
    { name: 'Current', value: data.kpis.current.count, amount: data.kpis.current.value },
    { name: '1-30', value: data.kpis.d30.count, amount: data.kpis.d30.value },
    { name: '31-60', value: data.kpis.d60.count, amount: data.kpis.d60.value },
    { name: '61-90', value: data.kpis.d90.count, amount: data.kpis.d90.value },
    { name: '90+', value: data.kpis.d90plus.count, amount: data.kpis.d90plus.value },
  ];

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'Customer', cell: i => <span className="font-semibold">{String(i.getValue())}</span> },
    { accessorKey: 'invoice_number', header: 'Invoice #', cell: i => <span className="font-mono text-xs">{String(i.getValue())}</span> },
    { accessorKey: 'invoice_total', header: 'Amount', cell: i => <span className="font-bold">₦{Number(i.getValue()).toLocaleString('en-NG')}</span> },
    { accessorKey: 'due_date', header: 'Due Date', cell: i => new Date(String(i.getValue())).toLocaleDateString('en-NG') },
    { accessorKey: 'days_overdue', header: 'Days Overdue', cell: i => {
        const days = Number(i.getValue());
        const color = days > 90 ? 'bg-red-100 text-red-700' : days > 60 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700';
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{days} days</span>;
      }
    },
    { accessorKey: 'utilization_pct', header: 'Credit Util %', cell: i => {
        const pct = Number(i.getValue());
        const width = Math.min(pct, 100);
        return <div className="w-full bg-gray-200 rounded h-2"><div style={{width: `${width}%`}} className={pct > 100 ? 'bg-red-600' : pct > 80 ? 'bg-amber-500' : 'bg-green-600'} /></div>;
      }
    },
    { accessorKey: 'territory', header: 'Territory', cell: i => <span className="text-xs">{String(i.getValue())}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Collections Intelligence" description="Invoice aging, credit risk, and payment tracking" />

      {data.insights.length > 0 && <InsightBanner insights={data.insights} />}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {agingData.map((aging) => (
          <KpiCard
            key={aging.name}
            title={aging.name + ' Days'}
            value={aging.value}
            format="number"
            change={0}
            icon={aging.name === '90+' ? AlertCircle : Clock}
            accentColor={aging.name === '90+' ? '#cc0c39' : aging.name === '61-90' ? '#FF9900' : '#146eb4'}
            subLabel={`₦${(aging.amount / 1000000).toFixed(1)}M`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Aging Distribution (₦)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#146eb4" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Weekly Collections Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.charts.weekly_collections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="collected" stroke="#067d62" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Overdue Invoices (At-Risk Customers)
        </h3>
        <DataTable columns={columns} data={data.records} isLoading={false} />
      </Card>

      {data.recommendations.length > 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="font-semibold text-lg mb-3 text-green-900">Recommendations</h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
