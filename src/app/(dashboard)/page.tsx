'use client';

import {
  ShoppingCart,
  Package,
  Users,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to Olite Manufacturing ERP"
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Sales Orders"
          value={1243}
          icon={ShoppingCart}
          change={12}
          iconColor="text-blue-500"
        />
        <KpiCard
          title="Stock Items"
          value={856}
          icon={Package}
          change={-2}
          iconColor="text-amber-500"
        />
        <KpiCard
          title="Active Debtors"
          value={342}
          icon={Users}
          change={8}
          iconColor="text-purple-500"
        />
        <KpiCard
          title="KYC Pending"
          value={47}
          icon={UserCheck}
          change={-5}
          iconColor="text-green-500"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">API Connection</span>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Queue Service</span>
                <span className="text-sm font-medium text-green-600">Running</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="/dashboard/sales/orders" className="block text-sm text-primary hover:underline">
                → Create Sales Order
              </a>
              <a href="/dashboard/inventory/items" className="block text-sm text-primary hover:underline">
                → View Inventory
              </a>
              <a href="/dashboard/kyc/applications" className="block text-sm text-primary hover:underline">
                → Review KYC Applications
              </a>
              <a href="/dashboard/accounts/debtors" className="block text-sm text-primary hover:underline">
                → View Debtors
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
