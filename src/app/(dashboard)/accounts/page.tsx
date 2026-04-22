'use client';

import { PageHeader } from '@/components/shared/PageHeader';

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Manage debtors, creditors, vouchers, and price lists"
      />
      <p className="text-muted-foreground">Select a sub-section from the navigation.</p>
    </div>
  );
}
