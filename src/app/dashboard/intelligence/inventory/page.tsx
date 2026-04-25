'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { InsightBanner } from '@/components/intelligence/InsightBanner';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/data-table/DataTable';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, AlertCircle, DollarSign } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface InventoryData {
  kpis: { in_stock: number; low_stock: number; out_of_stock: number; total_value: number };
  records: any[];
  charts: { by_location: any[] };
  insights: any[];
  recommendations: string[];
}

export default function InventoryIntelligence() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/inventory');
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

  const healthData = [
    { name: 'In Stock', value: data.kpis.in_stock, fill: '#067d62' },
    { name: 'Low Stock', value: data.kpis.low_stock, fill: '#FF9900' },
    { name: 'Out of Stock', value: data.kpis.out_of_stock, fill: '#cc0c39' },
  ];

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'Item', cell: i => <span className="font-semibold">{String(i.getValue())}</span> },
    { accessorKey: 'sku', header: 'SKU', cell: i => <span className="font-mono text-xs text-gray-600">{String(i.getValue())}</span> },
    { accessorKey: 'current_stock', header: 'Stock', cell: i => <span>{Number(i.getValue()).toFixed(0)}</span> },
    { accessorKey: 'reorder_level', header: 'Reorder Lvl', cell: i => <span className="text-gray-600">{Number(i.getValue()).toFixed(0)}</span> },
    { accessorKey: 'daily_consumption', header: 'Daily Use', cell: i => <span>{Number(i.getValue()).toFixed(2)}</span> },
    { accessorKey: 'days_to_depletion', header: 'Days Left', cell: i => {
        const days = Number(i.getValue());
        if (days === null) return <span className="text-gray-400">—</span>;
        const color = days <= 7 ? 'bg-red-100 text-red-700' : days <= 14 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{Math.round(days)}d</span>;
      }
    },
    { accessorKey: 'stock_status', header: 'Status', cell: i => {
        const status = String(i.getValue());
        const color = status === 'out_of_stock' ? 'bg-red-100 text-red-700' : status === 'low_stock' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status.replace('_', ' ')}</span>;
      }
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Intelligence" description="Stock health, depletion forecasting, and location analytics" />

      {data.insights.length > 0 && <InsightBanner insights={data.insights} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="In Stock" value={data.kpis.in_stock} format="number" change={0} icon={Package} accentColor="#067d62" />
        <KpiCard title="Low Stock" value={data.kpis.low_stock} format="number" change={0} icon={AlertTriangle} accentColor="#FF9900" />
        <KpiCard title="Out of Stock" value={data.kpis.out_of_stock} format="number" change={0} icon={AlertCircle} accentColor="#cc0c39" />
        <KpiCard title="Total Value" value={data.kpis.total_value} format="currency" change={0} icon={DollarSign} accentColor="#146eb4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Stock Health Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={healthData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                {healthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Stock Value by Depot</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.by_location} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="depot" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#146eb4" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-amber-600" />
          Items by Urgency (Days to Depletion)
        </h3>
        <DataTable columns={columns} data={data.records} isLoading={false} />
      </Card>

      {data.recommendations.length > 0 && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-lg mb-3 text-amber-900">Recommendations</h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
