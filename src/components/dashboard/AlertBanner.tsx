import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Alert {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action: string;
  priority: number;
}

export function AlertBanner() {
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
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const visibleAlerts = alerts.filter(a => !dismissed.has(`${a.type}-${a.title}`));

  if (loading || visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleAlerts.slice(0, 3).map((alert, i) => {
        const bgColor = alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                       alert.severity === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';
        const iconColor = alert.severity === 'critical' ? 'text-red-600' :
                         alert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600';
        const Icon = alert.severity === 'critical' ? AlertCircle : alert.severity === 'warning' ? AlertTriangle : Info;

        return (
          <div key={i} className={`p-4 border rounded-lg ${bgColor} flex items-start justify-between gap-3`}>
            <div className="flex items-start gap-3 flex-1">
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1">
                <p className="font-semibold text-sm">{alert.title}</p>
                <p className="text-xs mt-1 opacity-75">{alert.message}</p>
                <a href={alert.action} className="text-xs font-medium mt-2 inline-block hover:underline">
                  Take action →
                </a>
              </div>
            </div>
            <button
              onClick={() => setDismissed(new Set([...dismissed, `${alert.type}-${alert.title}`]))}
              className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
