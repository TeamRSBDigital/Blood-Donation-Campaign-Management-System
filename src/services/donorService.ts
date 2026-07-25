import { apiClient } from './apiClient.js';
import { Donor } from '../types/index.js';
import { DonorInput } from '../lib/validations/index.js';

export interface DonorFilterParams {
  bloodGroup?: string;
  union?: string;
  upazila?: string;
  searchQuery?: string;
  availableOnly?: boolean;
}

export const donorService = {
  async getAllDonors(filters?: DonorFilterParams): Promise<Donor[]> {
    const params = new URLSearchParams();
    if (filters?.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
    if (filters?.union) params.append('union', filters.union);
    if (filters?.upazila) params.append('upazila', filters.upazila);
    if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);
    if (filters?.availableOnly) params.append('availableOnly', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient<Donor[]>(`/donors${query}`);
    return res.data || [];
  },

  async getDonorById(id: string): Promise<Donor | null> {
    const res = await apiClient<Donor>(`/donors/${id}`);
    return res.data || null;
  },

  async createDonor(data: DonorInput): Promise<{ donor?: Donor; error?: string }> {
    const res = await apiClient<Donor>('/donors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.error) return { error: res.error };
    return { donor: res.data };
  },

  async updateDonor(id: string, data: Partial<DonorInput>): Promise<{ donor?: Donor; error?: string }> {
    const res = await apiClient<Donor>(`/donors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res.error) return { error: res.error };
    return { donor: res.data };
  },

  async deleteDonor(id: string): Promise<{ success: boolean; error?: string }> {
    const res = await apiClient<{ success: boolean }>(`/donors/${id}`, {
      method: 'DELETE',
    });
    if (res.error) return { success: false, error: res.error };
    return { success: true };
  },

  async bulkImport(donors: DonorInput[]): Promise<{ importedCount: number; error?: string }> {
    const res = await apiClient<{ importedCount: number }>('/donors/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ donors }),
    });
    if (res.error) return { importedCount: 0, error: res.error };
    return { importedCount: res.data?.importedCount || 0 };
  }
};
