'use client';

import { useMemo } from 'react';
import { usePermission } from '@/hooks/usePermission';

export function useVoucherTxnDate(backdatePerm: string) {
  const { can } = usePermission();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const allowPast = can(backdatePerm);
  return { today, allowPast };
}
