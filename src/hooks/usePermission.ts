import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function usePermission() {
  const { hasPermission } = useAuthStore();

  const can = useCallback(
    (permission: string): boolean => {
      return hasPermission(permission);
    },
    [hasPermission]
  );

  const canAny = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some((p) => hasPermission(p));
    },
    [hasPermission]
  );

  const canAll = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every((p) => hasPermission(p));
    },
    [hasPermission]
  );

  return { can, canAny, canAll };
}
