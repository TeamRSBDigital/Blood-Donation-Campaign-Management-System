import { AvailabilityStatus } from '../types/index.js';

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

export function calculateDonationEligibility(lastDonationDate?: string, intervalDays = 90): {
  status: AvailabilityStatus;
  daysRemaining: number;
  nextEligibleDate?: string;
  isEligible: boolean;
} {
  if (!lastDonationDate) {
    return {
      status: 'AVAILABLE',
      daysRemaining: 0,
      isEligible: true,
    };
  }

  const lastDate = new Date(lastDonationDate);
  if (isNaN(lastDate.getTime())) {
    return {
      status: 'AVAILABLE',
      daysRemaining: 0,
      isEligible: true,
    };
  }

  const today = new Date();
  const nextEligible = new Date(lastDate);
  nextEligible.setDate(nextEligible.getDate() + intervalDays);

  const diffMs = nextEligible.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      status: 'AVAILABLE',
      daysRemaining: 0,
      nextEligibleDate: nextEligible.toISOString().split('T')[0],
      isEligible: true,
    };
  }

  return {
    status: 'RESTRICTED',
    daysRemaining,
    nextEligibleDate: nextEligible.toISOString().split('T')[0],
    isEligible: false,
  };
}
