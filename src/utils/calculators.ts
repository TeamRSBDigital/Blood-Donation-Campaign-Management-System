import { AvailabilityStatus } from '../types/index.js';
import { formatDateBn, toBengaliNumeral } from './formatters.js';

export function calculateAge(birthDateString: string): number {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export interface EligibilityResult {
  status: AvailabilityStatus;
  daysRemaining: number;
  nextEligibleDate: string;
  nextEligibleDateFormatted: string;
  isEligible: boolean;
  messageBn: string;
  messageEn: string;
}

export function calculateDonationEligibility(
  lastDonationDate?: string | Date | null,
  intervalDays = 90
): EligibilityResult {
  if (!lastDonationDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      status: 'AVAILABLE',
      daysRemaining: 0,
      nextEligibleDate: todayStr,
      nextEligibleDateFormatted: formatDateBn(todayStr),
      isEligible: true,
      messageBn: 'রক্তদানে প্রস্তুত (পূর্ববর্তী রক্তদানের রেকর্ড নেই)',
      messageEn: 'Eligible to donate (No previous record)',
    };
  }

  const lastDate = lastDonationDate instanceof Date ? lastDonationDate : new Date(lastDonationDate);
  if (isNaN(lastDate.getTime())) {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      status: 'AVAILABLE',
      daysRemaining: 0,
      nextEligibleDate: todayStr,
      nextEligibleDateFormatted: formatDateBn(todayStr),
      isEligible: true,
      messageBn: 'রক্তদানে প্রস্তুত',
      messageEn: 'Eligible to donate',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextEligible = new Date(lastDate);
  nextEligible.setHours(0, 0, 0, 0);
  nextEligible.setDate(nextEligible.getDate() + intervalDays);

  const diffMs = nextEligible.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const nextEligibleIso = nextEligible.toISOString().split('T')[0];
  const nextEligibleFormatted = formatDateBn(nextEligibleIso);

  if (daysRemaining <= 0) {
    return {
      status: 'AVAILABLE',
      daysRemaining: 0,
      nextEligibleDate: nextEligibleIso,
      nextEligibleDateFormatted: nextEligibleFormatted,
      isEligible: true,
      messageBn: 'রক্তদানে সম্পূর্ণ প্রস্তুত',
      messageEn: 'Eligible to donate',
    };
  }

  const daysBn = toBengaliNumeral(daysRemaining);
  return {
    status: 'RESTRICTED',
    daysRemaining,
    nextEligibleDate: nextEligibleIso,
    nextEligibleDateFormatted: nextEligibleFormatted,
    isEligible: false,
    messageBn: `আর ${daysBn} দিন পর রক্তদানে প্রস্তুত হবেন (${nextEligibleFormatted})`,
    messageEn: `Eligible in ${daysRemaining} days (${nextEligibleIso})`,
  };
}

