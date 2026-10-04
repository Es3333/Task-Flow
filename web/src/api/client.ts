import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const tokenStore = {
  getAccess: () => localStorage.getItem('tf_access'),
  getRefresh: () => localStorage.getItem('tf_refresh'),
  set: (access: string, refresh: string) => {
    localStorage.setItem('tf_access', access);
    localStorage.setItem('tf_refresh', refresh);
  },
  clear: () => {
    localStorage.removeItem('tf_access');
    localStorage.removeItem('tf_refresh');
  },
};

export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const t = tokenStore.getAccess();
  if (t) config.headers.set('Authorization', `Bearer ${t}`);
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const rt = tokenStore.getRefresh();
  if (!rt) return null;
  try {
    const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: rt }, { withCredentials: true });
    const { accessToken, refreshToken } = res.data;
    tokenStore.set(accessToken, refreshToken);
    return accessToken;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retried && !original.url?.includes('/auth/')) {
      original._retried = true;
      if (!refreshing) refreshing = doRefresh().finally(() => setTimeout(() => (refreshing = null), 100));
      const newAccess = await refreshing;
      if (newAccess) {
        original.headers.set('Authorization', `Bearer ${newAccess}`);
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(e: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { error?: { message?: string } } | undefined;
    if (data?.error?.message) return data.error.message;
    if (e.message) return e.message;
  }
  return fallback;
}
