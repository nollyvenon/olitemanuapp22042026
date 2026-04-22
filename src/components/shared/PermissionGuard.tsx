'use client';

import { usePermission } from '@/hooks/usePermission';
import { useAuthStore } from '@/store/auth.store';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showUnauthorized?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  permissions: multi,
  requireAll = false,
  fallback = null,
  showUnauthorized = false,
}: PermissionGuardProps) {
  const user = useAuthStore((s) => s.user);
  const { can, canAll, canAny } = usePermission();

  if (!user) return <>{fallback}</>;

  const required = permission ? [permission] : multi ?? [];
  if (required.length === 0) return <>{children}</>;

  const allowed = requireAll ? canAll(required) : canAny(required);

  if (!allowed) {
    return showUnauthorized ? (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive font-medium">
          You don't have permission to access this.
        </p>
      </div>
    ) : (
      <>{fallback}</>
    );
  }

  return <>{children}</>;
}
