import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth.store';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1`;

let apiClient: AxiosInstance | null = null;
let refreshPromise: Promise<string> | null = null;

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: inject Bearer token
  client.interceptors.request.use((config) => {
    const { accessToken, isAuthenticated } = useAuthStore.getState();
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!accessToken,
      isAuthenticated,
      tokenPrefix: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
    });
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn(`[API] No access token found for ${config.url}`);
    }
    return config;
  });

  // Response interceptor: handle 401 with refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      if (!originalRequest) return Promise.reject(error);

      console.log(`[API] Response error:`, {
        status: error.response?.status,
        url: originalRequest.url,
        hasRetry: '_retry' in originalRequest,
      });

      // If 401 and not yet retried
      /*if (error.response?.status === 401 && !('_retry' in originalRequest)) {
        (originalRequest as any)._retry = true;
        console.log('[API] Attempting token refresh...');

        try {
          // Prevent multiple refresh calls
          if (!refreshPromise) {
            const { refreshToken, isAuthenticated } = useAuthStore.getState();
            console.log('[API] Refresh state:', { hasRefreshToken: !!refreshToken, isAuthenticated });

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            refreshPromise = (async () => {
              try {
                console.log('[API] Sending refresh request...');
                const { data } = await axios.post(
                  `${API_BASE_URL}/auth/refresh`,
                  {},
                  { headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshToken}`
                  } }
                );
                console.log('[API] Refresh successful');
                const newAccessToken = data.access_token;
                const { setTokens } = useAuthStore.getState();
                setTokens(newAccessToken, data.refresh_token || refreshToken);
                return newAccessToken;
              } catch (err) {
                console.error('[API] Refresh failed:', err);
                throw err;
              }
            })();
          }

          const newAccessToken = await refreshPromise;
          refreshPromise = null;

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log('[API] Retrying original request...');
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout
          console.error('[API] Token refresh failed, logging out:', refreshError);
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }*/

      return Promise.reject(error);
    }
  );

  return client;
}

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = createApiClient();
  }
  return apiClient;
}
