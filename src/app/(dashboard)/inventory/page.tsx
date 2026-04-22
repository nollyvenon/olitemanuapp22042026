'use client';

import { PageHeader } from '@/components/shared/PageHeader';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage inventory, items, categories, and stock movements"
      />
      <p className="text-muted-foreground">Select a sub-section from the navigation.</p>
    </div>
  );
}
