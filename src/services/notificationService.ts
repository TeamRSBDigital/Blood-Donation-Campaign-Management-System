import { apiClient } from './apiClient.js';

export interface NotificationPayload {
  title: string;
  message: string;
  recipientRoles?: string[];
  type: 'BLOOD_REQUEST' | 'CAMPAIGN' | 'DONOR_ALERT' | 'SYSTEM';
}

export const notificationService = {
  async sendTelegramAlert(message: string): Promise<{ success: boolean; error?: string }> {
    const res = await apiClient<{ success: boolean }>('/notifications/telegram', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    if (res.error) return { success: false, error: res.error };
    return { success: true };
  },

  async sendSmsAlert(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    // Placeholder SMS dispatch gateway interface
    console.log(`[SMS Gateway Mock] Dispatched SMS to ${phone}: ${message}`);
    return { success: true };
  }
};
