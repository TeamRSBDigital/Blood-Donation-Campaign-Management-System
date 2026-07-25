import { BloodGroup } from '../types/index.js';
import { RARE_BLOOD_GROUPS, BLOOD_GROUP_COMPATIBILITY } from '../constants/bloodGroups.js';

export function isRareBloodGroup(group: BloodGroup): boolean {
  return RARE_BLOOD_GROUPS.includes(group);
}

export function getBloodGroupBadgeColor(group: BloodGroup): string {
  if (isRareBloodGroup(group)) {
    return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200';
  }
  return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200';
}

export function getCompatibleRecipients(donorGroup: BloodGroup): BloodGroup[] {
  return BLOOD_GROUP_COMPATIBILITY[donorGroup]?.canGiveTo || [];
}

export function getCompatibleDonors(recipientGroup: BloodGroup): BloodGroup[] {
  return BLOOD_GROUP_COMPATIBILITY[recipientGroup]?.canReceiveFrom || [];
}

export function getAvatarUrl(name: string, photoUrl?: string): string {
  if (photoUrl && photoUrl.trim() !== '') return photoUrl;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e11d48&color=fff&bold=true`;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
