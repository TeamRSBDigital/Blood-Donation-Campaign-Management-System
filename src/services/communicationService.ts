import {
  BroadcastCampaign,
  BroadcastTargetFilter,
  MessageTemplate,
  RecipientCalculationResult
} from '../types/index.js';

class CommunicationService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('pbda_token') || sessionStorage.getItem('pbda_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get all campaigns
  async getCampaigns(params?: { status?: string; type?: string; searchQuery?: string }): Promise<BroadcastCampaign[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.searchQuery) query.set('searchQuery', params.searchQuery);

    const res = await fetch(`/api/communication/broadcasts?${query.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });

    if (!res.ok) {
      throw new Error('ক্যাম্পেইন তালিকা লোড করতে ব্যর্থ হয়েছে');
    }

    return res.json();
  }

  // Get campaign by ID
  async getCampaignById(id: string): Promise<BroadcastCampaign> {
    const res = await fetch(`/api/communication/broadcasts/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });

    if (!res.ok) {
      throw new Error('ক্যাম্পেইন এর বিবরণ লোড করা যায়নি');
    }

    return res.json();
  }

  // Calculate target audience recipients in real-time
  async calculateTargetRecipients(filter: BroadcastTargetFilter): Promise<RecipientCalculationResult> {
    const res = await fetch('/api/communication/broadcasts/calculate-target', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(filter)
    });

    if (!res.ok) {
      throw new Error('প্রাপকের সংখ্যা গণনা করতে ব্যর্থ হয়েছে');
    }

    return res.json();
  }

  // Create new campaign
  async createCampaign(
    campaignData: Omit<BroadcastCampaign, 'id' | 'createdAt' | 'updatedAt' | 'deliveredCount' | 'failedCount' | 'pendingCount' | 'skippedCount' | 'createdBy' | 'creatorRole' | 'estimatedRecipientsCount'>
  ): Promise<BroadcastCampaign> {
    const res = await fetch('/api/communication/broadcasts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(campaignData)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'নতুন ব্রডকাস্ট ক্যাম্পেইন তৈরি করতে ব্যর্থ হয়েছে');
    }

    return res.json();
  }

  // Send campaign immediately
  async sendCampaignNow(id: string): Promise<{ success: boolean; campaign?: BroadcastCampaign; error?: string }> {
    const res = await fetch(`/api/communication/broadcasts/${id}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'ক্যাম্পেইন পাঠাতে ব্যর্থ হয়েছে');
    }

    return res.json();
  }

  // Cancel scheduled campaign
  async cancelCampaign(id: string): Promise<{ success: boolean; campaign?: BroadcastCampaign; error?: string }> {
    const res = await fetch(`/api/communication/broadcasts/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'সিডিউলড ক্যাম্পেইন বাতিল করা যায়নি');
    }

    return res.json();
  }

  // Duplicate campaign
  async duplicateCampaign(id: string): Promise<BroadcastCampaign> {
    const res = await fetch(`/api/communication/broadcasts/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'ক্যাম্পেইন কপি করতে ব্যর্থ হয়েছে');
    }

    return res.json();
  }

  // Delete campaign
  async deleteCampaign(id: string): Promise<boolean> {
    const res = await fetch(`/api/communication/broadcasts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });

    if (!res.ok) {
      throw new Error('ক্যাম্পেইন মুছে ফেলা যায়নি');
    }

    return true;
  }

  // Get templates
  async getTemplates(): Promise<MessageTemplate[]> {
    const res = await fetch('/api/communication/templates', {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });

    if (!res.ok) {
      throw new Error('টেমপ্লেট লোড করতে ব্যর্থ হয়েছে');
    }

    return res.json();
  }

  // Create template
  async createTemplate(
    tmpl: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ): Promise<MessageTemplate> {
    const res = await fetch('/api/communication/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(tmpl)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'নতুন টেমপ্লেট তৈরি করা যায়নি');
    }

    return res.json();
  }

  // Update template
  async updateTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const res = await fetch(`/api/communication/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'টেমপ্লেট আপডেট করা যায়নি');
    }

    return res.json();
  }

  // Delete template
  async deleteTemplate(id: string): Promise<boolean> {
    const res = await fetch(`/api/communication/templates/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });

    if (!res.ok) {
      throw new Error('টেমপ্লেট মুছে ফেলা যায়নি');
    }

    return true;
  }
}

export const communicationService = new CommunicationService();
