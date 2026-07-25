import { dbService } from './db.js';
import {
  TelegramNotificationType,
  TelegramInlineButton,
  TelegramNotificationLog,
  WhatsappNotificationType,
  WhatsappRecipient,
  WhatsappNotificationLog,
  WhatsappDeliveryStats,
  UserRole
} from '../types/index.js';

export interface NotifyEventOptions {
  type: TelegramNotificationType | WhatsappNotificationType | string;
  title?: string;
  triggeredBy?: string;
  relatedRecordId?: string;
  data?: any;
  customMessage?: string;
  buttons?: TelegramInlineButton[];
  appUrl?: string;
}

// Queue processing state
let isProcessingQueue = false;
let isProcessingWhatsAppQueue = false;

function formatDateTime(isoOrDate?: string): string {
  try {
    const d = isoOrDate ? new Date(isoOrDate) : new Date();
    if (isNaN(d.getTime())) return new Date().toLocaleString('bn-BD');
    return d.toLocaleString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return new Date().toLocaleString();
  }
}

/**
 * Normalizes phone numbers to standard WhatsApp format with country code (e.g. 8801712345678)
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('01')) {
    cleaned = `88${cleaned}`;
  }
  return cleaned;
}

/**
 * Builds clean WhatsApp text message based on event type
 */
export function buildWhatsAppMessage(options: NotifyEventOptions, defaultAppUrl: string): string {
  const { type, triggeredBy = 'System', relatedRecordId, data = {}, customMessage, appUrl = defaultAppUrl } = options;
  const reqId = data.requestNumber || relatedRecordId || 'REQ-UNKNOWN';
  const dashUrl = `${appUrl}/request-blood?req=${reqId}`;

  switch (type) {
    case 'NEW_BLOOD_REQUEST':
      return `🩸 NEW BLOOD REQUEST\n\n` +
        `Request ID:\n${reqId}\n\n` +
        `Patient:\n${data.patientName || 'N/A'}\n\n` +
        `Blood Group:\n${data.bloodGroup || 'N/A'} (${data.bagsNeeded || 1} Bag)\n\n` +
        `Hospital:\n${data.hospitalName || 'N/A'}\n\n` +
        `Location:\n${data.upazila || 'Pangsha'}, ${data.district || 'Rajbari'}\n\n` +
        `Priority:\n${data.priority || 'Normal'}\n\n` +
        `Required Date:\n${data.requiredDate || 'ASAP'}\n\n` +
        `Contact:\n${data.contactPhone || 'N/A'}\n\n` +
        `Dashboard:\n${dashUrl}`;

    case 'EMERGENCY_BLOOD_REQUEST':
      return `🚨 EMERGENCY BLOOD REQUEST\n\n` +
        `Request ID:\n${reqId}\n\n` +
        `Patient:\n${data.patientName || 'N/A'}\n\n` +
        `Blood Group:\n${data.bloodGroup || 'N/A'} (${data.bagsNeeded || 1} Bag)\n\n` +
        `Hospital:\n${data.hospitalName || 'N/A'}\n\n` +
        `Location:\n${data.upazila || 'Pangsha'}, ${data.district || 'Rajbari'}\n\n` +
        `Priority:\nCritical (URGENT)\n\n` +
        `Required Date:\n${data.requiredDate || 'ASAP'}\n\n` +
        `Contact:\n${data.contactPhone || 'N/A'}\n\n` +
        `Dashboard:\n${dashUrl}`;

    case 'BLOOD_REQUEST_STATUS_CHANGED':
      return `🔄 BLOOD REQUEST STATUS CHANGED\n\n` +
        `Request ID:\n${reqId}\n\n` +
        `Patient:\n${data.patientName || 'N/A'}\n\n` +
        `Blood Group:\n${data.bloodGroup || 'N/A'}\n\n` +
        `Status:\n${data.oldStatus || 'PENDING'} ➔ ${data.newStatus || data.status || 'UPDATED'}\n\n` +
        `Updated By:\n${triggeredBy}\n\n` +
        `Dashboard:\n${dashUrl}`;

    case 'CRITICAL_BLOOD_REQUEST_REMINDER':
      return `⚠️ CRITICAL BLOOD REQUEST REMINDER\n\n` +
        `Request ID:\n${reqId}\n\n` +
        `Patient:\n${data.patientName || 'N/A'}\n\n` +
        `Blood Group:\n${data.bloodGroup || 'N/A'} (${data.bagsNeeded || 1} Bag Needed)\n\n` +
        `Hospital:\n${data.hospitalName || 'N/A'}\n\n` +
        `Location:\n${data.upazila || 'Pangsha'}, ${data.district || 'Rajbari'}\n\n` +
        `Priority:\nCritical (PENDING - Needs Urgent Donor)\n\n` +
        `Required Date:\n${data.requiredDate || 'ASAP'}\n\n` +
        `Contact:\n${data.contactPhone || 'N/A'}\n\n` +
        `Dashboard:\n${dashUrl}`;

    default:
      return `📢 SYSTEM NOTIFICATION\n\n` +
        `${customMessage || options.title || 'Notification'}\n\n` +
        `Triggered By:\n${triggeredBy}\n\n` +
        `Dashboard:\n${appUrl}`;
  }
}

