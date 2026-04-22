'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

function useAnimatedCounter(target: number, duration: number = 800) {
  const nodeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!nodeRef.current) return;
    const start = performance.now();
    const from = 0;
    let frameId: number;

    const update = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      if (nodeRef.current) nodeRef.current.textContent = current.toLocaleString();
      if (progress < 1) frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [target, duration]);

  return nodeRef;
}

export function KpiCard({
  title,
  value,
  prefix,
  suffix,
  change,
  icon: Icon,
  iconColor = 'text-primary',
  isLoading,
  onClick,
}: KpiCardProps) {
  const counterRef = useAnimatedCounter(value);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-muted rounded w-1/2 mb-3" />
          <div className="h-8 bg-muted rounded w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      className={cn('transition-shadow', onClick && 'cursor-pointer hover:shadow-md')}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('p-2 rounded-lg bg-muted', iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">
          {prefix}
          <span ref={counterRef}>0</span>
          {suffix}
        </div>
        {change !== undefined && (
          <p
            className={cn(
              'text-xs mt-1 font-medium',
              change >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {change >= 0 ? '+' : ''}
            {change}% vs last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
