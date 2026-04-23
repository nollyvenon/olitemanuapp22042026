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
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Response interceptor: handle 401 with refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      if (!originalRequest) return Promise.reject(error);

      // If 401 and not yet retried
      if (error.response?.status === 401 && !('_retry' in originalRequest)) {
        (originalRequest as any)._retry = true;

        try {
          // Prevent multiple refresh calls
          if (!refreshPromise) {
            const { refreshToken } = useAuthStore.getState();
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            refreshPromise = (async () => {
              const { data } = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                { refresh_token: refreshToken },
                { headers: { 'Content-Type': 'application/json' } }
              );
              const newAccessToken = data.access_token;
              const { setTokens } = useAuthStore.getState();
              setTokens(newAccessToken, data.refresh_token || refreshToken);
              return newAccessToken;
            })();
          }

          const newAccessToken = await refreshPromise;
          refreshPromise = null;

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }

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
