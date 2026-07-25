import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  Donor,
  BloodRequest,
  Campaign,
  AdminUser,
  AuditLog,
  SystemSettings,
  GalleryImage,
  EmergencyContact,
  DonationHistory,
  AvailabilityStatus,
  Notification
} from '../types/index.js';

const DATA_FILE_PATH = path.join(process.cwd(), 'pbda_data.json');

interface DatabaseSchema {
  donors: Donor[];
  bloodRequests: BloodRequest[];
  campaigns: Campaign[];
  adminUsers: AdminUser[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  galleryImages: GalleryImage[];
  emergencyContacts: EmergencyContact[];
  donationHistories: DonationHistory[];
  notifications: Notification[];
}

// Initial Admin Passwords (Hashed during seed initialization if string matches raw)
const DEFAULT_SUPERADMIN_PASSWORD_HASH = bcrypt.hashSync('superadmin123', 10);
const DEFAULT_ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);
const DEFAULT_VOLUNTEER_PASSWORD_HASH = bcrypt.hashSync('volunteer123', 10);

// Helper to calculate donor status based on last donation date (90 days interval)
export function calculateDonorStatus(lastDonationDate?: string, intervalDays = 90): AvailabilityStatus {
  if (!lastDonationDate) return 'AVAILABLE';
  
  const lastDate = new Date(lastDonationDate);
  if (isNaN(lastDate.getTime())) return 'AVAILABLE';

  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= intervalDays) {
    return 'AVAILABLE';
  } else {
    return 'RESTRICTED';
  }
}

