export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    SEARCH_DONORS: '/search',
    BLOOD_REQUESTS: '/requests',
    CAMPAIGNS: '/campaigns',
    REGISTER_DONOR: '/register',
    EMERGENCY: '/emergency',
    GALLERY: '/gallery',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    DONORS: '/admin/donors',
    REQUESTS: '/admin/requests',
    CAMPAIGNS: '/admin/campaigns',
    REPORTS: '/admin/reports',
    TELEGRAM: '/admin/telegram',
    USERS: '/admin/users',
    AUDIT_LOGS: '/admin/audit',
    SETTINGS: '/admin/settings',
  },
  ERROR: {
    NOT_FOUND: '/404',
    SERVER_ERROR: '/500',
    UNAUTHORIZED: '/401',
    FORBIDDEN: '/403',
  }
} as const;
