'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { AlertCircle, TrendingUp, Package, DollarSign, Users, Zap } from 'lucide-react';

interface UnifiedData {
  metadata: any;
  executive: any;
  revenue: any;
  inventory: any;
  accounts: any;
  sales: any;
  insights: any;
  alerts: any[];
  forecast: any;
  audit: any;
  correlations?: any[];
}

export default function UnifiedIntelligence() {
  const [data, setData] = useState<UnifiedData | null>(null);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const [unified, corr] = await Promise.all([
          api.get('/analytics/unified'),
          api.get('/analytics/correlations')
        ]);
        setData(unified.data);
        setCorrelations(corr.data.correlations || []);
      } catch (error) {
        console.error('Failed to load unified intelligence', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const exec = data.executive?.kpis || {};
  const rev = data.revenue || {};
  const inv = data.inventory || {};
  const acc = data.accounts || {};
  const sal = data.sales || {};
  const alerts = data.alerts || [];
  const forc = data.forecast || {};
  const auditSummary = data.audit?.summary?.[0] || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Intelligence Layer"
        description="Single source of truth: Executive + Revenue + Inventory + Accounts + Sales + Insights + Alerts + Forecasts + Audit"
      />

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <Card className="p-3 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Revenue (30d)</p>
          <p className="text-lg font-bold text-blue-900">₦{((exec.rev_current || 0) / 1000000).toFixed(1)}M</p>
        </Card>
        <Card className="p-3 bg-green-50 border-green-200">
          <p className="text-xs text-green-600 font-semibold">Pipeline</p>
          <p className="text-lg font-bold text-green-900">₦{((exec.pipeline_value || 0) / 1000000).toFixed(1)}M</p>
        </Card>
        <Card className="p-3 bg-amber-50 border-amber-200">
          <p className="text-xs text-amber-600 font-semibold">Outstanding AR</p>
          <p className="text-lg font-bold text-amber-900">₦{((exec.total_outstanding || 0) / 1000000).toFixed(1)}M</p>
        </Card>
        <Card className="p-3 bg-purple-50 border-purple-200">
          <p className="text-xs text-purple-600 font-semibold">Stock Value</p>
          <p className="text-lg font-bold text-purple-900">₦{((exec.stock_value || 0) / 1000000).toFixed(1)}M</p>
        </Card>
        <Card className="p-3 bg-red-50 border-red-200">
          <p className="text-xs text-red-600 font-semibold">Alerts</p>
          <p className="text-lg font-bold text-red-900">{alerts.length}</p>
        </Card>
        <Card className="p-3 bg-cyan-50 border-cyan-200">
          <p className="text-xs text-cyan-600 font-semibold">Audit Logs (24h)</p>
          <p className="text-lg font-bold text-cyan-900">{auditSummary.logs_24h || 0}</p>
        </Card>
      </div>

      {correlations.length > 0 && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-lg text-orange-900">Cross-Module Insights</h3>
          </div>
          <div className="space-y-2">
            {correlations.map((corr: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded border border-orange-200 flex justify-between">
                <div>
                  <p className="font-semibold text-orange-900 text-sm">{corr.type}</p>
                  <p className="text-xs text-orange-700">{corr.insight}</p>
                  <p className="text-xs text-gray-500 mt-1">Modules: {corr.modules.join(', ')}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${corr.severity === 'critical' ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'}`}>{corr.severity.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-lg text-blue-900 mb-4">Executive Dashboard</h3>
          <div className="space-y-2 text-sm">
            <p className="text-blue-700"><span className="font-semibold">Revenue Change:</span> {(exec.rev_change_pct || 0).toFixed(1)}%</p>
            <p className="text-blue-700"><span className="font-semibold">Pipeline Count:</span> {exec.pipeline_count || 0}</p>
            <p className="text-blue-700"><span className="font-semibold">Low Stock Items:</span> {exec.low_stock || 0}</p>
            <p className="text-blue-700"><span className="font-semibold">Forecast (30d):</span> ₦{((exec.forecast_30d || 0) / 1000000).toFixed(1)}M</p>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="font-semibold text-lg text-green-900 mb-4">Revenue Intelligence</h3>
          <div className="space-y-2 text-sm">
            <p className="text-green-700"><span className="font-semibold">Top Product:</span> {rev.top_products?.[0]?.name || 'N/A'}</p>
            <p className="text-green-700"><span className="font-semibold">Avg Margin:</span> {(rev.margins?.[0]?.margin_percent || 0).toFixed(1)}%</p>
            <p className="text-green-700"><span className="font-semibold">Dead Stock:</span> {rev.dead_stock?.length || 0} items</p>
            <p className="text-green-700"><span className="font-semibold">Growth (7d):</span> {(rev.growth_7d || 0).toFixed(1)}%</p>
          </div>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="font-semibold text-lg text-purple-900 mb-4">Inventory Intelligence</h3>
          <div className="space-y-2 text-sm">
            <p className="text-purple-700"><span className="font-semibold">Out of Stock:</span> {inv.out_of_stock || 0}</p>
            <p className="text-purple-700"><span className="font-semibold">Fast Moving:</span> {inv.fast_moving?.length || 0} items</p>
            <p className="text-purple-700"><span className="font-semibold">Avg Turnover:</span> {(inv.avg_turnover || 0).toFixed(1)}x</p>
            <p className="text-purple-700"><span className="font-semibold">Stockout Risk:</span> {forc.inventory?.stockout_risk?.length || 0}</p>
          </div>
        </Card>

        <Card className="p-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-lg text-amber-900 mb-4">Accounts Risk</h3>
          <div className="space-y-2 text-sm">
            <p className="text-amber-700"><span className="font-semibold">90+ Days Overdue:</span> {acc.aging_analysis?.[0]?.d90plus ? '₦' + (acc.aging_analysis[0].d90plus / 1000000).toFixed(1) + 'M' : '₦0M'}</p>
            <p className="text-amber-700"><span className="font-semibold">High Risk Accounts:</span> {acc.risky_accounts?.length || 0}</p>
            <p className="text-amber-700"><span className="font-semibold">Net Cash (30d):</span> ₦{((forc.cashflow?.net_position_30d?.[0]?.net_position || 0) / 1000000).toFixed(1)}M</p>
            <p className="text-amber-700"><span className="font-semibold">Follow-ups:</span> {acc.follow_ups?.length || 0}</p>
          </div>
        </Card>

        <Card className="p-6 bg-indigo-50 border-indigo-200">
          <h3 className="font-semibold text-lg text-indigo-900 mb-4">Sales Performance</h3>
          <div className="space-y-2 text-sm">
            <p className="text-indigo-700"><span className="font-semibold">Top Officer Revenue:</span> ₦{((sal.performance_metrics?.[0]?.authorized_revenue || 0) / 1000000).toFixed(1)}M</p>
            <p className="text-indigo-700"><span className="font-semibold">Avg Success Rate:</span> {((sal.success_rates?.reduce((s: number, r: any) => s + (r.success_rate || 0), 0) || 0) / (sal.success_rates?.length || 1)).toFixed(1)}%</p>
            <p className="text-indigo-700"><span className="font-semibold">Top Performers:</span> {sal.top_performers?.length || 0}</p>
            <p className="text-indigo-700"><span className="font-semibold">Underperformers:</span> {sal.underperformers?.length || 0}</p>
          </div>
        </Card>

        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="font-semibold text-lg text-red-900 mb-4">AI Insights & Alerts</h3>
          <div className="space-y-2 text-sm">
            <p className="text-red-700"><span className="font-semibold">Critical Alerts:</span> {alerts.filter((a: any) => a.severity === 'critical').length}</p>
            <p className="text-red-700"><span className="font-semibold">Daily Anomalies:</span> {data.insights?.daily?.length || 0}</p>
            <p className="text-red-700"><span className="font-semibold">Suspicious Activities:</span> {data.audit?.suspicious?.length || 0}</p>
            <p className="text-red-700"><span className="font-semibold">Overrides (24h):</span> {auditSummary.overrides_24h || 0}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