/**
 * Sends text message via Meta WhatsApp Cloud API endpoint
 */
async function sendWhatsAppMessageToApi(
  accessToken: string,
  phoneNumberId: string,
  apiVersion: string,
  recipientPhone: string,
  messageText: string
): Promise<{ success: boolean; error?: string; waMessageId?: string }> {
  try {
    const cleanPhone = normalizePhoneForWhatsApp(recipientPhone);
    if (!cleanPhone) {
      return { success: false, error: 'Invalid recipient phone number' };
    }

    const version = apiVersion || 'v20.0';
    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: true,
        body: messageText
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (res.ok && data.messages && data.messages.length > 0) {
      return {
        success: true,
        waMessageId: data.messages[0].id
      };
    } else {
      const errorObj = data.error || {};
      const errorMsg = errorObj.message || errorObj.error_data?.details || `HTTP ${res.status}: WhatsApp API Error`;
      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    const errorMsg = err.name === 'AbortError' ? 'WhatsApp API request timeout (8s)' : (err.message || 'Network request failed');
    return { success: false, error: errorMsg };
  }
}

/**
 * Asynchronous WhatsApp Queue Processor with Exponential Backoff
 */
async function processWhatsAppQueue() {
  if (isProcessingWhatsAppQueue) return;
  isProcessingWhatsAppQueue = true;

  try {
    const logs = dbService.getWhatsappLogs();
    const pendingLogs = logs.filter(l => l.status === 'PENDING' || l.status === 'RETRYING');

    if (pendingLogs.length === 0) {
      isProcessingWhatsAppQueue = false;
      return;
    }

    const settings = dbService.getSettings();
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || settings.whatsappAccessToken || '';
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || settings.whatsappPhoneNumberId || '';
    const apiVersion = process.env.WHATSAPP_API_VERSION || settings.whatsappApiVersion || 'v20.0';
    const isEnabled = process.env.WHATSAPP_NOTIFICATIONS_ENABLED !== undefined
      ? process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true'
      : (settings.enableWhatsappNotify ?? true);

    if (!isEnabled || !accessToken || !phoneNumberId) {
      for (const log of pendingLogs) {
        dbService.updateWhatsappLog(log.id, {
          status: 'FAILED',
          failureReason: !isEnabled ? 'WhatsApp notifications are disabled in settings' : 'WhatsApp Access Token or Phone Number ID not configured'
        });
      }
      isProcessingWhatsAppQueue = false;
      return;
    }

    for (const log of pendingLogs) {
      const result = await sendWhatsAppMessageToApi(
        accessToken,
        phoneNumberId,
        apiVersion,
        log.recipientPhone,
        log.message
      );

      if (result.success) {
        dbService.updateWhatsappLog(log.id, {
          status: 'SUCCESS',
          deliveredAt: new Date().toISOString(),
          waMessageId: result.waMessageId
        });
      } else {
        const nextAttempt = log.retryCount + 1;
        if (nextAttempt < log.maxRetries) {
          dbService.updateWhatsappLog(log.id, {
            status: 'RETRYING',
            retryCount: nextAttempt,
            failureReason: result.error
          });
          // Exponential backoff
          await new Promise(r => setTimeout(r, Math.min(2000 * Math.pow(2, nextAttempt), 10000)));
        } else {
          dbService.updateWhatsappLog(log.id, {
            status: 'FAILED',
            retryCount: nextAttempt,
            failureReason: result.error
          });
        }
      }
    }
  } catch (err) {
    console.error('[WHATSAPP QUEUE ERROR]', err);
  } finally {
    isProcessingWhatsAppQueue = false;
  }
}

/**
 * Builds clean Markdown formatted text for Telegram notifications
 */
export function buildTelegramMessage(options: NotifyEventOptions, defaultAppUrl: string): { messageText: string; buttons: TelegramInlineButton[] } {
  const { type, triggeredBy = 'System', relatedRecordId, data = {}, customMessage, buttons: customButtons, appUrl = defaultAppUrl } = options;
  const timeStr = formatDateTime(new Date().toISOString());

  let text = '';
  const buttons: TelegramInlineButton[] = customButtons ? [...customButtons] : [];

  switch (type) {
    case 'NEW_BLOOD_REQUEST':
    case 'EMERGENCY_BLOOD_REQUEST': {
      const isEmergency = type === 'EMERGENCY_BLOOD_REQUEST' || data.priority === 'CRITICAL' || data.priority === 'HIGH';
      const icon = isEmergency ? '🚨 EMERGENCY BLOOD REQUEST' : '🩸 NEW BLOOD REQUEST';
      
      text = `${icon}\n\n` +
        `*Request ID:* ${data.requestNumber || relatedRecordId || 'REQ-UNKNOWN'}\n` +
        `*Patient Name:* ${data.patientName || 'N/A'}\n` +
        `*Blood Group:* *${data.bloodGroup || 'N/A'}* (${data.bagsNeeded || 1} Bag)\n` +
        `*Hospital:* ${data.hospitalName || 'N/A'}\n` +
        `*District:* ${data.district || 'Rajbari'} (Upazila: ${data.upazila || 'Pangsha'})\n` +
        `*Contact:* ${data.contactPhone || 'N/A'}\n` +
        `*Priority:* *${data.priority || (isEmergency ? 'Critical' : 'Normal')}*\n` +
        `*Required Date:* ${data.requiredDate || 'ASAP'}\n` +
        `*Submitted At:* ${timeStr}\n` +
        (data.notes ? `\n*Note:* _${data.notes}_` : '');

      if (buttons.length === 0) {
        if (data.requestNumber) {
          buttons.push({ text: '👀 View Request', url: `${appUrl}/request-blood?req=${data.requestNumber}` });
        }
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
        if (data.contactPhone) {
          buttons.push({ text: '📞 Call Patient', url: `tel:${data.contactPhone}` });
        }
        if (data.hospitalName) {
          const query = encodeURIComponent(`${data.hospitalName} ${data.upazila || ''}`);
          buttons.push({ text: '📍 Open Google Maps', url: `https://www.google.com/maps/search/?api=1&query=${query}` });
        }
      }
      break;
    }

    case 'BLOOD_REQUEST_STATUS_CHANGED': {
      text = `🔄 *BLOOD REQUEST STATUS CHANGED*\n\n` +
        `*Request ID:* ${data.requestNumber || relatedRecordId || 'N/A'}\n` +
        `*Patient Name:* ${data.patientName || 'N/A'}\n` +
        `*Blood Group:* ${data.bloodGroup || 'N/A'}\n` +
        `*Previous Status:* ${data.oldStatus || 'PENDING'}\n` +
        `*New Status:* *${data.newStatus || data.status || 'UPDATED'}*\n` +
        `*Updated By:* ${triggeredBy}\n` +
        `*Updated Time:* ${timeStr}`;

      if (buttons.length === 0) {
        if (data.requestNumber) {
          buttons.push({ text: '👀 View Request', url: `${appUrl}/request-blood?req=${data.requestNumber}` });
        }
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }

    case 'NEW_DONOR_ADDED': {
      text = `✅ *NEW DONOR REGISTERED*\n\n` +
        `*Name:* ${data.name || 'N/A'}\n` +
        `*Blood Group:* *${data.bloodGroup || 'N/A'}*\n` +
        `*Phone:* ${data.phone || 'N/A'}\n` +
        `*District:* ${data.district || 'Rajbari'} (Upazila: ${data.upazila || 'Pangsha'}, Union: ${data.union || 'N/A'})\n` +
        `*Created By:* ${triggeredBy}\n` +
        `*Registration Time:* ${timeStr}`;

      if (buttons.length === 0) {
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }

    case 'DONOR_UPDATED': {
      text = `✏ *DONOR UPDATED*\n\n` +
        `*Name:* ${data.name || 'N/A'}\n` +
        `*Blood Group:* ${data.bloodGroup || 'N/A'}\n` +
        `*Updated Fields:* ${data.updatedFields || data.notes || 'Profile details updated'}\n` +
        `*Updated By:* ${triggeredBy}\n` +
        `*Updated Time:* ${timeStr}`;

      if (buttons.length === 0) {
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }

    case 'DONOR_DELETED': {
      text = `⚠️ *DONOR DELETED*\n\n` +
        `*Name:* ${data.name || 'N/A'}\n` +
        `*Blood Group:* ${data.bloodGroup || 'N/A'}\n` +
        `*Deleted By:* ${triggeredBy}\n` +
        `*Deleted Time:* ${timeStr}`;

      if (buttons.length === 0) {
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }

    case 'DONOR_AVAILABILITY_CHANGED': {
      text = `🔄 *DONOR AVAILABILITY CHANGED*\n\n` +
        `*Name:* ${data.name || 'N/A'}\n` +
        `*Blood Group:* ${data.bloodGroup || 'N/A'}\n` +
        `*New Status:* *${data.status || 'AVAILABLE'}*\n` +
        `*Reason:* ${data.reason || 'Donation history update'}\n` +
        `*Updated By:* ${triggeredBy}\n` +
        `*Updated Time:* ${timeStr}`;

      if (buttons.length === 0) {
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }

    case 'NEW_ADMIN_CREATED': {
      text = `🛡 *NEW ADMIN CREATED*\n\n` +
        `*Name:* ${data.name || 'N/A'}\n` +
        `*Email:* ${data.email || 'N/A'}\n` +
        `*Role:* *${data.role || 'ADMIN'}*\n` +
        `*Created By:* ${triggeredBy}\n` +
        `*Created Time:* ${timeStr}`;

      if (buttons.length === 0) {
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }

    case 'ADMIN_REMOVED': {
      text = `❌ *ADMIN REMOVED*\n\n` +
        `*Name:* ${data.name || 'N/A'}\n` +
        `*Role:* ${data.role || 'ADMIN'}\n` +
        `*Removed By:* ${triggeredBy}\n` +
        `*Removed Time:* ${timeStr}`;

      if (buttons.length === 0) {
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }

    case 'ROLE_CHANGED': {
      text = `🔑 *ADMIN ROLE / PERMISSION CHANGED*\n\n` +
        `*Name:* ${data.name || 'N/A'}\n` +
        `*Previous Role:* ${data.oldRole || 'N/A'}\n` +
        `*New Role:* *${data.newRole || data.role || 'N/A'}*\n` +
        `*Updated By:* ${triggeredBy}\n` +
        `*Updated Time:* ${timeStr}`;

      if (buttons.length === 0) {
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }

    case 'DATABASE_BACKUP_COMPLETED': {
      text = `💾 *DATABASE BACKUP COMPLETED*\n\n` +
        `*Backup ID:* ${data.backupId || 'AUTO-BACKUP'}\n` +
        `*Total Records:* ${data.totalRecords || 'Full snapshot'}\n` +
        `*Triggered By:* ${triggeredBy}\n` +
        `*Completed At:* ${timeStr}`;

      if (buttons.length === 0) {
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }

    case 'SERVER_ERROR':
    case 'DATABASE_ERROR':
    case 'SECURITY_WARNING': {
      const iconMap = {
        SERVER_ERROR: '🔥 SERVER ERROR',
        DATABASE_ERROR: '⚠️ DATABASE ERROR',
        SECURITY_WARNING: '🛡 SECURITY WARNING'
      };
      text = `${iconMap[type]}\n\n` +
        `*Details:* ${customMessage || data.message || 'System exception logged'}\n` +
        `*Module/Path:* ${data.path || data.module || 'Core Server'}\n` +
        `*Actor/IP:* ${data.ip || triggeredBy}\n` +
        `*Timestamp:* ${timeStr}`;

      if (buttons.length === 0) {
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }

    default: {
      text = `📢 *SYSTEM NOTIFICATION*\n\n` +
        `${customMessage || options.title || 'System Notification'}\n\n` +
        `*Triggered By:* ${triggeredBy}\n` +
        `*Timestamp:* ${timeStr}`;

      if (buttons.length === 0) {
        buttons.push({ text: '📋 Open Dashboard', url: appUrl });
      }
      break;
    }
  }

  return { messageText: text, buttons };
}

/**
 * Sends a message directly to Telegram via API
 */
async function sendTelegramMessageToApi(
  botToken: string,
  chatId: string,
  messageText: string,
  buttons: TelegramInlineButton[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    // Group buttons into rows of max 2 buttons
    const keyboardRows: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [];
    if (buttons && buttons.length > 0) {
      let currentRow: Array<{ text: string; url?: string; callback_data?: string }> = [];
      for (const btn of buttons) {
        currentRow.push({
          text: btn.text,
          url: btn.url,
          callback_data: btn.callback_data
        });
        if (currentRow.length === 2) {
          keyboardRows.push(currentRow);
          currentRow = [];
        }
      }
      if (currentRow.length > 0) {
        keyboardRows.push(currentRow);
      }
    }

    const payload: any = {
      chat_id: chatId,
      text: messageText,
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    };

    if (keyboardRows.length > 0) {
      payload.reply_markup = {
        inline_keyboard: keyboardRows
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json();
    if (res.ok && data.ok) {
      return { success: true };
    } else {
      const errorMsg = data.description || `HTTP ${res.status}: ${data.error_code || 'Telegram API Error'}`;
      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    const errorMsg = err.name === 'AbortError' ? 'Telegram API request timeout (8s)' : (err.message || 'Network connection failed');
    return { success: false, error: errorMsg };
  }
}

/**
 * Asynchronous Telegram Queue Processor with Exponential Backoff
 */
async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  try {
    const logs = dbService.getTelegramLogs();
    const pendingLogs = logs.filter(l => l.status === 'PENDING' || l.status === 'RETRYING');

    if (pendingLogs.length === 0) {
      isProcessingQueue = false;
      return;
    }

    const settings = dbService.getSettings();
    const botToken = process.env.TELEGRAM_BOT_TOKEN || settings.telegramBotToken || '';
    const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_GROUP_CHAT_ID || settings.telegramChatId || '';
    const isEnabled = process.env.TELEGRAM_NOTIFY_ENABLED !== undefined
      ? process.env.TELEGRAM_NOTIFY_ENABLED === 'true'
      : Boolean(settings.enableTelegramNotify);

    if (!isEnabled || !botToken || !chatId) {
      // Mark as failed if disabled or unconfigured
      for (const log of pendingLogs) {
        dbService.updateTelegramLog(log.id, {
          status: 'FAILED',
          failureReason: !isEnabled ? 'Telegram notifications are disabled in settings' : 'Telegram Bot Token or Group Chat ID not configured'
        });
      }
      isProcessingQueue = false;
      return;
    }

    for (const log of pendingLogs) {
      const result = await sendTelegramMessageToApi(
        botToken,
        chatId,
        log.message,
        log.buttons || []
      );

      if (result.success) {
        dbService.updateTelegramLog(log.id, {
          status: 'SUCCESS',
          deliveredAt: new Date().toISOString(),
          chatId
        });
      } else {
        const nextAttempt = log.retryCount + 1;
        if (nextAttempt < log.maxRetries) {
          dbService.updateTelegramLog(log.id, {
            status: 'RETRYING',
            retryCount: nextAttempt,
            failureReason: result.error
          });
          // Exponential backoff delay before retry
          await new Promise(r => setTimeout(r, Math.min(2000 * Math.pow(2, nextAttempt), 10000)));
        } else {
          dbService.updateTelegramLog(log.id, {
            status: 'FAILED',
            retryCount: nextAttempt,
            failureReason: result.error,
            chatId
          });
        }
      }
    }
  } catch (queueErr) {
    console.error('[TELEGRAM QUEUE ERROR]', queueErr);
  } finally {
    isProcessingQueue = false;
  }
}

export const notificationService = {
  /**
   * Central entry point for all application notifications
   */
  async notify(options: NotifyEventOptions, defaultAppUrl = 'http://localhost:3000') {
    try {
      const { type, title, triggeredBy = 'System', relatedRecordId, data = {} } = options;

      // 1. Dashboard Notification Integration
      let notifRole: UserRole = 'VOLUNTEER';
      if (type.includes('ADMIN') || type.includes('ROLE') || type.includes('SECURITY') || type.includes('BACKUP')) {
        notifRole = 'SUPER_ADMIN';
      }

      const formattedTitle = title || options.customMessage || type.replace(/_/g, ' ');
      const notifMessage = options.customMessage || 
        (data.patientName ? `${data.patientName} (${data.bloodGroup || ''})` :
        data.name ? `${data.name} (${data.bloodGroup || data.role || ''})` :
        `${formattedTitle} - ${triggeredBy}`);

      dbService.addNotification({
        type: type.includes('BLOOD_REQUEST') ? 'BLOOD_REQUEST' : type.includes('DONOR') ? 'DONOR_ALERT' : 'SYSTEM',
        title: formattedTitle,
        message: notifMessage,
        recipientRole: notifRole,
        linkUrl: data.requestNumber ? `/request-blood?req=${data.requestNumber}` : undefined
      });

      // 2. Activity Log / Audit Log Integration
      dbService.addAuditLog(
        triggeredBy,
        notifRole,
        type,
        `${formattedTitle}: ${notifMessage}`
      );

      // 3. Telegram Group Notification Queue
      const { messageText, buttons } = buildTelegramMessage(options, defaultAppUrl);

      const newLog = dbService.addTelegramLog({
        type: type as TelegramNotificationType,
        title: formattedTitle,
        message: messageText,
        triggeredBy,
        relatedRecordId,
        status: 'PENDING',
        retryCount: 0,
        maxRetries: 3,
        buttons
      });

      // Trigger queue processing asynchronously
      setImmediate(() => {
        processQueue().catch(err => console.error('[TELEGRAM PROCESS QUEUE ERROR]', err));
      });

      // 4. WhatsApp Cloud API Queue Integration
      try {
        const waRecipients = dbService.getWhatsappRecipients().filter(r => r.enabled);
        if (waRecipients.length > 0) {
          const waMessageText = buildWhatsAppMessage(options, defaultAppUrl);
          for (const recipient of waRecipients) {
            dbService.addWhatsappLog({
              type: type as any,
              title: formattedTitle,
              message: waMessageText,
              recipientPhone: recipient.phone,
              recipientName: recipient.name,
              triggeredBy,
              relatedRecordId,
              status: 'PENDING',
              retryCount: 0,
              maxRetries: 3
            });
          }
          setImmediate(() => {
            processWhatsAppQueue().catch(err => console.error('[WHATSAPP PROCESS QUEUE ERROR]', err));
          });
        }
      } catch (waErr) {
        console.error('[WHATSAPP QUEUE DISPATCH ERROR]', waErr);
      }

      return newLog;
    } catch (err) {
      console.error('[NOTIFICATION SERVICE ERROR] Main application preserved:', err);
    }
  },

  /**
   * Test Telegram connection directly
   */
  async testConnection(botToken: string, chatId: string, customMsg?: string, appUrl = 'http://localhost:3000') {
    const testMessage = `🧪 *PA NGSHA BLOOD DONORS ASSOCIATION*\n\n` +
      `✅ *Telegram Group Notification Connection Test*\n\n` +
      `*Status:* Success! Telegram Bot is successfully configured and connected to this Telegram Group.\n` +
      `*Timestamp:* ${formatDateTime(new Date().toISOString())}\n\n` +
      `_${customMsg || 'All future blood requests, donor updates, admin alerts, and system warnings will be delivered automatically here.'}_`;

    const buttons: TelegramInlineButton[] = [
      { text: '📋 Open Dashboard', url: appUrl },
      { text: '🩸 Request Blood', url: `${appUrl}/request-blood` }
    ];

    const result = await sendTelegramMessageToApi(botToken, chatId, testMessage, buttons);
    return result;
  },

  /**
   * Manually retry a specific failed Telegram notification
   */
  async retryFailedNotification(logId: string) {
    const log = dbService.getTelegramLogById(logId);
    if (!log) return { success: false, error: 'Notification log not found' };

    const settings = dbService.getSettings();
    const botToken = process.env.TELEGRAM_BOT_TOKEN || settings.telegramBotToken || '';
    const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_GROUP_CHAT_ID || settings.telegramChatId || '';

    if (!botToken || !chatId) {
      return { success: false, error: 'Telegram bot token or group chat ID missing' };
    }

    dbService.updateTelegramLog(logId, { status: 'RETRYING' });

    const result = await sendTelegramMessageToApi(
      botToken,
      chatId,
      log.message,
      log.buttons || []
    );

    if (result.success) {
      dbService.updateTelegramLog(logId, {
        status: 'SUCCESS',
        deliveredAt: new Date().toISOString(),
        chatId
      });
      return { success: true };
    } else {
      dbService.updateTelegramLog(logId, {
        status: 'FAILED',
        retryCount: log.retryCount + 1,
        failureReason: result.error
      });
      return { success: false, error: result.error };
    }
  },

  /**
   * Test WhatsApp Cloud API connection directly
   */
  async testWhatsAppConnection(
    accessToken: string,
    phoneNumberId: string,
    apiVersion: string,
    recipientPhone: string,
    customMsg?: string,
    appUrl = 'http://localhost:3000'
  ) {
    const testMessage = `🧪 *PANGSHA BLOOD DONORS ASSOCIATION*\n\n` +
      `✅ *WhatsApp Cloud API Connection Test*\n\n` +
      `Status:\nSuccess! Meta WhatsApp Cloud API is successfully configured and working.\n\n` +
      `Time:\n${formatDateTime(new Date().toISOString())}\n\n` +
      `Details:\n${customMsg || 'Blood requests, emergency alerts, status updates, and reminders will be delivered to authorized WhatsApp recipients.'}\n\n` +
      `Dashboard:\n${appUrl}`;

    const result = await sendWhatsAppMessageToApi(
      accessToken,
      phoneNumberId,
      apiVersion,
      recipientPhone,
      testMessage
    );
    return result;
  },

  /**
   * Manually retry a specific failed WhatsApp notification
   */
  async retryFailedWhatsAppNotification(logId: string) {
    const log = dbService.getWhatsappLogById(logId);
    if (!log) return { success: false, error: 'WhatsApp notification log not found' };

    const settings = dbService.getSettings();
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || settings.whatsappAccessToken || '';
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || settings.whatsappPhoneNumberId || '';
    const apiVersion = process.env.WHATSAPP_API_VERSION || settings.whatsappApiVersion || 'v20.0';

    if (!accessToken || !phoneNumberId) {
      return { success: false, error: 'WhatsApp Access Token or Phone Number ID missing' };
    }

    dbService.updateWhatsappLog(logId, { status: 'RETRYING' });

    const result = await sendWhatsAppMessageToApi(
      accessToken,
      phoneNumberId,
      apiVersion,
      log.recipientPhone,
      log.message
    );

    if (result.success) {
      dbService.updateWhatsappLog(logId, {
        status: 'SUCCESS',
        deliveredAt: new Date().toISOString(),
        waMessageId: result.waMessageId
      });
      return { success: true };
    } else {
      dbService.updateWhatsappLog(logId, {
        status: 'FAILED',
        retryCount: log.retryCount + 1,
        failureReason: result.error
      });
      return { success: false, error: result.error };
    }
  },

  /**
   * Periodic reminder for Pending Critical Blood Requests
   */
  async triggerCriticalReminders(defaultAppUrl = 'http://localhost:3000') {
    try {
      const requests = dbService.getBloodRequests();
      const pendingCritical = requests.filter(r => r.status === 'PENDING' && (r.priority === 'CRITICAL' || r.priority === 'URGENT'));

      if (pendingCritical.length === 0) return;

      const settings = dbService.getSettings();
      const intervalMinutes = settings.whatsappReminderIntervalMinutes || 30;
      const intervalMs = intervalMinutes * 60 * 1000;
      const now = Date.now();

      for (const req of pendingCritical) {
        const logs = dbService.getWhatsappLogs().filter(
          l => l.relatedRecordId === req.requestNumber && l.type === 'CRITICAL_BLOOD_REQUEST_REMINDER'
        );

        const lastSentTime = logs.length > 0 ? new Date(logs[0].createdAt).getTime() : 0;

        if (now - lastSentTime >= intervalMs) {
          await this.notify({
            type: 'CRITICAL_BLOOD_REQUEST_REMINDER',
            title: `⚠️ ক্রাফটিক্যাল রক্তের আবেদন রিমাইন্ডার (${req.bloodGroup})`,
            triggeredBy: 'অটো-সিস্টেম রিমাইন্ডার',
            relatedRecordId: req.requestNumber,
            data: req
          }, defaultAppUrl);
        }
      }
    } catch (err) {
      console.error('[CRITICAL REMINDER ERROR]', err);
    }
  }
};
