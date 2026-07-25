import { apiClient } from './apiClient.js';
import { Donor, DonationHistory } from '../types/index.js';

export interface DonorFilterParams {
  bloodGroup?: string;
  union?: string;
  upazila?: string;
  district?: string;
  gender?: string;
  status?: string;
  searchQuery?: string;
  availableOnly?: boolean;
  showTrash?: boolean;
}

export const donorService = {
  async getAllDonors(filters?: DonorFilterParams): Promise<Donor[]> {
    const params = new URLSearchParams();
    if (filters?.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
    if (filters?.union) params.append('union', filters.union);
    if (filters?.upazila) params.append('upazila', filters.upazila);
    if (filters?.district) params.append('district', filters.district);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);
    if (filters?.availableOnly) params.append('availableOnly', 'true');
    if (filters?.showTrash) params.append('showTrash', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient<Donor[]>(`/donors${query}`);
    return res.data || [];
  },

  async getDonorById(id: string): Promise<Donor | null> {
    const res = await apiClient<Donor>(`/donors/${id}`);
    return res.data || null;
  },

  async getDonationHistory(donorId: string): Promise<DonationHistory[]> {
    const res = await apiClient<DonationHistory[]>(`/donors/${donorId}/history`);
    return res.data || [];
  },

  async checkPhoneExists(phone: string, excludeId?: string): Promise<boolean> {
    const res = await apiClient<{ exists: boolean }>('/donors/check-phone', {
      method: 'POST',
      body: JSON.stringify({ phone, excludeId })
    });
    return res.data?.exists || false;
  },

  async createDonor(data: Partial<Donor>): Promise<{ donor?: Donor; error?: string }> {
    const res = await apiClient<Donor>('/donors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.error) return { error: res.error };
    return { donor: res.data };
  },

  async updateDonor(id: string, data: Partial<Donor>): Promise<{ donor?: Donor; error?: string }> {
    const res = await apiClient<Donor>(`/donors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res.error) return { error: res.error };
    return { donor: res.data };
  },

  async deleteDonor(id: string, permanent = false): Promise<{ success: boolean; error?: string }> {
    const query = permanent ? '?permanent=true' : '';
    const res = await apiClient<{ message: string }>(`/donors/${id}${query}`, {
      method: 'DELETE',
    });
    if (res.error) return { success: false, error: res.error };
    return { success: true };
  },

  async restoreDonor(id: string): Promise<{ success: boolean; error?: string }> {
    const res = await apiClient<{ message: string }>(`/donors/${id}/restore`, {
      method: 'POST',
    });
    if (res.error) return { success: false, error: res.error };
    return { success: true };
  },

  async bulkDeleteDonors(ids: string[], permanent = false): Promise<{ count: number; error?: string }> {
    const res = await apiClient<{ count: number }>('/donors/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids, permanent })
    });
    if (res.error) return { count: 0, error: res.error };
    return { count: res.data?.count || 0 };
  },

  async bulkImport(donors: Partial<Donor>[]): Promise<{ importedCount: number; error?: string }> {
    const res = await apiClient<{ importedCount: number }>('/donors/import', {
      method: 'POST',
      body: JSON.stringify({ donors }),
    });
    if (res.error) return { importedCount: 0, error: res.error };
    return { importedCount: res.data?.importedCount || 0 };
  }
};
