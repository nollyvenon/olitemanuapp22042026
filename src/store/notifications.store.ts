import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  lastFetchedAt: number | null;
  setNotifications: (notifications: AppNotification[]) => void;
  setUnreadCount: (count: number) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setLastFetchedAt: (ts: number) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  lastFetchedAt: null,
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    })),
  setLastFetchedAt: (ts) => set({ lastFetchedAt: ts }),
}));
