'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DataTable } from '@/components/data-table/DataTable';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, DollarSign, TrendingDown, Clock } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface AccountsData {
  receivables: any[];
  payables: any[];
  aging_analysis: any[];
  overdue_customers: any[];
  risky_accounts: any[];
  risk_scores: any[];
  cash_forecast: any;
  follow_ups: any[];
  credit_recommendations: any[];
}

export default function AccountsRisk() {
  const [data, setData] = useState<AccountsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/accounts-risk');
        setData(data);
      } catch (error) {
        console.error('Failed to load accounts risk', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const aging = data.aging_analysis[0] || {};
  const forecast = data.cash_forecast || {};

  const receiveColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Customer', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'outstanding', header: 'Outstanding (₦)', cell: ({ getValue }) => <span className="font-bold text-red-600">{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
    { accessorKey: 'overdue_30', header: '30+ Days', cell: ({ getValue }) => <span className="text-amber-600">{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
    { accessorKey: 'overdue_90', header: '90+ Days', cell: ({ getValue }) => <span className="text-red-600 font-bold">{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
  ];

  const riskColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Account', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'score', header: 'Risk Score', cell: ({ getValue, row }) => <span className={`font-bold px-2 py-1 rounded ${row.original.risk_level === 'high' ? 'bg-red-100 text-red-700' : row.original.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{Math.round(Number(getValue()))}</span> },
    { accessorKey: 'risk_level', header: 'Level', cell: ({ getValue }) => <span className="font-bold">{String(getValue()).toUpperCase()}</span> },
    { accessorKey: 'payment_rate', header: 'Pay Rate %', cell: ({ getValue }) => <span>{Number(getValue()).toFixed(1)}%</span> },
  ];

  const followUpColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Customer', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'days_overdue', header: 'Days Overdue', cell: ({ getValue, row }) => <span className={`font-bold ${row.original.urgency === 'urgent' ? 'text-red-600' : 'text-amber-600'}`}>{getValue()}</span> },
    { accessorKey: 'amount_due', header: 'Amount Due (₦)', cell: ({ getValue }) => <span className="font-bold">{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
    { accessorKey: 'action', header: 'Action', cell: ({ getValue }) => <span className="text-sm font-semibold text-blue-600">{String(getValue())}</span> },
  ];

  const creditColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Customer', cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'current_limit', header: 'Current Limit', cell: ({ getValue }) => <span>₦{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
    { accessorKey: 'recommended_limit', header: 'Recommended', cell: ({ getValue }) => <span className="font-bold text-blue-600">₦{Number(getValue()).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span> },
    { accessorKey: 'reason', header: 'Reason', cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts Risk Report"
        description="Receivables, payables, aging analysis with risk scoring and cash flow forecasting"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Outstanding"
          value={Number(aging.total_outstanding || 0)}
          format="currency"
          change={0}
          icon={DollarSign}
          accentColor="#cc0c39"
        />
        <KpiCard
          title="90+ Days Overdue"
          value={Number(aging.d90plus || 0)}
          format="currency"
          change={0}
          icon={AlertTriangle}
          accentColor="#FF9900"
        />
        <KpiCard
          title="Net Cash (30d)"
          value={Number(forecast.net_cash_30d || 0)}
          format="currency"
          change={0}
          icon={TrendingDown}
          accentColor={Number(forecast.net_cash_30d || 0) >= 0 ? '#067d62' : '#cc0c39'}
        />
        <KpiCard
          title="Critical Follow-ups"
          value={data.follow_ups.filter((f: any) => f.urgency === 'urgent').length}
          format="number"
          change={0}
          icon={Clock}
          accentColor="#cc0c39"
        />
      </div>

      {data.overdue_customers.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-300">
          <h3 className="font-semibold text-lg text-red-900 mb-3">🚨 Overdue Customers (Top 5)</h3>
          <div className="space-y-2">
            {data.overdue_customers.slice(0, 5).map((c: any, i: number) => (
              <div key={i} className="flex justify-between p-2 bg-white rounded border border-red-200">
                <div className="text-sm">
                  <p className="font-medium text-red-900">{c.name}</p>
                  <p className="text-xs text-red-700">{c.days_overdue} days overdue</p>
                </div>
                <span className="font-bold text-red-600">₦{Number(c.amount_due).toLocaleString('en-NG', {maximumFractionDigits: 0})}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Receivables Aging</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[aging]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#067d62" name="Current" />
              <Bar dataKey="d30" fill="#febd69" name="1-30d" />
              <Bar dataKey="d60" fill="#FF9900" name="31-60d" />
              <Bar dataKey="d90" fill="#c45500" name="61-90d" />
              <Bar dataKey="d90plus" fill="#cc0c39" name="90+d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Cash Flow Forecast (30d)</h3>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-700">Expected Inflow</p>
              <p className="text-2xl font-bold text-green-600">₦{Number(forecast.inflow_30d).toLocaleString('en-NG', {maximumFractionDigits: 0})}</p>
            </div>
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <p className="text-sm text-red-700">Expected Outflow</p>
              <p className="text-2xl font-bold text-red-600">₦{Number(forecast.outflow_30d).toLocaleString('en-NG', {maximumFractionDigits: 0})}</p>
            </div>
            <div className={`p-3 rounded border ${Number(forecast.net_cash_30d || 0) >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className={`text-sm ${Number(forecast.net_cash_30d || 0) >= 0 ? 'text-blue-700' : 'text-yellow-700'}`}>Net Position</p>
              <p className={`text-2xl font-bold ${Number(forecast.net_cash_30d || 0) >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>₦{Number(forecast.net_cash_30d).toLocaleString('en-NG', {maximumFractionDigits: 0})}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Receivables Summary</h3>
        <DataTable columns={receiveColumns} data={data.receivables.slice(0, 15)} />
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Customer Risk Scores</h3>
        <DataTable columns={riskColumns} data={data.risk_scores} />
      </Card>

      {data.risky_accounts.length > 0 && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-lg text-amber-900 mb-3">⚠ High-Risk Accounts</h3>
          <div className="space-y-2">
            {data.risky_accounts.map((a: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-amber-200">
                <p className="font-medium text-amber-900">{a.name}</p>
                <p className="text-xs text-amber-700 mt-1">Risk: {a.risk_flags}</p>
                <p className="text-sm font-semibold text-amber-600 mt-1">₦{Number(a.outstanding).toLocaleString('en-NG', {maximumFractionDigits: 0})}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.follow_ups.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Follow-up Actions</h3>
          <DataTable columns={followUpColumns} data={data.follow_ups} />
        </Card>
      )}

      {data.credit_recommendations.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-lg text-blue-900 mb-4">💳 Credit Limit Adjustments</h3>
          <DataTable columns={creditColumns} data={data.credit_recommendations} />
        </Card>
      )}
    </div>
  );
}
