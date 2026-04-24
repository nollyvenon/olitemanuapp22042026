'use client';

import { PageHeader } from '@/components/shared/PageHeader';

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="Manage sales orders, invoices, and approvals"
      />
      <p className="text-muted-foreground">Select a sub-section from the navigation.</p>
    </div>
  );
}
