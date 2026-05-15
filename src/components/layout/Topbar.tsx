'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { LogOut, Menu, Bell, User, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { getApiClient } from '@/lib/api-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Topbar() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { toggleSidebar, theme, setTheme } = useUIStore();
  const { notifications, unreadCount, setNotifications, setUnreadCount, markAsRead } = useNotificationsStore();
  const desktopNotifyRef = useRef(new Set<string>());

  const handleLogout = () => { logout(); router.push('/login'); };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const pull = async () => {
      try {
        const api = getApiClient();
        const { data } = await api.get('/notifications');
        const list = Array.isArray(data) ? data : (data.data ?? []);
        const mapped = (Array.isArray(list) ? list : []).map((n: Record<string, unknown>) => ({
          id: String(n.id ?? ''),
          type: String(n.type ?? 'info'),
          message: String(n.message ?? n.body ?? n.title ?? ''),
          data: typeof n.data === 'object' && n.data !== null ? (n.data as Record<string, unknown>) : {},
          read_at: (n.read_at as string | null) ?? null,
          created_at: String(n.created_at ?? n.createdAt ?? new Date().toISOString()),
        }));
        setNotifications(mapped);
        setUnreadCount(mapped.filter((x) => !x.read_at).length);
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    pull();
    const t = setInterval(pull, 60000);
    return () => clearInterval(t);
  }, [isAuthenticated, user, setNotifications, setUnreadCount]);

  useEffect(() => {
    if (typeof window === 'undefined' || localStorage.getItem('omclta_notify') !== '1') return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    for (const n of notifications) {
      if (n.read_at || desktopNotifyRef.current.has(n.id)) continue;
      desktopNotifyRef.current.add(n.id);
      try {
        new Notification('Olite ERP', { body: n.message });
      } catch {
        /* ignore */
      }
    }
  }, [notifications]);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-6" style={{ background: '#232f3e', borderBottom: '3px solid #FF9900' }}>
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-white hover:text-[#FF9900] transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden sm:block text-sm font-medium" style={{ color: '#aab7c4' }}>
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="relative p-2 rounded hover:bg-[#37475a] transition-colors text-white">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-3.5 h-3.5 px-0.5 text-[9px] font-bold rounded-full bg-[#FF9900] text-[#0f1111] flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-80 overflow-y-auto" style={{ background: '#232f3e', border: '1px solid #37475a' }}>
            {notifications.length === 0 ? (
              <div className="px-3 py-4 text-xs" style={{ color: '#aab7c4' }}>
                No notifications
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="text-white hover:bg-[#37475a] cursor-pointer flex-col items-start gap-0.5 py-2"
                  onClick={async () => {
                    if (!n.read_at) {
                      markAsRead(n.id);
                      try {
                        const api = getApiClient();
                        await api.patch(`/notifications/${n.id}/read`);
                      } catch {
                        /* ignore */
                      }
                    }
                  }}
                >
                  <span className={`text-xs ${n.read_at ? 'opacity-60' : ''}`}>{n.message}</span>
                  <span className="text-[10px] opacity-70">{new Date(n.created_at).toLocaleString()}</span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator style={{ background: '#37475a' }} />
            <DropdownMenuItem onClick={() => router.push('/dashboard/notifications/guided-workflow')} className="text-[#FF9900] text-xs cursor-pointer">
              Notification settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-[#37475a] transition-colors text-white"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-[#37475a] transition-colors">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#FF9900', color: '#0f1111' }}>
              {initials}
            </div>
            {user?.name && <span className="hidden sm:block text-sm font-medium text-white max-w-30 truncate">{user.name}</span>}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" style={{ background: '#232f3e', border: '1px solid #37475a' }}>
            <div className="px-2 py-2">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs" style={{ color: '#aab7c4' }}>{user?.email}</p>
            </div>
            <DropdownMenuSeparator style={{ background: '#37475a' }} />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="text-white hover:bg-[#37475a] cursor-pointer">
              <User className="mr-2 h-4 w-4 text-[#FF9900]" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: '#37475a' }} />
            <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-[#37475a] cursor-pointer">
              <LogOut className="mr-2 h-4 w-4 text-[#FF9900]" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
