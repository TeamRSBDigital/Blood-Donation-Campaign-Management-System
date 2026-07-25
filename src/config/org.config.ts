export const ORG_CONFIG = {
  nameBn: 'পাংশা ব্লাড ডোনার্স এসোসিয়েশন',
  nameEn: 'Pangsha Blood Donors Association',
  shortName: 'PBDA',
  taglineBn: 'রক্ত দিন, জীবন বাঁচান - মানব সেবায় আমরা সদা প্রস্তুত',
  taglineEn: 'Donate Blood, Save Lives - Ready to Serve Humanity',
  
  contacts: {
    primaryPhone: '+8801712000000',
    emergencyHotline: '+8801812999888',
    email: 'info@pbdabangladesh.org',
    facebookGroup: 'https://facebook.com/groups/pbdabangladesh',
    facebookPage: 'https://facebook.com/pbdabangladesh',
  },

  location: {
    addressBn: 'পাংশা মডেল থানা রোড, পাংশা পৌরসভা, রাজবাড়ী, বাংলাদেশ',
    addressEn: 'Pangsha Model Thana Road, Pangsha Pourashava, Rajbari, Bangladesh',
    upazila: 'Pangsha',
    district: 'Rajbari',
    postalCode: '7720',
  },

  establishedYear: '2020',
} as const;

export type OrgConfig = typeof ORG_CONFIG;
