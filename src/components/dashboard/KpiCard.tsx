'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'currency' | 'compact';
  change: number;
  changeSuffix?: string;
  icon: LucideIcon;
  accentColor: string;
  href?: string;
  isLoading?: boolean;
  subLabel?: string;
}

function formatValue(value: number, format: KpiCardProps['format'] = 'number', prefix = '', suffix = '') {
  let formatted: string;
  if (format === 'currency') {
    formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  } else if (format === 'compact') {
    formatted = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
    formatted = prefix + formatted + suffix;
  } else {
    formatted = prefix + new Intl.NumberFormat('en-US').format(value) + suffix;
  }
  return formatted;
}

function useCountUp(target: number, duration = 900) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const start = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = Math.round(eased * target);
      if (ref.current) ref.current.textContent = new Intl.NumberFormat('en-US').format(current);
      if (p < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);
  return ref;
}

export function KpiCard({
  title, value, prefix = '', suffix = '', format = 'number',
  change, changeSuffix = '%', icon: Icon, accentColor, href,
  isLoading, subLabel,
}: KpiCardProps) {
  const router = useRouter();
  const countRef = useCountUp(value);
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const trendColor = isNeutral ? '#767676' : isPositive ? '#067d62' : '#cc0c39';
  const trendBg   = isNeutral ? '#f4f6f8'  : isPositive ? '#e8f8f5'  : '#fdecea';
  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-5 animate-pulse" style={{ border: '1px solid #d5d9d9', borderTop: `3px solid ${accentColor}` }}>
        <div className="h-4 w-1/2 rounded bg-[#eaeded] mb-4" />
        <div className="h-8 w-3/4 rounded bg-[#eaeded] mb-3" />
        <div className="h-3 w-1/3 rounded bg-[#eaeded]" />
      </div>
    );
  }

  const handleClick = () => { if (href) router.push(href); };

  return (
    <div
      onClick={handleClick}
      role={href ? 'button' : undefined}
      tabIndex={href ? 0 : undefined}
      onKeyDown={(e) => { if (href && (e.key === 'Enter' || e.key === ' ')) handleClick(); }}
      className={cn(
        'bg-white rounded-lg p-5 flex flex-col gap-4 transition-all duration-200',
        href && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]'
      )}
      style={{ border: '1px solid #d5d9d9', borderTop: `3px solid ${accentColor}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium leading-tight" style={{ color: '#555555' }}>{title}</p>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: accentColor + '18' }}>
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
      </div>

      {/* Value */}
      <div>
        {format === 'currency' ? (
          <p className="text-3xl font-bold tabular-nums leading-none" style={{ color: '#0f1111' }}>
            {formatValue(value, format, prefix, suffix)}
          </p>
        ) : (
          <p className="text-3xl font-bold tabular-nums leading-none" style={{ color: '#0f1111' }}>
            {prefix}<span ref={countRef}>0</span>{suffix}
          </p>
        )}
        {subLabel && <p className="text-xs mt-1" style={{ color: '#767676' }}>{subLabel}</p>}
      </div>

      {/* Trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold" style={{ background: trendBg, color: trendColor }}>
          <TrendIcon className="w-3 h-3" />
          <span>{isPositive ? '+' : ''}{change}{changeSuffix}</span>
        </div>
        {href && (
          <span className="text-xs font-medium transition-colors hover:text-[#FF9900]" style={{ color: '#146eb4' }}>
            View details →
          </span>
        )}
      </div>
    </div>
  );
}
