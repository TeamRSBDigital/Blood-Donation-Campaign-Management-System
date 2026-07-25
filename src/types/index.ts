export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VOLUNTEER';

export type RequestPriority = 'NORMAL' | 'URGENT' | 'CRITICAL';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'FULFILLED' | 'CANCELLED';

export type AvailabilityStatus = 'AVAILABLE' | 'RESTRICTED' | 'UNAVAILABLE';

export interface AdminUser {
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
  alternativePhone?: string;
  email?: string;
  photoUrl?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  weightKg?: number;
  district: string;
  upazila: string;
  union: string;
  village: string;
  lastDonationDate?: string; // ISO format string YYYY-MM-DD
  totalDonations: number;
  isVerified: boolean;
  isAvailableOverride?: boolean; // Admin can manually set off
  hemoglobinLevel?: string;
  bpNotes?: string;
  medicalNotes?: string;
  status: AvailabilityStatus;
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
  assignedDonors?: string[]; // donor IDs
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
  eligibilityIntervalDays: number; // default 90 days
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
