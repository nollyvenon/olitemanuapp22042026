'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { getApiClient } from '@/lib/api-client';
import { useAiDashboard } from '@/hooks/useAiDashboard';
import { TrendingUp, AlertCircle, Brain, Clock } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AiDashboard() {
  const { insights, alerts, forecast, kpis, lastUpdated, isLoading, refetch } = useAiDashboard();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const api = getApiClient();

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await api.get('/audit-logs?limit=10');
        setAuditLogs(res.data.data || []);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      }
    };
    loadLogs();
  }, [api]);

  const criticalInsights = insights.filter((i: any) => i.impact === 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Dashboard"
        description="Real-time insights, predictions, and alerts powered by AI"
        actions={
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Loading...'}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Revenue Today" value={kpis?.revenue_today || 0} format="currency" change={0} accentColor="#FF9900" icon={TrendingUp} />
        <KpiCard title="Orders Today" value={kpis?.orders_today || 0} format="number" change={0} accentColor="#067d62" icon={TrendingUp} />
        <KpiCard title="Low Stock Items" value={kpis?.low_stock_items || 0} format="number" change={0} accentColor="#cc0c39" icon={AlertCircle} />
        <KpiCard title="Overdue Invoices" value={kpis?.overdue_invoices || 0} format="number" change={0} accentColor="#c45500" icon={AlertCircle} />
      </div>

      {/* Critical Alerts */}
      {criticalInsights.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <h3 className="font-bold text-red-900 mb-3">🚨 Critical Insights</h3>
          <div className="space-y-2">
            {criticalInsights.slice(0, 3).map((insight: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-red-100">
                <p className="font-semibold text-red-900 text-sm">{insight.insight}</p>
                <p className="text-xs text-red-700 mt-1">Risk: {insight.risk}</p>
                <p className="text-xs text-red-600 mt-1">Action: {insight.action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Insights Grid */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Insights & Recommendations
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {insights.slice(0, 6).map((insight: any, i: number) => (
            <div key={i} className={`p-4 rounded border-l-4 ${
              insight.impact === 3 ? 'border-red-500 bg-red-50' :
              insight.impact === 2 ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <p className="font-semibold text-sm">{insight.insight}</p>
              <p className="text-xs text-gray-600 mt-2">💡 {insight.action}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Forecast Chart */}
      {forecast?.sales?.forecast_7d && (
        <Card className="p-6">
          <h3 className="font-bold mb-4">7-Day Sales Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={[...(forecast.sales.historical || []), ...(forecast.sales.forecast_7d || [])]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="actual" fill="#FF9900" name="Actual Revenue" />
              <Line type="monotone" dataKey="forecast" stroke="#cc0c39" strokeDasharray="5 5" name="Forecast" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold mb-4">Active Alerts</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {alerts.map((alert: any, i: number) => (
              <div key={i} className="p-3 border rounded flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                  alert.severity === 'critical' ? 'bg-red-200 text-red-700' :
                  alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-700' :
                  'bg-blue-200 text-blue-700'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Activity Feed */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Recent Activity</h3>
        <div className="space-y-2 max-h-48 overflow-auto">
          {auditLogs.map((log: any, i: number) => (
            <div key={i} className="text-xs p-2 border-b pb-2">
              <p className="font-semibold">{log.user_name || 'System'} — {log.action_type}</p>
              <p className="text-gray-600">{log.entity_type} {log.entity_id}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
