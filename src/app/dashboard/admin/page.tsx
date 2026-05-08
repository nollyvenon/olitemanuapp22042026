'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Users, Shield, MapPin, Lock, Settings, FileText } from 'lucide-react';

interface AdminCard {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const adminCards: AdminCard[] = [
  { href: '/dashboard/admin/users', title: 'Users', description: 'Manage user accounts and access', icon: <Users className="h-6 w-6" /> },
  { href: '/dashboard/admin/roles', title: 'Roles & Groups', description: 'Define roles and permission groups', icon: <Shield className="h-6 w-6" /> },
  { href: '/dashboard/admin/permissions', title: 'Permissions', description: 'Manage system permissions', icon: <Lock className="h-6 w-6" /> },
  { href: '/dashboard/admin/locations', title: 'Locations', description: 'Configure office locations', icon: <MapPin className="h-6 w-6" /> },
  { href: '/dashboard/admin/settings', title: 'Settings', description: 'System configuration', icon: <Settings className="h-6 w-6" /> },
  { href: '/dashboard/admin/audit', title: 'Audit Logs', description: 'View system audit trails', icon: <FileText className="h-6 w-6" /> },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Manage users, roles, groups, permissions, and system settings"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="p-6 border border-gray-200 rounded-lg hover:border-orange-400 hover:shadow-md transition-all cursor-pointer bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  {card.icon}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
