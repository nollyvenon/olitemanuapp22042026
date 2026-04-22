'use client';

import { PageHeader } from '@/components/shared/PageHeader';

export default function KycPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="KYC"
        description="Manage KYC applications and approvals"
      />
      <p className="text-muted-foreground">Select a sub-section from the navigation.</p>
    </div>
  );
}
