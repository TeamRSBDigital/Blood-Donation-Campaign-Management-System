import { UserRole } from '../types/index.js';

export const ROLES: Record<UserRole, { labelBn: string; labelEn: string; level: number }> = {
  SUPER_ADMIN: {
    labelBn: 'সুপার এডমিন',
    labelEn: 'Super Administrator',
    level: 3,
  },
  ADMIN: {
    labelBn: 'এডমিন',
    labelEn: 'Administrator',
    level: 2,
  },
  VOLUNTEER: {
    labelBn: 'ভলান্টিয়ার',
    labelEn: 'Volunteer Staff',
    level: 1,
  },
};

export const PERMISSIONS = {
  MANAGE_USERS: ['SUPER_ADMIN'] as UserRole[],
  MANAGE_SETTINGS: ['SUPER_ADMIN'] as UserRole[],
  DELETE_DONOR: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  EDIT_DONOR: ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER'] as UserRole[],
  CREATE_DONOR: ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER'] as UserRole[],
  MANAGE_REQUESTS: ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER'] as UserRole[],
  VIEW_AUDIT_LOGS: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  EXPORT_REPORTS: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
};
