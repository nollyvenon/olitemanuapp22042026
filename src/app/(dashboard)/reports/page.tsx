'use client';

import { PageHeader } from '@/components/shared/PageHeader';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View inventory, movement, and aging reports"
      />
      <p className="text-muted-foreground">Select a sub-section from the navigation.</p>
    </div>
  );
}
