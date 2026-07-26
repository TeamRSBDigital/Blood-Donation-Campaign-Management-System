import { UserRole } from './index.js';

export type BroadcastType =
  | 'EMERGENCY_BLOOD_REQUEST'
  | 'GENERAL_ANNOUNCEMENT'
  | 'CAMPAIGN_UPDATE'
  | 'VOLUNTEER_NOTICE'
  | 'SYSTEM_NOTIFICATION'
  | 'CUSTOM_MESSAGE';

export type BroadcastPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type BroadcastChannel =
  | 'TELEGRAM_GROUP'
  | 'TELEGRAM_DIRECT'
  | 'WHATSAPP_CLOUD'
  | 'WHATSAPP_QR'
  | 'EMAIL'
  | 'SMS'
  | 'DASHBOARD_NOTIFICATION';

export type BroadcastStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface BroadcastTargetFilter {
  bloodGroups?: string[]; // e.g., ['A+', 'B+']
  district?: string;
  upazila?: string;
  union?: string;
  availabilityStatus?: string[]; // e.g. ['AVAILABLE', 'TEMP_UNAVAILABLE']
  verificationStatus?: string[]; // e.g. ['VERIFIED']
  gender?: string[]; // e.g. ['MALE', 'FEMALE']
  eligibilityFilter?: 'ALL' | 'ELIGIBLE_NOW' | 'ELIGIBLE_THIS_WEEK' | 'IN_COOLDOWN';
  lastDonationBefore?: string;
  minDonations?: number;
  maxDonations?: number;
  targetRoles?: string[]; // e.g. ['DONOR', 'VOLUNTEER', 'ADMIN']
  individualDonorIds?: string[]; // specific donors selected
}

export interface BroadcastRecipientStatus {
  recipientId: string;
  recipientName: string;
  phone?: string;
  role?: string;
  channel: BroadcastChannel;
  status: 'DELIVERED' | 'FAILED' | 'SKIPPED' | 'PENDING';
  errorDetails?: string;
  deliveredAt?: string;
}

export interface BroadcastCampaign {
  id: string;
  title: string;
  message: string;
  type: BroadcastType;
  priority: BroadcastPriority;
  channels: BroadcastChannel[];
  isEmergency: boolean;
  targetFilter: BroadcastTargetFilter;
  estimatedRecipientsCount: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  skippedCount: number;
  status: BroadcastStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdBy: string;
  creatorRole: UserRole;
  createdAt: string;
  updatedAt: string;
  linkUrl?: string;
  deliveryReport?: BroadcastRecipientStatus[];
}

export type MessageTemplateCategory = 'EMERGENCY' | 'THANK_YOU' | 'ANNOUNCEMENT' | 'MEETING' | 'DONATION_CAMP' | 'CUSTOM';

export interface MessageTemplate {
  id: string;
  name: string;
  category: MessageTemplateCategory;
  subject: string;
  body: string;
  defaultPriority: BroadcastPriority;
  defaultChannels: BroadcastChannel[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RecipientCalculationResult {
  totalMatchingDonors: number;
  totalMatchingUsers: number;
  totalUniqueRecipients: number;
  breakdownByBloodGroup: Record<string, number>;
  breakdownByDistrict: Record<string, number>;
  breakdownByAvailability: Record<string, number>;
  breakdownByVerification: Record<string, number>;
  matchingSample: Array<{ id: string; name: string; bloodGroup: string; phone: string; district: string; upazila: string }>;
}
