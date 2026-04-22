import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Permission {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles?: Role[];
  permissions?: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),

      hasPermission: (permission: string): boolean => {
        const { user } = get();
        if (!user) return false;
        const permissions = user.permissions ?? [];
        return (
          permissions.includes(permission) ||
          permissions.some(
            (p) => p.endsWith('.*') && permission.startsWith(p.slice(0, -2))
          )
        );
      },

      hasRole: (role: string): boolean => {
        const { user } = get();
        if (!user) return false;
        return user.roles?.some((r) => r.slug === role) ?? false;
      },
    }),
    {
      name: 'olite-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
