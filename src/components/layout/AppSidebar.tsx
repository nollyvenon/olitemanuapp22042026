'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { usePermission } from '@/hooks/usePermission';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from './nav-config';

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
        'fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-14' : 'w-64'
      )}
      style={{ background: 'linear-gradient(180deg, #131921 0%, #1a2332 60%, #131921 100%)', borderRight: '1px solid #2d3748' }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 shrink-0" style={{ borderBottom: '1px solid #FF9900', background: '#0f1111' }}>
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: '#FF9900' }}>
            <span className="font-black text-sm" style={{ color: '#0f1111' }}>OL</span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight truncate" style={{ color: '#FF9900' }}>OLITE ERP</p>
              <p className="text-xs truncate" style={{ color: '#aab7c4' }}>Manufacturing</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleGroups.map((group, idx) => (
          <div key={idx} className="mb-2">
            {group.label && !sidebarCollapsed && (
              <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#637083' }}>
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn('flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all')}
                  style={isActive
                    ? { background: '#FF9900', color: '#0f1111' }
                    : { color: '#d5d9d9' }
                  }
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#37475a'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#d5d9d9'; } }}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-10 mx-2 mb-4 rounded transition-colors"
        style={{ color: '#637083' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#37475a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#637083'; }}
      >
        <ChevronLeft className={cn('w-4 h-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
      </button>
    </aside>
  );
}
