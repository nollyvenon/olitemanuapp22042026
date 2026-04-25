'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, XCircle, Clock, X, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface Alert {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action: string;
  priority: number;
}

export function AlertsSection() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/analytics/alerts');
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error('Failed to load alerts', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visible = alerts.filter(a => !dismissed.has(`${a.type}-${a.title}`));
  const criticalCount = visible.filter(a => a.severity === 'critical').length;

  if (loading) return null;

  const bgColor = (sev: string) => sev === 'critical' ? '#fff5f5' : sev === 'warning' ? '#fffbf0' : '#f0f7ff';
  const borderColor = (sev: string) => sev === 'critical' ? '#cc0c39' : sev === 'warning' ? '#c45500' : '#146eb4';
  const iconColor = (sev: string) => sev === 'critical' ? '#cc0c39' : sev === 'warning' ? '#c45500' : '#146eb4';
  const Icon = (sev: string) => sev === 'critical' ? AlertCircle : sev === 'warning' ? AlertTriangle : Info;

  return (
    <section>
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #d5d9d9' }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#232f3e' }}>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm" style={{ color: '#FF9900' }}>Proactive Alerts</span>
            {criticalCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#cc0c39', color: '#fff' }}>
                {criticalCount} critical
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-2">
          {visible.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: '#767676' }}>All systems healthy</div>
          ) : (
            visible.map((alert, i) => {
              const IconComp = Icon(alert.severity);
              const color = borderColor(alert.severity);
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg px-4 py-3 transition-all"
                  style={{ background: bgColor(alert.severity), border: `1px solid ${color}30`, borderLeft: `3px solid ${color}` }}
                >
                  <IconComp className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(alert.action)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold" style={{ color }}>{alert.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: color + '18', color }}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#555555' }}>{alert.message}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => router.push(alert.action)} className="p-1 rounded hover:bg-black/5" title="View">
                      <ChevronRight className="w-3.5 h-3.5" style={{ color }} />
                    </button>
                    <button onClick={() => setDismissed(new Set([...dismissed, `${alert.type}-${alert.title}`]))} className="p-1 rounded hover:bg-black/5" title="Dismiss">
                      <X className="w-3.5 h-3.5" style={{ color: '#aab7c4' }} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
