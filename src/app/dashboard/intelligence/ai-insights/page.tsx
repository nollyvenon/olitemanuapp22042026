'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { getApiClient } from '@/lib/api-client';
import { AlertCircle, TrendingUp, Zap, CheckCircle2, Clock, Brain } from 'lucide-react';

interface Insight {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  insight: string;
  data: Record<string, any>;
}

interface WeeklySummary {
  period: string;
  insights: Insight[];
  top_findings: Insight[];
  recommendations: string[];
}

interface InsightData {
  daily: Insight[];
  weekly: WeeklySummary;
  generated_at: string;
}

export default function AIInsights() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/insights');
        setData(data);
      } catch (error) {
        console.error('Failed to load insights', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) return <div className="p-4">Loading...</div>;

  const severityCounts = {
    critical: data.daily.filter(i => i.severity === 'critical').length,
    warning: data.daily.filter(i => i.severity === 'warning').length,
    info: data.daily.filter(i => i.severity === 'info').length,
  };

  const criticalInsights = data.daily.filter(i => i.severity === 'critical');
  const warningInsights = data.daily.filter(i => i.severity === 'warning');
  const infoInsights = data.daily.filter(i => i.severity === 'info');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <TrendingUp className="w-5 h-5 text-amber-600" />;
      default:
        return <Zap className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Insight Engine"
        description="Automated anomaly detection, trend analysis, and actionable intelligence across all modules"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{severityCounts.critical}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-300" />
          </div>
        </Card>

        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Warnings</p>
              <p className="text-3xl font-bold text-amber-900 mt-2">{severityCounts.warning}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-amber-300" />
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Info Insights</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{severityCounts.info}</p>
            </div>
            <Zap className="w-10 h-10 text-blue-300" />
          </div>
        </Card>
      </div>

      {criticalInsights.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-lg text-red-900">🚨 Critical Alerts</h3>
          </div>
          <div className="space-y-3">
            {criticalInsights.map((insight, i) => (
              <div key={i} className="p-4 bg-white rounded border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">{insight.insight}</p>
                    <p className="text-sm text-red-700 mt-1">{insight.type.replace(/_/g, ' ')}</p>
                    {Object.keys(insight.data).length > 0 && (
                      <div className="text-xs text-red-600 mt-2 space-y-1">
                        {Object.entries(insight.data).map(([k, v]) => (
                          <div key={k}>
                            <span className="font-medium">{k}:</span> {String(v)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {warningInsights.length > 0 && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-lg text-amber-900">⚠️ Warnings</h3>
          </div>
          <div className="space-y-3">
            {warningInsights.map((insight, i) => (
              <div key={i} className="p-4 bg-white rounded border border-amber-200">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900">{insight.insight}</p>
                    <p className="text-sm text-amber-700 mt-1">{insight.type.replace(/_/g, ' ')}</p>
                    {Object.keys(insight.data).length > 0 && (
                      <div className="text-xs text-amber-600 mt-2 space-y-1">
                        {Object.entries(insight.data).map(([k, v]) => (
                          <div key={k}>
                            <span className="font-medium">{k}:</span> {String(v)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {infoInsights.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-blue-900">💡 Insights</h3>
          </div>
          <div className="space-y-3">
            {infoInsights.map((insight, i) => (
              <div key={i} className="p-4 bg-white rounded border border-blue-200">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{insight.insight}</p>
                    <p className="text-sm text-blue-700 mt-1">{insight.type.replace(/_/g, ' ')}</p>
                    {Object.keys(insight.data).length > 0 && (
                      <div className="text-xs text-blue-600 mt-2 space-y-1">
                        {Object.entries(insight.data).map(([k, v]) => (
                          <div key={k}>
                            <span className="font-medium">{k}:</span> {String(v)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-purple-50 border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg text-purple-900">📊 {data.weekly.period}</h3>
        </div>

        <div className="space-y-4">
          {data.weekly.top_findings.length > 0 && (
            <div>
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Top Findings
              </h4>
              <div className="space-y-2">
                {data.weekly.top_findings.map((finding, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded border border-purple-200">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getSeverityBg(finding.severity)}`}>
                      {finding.severity.toUpperCase()}
                    </span>
                    <p className="text-sm text-purple-900 flex-1">{finding.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.weekly.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recommended Actions
              </h4>
              <div className="space-y-2">
                {data.weekly.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded border border-purple-200">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-900">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="text-xs text-gray-500 text-right">
        Generated at {new Date(data.generated_at).toLocaleString()}
      </div>
    </div>
  );
}
