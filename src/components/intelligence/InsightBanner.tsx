'use client';

import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface Insight {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  action?: string;
  actionHref?: string;
}

export function InsightBanner({ insights }: { insights: Insight[] }) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const severityConfig = {
    critical: { bg: 'bg-red-50 border-red-200', icon: AlertCircle, textColor: 'text-red-800', iconColor: 'text-red-600' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, textColor: 'text-amber-800', iconColor: 'text-amber-600' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: Info, textColor: 'text-blue-800', iconColor: 'text-blue-600' },
  };

  const visible = insights.filter((_, i) => !dismissed.has(i));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((insight, idx) => {
        const config = severityConfig[insight.severity];
        const Icon = config.icon;
        return (
          <div key={idx} className={`flex items-start gap-3 p-4 rounded-lg border ${config.bg}`}>
            <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${config.textColor}`}>{insight.message}</p>
              {insight.action && <p className={`text-xs mt-1 ${config.textColor}`}>{insight.action}</p>}
            </div>
            <button onClick={() => setDismissed(new Set(dismissed).add(idx))} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