const SEED_DATA: DatabaseSchema = {
  settings: {
    orgNameBn: 'পাংশা ব্লাড ডোনার্স এসোসিয়েশন',
    orgNameEn: 'Pangsha Blood Donors Association',
    mottoBn: 'রক্ত দিন, জীবন বাঁচান - মানব সেবায় আমরা সদা প্রস্তুত',
    mottoEn: 'Donate Blood, Save Lives - Ready to Serve Humanity',
    primaryPhone: '+8801712000000',
    emergencyHotline: '+8801812999888',
    email: 'info@pbdabangladesh.org',
    addressBn: 'পাংশা মডেল থানা রোড, পাংশা পৌরসভা, রাজবাড়ী',
    addressEn: 'Pangsha Model Thana Road, Pangsha Pourashava, Rajbari',
    eligibilityIntervalDays: 90,
    enableTelegramNotify: true,
    enablePublicRequestPosting: true,
    telegramBotToken: '',
    telegramChatId: ''
  },
  adminUsers: [
    {
      id: 'admin-1',
      name: 'ড. মো: তানভীর আহমেদ',
      email: 'superadmin@pbda.org',
      phone: '01712345678',
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=250&q=80',
      createdAt: '2025-01-01T00:00:00.000Z',
      active: true
    },
    {
      id: 'admin-2',
      name: 'মোঃ মেহেদী হাসান (এডমিন)',
      email: 'admin@pbda.org',
      phone: '01812345678',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
      createdAt: '2025-01-15T00:00:00.000Z',
      active: true
    },
    {
      id: 'admin-3',
      name: 'মোছা: শারমীন আক্তার (ভলান্টিয়ার)',
      email: 'volunteer@pbda.org',
      phone: '01912345678',
      role: 'VOLUNTEER',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      createdAt: '2025-02-01T00:00:00.000Z',
      active: true
    }
  ],
  donors: [
    {
      id: 'dn-101',
      name: 'মোঃ হাফিজুর রহমান',
      nameEn: 'Hafizur Rahman',
      bloodGroup: 'B+',
      phone: '01711223344',
      alternativePhone: '01811223344',
      gender: 'MALE',
      age: 26,
      weightKg: 68,
      district: 'Rajbari',
      upazila: 'Pangsha',
      union: 'পাংশা পৌরসভা',
      village: 'কুঠিপাড়া',
      lastDonationDate: '2025-11-10', // over 90 days ago -> Available
      totalDonations: 7,
      isVerified: true,
      status: 'AVAILABLE',
      hemoglobinLevel: '14.2 g/dL',
      bpNotes: '120/80 mmHg',
      medicalNotes: 'নিয়মিত রক্তদাতা, শারীরিক সুস্থতা চমৎকার',
      createdAt: '2025-01-10T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z'
    },
    {
      id: 'dn-102',
      name: 'এস এম আশরাফুল আলম',
      nameEn: 'SM Ashraful Alam',
      bloodGroup: 'O+',
      phone: '01722334455',
      gender: 'MALE',
      age: 29,
      weightKg: 72,
      district: 'Rajbari',
      upazila: 'Pangsha',
      union: 'হাবাসপুর',
      village: 'হাবাসপুর বাজার',
      lastDonationDate: '2026-01-05', // recently donated -> Restricted until April
      totalDonations: 12,
      isVerified: true,
      status: 'RESTRICTED',
      hemoglobinLevel: '13.8 g/dL',
      bpNotes: '118/78 mmHg',
      medicalNotes: 'হাবাসপুর ইউনিয়নের ব্লাড টিম কোঅর্ডিনেটর',
      createdAt: '2025-01-12T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z'
    },
    {
      id: 'dn-103',
      name: 'মোছা: ফারজানা পারভীন',
      nameEn: 'Farzana Parvin',
      bloodGroup: 'A+',
      phone: '01833445566',
      gender: 'FEMALE',
      age: 23,
      weightKg: 54,
      district: 'Rajbari',
      upazila: 'Pangsha',
      union: 'মৌরাট',
      village: 'মৌরাট উত্তরপাড়া',
      lastDonationDate: '2025-10-15',
      totalDonations: 4,
      isVerified: true,
      status: 'AVAILABLE',
      hemoglobinLevel: '12.6 g/dL',
      bpNotes: '110/70 mmHg',
      medicalNotes: 'পাংশা সরকারি কলেজ ছাত্রী',
      createdAt: '2025-02-01T00:00:00.000Z',
      updatedAt: '2026-02-15T00:00:00.000Z'
    },
    {
      id: 'dn-104',
      name: 'কাজী আরিফুল ইসলাম',
      nameEn: 'Kazi Ariful Islam',
      bloodGroup: 'AB+',
      phone: '01944556677',
      gender: 'MALE',
      age: 31,
      weightKg: 75,
      district: 'Rajbari',
      upazila: 'Pangsha',
      union: 'বাহাদুরপুর',
      village: 'সেনগ্রাম',
      lastDonationDate: '2025-09-20',
      totalDonations: 9,
      isVerified: true,
      status: 'AVAILABLE',
      hemoglobinLevel: '14.5 g/dL',
      createdAt: '2025-02-10T00:00:00.000Z',
      updatedAt: '2026-01-10T00:00:00.000Z'
    },
    {
      id: 'dn-105',
      name: 'মোঃ সাইফুর রহমান রনি',
      nameEn: 'Saifur Rahman Roni',
      bloodGroup: 'O-', // Rare group
      phone: '01755667788',
      gender: 'MALE',
      age: 27,
      weightKg: 65,
      district: 'Rajbari',
      upazila: 'Pangsha',
      union: 'যশাই',
      village: 'যশাই দক্ষিণপাড়া',
      lastDonationDate: '2025-12-01',
      totalDonations: 6,
      isVerified: true,
      status: 'AVAILABLE',
      hemoglobinLevel: '13.9 g/dL',
      medicalNotes: 'রেয়ার ব্লাড গ্রুপ (O Negative) ডোনার ক্লাব সদস্য',
      createdAt: '2025-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z'
    },
    {
      id: 'dn-106',
      name: 'মোঃ তারিকুল ইসলাম',
      nameEn: 'Tarikul Islam',
      bloodGroup: 'B-',
      phone: '01866778899',
      gender: 'MALE',
      age: 28,
      weightKg: 70,
      district: 'Rajbari',
      upazila: 'Pangsha',
      union: 'বাবুপাড়া',
      village: 'বাবুপাড়া পূর্বপাড়া',
      lastDonationDate: '2025-08-10',
      totalDonations: 5,
      isVerified: true,
      status: 'AVAILABLE',
      hemoglobinLevel: '14.0 g/dL',
      createdAt: '2025-03-15T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z'
    },
    {
      id: 'dn-107',
      name: 'নাসরিন সু his সঙ্গীতা',
      nameEn: 'Nasrin Sangeeta',
      bloodGroup: 'A-',
      phone: '01977889900',
      gender: 'FEMALE',
      age: 24,
      weightKg: 52,
      district: 'Rajbari',
      upazila: 'Pangsha',
      union: 'মাছপাড়া',
      village: 'মাছপাড়া বাজার',
      lastDonationDate: '2025-11-28',
      totalDonations: 3,
      isVerified: true,
      status: 'AVAILABLE',
      hemoglobinLevel: '12.8 g/dL',
      createdAt: '2025-04-01T00:00:00.000Z',
      updatedAt: '2026-01-20T00:00:00.000Z'
    },
    {
      id: 'dn-108',
      name: 'মোঃ রেজোয়ান করিম',
      nameEn: 'Rezwan Karim',
      bloodGroup: 'AB-',
      phone: '01788990011',
      gender: 'MALE',
      age: 33,
      weightKg: 80,
      district: 'Rajbari',
      upazila: 'Pangsha',
      union: 'পাট্টা',
      village: 'পাট্টা মধ্যপাড়া',
      lastDonationDate: '2025-07-04',
      totalDonations: 11,
      isVerified: true,
      status: 'AVAILABLE',
      hemoglobinLevel: '15.1 g/dL',
      createdAt: '2025-04-10T00:00:00.000Z',
      updatedAt: '2026-02-10T00:00:00.000Z'
    },
    {
      id: 'dn-109',
      name: 'মোঃ শামীম হোসেন',
      nameEn: 'Shamim Hossain',
      bloodGroup: 'B+',
      phone: '01899001122',
      gender: 'MALE',
      age: 25,
      weightKg: 66,
      district: 'Rajbari',
      upazila: 'Pangsha',
      union: 'কসবা মাঝাইল',
      village: 'কসবা মোড়',
      lastDonationDate: '2025-10-10',
      totalDonations: 8,
      isVerified: true,
      status: 'AVAILABLE',
      hemoglobinLevel: '13.7 g/dL',
      createdAt: '2025-05-01T00:00:00.000Z',
      updatedAt: '2026-01-05T00:00:00.000Z'
    },
    {
      id: 'dn-110',
      name: 'শেখ রিয়াদ হাসান',
      nameEn: 'Sheikh Riyad Hasan',
      bloodGroup: 'O+',
      phone: '01900112233',
      gender: 'MALE',
      age: 22,
      weightKg: 62,
      district: 'Rajbari',
      upazila: 'Pangsha',
      union: 'সরিষা',
      village: 'সরিষা হাইস্কুল রোড',
      lastDonationDate: '2026-02-15', // recently donated -> Restricted
      totalDonations: 2,
      isVerified: true,
      status: 'RESTRICTED',
      hemoglobinLevel: '13.5 g/dL',
      createdAt: '2025-06-01T00:00:00.000Z',
      updatedAt: '2026-02-15T00:00:00.000Z'
    }
  ],
  donationHistories: [
    {
      id: 'dh-1',
      donorId: 'dn-101',
      date: '2025-11-10',
      hospitalName: 'পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স',
      patientName: 'রহিমা বেগম (গর্ভবতী মা)',
      bagsCount: 1,
      location: 'পাংশা',
      notes: 'জরুরী সিজারিয়ান সেকশন অপারেশন',
      verifiedBy: 'ড. মো: তানভীর আহমেদ',
      createdAt: '2025-11-10T14:30:00.000Z'
    },
    {
      id: 'dh-2',
      donorId: 'dn-102',
      date: '2026-01-05',
      hospitalName: 'রাজবাড়ী সদর হাসপাতাল',
      patientName: 'মোঃ শফিকুল ইসলাম (সড়ক দুর্ঘটনা)',
      bagsCount: 1,
      location: 'রাজবাড়ী সদর',
      notes: 'জরুরী সার্জারি রক্তদান',
      verifiedBy: 'মোঃ মেহেদী হাসান',
      createdAt: '2026-01-05T10:15:00.000Z'
    }
  ],
  bloodRequests: [
    {
      id: 'req-201',
      patientName: 'মোছা: আমেনা বেগম (৪৮)',
      bloodGroup: 'O-',
      bagsNeeded: 2,
      hospitalName: 'পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স, পাংশা, রাজবাড়ী',
      upazila: 'পাংশা',
      union: 'পাংশা পৌরসভা',
      requiredDate: '2026-07-26',
      requiredTime: 'সকাল ১০:০০ টা',
      contactPerson: 'মোঃ জলিল শেখ (রোগীর ছেলে)',
      contactPhone: '01719887766',
      alternativePhone: '01819887766',
      priority: 'CRITICAL',
      status: 'PENDING',
      diseaseOrReason: 'তীব্র রক্তশূন্যতা ও হিমোগ্লোবিন কমে যাওয়া (জরুরী রক্তের প্রয়োজন)',
      createdAt: '2026-07-25T08:00:00.000Z',
      notes: 'রোগীর অবস্থা আশঙ্কাজনক। ও নেগেটিভ রক্তদাতার দ্রুত সহায়তা কাম্য।'
    },
    {
      id: 'req-202',
      patientName: 'মোঃ আলিউজ্জামান (৫৫)',
      bloodGroup: 'B+',
      bagsNeeded: 1,
      hospitalName: 'রাজবাড়ী সদর হাসপাতাল, রাজবাড়ী',
      upazila: 'রাজবাড়ী সদর',
      union: 'রাজবাড়ী পৌরসভা',
      requiredDate: '2026-07-27',
      requiredTime: 'দুপুর ১২:০০ টা',
      contactPerson: 'কামরুল হাসান',
      contactPhone: '01912998877',
      priority: 'URGENT',
      status: 'APPROVED',
      diseaseOrReason: 'পিত্তথলির পাথর অপারেশন (Cholecystectomy Surgery)',
      createdAt: '2026-07-24T14:20:00.000Z'
    },
    {
      id: 'req-203',
      patientName: 'শিশু মাহিন (৬)',
      bloodGroup: 'A+',
      bagsNeeded: 1,
      hospitalName: 'ফরিদা ক্লিনিক অ্যান্ড নার্সিং হোম, পাংশা',
      upazila: 'পাংশা',
      union: 'পাংশা পৌরসভা',
      requiredDate: '2026-07-25',
      requiredTime: 'বিকাল ৪:০০ টা',
      contactPerson: 'রাসেল খান (পিতা)',
      contactPhone: '01815667788',
      priority: 'NORMAL',
      status: 'FULFILLED',
      fulfilledDate: '2026-07-25T16:00:00.000Z',
      diseaseOrReason: 'থ্যালাসেমিয়া নিয়মিত রক্তদান',
      createdAt: '2026-07-24T09:00:00.000Z'
    }
  ],
  campaigns: [
    {
      id: 'camp-1',
      titleBn: 'পাংশা পাইলট উচ্চ বিদ্যালয়ে বিনামূল্যে ব্লাড গ্রুপিং ও সচেতনতা ক্যাম্প',
      titleEn: 'Free Blood Grouping Camp at Pangsha Pilot High School',
      descriptionBn: 'শিক্ষার্থীদের মধ্যে রক্তদানের প্রয়োজনীয়তা ছড়িয়ে দিতে এবং রক্তের গ্রুপ ফ্রিতে নির্ণয় করে ডাটাবেজে অন্তর্ভুক্তির লক্ষ্যে বিশেষ ক্যাম্পেইন।',
      descriptionEn: 'Awareness drive and free blood grouping camp for students and young youth in Pangsha.',
      location: 'পাংশা পাইলট উচ্চ বিদ্যালয় প্রাঙ্গণ, পাংশা',
      upazila: 'পাংশা',
      date: '2026-08-15',
      time: 'সকাল ৯:০০ - বিকাল ৪:০০',
      bannerUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80',
      targetBags: 50,
      collectedBags: 0,
      organizer: 'পাংশা ব্লাড ডোনার্স এসোসিয়েশন',
      status: 'UPCOMING',
      createdAt: '2026-07-01T00:00:00.000Z'
    },
    {
      id: 'camp-2',
      titleBn: 'হাবাসপুর ইউনিয়ন স্বেচ্ছায় রক্তদান অভিযান ২০২৬',
      titleEn: 'Habaspur Union Voluntary Blood Drive 2026',
      descriptionBn: 'হাবাসপুর বাজারে স্থানীয় তরুণদের উদ্বুদ্ধকরণ ও রক্তদান কর্মসূচির মাধ্যমে ৩০ ব্যাগ রক্ত সংগ্রহের লক্ষ্যমাত্রা।',
      descriptionEn: 'Local youth mobilization and blood collection campaign in Habaspur Union.',
      location: 'হাবাসপুর ইউনিয়ন পরিষদ হলরুম',
      upazila: 'পাংশা',
      date: '2026-06-20',
      time: 'সকাল ১০:০০ - দুপুর ২:০০',
      bannerUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
      targetBags: 30,
      collectedBags: 32,
      organizer: 'পিবিডিএ হাবাসপুর শাখা',
      status: 'COMPLETED',
      createdAt: '2026-06-01T00:00:00.000Z'
    }
  ],
  galleryImages: [
    {
      id: 'img-1',
      titleBn: 'পাংশায় মহান স্বাধীনতা দিবসে স্বেচ্ছায় রক্তদান শিবির',
      titleEn: 'Voluntary Blood Camp on Independence Day at Pangsha',
      imageUrl: 'https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?auto=format&fit=crop&w=800&q=80',
      category: 'CAMPAIGN',
      date: '2026-03-26'
    },
    {
      id: 'img-2',
      titleBn: 'পাংশা সরকারি কলেজে রক্তদানে তরুণদের উৎসাহিতকরণ র্যালি',
      titleEn: 'Blood Donation Awareness Rally at Pangsha Government College',
      imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
      category: 'AWARENESS',
      date: '2026-02-14'
    },
    {
      id: 'img-3',
      titleBn: 'রেয়ার ও-নেগেটিভ রক্তদাতাদের বিশেষ সম্মাননা প্রদান',
      titleEn: 'Honoring Rare O-Negative Donors at Pangsha',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      category: 'EVENT',
      date: '2026-01-10'
    }
  ],
  emergencyContacts: [
    {
      id: 'ec-1',
      titleBn: 'পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স (জরুরী বিভাগ)',
      titleEn: 'Pangsha Upazila Health Complex (Emergency)',
      category: 'HOSPITAL',
      phone: '01730324500',
      phoneSecondary: '01711000011',
      location: 'পাংশা হাসপাতাল রোড, পাংশা, রাজবাড়ী',
      isHotline: true
    },
    {
      id: 'ec-2',
      titleBn: 'রাজবাড়ী সদর হাসপাতাল ব্লাড ব্যাংক',
      titleEn: 'Rajbari Sadar Hospital Blood Bank',
      category: 'BLOOD_BANK',
      phone: '01715443322',
      location: 'হাসপাসাল রোড, রাজবাড়ী সদর',
      isHotline: true
    },
    {
      id: 'ec-3',
      titleBn: 'পাংশা রেড ক্রিসেন্ট এ্যাম্বুলেন্স সার্ভিস',
      titleEn: 'Pangsha Red Crescent Ambulance',
      category: 'AMBULANCE',
      phone: '01712990088',
      location: 'পাংশা পৌরসভা',
      isHotline: true
    },
    {
      id: 'ec-4',
      titleBn: 'পিবিডিএ ২৪/৭ জরুরী ব্লাড হটলাইন',
      titleEn: 'PBDA 24/7 Emergency Helpline',
      category: 'ORGANIZATION_LEADER',
      phone: '01812999888',
      phoneSecondary: '01712000000',
      location: 'পাংশা মডেল থানা রোড, রাজবাড়ী',
      isHotline: true
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      actorName: 'ড. মো: তানভীর আহমেদ',
      actorRole: 'SUPER_ADMIN',
      action: 'SYSTEM_INIT',
      details: 'পাংশা ব্লাড ডোনার্স এসোসিয়েশন ডাটাবেজ সিস্টেম চালু করা হয়েছে।',
      timestamp: '2026-07-25T10:00:00.000Z'
    }
  ],
  notifications: []
};

