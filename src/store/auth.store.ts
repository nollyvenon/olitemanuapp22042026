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
  isHydrated: boolean;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  setDeviceId: (deviceId: string) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  setHydrated: (hydrated: boolean) => void;
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
      isHydrated: false,

      setTokens: (accessToken, refreshToken) => {
        console.log('[AuthStore] setTokens called', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          accessTokenLength: accessToken?.length,
        });
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => {
        console.log('[AuthStore] setUser called', { userId: user?.id });
        set({ user });
      },

      setDeviceId: (deviceId) => set({ deviceId }),

      setLoading: (isLoading) => {
        console.log('[AuthStore] setLoading', isLoading);
        set({ isLoading });
      },

      logout: () => {
        console.log('[AuthStore] logout called');
        console.trace('logout stacktrace');
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          deviceId: null,
          isAuthenticated: false,
        });
      },

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

      setHydrated: (hydrated: boolean) => {
        console.log('[AuthStore] setHydrated', hydrated);
        set({ isHydrated: hydrated });
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
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            console.log('[AuthStore] Hydration complete', {
              hasAccessToken: !!state.accessToken,
              isAuthenticated: state.isAuthenticated,
            });
            state.setHydrated(true);
          }
        };
      },
    }
  )
);
