import { apiClient } from './apiClient.js';
import { Donor, DonationHistory } from '../types/index.js';

export interface DonorFilterParams {
  bloodGroup?: string;
  union?: string;
  upazila?: string;
  district?: string;
  gender?: string;
  status?: string;
  verificationStatus?: string;
  eligibility?: string;
  searchQuery?: string;
  availableOnly?: boolean;
  showTrash?: boolean;
}

export interface EligibilityStats {
  verifiedCount: number;
  pendingVerificationCount: number;
  availableCount: number;
  unavailableCount: number;
  eligibleTodayCount: number;
  eligibleThisWeekCount: number;
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
    if (filters?.verificationStatus) params.append('verificationStatus', filters.verificationStatus);
    if (filters?.eligibility) params.append('eligibility', filters.eligibility);
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
  },

  // Verification & Eligibility API
  async submitVerification(donorId: string, notes?: string): Promise<{ success: boolean; donor?: Donor; error?: string }> {
    const res = await apiClient<{ success: boolean; message: string; donor: Donor }>(`/donors/${donorId}/verify/submit`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
    if (res.error) return { success: false, error: res.error };
    return { success: true, donor: res.data?.donor };
  },

  async reviewVerification(donorId: string, notes?: string): Promise<{ success: boolean; donor?: Donor; error?: string }> {
    const res = await apiClient<{ success: boolean; message: string; donor: Donor }>(`/donors/${donorId}/verify/review`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
    if (res.error) return { success: false, error: res.error };
    return { success: true, donor: res.data?.donor };
  },

  async approveVerification(donorId: string, notes?: string): Promise<{ success: boolean; donor?: Donor; error?: string }> {
    const res = await apiClient<{ success: boolean; message: string; donor: Donor }>(`/donors/${donorId}/verify/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
    if (res.error) return { success: false, error: res.error };
    return { success: true, donor: res.data?.donor };
  },

  async rejectVerification(donorId: string, reason: string): Promise<{ success: boolean; donor?: Donor; error?: string }> {
    const res = await apiClient<{ success: boolean; message: string; donor: Donor }>(`/donors/${donorId}/verify/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    if (res.error) return { success: false, error: res.error };
    return { success: true, donor: res.data?.donor };
  },

  async updateAvailability(
    donorId: string,
    status: string,
    tempInfo?: { tempStart?: string; tempEnd?: string; tempReason?: string; tempNotes?: string }
  ): Promise<{ success: boolean; donor?: Donor; error?: string }> {
    const res = await apiClient<{ success: boolean; message: string; donor: Donor }>(`/donors/${donorId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...tempInfo })
    });
    if (res.error) return { success: false, error: res.error };
    return { success: true, donor: res.data?.donor };
  },

  async getEligibilityStats(): Promise<EligibilityStats | null> {
    const res = await apiClient<EligibilityStats>('/eligibility/stats');
    return res.data || null;
  },

  async triggerEligibilityReminders(): Promise<{ notifiedCount: number; error?: string }> {
    const res = await apiClient<{ notifiedCount: number }>('/eligibility/check-reminders', {
      method: 'POST'
    });
    if (res.error) return { notifiedCount: 0, error: res.error };
    return { notifiedCount: res.data?.notifiedCount || 0 };
  }
};