// Database state in memory, synced to disk
let db: DatabaseSchema = loadDatabase();

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const dataStr = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const loaded = JSON.parse(dataStr);
      loaded.notifications = loaded.notifications || [];
      return loaded;
    }
  } catch (err) {
    console.error('Error loading PBDA DB from file, re-initializing seed:', err);
  }
  // If file doesn't exist, write seed data
  saveDatabase(SEED_DATA);
  return SEED_DATA;
}

export function saveDatabase(dataToSave?: DatabaseSchema) {
  try {
    const data = dataToSave || db;
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save PBDA database file:', err);
  }
}

// Database helper functions
export const dbService = {
  getSettings(): SystemSettings {
    return db.settings;
  },

  updateSettings(newSettings: Partial<SystemSettings>, actorName: string): SystemSettings {
    db.settings = { ...db.settings, ...newSettings };
    saveDatabase();
    this.addAuditLog(actorName, 'SUPER_ADMIN', 'UPDATE_SETTINGS', 'সিস্টেম সেটিংস হালনাগাদ করা হয়েছে।');
    return db.settings;
  },

  // Donors CRUD
  getDonors(filter?: {
    bloodGroup?: string;
    union?: string;
    upazila?: string;
    district?: string;
    gender?: string;
    status?: string;
    searchQuery?: string;
    availableOnly?: boolean;
    showTrash?: boolean;
  }): Donor[] {
    let list = [...db.donors];

    // Soft delete filter
    if (filter?.showTrash) {
      list = list.filter(d => d.isDeleted === true);
    } else {
      list = list.filter(d => !d.isDeleted);
    }

    // Re-verify donor availability status dynamically
    list = list.map(d => {
      let finalStatus: AvailabilityStatus = d.status || 'AVAILABLE';
      if (d.canDonate === false) {
        finalStatus = 'RESTRICTED';
      } else if (d.isAvailableOverride === false) {
        finalStatus = 'RESTRICTED';
      } else if (d.status === 'UNAVAILABLE' || d.status === 'TEMP_UNAVAILABLE') {
        finalStatus = d.status;
      } else {
        finalStatus = calculateDonorStatus(d.lastDonationDate, db.settings.eligibilityIntervalDays);
      }
      return {
        ...d,
        status: finalStatus
      };
    });

    if (filter?.bloodGroup && filter.bloodGroup !== 'ALL') {
      list = list.filter(d => d.bloodGroup === filter.bloodGroup);
    }

    if (filter?.union && filter.union !== 'ALL') {
      list = list.filter(d => d.union === filter.union);
    }

    if (filter?.upazila && filter.upazila !== 'ALL') {
      list = list.filter(d => d.upazila.toLowerCase() === filter.upazila.toLowerCase());
    }

    if (filter?.district && filter.district !== 'ALL') {
      list = list.filter(d => d.district.toLowerCase() === filter.district.toLowerCase());
    }

    if (filter?.gender && filter.gender !== 'ALL') {
      list = list.filter(d => d.gender === filter.gender);
    }

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter(d => d.status === filter.status);
    }

    if (filter?.availableOnly) {
      list = list.filter(d => d.status === 'AVAILABLE');
    }

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase().trim();
      list = list.filter(d => 
        d.name.toLowerCase().includes(q) ||
        (d.nameEn && d.nameEn.toLowerCase().includes(q)) ||
        d.phone.includes(q) ||
        (d.whatsAppPhone && d.whatsAppPhone.includes(q)) ||
        d.bloodGroup.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q) ||
        d.upazila.toLowerCase().includes(q) ||
        d.union.toLowerCase().includes(q) ||
        d.village.toLowerCase().includes(q)
      );
    }

    // Sort in exact order:
    // 1. Available donors first
    // 2. Oldest Last Donation Date first
    // 3. Verified donors first
    // 4. Recently Updated
    list.sort((a, b) => {
      // 1. Available donors first
      if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
      if (a.status !== 'AVAILABLE' && b.status === 'AVAILABLE') return 1;

      // 2. Oldest Last Donation Date first (empty/null date treated as oldest)
      const dateA = a.lastDonationDate || '';
      const dateB = b.lastDonationDate || '';
      if (dateA !== dateB) {
        if (!dateA) return -1;
        if (!dateB) return 1;
        const comp = dateA.localeCompare(dateB);
        if (comp !== 0) return comp;
      }

      // 3. Verified donors first
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;

      // 4. Recently Updated (descending)
      const updateA = a.updatedAt || '';
      const updateB = b.updatedAt || '';
      return updateB.localeCompare(updateA);
    });

    return list;
  },

  getDonorById(id: string): Donor | undefined {
    const d = db.donors.find(item => item.id === id);
    if (!d) return undefined;
    let finalStatus: AvailabilityStatus = d.status || 'AVAILABLE';
    if (d.canDonate === false) {
      finalStatus = 'RESTRICTED';
    } else if (d.isAvailableOverride === false) {
      finalStatus = 'RESTRICTED';
    } else if (d.status === 'UNAVAILABLE' || d.status === 'TEMP_UNAVAILABLE') {
      finalStatus = d.status;
    } else {
      finalStatus = calculateDonorStatus(d.lastDonationDate, db.settings.eligibilityIntervalDays);
    }
    return {
      ...d,
      status: finalStatus
    };
  },

  checkDuplicatePhone(phone: string, excludeId?: string): boolean {
    const cleanPhone = phone.trim();
    if (!cleanPhone) return false;
    return db.donors.some(d => !d.isDeleted && d.phone.trim() === cleanPhone && d.id !== excludeId);
  },

  addDonor(donorData: Omit<Donor, 'id' | 'createdAt' | 'updatedAt' | 'totalDonations'> & { status?: AvailabilityStatus }, actorName?: string): Donor {
    const newId = `dn-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const calculatedStatus = calculateDonorStatus(donorData.lastDonationDate, db.settings.eligibilityIntervalDays);

    const newDonor: Donor = {
      ...donorData,
      id: newId,
      totalDonations: donorData.lastDonationDate ? 1 : 0,
      status: donorData.canDonate === false ? 'RESTRICTED' : calculatedStatus,
      isVerified: donorData.isVerified ?? true,
      createdBy: actorName || donorData.createdBy || 'SYSTEM',
      createdAt: now,
      updatedAt: now,
    };

    db.donors.unshift(newDonor);
    saveDatabase();

    if (actorName) {
      this.addAuditLog(actorName, 'ADMIN', 'ADD_DONOR', `নতুন রক্তদাতা যোগ করা হয়েছে: ${newDonor.name} (${newDonor.bloodGroup})`);
    }

    return newDonor;
  },

  updateDonor(id: string, updateData: Partial<Donor>, actorName?: string): Donor | undefined {
    const index = db.donors.findIndex(d => d.id === id);
    if (index === -1) return undefined;

    const existing = db.donors[index];
    const now = new Date().toISOString();

    const updated: Donor = {
      ...existing,
      ...updateData,
      updatedAt: now,
    };

    if (updated.canDonate === false) {
      updated.status = 'RESTRICTED';
    } else if (updated.isAvailableOverride === false) {
      updated.status = 'RESTRICTED';
    } else if (updated.status === 'UNAVAILABLE' || updated.status === 'TEMP_UNAVAILABLE') {
      // keep custom status
    } else {
      updated.status = calculateDonorStatus(updated.lastDonationDate, db.settings.eligibilityIntervalDays);
    }

    db.donors[index] = updated;
    saveDatabase();

    if (actorName) {
      this.addAuditLog(actorName, 'ADMIN', 'UPDATE_DONOR', `রক্তদাতার তথ্য এডিট করা হয়েছে: ${updated.name}`);
    }

    return updated;
  },

  deleteDonor(id: string, actorName?: string, permanent = false): boolean {
    const index = db.donors.findIndex(d => d.id === id);
    if (index === -1) return false;

    const donorName = db.donors[index].name;

    if (permanent) {
      db.donors.splice(index, 1);
      if (actorName) {
        this.addAuditLog(actorName, 'ADMIN', 'PERMANENT_DELETE_DONOR', `রক্তদাতা স্থায়ীভাবে মুছে ফেলা হয়েছে: ${donorName} (ID: ${id})`);
      }
    } else {
      db.donors[index].isDeleted = true;
      db.donors[index].deletedAt = new Date().toISOString();
      if (actorName) {
        this.addAuditLog(actorName, 'ADMIN', 'SOFT_DELETE_DONOR', `রক্তদাতা সফট ডিলিট ট্র্যাশে স্থানান্তরিত হয়েছে: ${donorName} (ID: ${id})`);
      }
    }

    saveDatabase();
    return true;
  },

  restoreDonor(id: string, actorName?: string): boolean {
    const donor = db.donors.find(d => d.id === id);
    if (!donor) return false;

    donor.isDeleted = false;
    delete donor.deletedAt;
    donor.updatedAt = new Date().toISOString();

    saveDatabase();

    if (actorName) {
      this.addAuditLog(actorName, 'ADMIN', 'RESTORE_DONOR', `ট্র্যাশ থেকে রক্তদাতা পুনরুদ্ধার করা হয়েছে: ${donor.name} (ID: ${id})`);
    }

    return true;
  },

  bulkDeleteDonors(ids: string[], actorName?: string, permanent = false): number {
    let count = 0;
    const now = new Date().toISOString();

    if (permanent) {
      db.donors = db.donors.filter(d => {
        if (ids.includes(d.id)) {
          count++;
          return false;
        }
        return true;
      });
    } else {
      db.donors.forEach(d => {
        if (ids.includes(d.id)) {
          d.isDeleted = true;
          d.deletedAt = now;
          count++;
        }
      });
    }

    saveDatabase();

    if (actorName && count > 0) {
      this.addAuditLog(actorName, 'ADMIN', permanent ? 'BULK_PERMANENT_DELETE_DONORS' : 'BULK_SOFT_DELETE_DONORS', `${count} জন রক্তদাতা মুছে ফেলা হয়েছে`);
    }

    return count;
  },

  // Donation History
  addDonationHistory(history: Omit<DonationHistory, 'id' | 'createdAt'>, actorName?: string): DonationHistory {
    const newId = `dh-${Date.now().toString().slice(-6)}`;
    const newHistory: DonationHistory = {
      ...history,
      id: newId,
      createdAt: new Date().toISOString()
    };

    db.donationHistories.unshift(newHistory);

    // Update donor's last donation date and increment total donations
    const donor = db.donors.find(d => d.id === history.donorId);
    if (donor) {
      donor.lastDonationDate = history.date;
      donor.totalDonations = (donor.totalDonations || 0) + 1;
      donor.status = calculateDonorStatus(donor.lastDonationDate, db.settings.eligibilityIntervalDays);
      donor.updatedAt = new Date().toISOString();
    }

    saveDatabase();

    if (actorName) {
      this.addAuditLog(actorName, 'ADMIN', 'ADD_DONATION_RECORD', `রক্তদানের রেকর্ড যুক্ত হয়েছে: donor ${donor?.name || history.donorId}`);
    }

    return newHistory;
  },

  getDonationHistoryForDonor(donorId: string): DonationHistory[] {
    return db.donationHistories.filter(h => h.donorId === donorId).sort((a, b) => b.date.localeCompare(a.date));
  },

  getAllDonationHistories(): DonationHistory[] {
    return [...db.donationHistories].sort((a, b) => b.date.localeCompare(a.date));
  },

  // Blood Requests CRUD
  getBloodRequests(includeDeleted = false): BloodRequest[] {
    let list = db.bloodRequests;
    if (!includeDeleted) {
      list = list.filter(r => !r.isDeleted);
    }
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getBloodRequestById(idOrNum: string): BloodRequest | undefined {
    return db.bloodRequests.find(r => (r.id === idOrNum || r.requestNumber === idOrNum) && !r.isDeleted);
  },

  addBloodRequest(reqData: Omit<BloodRequest, 'id' | 'createdAt' | 'status'>, actorName?: string): BloodRequest {
    const newId = `req-${Date.now().toString().slice(-6)}`;
    const currentYear = new Date().getFullYear();
    const count = db.bloodRequests.length + 1;
    const generatedReqNum = `REQ-${currentYear}-${count.toString().padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newRequest: BloodRequest = {
      ...reqData,
      id: newId,
      requestNumber: reqData.requestNumber || generatedReqNum,
      status: 'PENDING',
      division: reqData.division || 'Dhaka',
      district: reqData.district || 'Rajbari',
      upazila: reqData.upazila || 'Pangsha',
      createdAt: now,
    };

    db.bloodRequests.unshift(newRequest);

    // Create in-app notification for volunteers/admins
    const newNotif: Notification = {
      id: `notif-${Date.now().toString().slice(-6)}`,
      type: 'BLOOD_REQUEST',
      title: `জরুরী রক্তের আবেদন (${newRequest.bloodGroup})`,
      message: `${newRequest.patientName} এর জন্য ${newRequest.bagsNeeded} ব্যাগ ${newRequest.bloodGroup} রক্তের আবেদন করা হয়েছে (${newRequest.hospitalName}, ${newRequest.upazila})।`,
      recipientRole: 'VOLUNTEER',
      isRead: false,
      createdAt: now,
      linkUrl: `/request-blood?req=${newRequest.requestNumber}`
    };
    db.notifications.unshift(newNotif);

    saveDatabase();

    this.addAuditLog(
      actorName || 'PUBLIC_VISITOR',
      'VOLUNTEER',
      'ADD_BLOOD_REQUEST',
      `নতুন রক্তের আবেদন জমা পড়েছে (নম্বর: ${newRequest.requestNumber}): ${newRequest.patientName} (${newRequest.bloodGroup})`
    );
    return newRequest;
  },

  updateBloodRequest(id: string, updateData: Partial<BloodRequest>, actorName?: string): BloodRequest | undefined {
    const index = db.bloodRequests.findIndex(r => r.id === id || r.requestNumber === id);
    if (index === -1) return undefined;

    const updated = { ...db.bloodRequests[index], ...updateData };
    if ((updateData.status === 'FULFILLED' || updateData.status === 'COMPLETED') && !updated.fulfilledDate) {
      updated.fulfilledDate = new Date().toISOString();
    }

    db.bloodRequests[index] = updated;
    saveDatabase();

    if (actorName) {
      this.addAuditLog(actorName, 'ADMIN', 'UPDATE_BLOOD_REQUEST', `রক্তের আবেদন আপডেট (নম্বর: ${updated.requestNumber || id}): স্ট্যাটাস ${updated.status}`);
    }

    return updated;
  },

  deleteBloodRequest(id: string, actorName?: string): boolean {
    const index = db.bloodRequests.findIndex(r => r.id === id || r.requestNumber === id);
    if (index === -1) return false;

    db.bloodRequests[index].isDeleted = true;
    db.bloodRequests[index].deletedAt = new Date().toISOString();
    saveDatabase();

    if (actorName) {
      this.addAuditLog(actorName, 'ADMIN', 'SOFT_DELETE_BLOOD_REQUEST', `রক্তের আবেদন ট্র্যাশে স্থানান্তরিত হয়েছে: ${db.bloodRequests[index].requestNumber || id}`);
    }
    return true;
  },

  // Campaigns
  getCampaigns(): Campaign[] {
    return [...db.campaigns].sort((a, b) => b.date.localeCompare(a.date));
  },

  addCampaign(campaign: Omit<Campaign, 'id' | 'createdAt'>, actorName?: string): Campaign {
    const newId = `camp-${Date.now().toString().slice(-6)}`;
    const newCampaign: Campaign = {
      ...campaign,
      id: newId,
      createdAt: new Date().toISOString()
    };
    db.campaigns.unshift(newCampaign);
    saveDatabase();

    if (actorName) {
      this.addAuditLog(actorName, 'ADMIN', 'ADD_CAMPAIGN', `নতুন ক্যাম্পেইন যুক্ত করা হয়েছে: ${newCampaign.titleBn}`);
    }

    return newCampaign;
  },

  // Admin Auth Helpers
  getAdminUsers(): AdminUser[] {
    return db.adminUsers;
  },

  findAdminByEmail(email: string): AdminUser | undefined {
    return db.adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  verifyAdminPassword(email: string, rawPassword: string): boolean {
    const emailLower = email.toLowerCase().trim();
    if (emailLower === 'superadmin@pbda.org' && rawPassword === 'superadmin123') return true;
    if (emailLower === 'admin@pbda.org' && rawPassword === 'admin123') return true;
    if (emailLower === 'volunteer@pbda.org' && rawPassword === 'volunteer123') return true;

    // Fallback hash check
    if (emailLower === 'superadmin@pbda.org') return bcrypt.compareSync(rawPassword, DEFAULT_SUPERADMIN_PASSWORD_HASH);
    if (emailLower === 'admin@pbda.org') return bcrypt.compareSync(rawPassword, DEFAULT_ADMIN_PASSWORD_HASH);
    if (emailLower === 'volunteer@pbda.org') return bcrypt.compareSync(rawPassword, DEFAULT_VOLUNTEER_PASSWORD_HASH);

    return false;
  },

  addAdminUser(user: Omit<AdminUser, 'id' | 'createdAt'>, actorName: string): AdminUser {
    const newAdmin: AdminUser = {
      ...user,
      id: `admin-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      active: true
    };
    db.adminUsers.push(newAdmin);
    saveDatabase();
    this.addAuditLog(actorName, 'SUPER_ADMIN', 'ADD_ADMIN_USER', `নতুন এডমিন ব্যবহারকারী যুক্ত করা হয়েছে: ${newAdmin.name} (${newAdmin.role})`);
    return newAdmin;
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return [...db.auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  addAuditLog(actorName: string, actorRole: any, action: string, details: string) {
    const log: AuditLog = {
      id: `log-${Date.now().toString().slice(-6)}`,
      actorName,
      actorRole,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(log);
    if (db.auditLogs.length > 500) {
      db.auditLogs = db.auditLogs.slice(0, 500); // cap max 500 logs
    }
    saveDatabase();
  },

  // Emergency Contacts & Gallery
  getEmergencyContacts(): EmergencyContact[] {
    return db.emergencyContacts;
  },

  getGalleryImages(): GalleryImage[] {
    return db.galleryImages;
  },

  // Bulk Import Donors
  importDonorsBulk(donorsList: Array<Omit<Donor, 'id' | 'createdAt' | 'updatedAt' | 'status'>>, actorName: string): { importedCount: number } {
    let count = 0;
    const now = new Date().toISOString();

    for (const d of donorsList) {
      if (!d.name || !d.bloodGroup || !d.phone) continue;
      const newId = `dn-imp-${Date.now().toString().slice(-4)}-${count}`;
      const status = calculateDonorStatus(d.lastDonationDate, db.settings.eligibilityIntervalDays);

      const newDonor: Donor = {
        ...d,
        id: newId,
        gender: d.gender || 'MALE',
        age: d.age || 25,
        district: d.district || 'Rajbari',
        upazila: d.upazila || 'Pangsha',
        union: d.union || 'পাংশা পৌরসভা',
        village: d.village || 'পাংশা',
        totalDonations: d.totalDonations || (d.lastDonationDate ? 1 : 0),
        isVerified: d.isVerified ?? true,
        status,
        createdAt: now,
        updatedAt: now
      };

      db.donors.unshift(newDonor);
      count++;
    }

    saveDatabase();
    this.addAuditLog(actorName, 'ADMIN', 'IMPORT_DONORS', `${count} জন নতুন রক্তদাতার ডাটা বাল্ক ইমপোর্ট করা হয়েছে।`);
    return { importedCount: count };
  }
};
