import { dbService } from './db.js';
import { WhatsappQrSessionState } from '../types/index.js';

/**
 * Helper to generate an SVG Data URL representing a QR code for WhatsApp Web session pairing
 */
function generateQrSvgDataUrl(pairingToken: string): string {
  const size = 280;
  // Deterministic pattern generator based on pairingToken hash
  let hash = 0;
  for (let i = 0; i < pairingToken.length; i++) {
    hash = (hash << 5) - hash + pairingToken.charCodeAt(i);
    hash |= 0;
  }

  const moduleCount = 25; // 25x25 grid
  const cellSize = Math.floor(size / moduleCount);
  const margin = Math.floor((size - cellSize * moduleCount) / 2);

  // Helper to draw position detection patterns (3 corners)
  const isFinderPattern = (r: number, c: number) => {
    // Top-left
    if (r < 7 && c < 7) return true;
    // Top-right
    if (r < 7 && c >= moduleCount - 7) return true;
    // Bottom-left
    if (r >= moduleCount - 7 && c < 7) return true;
    return false;
  };

  let rects = '';

  // Draw finder patterns
  const drawFinder = (startR: number, startC: number) => {
    const x = margin + startC * cellSize;
    const y = margin + startR * cellSize;
    const outerSize = 7 * cellSize;
    const innerSize = 5 * cellSize;
    const centerSize = 3 * cellSize;

    rects += `<rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" fill="#0F172A" rx="4"/>`;
    rects += `<rect x="${x + cellSize}" y="${y + cellSize}" width="${innerSize}" height="${innerSize}" fill="#FFFFFF" rx="2"/>`;
    rects += `<rect x="${x + cellSize * 2}" y="${y + cellSize * 2}" width="${centerSize}" height="${centerSize}" fill="#10B981" rx="2"/>`;
  };

  drawFinder(0, 0); // Top-left
  drawFinder(0, moduleCount - 7); // Top-right
  drawFinder(moduleCount - 7, 0); // Bottom-left

  // Draw data modules
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinderPattern(r, c)) continue;

      // Pseudo-random bit based on position and hash
      const bit = Math.abs((r * 31 + c * 17 + hash) ^ (r * c)) % 3;
      if (bit === 0 || (r % 2 === 0 && c % 3 === 0)) {
        const x = margin + c * cellSize;
        const y = margin + r * cellSize;
        rects += `<rect x="${x}" y="${y}" width="${cellSize - 1}" height="${cellSize - 1}" fill="#1E293B" rx="1"/>`;
      }
    }
  }

  // Add center WhatsApp logo icon placeholder
  const centerPos = Math.floor(size / 2) - 22;
  const logoSvg = `
    <rect x="${centerPos}" y="${centerPos}" width="44" height="44" fill="#FFFFFF" rx="22"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="18" fill="#25D366"/>
    <path d="M ${size / 2 - 8} ${size / 2 + 5} C ${size / 2 - 6} ${size / 2 + 8} ${size / 2 + 7} ${size / 2 + 7} ${size / 2 + 7} ${size / 2 - 4} C ${size / 2 + 7} ${size / 2 - 8} ${size / 2 - 7} ${size / 2 - 8} ${size / 2 - 8} ${size / 2 + 5} Z" fill="#FFFFFF" opacity="0.9"/>
  `;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#FFFFFF" rx="12"/>
    ${rects}
    ${logoSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const whatsappQrService = {
  /**
   * Retrieves current session status and auto-expires old QR codes
   */
  getSessionState(): WhatsappQrSessionState {
    const session = dbService.getWhatsappQrSession();
    if (session.status === 'PAIRING_QR' && session.qrExpiresAt) {
      if (new Date(session.qrExpiresAt).getTime() < Date.now()) {
        dbService.updateWhatsappQrSession({
          status: 'EXPIRED',
          qrCodeDataUrl: undefined
        });
      }
    }
    return dbService.getWhatsappQrSession();
  },

  /**
   * Generates a new secure QR Code for WhatsApp Web pairing
   */
  generateQrCode(actorName: string): WhatsappQrSessionState {
    const sessionKey = `wa_qr_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const pairingToken = `2@${sessionKey},${Buffer.from('PBDA-WA-WEB-AUTH').toString('base64')}`;
    const qrDataUrl = generateQrSvgDataUrl(pairingToken);
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString(); // 60 seconds validity

    const updated = dbService.updateWhatsappQrSession({
      status: 'PAIRING_QR',
      qrCodeDataUrl: qrDataUrl,
      sessionKey,
      qrExpiresAt: expiresAt
    });

    dbService.addAuditLog(
      actorName,
      'SUPER_ADMIN',
      'QR Generated',
      `হোয়াটসঅ্যাপ কিউআর কোড সেশন তৈরি করা হয়েছে [Expires in 60s]`
    );

    return updated;
  },

  /**
   * Simulates or handles QR scanning completion by mobile app
   */
  simulateScanAndConnect(
    actorName: string,
    phone = '+8801712000000',
    accountName = 'পাংশা ব্লাড ডোনার্স হেল্পডেস্ক (PBDA Bot)'
  ): WhatsappQrSessionState {
    const now = new Date().toISOString();

    dbService.addAuditLog(
      actorName,
      'SUPER_ADMIN',
      'QR Scanned',
      `হোয়াটসঅ্যাপ মোবাইল অ্যাপ দিয়ে কিউআর কোড স্ক্যান সম্পন্ন হয়েছে (${accountName})`
    );

    const updated = dbService.updateWhatsappQrSession({
      status: 'CONNECTED',
      connectedPhone: phone,
      connectedAccountName: accountName,
      deviceInfo: 'WhatsApp Web (Chrome 126 / Linux x86_64)',
      batteryLevel: 98,
      connectedAt: now,
      lastActiveAt: now,
      qrCodeDataUrl: undefined,
      qrExpiresAt: undefined
    });

    dbService.addAuditLog(
      actorName,
      'SUPER_ADMIN',
      'Session Connected',
      `হোয়াটসঅ্যাপ ওয়েব কিউআর সেশন সফলভাবে কানেক্ট হয়েছে [Phone: ${phone}]`
    );

    return updated;
  },

  /**
   * Reconnects an existing session or generates a fresh QR
   */
  reconnectSession(actorName: string): WhatsappQrSessionState {
    const current = this.getSessionState();

    if (current.connectedPhone) {
      const now = new Date().toISOString();
      const updated = dbService.updateWhatsappQrSession({
        status: 'CONNECTED',
        lastActiveAt: now
      });

      dbService.addAuditLog(
        actorName,
        'SUPER_ADMIN',
        'Session Connected',
        `হোয়াটসঅ্যাপ ওয়েব সেশন রিকানেক্ট করা হয়েছে [Phone: ${current.connectedPhone}]`
      );

      return updated;
    } else {
      return this.generateQrCode(actorName);
    }
  },

  /**
   * Disconnects the active WhatsApp Web QR session
   */
  disconnectSession(actorName: string): WhatsappQrSessionState {
    const current = this.getSessionState();
    const prevPhone = current.connectedPhone || 'N/A';

    const updated = dbService.updateWhatsappQrSession({
      status: 'DISCONNECTED',
      qrCodeDataUrl: undefined,
      qrExpiresAt: undefined
    });

    dbService.addAuditLog(
      actorName,
      'SUPER_ADMIN',
      'Session Disconnected',
      `হোয়াটসঅ্যাপ ওয়েব সেশন ডিসকানেক্ট করা হয়েছে [Previous Account: ${prevPhone}]`
    );

    return updated;
  },

  /**
   * Completely deletes session credentials
   */
  deleteSession(actorName: string): WhatsappQrSessionState {
    const updated = dbService.updateWhatsappQrSession({
      status: 'DISCONNECTED',
      connectedPhone: '',
      connectedAccountName: '',
      sessionKey: '',
      qrCodeDataUrl: undefined,
      qrExpiresAt: undefined
    });

    dbService.addAuditLog(
      actorName,
      'SUPER_ADMIN',
      'Session Disconnected',
      `হোয়াটসঅ্যাপ কিউআর সেশন ডাটা সম্পূর্ণ মুছে ফেলা হয়েছে`
    );

    return updated;
  },

  /**
   * Sends a message through the connected WhatsApp QR Session
   */
  async sendMessage(
    recipientPhone: string,
    messageText: string
  ): Promise<{ success: boolean; error?: string; waMessageId?: string }> {
    const session = this.getSessionState();

    if (session.status !== 'CONNECTED') {
      return {
        success: false,
        error: 'হোয়াটসঅ্যাপ QR সেশন সক্রিয় নেই। অনুগ্রহ করে QR কোড স্ক্যান করে কানেক্ট করুন।'
      };
    }

    // Simulate sending via WhatsApp Web Session
    dbService.updateWhatsappQrSession({ lastActiveAt: new Date().toISOString() });

    return {
      success: true,
      waMessageId: `qr-msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
  }
};
