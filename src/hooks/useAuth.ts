import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getApiClient } from '@/lib/api-client';
import type { AuthUser } from '@/store/auth.store';

export function useAuth() {
  const { setTokens, setUser, logout, setLoading } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string, meta: { device_fingerprint: string; user_agent: string; latitude?: number; longitude?: number; gps_source: string }) => {
      setLoading(true);
      try {
        const api = getApiClient();
        const { data } = await api.post('/auth/login', { email, password, ...meta });
        console.log('[Auth] Login response:', {
          hasAccessToken: !!data.access_token,
          hasRefreshToken: !!data.refresh_token,
          accessTokenLength: data.access_token?.length,
          refreshTokenLength: data.refresh_token?.length,
          accessTokenPrefix: data.access_token?.substring(0, 50) + '...',
        });
        setTokens(data.access_token, data.refresh_token);
        setUser(data.user as AuthUser);
        return true;
      } catch (err) {
        console.error('[Auth] Login failed:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setTokens, setUser, setLoading]
  );

  const getMe = useCallback(async () => {
    try {
      const api = getApiClient();
      const { data } = await api.get('/auth/me');
      setUser(data as AuthUser);
      return data as AuthUser;
    } catch (error) {
      logout();
      throw error;
    }
  }, [setUser, logout]);

  return { login, getMe, logout };
}
