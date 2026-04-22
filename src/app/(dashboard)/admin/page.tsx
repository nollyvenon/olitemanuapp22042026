'use client';

import { PageHeader } from '@/components/shared/PageHeader';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Manage users, roles, groups, and system settings"
      />
      <p className="text-muted-foreground">Select a sub-section from the navigation.</p>
    </div>
  );
}
