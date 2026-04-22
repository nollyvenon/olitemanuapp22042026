'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

interface AuthGuardProps {
  children: ReactNode;
  requiredPermissions?: string[];
}

export function AuthGuard({ children, requiredPermissions }: AuthGuardProps) {
  const router = useRouter();
  const { user, accessToken, hasPermission } = useAuthStore();

  useEffect(() => {
    if (!accessToken || !user) {
      router.push('/auth/login');
      return;
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAll = requiredPermissions.every((perm) => hasPermission(perm));
      if (!hasAll) {
        router.push('/dashboard/unauthorized');
      }
    }
  }, [accessToken, user, requiredPermissions, router, hasPermission]);

  if (!accessToken || !user) {
    return null;
  }

  if (requiredPermissions) {
    const hasAll = requiredPermissions.every((perm) => hasPermission(perm));
    if (!hasAll) {
      return null;
    }
  }

  return <>{children}</>;
}
