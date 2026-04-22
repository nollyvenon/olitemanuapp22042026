'use client';

import { PageHeader } from '@/components/shared/PageHeader';

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="View system activity and user actions"
      />
      <p className="text-muted-foreground">Loading audit logs...</p>
    </div>
  );
}
