'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, Menu, Bell, User, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toggleSidebar, theme, setTheme } = useUIStore();

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
        <button className="relative p-2 rounded hover:bg-[#37475a] transition-colors text-white">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF9900]" />
        </button>

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
            {user?.name && <span className="hidden sm:block text-sm font-medium text-white max-w-[120px] truncate">{user.name}</span>}
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
