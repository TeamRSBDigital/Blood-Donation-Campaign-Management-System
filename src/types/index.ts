export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VOLUNTEER';

export type RequestPriority = 'NORMAL' | 'URGENT' | 'CRITICAL';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'FULFILLED' | 'CANCELLED';

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
  patientName: string;
  bloodGroup: BloodGroup;
  bagsNeeded: number;
  hospitalName: string;
  upazila: string;
  union?: string;
  requiredDate: string;
  requiredTime?: string;
  contactPerson: string;
  contactPhone: string;
  alternativePhone?: string;
  priority: RequestPriority;
  status: RequestStatus;
  diseaseOrReason: string;
  medicalDocsUrl?: string;
  assignedDonors?: string[];
  fulfilledDate?: string;
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
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SystemSettings {
  orgNameBn: string;
  orgNameEn: string;
  mottoBn: string;
  mottoEn: string;
  primaryPhone: string;
  emergencyHotline: string;
  email: string;
  addressBn: string;
  addressEn: string;
  eligibilityIntervalDays: number;
  telegramBotToken?: string;
  telegramChatId?: string;
  whatsappWebhookUrl?: string;
  enableTelegramNotify: boolean;
  enablePublicRequestPosting: boolean;
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
