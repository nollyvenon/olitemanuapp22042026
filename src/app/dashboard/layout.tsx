'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const hasPermission = (requiredPerm?: string) => {
    if (!requiredPerm) return true;
    return user.permissions?.some(p => {
      const pNs = p.endsWith('.*') ? p.slice(0, -2) : p;
      const rNs = requiredPerm.endsWith('.*') ? requiredPerm.slice(0, -2) : requiredPerm;
      return pNs === rNs || pNs.startsWith(rNs) || rNs.startsWith(pNs);
    }) ?? false;
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', permission: null },
    { label: 'Sales Orders', href: '/dashboard/sales', icon: '📈', permission: 'sales.' },
    { label: 'Inventory', href: '/dashboard/inventory', icon: '📦', permission: 'inventory.' },
    { label: 'Accounts', href: '/dashboard/accounts', icon: '💰', permission: 'accounts.' },
    { label: 'Reports', href: '/dashboard/reports', icon: '📋', permission: 'reports.' },
    { label: 'Users', href: '/dashboard/users', icon: '👥', permission: 'admin.' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">OMCLTA</h1>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            if (!hasPermission(item.permission)) return null;

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 w-56">
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
