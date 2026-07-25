import { z } from 'zod';

// Phone Number Regex (Bangladeshi 11-digit or +880 format)
const bdPhoneRegex = /^(\+88)?01[3-9]\d{8}$/;

const bloodGroupTuple = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const donorSchema = z.object({
  name: z.string().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে'),
  nameEn: z.string().optional(),
  bloodGroup: z.enum(bloodGroupTuple, {
    message: 'রক্তের গ্রুপ নির্বাচন করুন',
  }),
  phone: z.string().regex(bdPhoneRegex, 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712000000)'),
  alternativePhone: z.string().optional().refine(
    val => !val || bdPhoneRegex.test(val),
    'সঠিক বিকল্প মোবাইল নম্বর দিন'
  ),
  email: z.string().email('সঠিক ইমেইল এড্রেস দিন').optional().or(z.literal('')),
  photoUrl: z.string().url('সঠিক ইমেজ URL দিন').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  age: z.number().min(18, 'রক্তদাতার বয়স অন্তত ১৮ হতে হবে').max(65, 'বয়স সর্বোচ্চ ৬৫ হতে পারবে'),
  weightKg: z.number().min(45, 'ওজন অন্তত ৪৫ কেজি হতে হবে').optional(),
  district: z.string().min(2, 'জেলা নির্বাচন করুন'),
  upazila: z.string().min(2, 'উপজেলা নির্বাচন করুন'),
  union: z.string().min(2, 'ইউনিয়ন/পৌরসভা নির্বাচন করুন'),
  village: z.string().min(2, 'গ্রাম/মহল্লা দিন'),
  lastDonationDate: z.string().optional(),
  isVerified: z.boolean().default(true),
  hemoglobinLevel: z.string().optional(),
  bpNotes: z.string().optional(),
  medicalNotes: z.string().optional(),
});

export type DonorInput = z.infer<typeof donorSchema>;

export const bloodRequestSchema = z.object({
  patientName: z.string().min(2, 'রোগীর নাম অন্তত ২ অক্ষরের হতে হবে'),
  bloodGroup: z.enum(bloodGroupTuple, {
    message: 'রক্তের গ্রুপ নির্বাচন করুন',
  }),
  bagsNeeded: z.number().min(1, 'অন্তত ১ ব্যাগ নির্বাচন করুন').max(10, 'সর্বোচ্চ ১০ ব্যাগ দেওয়া যাবে'),
  hospitalName: z.string().min(3, 'হাসপাতালের নাম ও ঠিকানা পরিষ্কারভাবে লিখুন'),
  upazila: z.string().min(2, 'উপজেলা নাম দিন'),
  union: z.string().optional(),
  requiredDate: z.string().min(1, 'রক্ত প্রয়োজন এর তারিখ দিন'),
  requiredTime: z.string().optional(),
  contactPerson: z.string().min(2, 'যোগাযোগকারীর নাম লিখুন'),
  contactPhone: z.string().regex(bdPhoneRegex, 'সঠিক মোবাইল নম্বর দিন'),
  alternativePhone: z.string().optional(),
  priority: z.enum(['NORMAL', 'URGENT', 'CRITICAL']),
  diseaseOrReason: z.string().min(3, 'রক্ত প্রয়োজন এর কারণ বা রোগের বিবরণ লিখুন'),
  medicalDocsUrl: z.string().optional(),
  notes: z.string().optional(),
});

export type BloodRequestInput = z.infer<typeof bloodRequestSchema>;

export const loginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল ঠিকানা লিখুন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const campaignSchema = z.object({
  titleBn: z.string().min(5, 'ক্যাম্পেইন শিরোনাম লিখুন'),
  titleEn: z.string().min(5, 'English Title required'),
  descriptionBn: z.string().min(10, 'ক্যাম্পেইন বিবরণ লিখুন'),
  descriptionEn: z.string().optional(),
  location: z.string().min(3, 'স্থান লিখুন'),
  upazila: z.string().min(2, 'উপজেলা লিখুন'),
  date: z.string().min(1, 'তারিখ দিন'),
  time: z.string().min(1, 'সময় দিন'),
  bannerUrl: z.string().optional(),
  targetBags: z.number().optional(),
  organizer: z.string().min(2, 'আয়োজক এর নাম লিখুন'),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
