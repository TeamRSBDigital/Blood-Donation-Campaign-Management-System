import { UserRole } from '../types/index.js';
import { PERMISSIONS, ROLES } from '../constants/roles.js';

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('pbda_token');
  return !!token;
}

export function getCurrentUserRole(): UserRole | null {
  const userStr = localStorage.getItem('pbda_user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.role || null;
  } catch {
    return null;
  }
}

export function hasPermission(permissionKey: keyof typeof PERMISSIONS): boolean {
  const role = getCurrentUserRole();
  if (!role) return false;
  const allowedRoles = PERMISSIONS[permissionKey];
  return allowedRoles.includes(role);
}

export function isRoleAtLeast(requiredRole: UserRole): boolean {
  const currentRole = getCurrentUserRole();
  if (!currentRole) return false;
  return ROLES[currentRole].level >= ROLES[requiredRole].level;
}
