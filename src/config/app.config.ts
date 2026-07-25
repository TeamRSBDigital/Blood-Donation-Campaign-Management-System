export const APP_CONFIG = {
  name: 'Blood Donation Campaign Management System',
  shortName: 'PBDA System',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  apiBaseUrl: '/api',
  
  // Phase & Region Scope
  phase: {
    current: 'Phase 1 - Pangsha Upazila',
    district: 'Rajbari',
    division: 'Dhaka',
    country: 'Bangladesh',
  },
  futureExpansion: [
    'Rajbari District (All Upazilas)',
    'Faridpur & Kushtia Border Unions',
    'Nationwide Bangladesh'
  ],

  // Business Rules
  donation: {
    eligibilityIntervalDays: 90, // 3 months required between donations
    minAgeYears: 18,
    maxAgeYears: 65,
    minWeightKg: 50,
  },

  pagination: {
    defaultPageSize: 10,
    maxPageSize: 50,
  },

  features: {
    enablePublicRequestPosting: true,
    enableTelegramBotNotifications: true,
    enableSmsAlerts: false,
    enableAuditLogging: true,
    enableExportPdfCsv: true,
  }
} as const;

export type AppConfig = typeof APP_CONFIG;
