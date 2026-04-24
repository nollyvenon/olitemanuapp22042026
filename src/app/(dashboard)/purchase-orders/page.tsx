'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PurchaseOrdersPage() {

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <Button>Create PO</Button>
      </div>

      <div className="space-y-3">
        <Card className="p-6 text-center text-gray-600">
          <p>No purchase orders yet</p>
          <p className="text-sm">Start by creating a new purchase order</p>
        </Card>
      </div>
    </div>
  );
}
