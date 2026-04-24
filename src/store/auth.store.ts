import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Group {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  long: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  groups: Group[];
  permissions: string[];
  locations: Location[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  deviceId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  setDeviceId: (deviceId: string) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      deviceId: null,
      isLoading: false,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      setDeviceId: (deviceId) => set({ deviceId }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          deviceId: null,
          isAuthenticated: false,
        }),

      hasPermission: (permission: string): boolean => {
        const { user } = get();
        if (!user?.permissions) return false;
        if (user.permissions.includes('admin.*')) return true;
        return (
          user.permissions.includes(permission) ||
          user.permissions.some(
            (p) => p.endsWith('.*') && permission.startsWith(p.slice(0, -2))
          )
        );
      },
    }),
    {
      name: 'omclta-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        deviceId: state.deviceId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
