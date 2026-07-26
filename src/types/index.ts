export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VOLUNTEER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

export type RequestPriority = 'NORMAL' | 'URGENT' | 'CRITICAL';

export type RequestStatus = 'PENDING' | 'SEARCHING' | 'MATCHED' | 'FULFILLED' | 'COMPLETED' | 'CANCELLED' | 'APPROVED';

export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'TEMP_UNAVAILABLE' | 'RESTRICTED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  active: boolean;
  status?: UserStatus;
  isDeleted?: boolean;
}

export interface AdminUser extends User {}

export interface DonationHistory {
  id: string;
  donorId: string;
  date: string;
  hospitalName: string;
  patientName?: string;
  bagsCount: number;
  location: string;
  notes?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface Donor {
  id: string;
  name: string;
  nameEn?: string;
  bloodGroup: BloodGroup;
  phone: string;
  whatsAppPhone?: string;
  alternativePhone?: string;
  email?: string;
  photoUrl?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string; // YYYY-MM-DD
  age: number; // Auto calculated or provided
  weightKg?: number;
  occupation?: string;
  division?: string;
  district: string;
  upazila: string;
  union: string;
  village: string;
  lastDonationDate?: string; // ISO YYYY-MM-DD
  totalDonations: number;
  isVerified: boolean;
  isAvailableOverride?: boolean;
  hemoglobinLevel?: string;
  bpNotes?: string;
  hasDiabetes?: boolean;
  hasHepatitis?: boolean;
  otherDiseases?: string;
  medicalNotes?: string;
  canDonate?: boolean;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  status: AvailabilityStatus;
  isDeleted?: boolean;
  deletedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BloodRequest {
  id: string;
  requestNumber?: string;
  patientName: string;
  bloodGroup: BloodGroup;
  bagsNeeded: number;
  hospitalName: string;
  requiredDate: string;
  requiredTime?: string;
  contactPerson: string;
  contactPhone: string;
  alternativePhone?: string;
  whatsAppNumber?: string;
  division?: string;
  district?: string;
  upazila: string;
  union?: string;
  exactAddress?: string;
  doctorName?: string;
  priority: RequestPriority;
  status: RequestStatus;
  diseaseOrReason?: string;
  medicalDocsUrl?: string;
  assignedDonors?: string[];
  fulfilledDate?: string;
  adminNotes?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  notes?: string;
}

export interface Campaign {
  id: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  location: string;
  upazila: string;
  date: string;
  time: string;
  bannerUrl?: string;
  targetBags?: number;
  collectedBags?: number;
  organizer: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  createdAt: string;
}

export type TelegramNotificationType =
  | 'NEW_BLOOD_REQUEST'
  | 'EMERGENCY_BLOOD_REQUEST'
  | 'BLOOD_REQUEST_STATUS_CHANGED'
  | 'NEW_DONOR_ADDED'
  | 'DONOR_UPDATED'
  | 'DONOR_DELETED'
  | 'DONOR_AVAILABILITY_CHANGED'
  | 'NEW_ADMIN_CREATED'
  | 'ADMIN_REMOVED'
  | 'ROLE_CHANGED'
  | 'DATABASE_BACKUP_COMPLETED'
  | 'SERVER_ERROR'
  | 'DATABASE_ERROR'
  | 'SECURITY_WARNING';

export interface TelegramInlineButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface TelegramNotificationLog {
  id: string;
  type: TelegramNotificationType;
  title: string;
  message: string;
  triggeredBy: string;
  relatedRecordId?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'RETRYING';
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  deliveredAt?: string;
  failureReason?: string;
  chatId?: string;
  buttons?: TelegramInlineButton[];
}

export interface TelegramDeliveryStats {
  totalSent: number;
  totalSuccess: number;
  totalFailed: number;
  totalPending: number;
  lastSuccessfulDelivery?: string;
  lastFailedDelivery?: string;
  lastFailureReason?: string;
  isConfigured: boolean;
  isEnabled: boolean;
}

export interface Notification {
  id: string;
  type: 'BLOOD_REQUEST' | 'CAMPAIGN' | 'DONOR_ALERT' | 'SYSTEM';
  title: string;
  message: string;
  recipientRole?: UserRole;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
}

export interface GalleryImage {
  id: string;
  titleBn: string;
  titleEn: string;
  imageUrl: string;
  category: 'CAMPAIGN' | 'DONATION' | 'AWARENESS' | 'EVENT';
  date: string;
}

export interface EmergencyContact {
  id: string;
  titleBn: string;
  titleEn: string;
  category: 'HOSPITAL' | 'AMBULANCE' | 'BLOOD_BANK' | 'ORGANIZATION_LEADER';
  phone: string;
  phoneSecondary?: string;
  location: string;
  isHotline?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  module?: string;
  details: string;
  actorName: string;
  actorRole: UserRole | 'SYSTEM' | 'GUEST';
  actorEmail?: string;
  targetRecordId?: string;
  targetRecordType?: string;
  oldValue?: Record<string, any> | string | null;
  newValue?: Record<string, any> | string | null;
  ipAddress?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  requestUrl?: string;
  status?: 'SUCCESS' | 'FAILED' | 'WARNING';
  timestamp: string;
  // Legacy alias support
  userName?: string;
  userId?: string;
}

export interface SystemSettings {
  // General Settings
  orgNameBn: string;
  orgNameEn: string;
  orgLogoUrl?: string;
  mottoBn: string;
  mottoEn: string;
  primaryPhone: string;
  emergencyHotline: string;
  email: string;
  supportEmail?: string;
  addressBn: string;
  addressEn: string;
  websiteUrl?: string;
  timezone?: string;
  language?: string;

  // Organization Settings
  defaultDistrict?: string;
  defaultUpazila?: string;
  emergencyContactName?: string;
  bloodRequestExpirationHours?: number;
  eligibilityIntervalDays: number;

  // Notification Provider Settings
  activeWhatsappProvider?: 'CLOUD_API' | 'QR_SESSION';
  activeTelegramProvider?: 'BOT';
  activeEmailProvider?: 'DISABLED' | 'SMTP';
  activeSmsProvider?: 'DISABLED' | 'SMS_GATEWAY';

  // Notification Settings
  enableDashboardNotify?: boolean;
  enableTelegramNotify: boolean;
  enableWhatsappNotify?: boolean;
  criticalReminderIntervalMinutes?: number;
  maxRetryAttempts?: number;

  // Telegram Settings
  telegramBotToken?: string;
  telegramChatId?: string;

  // WhatsApp Cloud API Configuration
  whatsappAccessToken?: string;
  whatsappPhoneNumberId?: string;
  whatsappBusinessAccountId?: string;
  whatsappApiVersion?: string;
  whatsappWebhookUrl?: string;
  whatsappReminderIntervalMinutes?: number;

  // Security Settings
  sessionTimeoutMinutes?: number;
  maxLoginAttempts?: number;
  passwordPolicy?: string;
  activityLogRetentionDays?: number;

  // Backup Settings
  enableAutoBackup?: boolean;
  backupSchedule?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  customScheduleCron?: string;
  backupRetentionPolicy?: 'KEEP_7' | 'KEEP_30' | 'KEEP_90' | 'CUSTOM';
  backupRetentionDays?: number;
  lastBackupTime?: string;
  nextScheduledBackup?: string;
  backupStorageLocation?: 'LOCAL_DISK' | 'CLOUD_VAULT';

  // System Information Metadata
  appVersion?: string;
  environment?: string;
  enablePublicRequestPosting?: boolean;
  helplinePhone?: string;
  emergencyAnnouncement?: string;
}

export interface DashboardStats {
  totalDonors: number;
  availableDonors: number;
  totalDonations: number;
  pendingRequests: number;
  criticalRequests: number;
  upcomingCampaigns: number;
  bloodGroupCounts: Record<BloodGroup, number>;
  unionCounts: Record<string, number>;
}

export interface ReportSummary {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  totalDonationsCollected: number;
  totalRequestsReceived: number;
  totalRequestsFulfilled: number;
  fulfillmentRatePercentage: number;
  topUnionsByDonors: Array<{ union: string; count: number }>;
}

export interface FullAnalyticsData {
  overview: {
    totalDonors: number;
    availableDonors: number;
    unavailableDonors: number;
    totalRequests: number;
    completedRequests: number;
    pendingRequests: number;
    cancelledRequests: number;
    totalVolunteers: number;
  };
  bloodGroupReport: Array<{
    bloodGroup: BloodGroup;
    totalDonors: number;
    available: number;
    unavailable: number;
    percentage: number;
  }>;
  locationReport: Array<{
    division: string;
    district: string;
    upazila: string;
    union: string;
    donorCount: number;
    availableCount: number;
  }>;
  donationReport: {
    todayDonations: number;
    weekDonations: number;
    monthDonations: number;
    yearDonations: number;
  };
  requestReport: Array<{
    status: string;
    label: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: {
    latestDonors: Donor[];
    latestRequests: BloodRequest[];
    latestDonations: DonationHistory[];
    latestAuditLogs: AuditLog[];
  };
  charts: {
    bloodGroupDistribution: Array<{ group: string; total: number; available: number; unavailable: number }>;
    donationTrend: Array<{ period: string; count: number }>;
    requestTrend: Array<{ period: string; count: number }>;
    monthlyRegistrationTrend: Array<{ month: string; count: number }>;
    locationDistribution: Array<{ name: string; count: number; available: number }>;
  };
}

// WhatsApp Notification System Types
export type WhatsappNotificationType =
  | 'NEW_BLOOD_REQUEST'
  | 'EMERGENCY_BLOOD_REQUEST'
  | 'BLOOD_REQUEST_STATUS_CHANGED'
  | 'CRITICAL_BLOOD_REQUEST_REMINDER';

export interface WhatsappRecipient {
  id: string;
  name: string;
  phone: string;
  role?: string;
  enabled: boolean;
  createdAt: string;
}

export interface WhatsappNotificationLog {
  id: string;
  type: WhatsappNotificationType;
  title: string;
  message: string;
  recipientPhone: string;
  recipientName?: string;
  triggeredBy: string;
  relatedRecordId?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'RETRYING';
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  deliveredAt?: string;
  failureReason?: string;
  waMessageId?: string;
}

export interface WhatsappDeliveryStats {
  totalSent: number;
  totalSuccess: number;
  totalFailed: number;
  totalPending: number;
  lastSuccessfulDelivery?: string;
  lastFailedDelivery?: string;
  lastFailureReason?: string;
  isConfigured: boolean;
  isEnabled: boolean;
  activeRecipientsCount: number;
}

export type WhatsappProviderType = 'CLOUD_API' | 'QR_SESSION';

export type WhatsappQrStatus = 'DISCONNECTED' | 'PAIRING_QR' | 'CONNECTED' | 'EXPIRED';

export interface WhatsappQrSessionState {
  status: WhatsappQrStatus;
  qrCodeDataUrl?: string;
  connectedPhone?: string;
  connectedAccountName?: string;
  deviceInfo?: string;
  batteryLevel?: number;
  connectedAt?: string;
  lastActiveAt?: string;
  sessionKey?: string;
  qrExpiresAt?: string;
}

// Backup & Restore System Types
export type BackupType =
  | 'FULL'
  | 'SETTINGS'
  | 'SYSTEM_CONFIG'
  | 'AUDIT_LOGS'
  | 'EXPORT_FILES'
  | 'FILE_STORAGE';

export type BackupMethod = 'MANUAL' | 'SCHEDULED' | 'AUTOMATIC';

export type BackupStatus = 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'RESTORED';

export interface BackupRecord {
  id: string;
  name: string;
  type: BackupType;
  method: BackupMethod;
  createdBy: string;
  createdByRole: UserRole | 'SYSTEM';
  createdAt: string;
  sizeBytes: number;
  sizeFormatted: string;
  status: BackupStatus;
  durationMs: number;
  storageLocation: string;
  recordCounts?: {
    donors?: number;
    bloodRequests?: number;
    campaigns?: number;
    adminUsers?: number;
    auditLogs?: number;
    donationHistories?: number;
    settings?: boolean;
    galleryImages?: number;
    emergencyContacts?: number;
  };
  checksumMd5?: string;
  appVersion?: string;
  payloadJson?: string;
  notes?: string;
}

export interface BackupIntegrityCheckResult {
  backupId: string;
  backupName: string;
  isValid: boolean;
  checksumMatch: boolean;
  dbVersionCompatible: boolean;
  appVersionCompatible: boolean;
  recordCountValid: boolean;
  totalRecordsChecked: number;
  verifiedAt: string;
  verifiedBy: string;
  message: string;
  details?: {
    checksum: string;
    appVersion: string;
    targetVersion: string;
    parsedCounts: Record<string, number>;
  };
}

export interface BackupSummaryStats {
  lastBackupTime?: string;
  nextScheduledBackup?: string;
  lastBackupStatus?: BackupStatus;
  lastBackupSize?: string;
  lastBackupType?: BackupType;
  lastBackupDurationMs?: number;
  storageLocation?: string;
  totalBackupsCount: number;
  totalStorageSizeBytes: number;
  totalStorageFormatted: string;
  autoBackupEnabled: boolean;
  scheduleFrequency: string;
  retentionPolicy: string;
}


