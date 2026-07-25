import { apiClient } from './apiClient.js';
import { User, AdminUser } from '../types/index.js';
import { LoginInput } from '../lib/validations/index.js';

export const authService = {
  async login(credentials: LoginInput): Promise<{ user?: AdminUser; token?: string; error?: string }> {
    const response = await apiClient<{ user: AdminUser; token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.error || !response.data) {
      return { error: response.error || 'লগইন ব্যর্থ হয়েছে। সঠিকভাবে ইউজার ও পাসওয়ার্ড দিন।' };
    }

    localStorage.setItem('pbda_token', response.data.token);
    localStorage.setItem('pbda_user', JSON.stringify(response.data.user));

    return { user: response.data.user, token: response.data.token };
  },

  async verifySession(): Promise<AdminUser | null> {
    const token = localStorage.getItem('pbda_token');
    if (!token) return null;

    const response = await apiClient<AdminUser>('/me', {
      method: 'GET',
    });

    if (response.error || !response.data) {
      this.logout();
      return null;
    }

    return response.data;
  },

  logout(): void {
    localStorage.removeItem('pbda_token');
    localStorage.removeItem('pbda_user');
  },

  getCurrentUserFromStorage(): AdminUser | null {
    const str = localStorage.getItem('pbda_user');
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }
};
