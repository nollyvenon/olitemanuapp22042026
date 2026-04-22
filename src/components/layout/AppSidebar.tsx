'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { usePermission } from '@/hooks/usePermission';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from './nav-config';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { can } = usePermission();

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-50 flex flex-col',
        'bg-[oklch(0.16_0_0)] text-[oklch(0.65_0_0)]',
        'border-r border-[oklch(0.22_0_0)]',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-14' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-[oklch(0.22_0_0)] shrink-0'
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[oklch(0.508_0.226_260)] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">OL</span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="font-bold text-white text-sm leading-tight truncate">
                Olite ERP
              </p>
              <p className="text-xs text-[oklch(0.65_0_0)] truncate">
                Manufacturing
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {visibleGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {group.label && !sidebarCollapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-[oklch(0.65_0_0)] uppercase tracking-wider">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    'hover:bg-[oklch(0.22_0_0)]',
                    isActive
                      ? 'bg-[oklch(0.508_0.226_260)] text-white'
                      : 'text-[oklch(0.65_0_0)] hover:text-white'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <Button
        onClick={toggleSidebar}
        variant="ghost"
        size="icon"
        className={cn(
          'h-10 mx-2 mb-4 rounded-lg',
          'text-[oklch(0.65_0_0)] hover:bg-[oklch(0.22_0_0)]',
          'hover:text-white transition-colors'
        )}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft
          className={cn('w-4 h-4 transition-transform', sidebarCollapsed && 'rotate-180')}
        />
      </Button>
    </aside>
  );
}
