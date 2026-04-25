'use client';

import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { useRouter } from 'next/navigation';
import { TrendingUp, DollarSign, Package, Users } from 'lucide-react';

const reports = [
  {
    title: 'Sales Intelligence',
    description: 'Pipeline funnel, stalled orders, revenue trends, and conversion analysis',
    icon: TrendingUp,
    href: '/dashboard/intelligence/sales',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    title: 'Collections Intelligence',
    description: 'Invoice aging, credit risk assessment, and overdue account tracking',
    icon: DollarSign,
    href: '/dashboard/intelligence/collections',
    color: 'bg-green-50 text-green-600 border-green-200',
  },
  {
    title: 'Inventory Intelligence',
    description: 'Stock health, days-to-depletion predictions, and location analytics',
    icon: Package,
    href: '/dashboard/intelligence/inventory',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    title: 'Performance Intelligence',
    description: 'Sales rep rankings, conversion rates, and depot benchmarking',
    icon: Users,
    href: '/dashboard/intelligence/performance',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
];

export default function IntelligencePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intelligence Reporting"
        description="Smart, actionable analytics with auto-detected problems and recommendations"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card
              key={report.href}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-gray-200 hover:border-l-orange-500"
              onClick={() => router.push(report.href)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{report.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
