import { APP_CONFIG } from '../config/app.config.js';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${APP_CONFIG.apiBaseUrl}${endpoint}`;
  
  const token = localStorage.getItem('pbda_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        error: data.error || data.message || `API Error (${res.status})`,
        status: res.status,
      };
    }

    return {
      data,
      status: res.status,
    };
  } catch (err: any) {
    return {
      error: err.message || 'Network communication failure',
      status: 500,
    };
  }
}
