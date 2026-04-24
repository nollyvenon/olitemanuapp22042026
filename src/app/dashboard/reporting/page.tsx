'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function ReportingPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-2">Inventory Report</h2>
          <p className="text-gray-600 mb-4">Opening, inwards, outwards, closing balances</p>
          <Link href="/dashboard/reporting/inventory"><Button className="w-full">View</Button></Link>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-2">Stock Movements</h2>
          <p className="text-gray-600 mb-4">Detailed transaction history</p>
          <Link href="/dashboard/reporting/movements"><Button className="w-full">View</Button></Link>
        </Card>
      </div>
    </div>
  );
}
