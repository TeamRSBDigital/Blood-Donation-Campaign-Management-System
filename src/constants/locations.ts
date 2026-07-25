export interface UnionOption {
  id: string;
  nameBn: string;
  nameEn: string;
}

export interface UpazilaOption {
  id: string;
  nameBn: string;
  nameEn: string;
  district: string;
  unions: UnionOption[];
}

export const DISTRICT_NAME_BN = 'রাজবাড়ী';
export const DISTRICT_NAME_EN = 'Rajbari';

export const PANGSHA_UNIONS: UnionOption[] = [
  { id: 'pangsha-pourashava', nameBn: 'পাংশা পৌরসভা', nameEn: 'Pangsha Pourashava' },
  { id: 'bahadurpur', nameBn: 'বাহাদুরপুর', nameEn: 'Bahadurpur' },
  { id: 'habaspur', nameBn: 'হাবাসপুর', nameEn: 'Habaspur' },
  { id: 'yashai', nameBn: 'যশাই', nameEn: 'Yashai' },
  { id: 'babupara', nameBn: 'বাবুপাড়া', nameEn: 'Babupara' },
  { id: 'machpara', nameBn: 'মাছপাড়া', nameEn: 'Machpara' },
  { id: 'patta', nameBn: 'পাট্টা', nameEn: 'Patta' },
  { id: 'sarisha', nameBn: 'সরিষা', nameEn: 'Sarisha' },
  { id: 'maurat', nameBn: 'মৌরাট', nameEn: 'Maurat' },
  { id: 'kasba', nameBn: 'কসবা মাঝাইল', nameEn: 'Kasba Majhail' },
  { id: 'kalyanpur', nameBn: 'কল্যানপুর', nameEn: 'Kalyanpur' },
  { id: 'samta', nameBn: 'সামতা', nameEn: 'Samta' },
];

export const RAJBARI_UPAZILAS: UpazilaOption[] = [
  {
    id: 'pangsha',
    nameBn: 'পাংশা',
    nameEn: 'Pangsha',
    district: 'Rajbari',
    unions: PANGSHA_UNIONS
  },
  {
    id: 'kalukhali',
    nameBn: 'কালুখালী',
    nameEn: 'Kalukhali',
    district: 'Rajbari',
    unions: [
      { id: 'maddapur', nameBn: 'মাদাপুর', nameEn: 'Maddapur' },
      { id: 'mrikigi', nameBn: 'মৃগী', nameEn: 'Mrigi' },
      { id: 'ratandia', nameBn: 'রতনদিয়া', nameEn: 'Ratandia' },
      { id: 'saorail', nameBn: 'সাওরাইল', nameEn: 'Saorail' },
      { id: 'boalia', nameBn: 'বোয়ালিয়া', nameEn: 'Boalia' },
    ]
  },
  {
    id: 'baliakandi',
    nameBn: 'বালিয়াকান্দি',
    nameEn: 'Baliakandi',
    district: 'Rajbari',
    unions: [
      { id: 'baliakandi-sadar', nameBn: 'বালিয়াকান্দি সদর', nameEn: 'Baliakandi Sadar' },
      { id: 'islampur', nameBn: 'ইসলামপুর', nameEn: 'Islampur' },
      { id: 'nawabpur', nameBn: 'নবাবপুর', nameEn: 'Nawabpur' },
      { id: 'jungle', nameBn: 'জঙ্গল', nameEn: 'Jungle' },
      { id: 'narua', nameBn: 'নারুয়া', nameEn: 'Narua' },
    ]
  },
  {
    id: 'rajbari-sadar',
    nameBn: 'রাজবাড়ী সদর',
    nameEn: 'Rajbari Sadar',
    district: 'Rajbari',
    unions: [
      { id: 'rajbari-pourashava', nameBn: 'রাজবাড়ী পৌরসভা', nameEn: 'Rajbari Pourashava' },
      { id: 'aladipur', nameBn: 'আলাদিপুর', nameEn: 'Aladipur' },
      { id: 'banibaha', nameBn: 'বাণীবহ', nameEn: 'Banibaha' },
      { id: 'khankhanapur', nameBn: 'খানখানাপুর', nameEn: 'Khankhanapur' },
      { id: 'mizanpur', nameBn: 'মিজানপুর', nameEn: 'Mizanpur' },
    ]
  },
  {
    id: 'goalanda',
    nameBn: 'গোয়ালন্দ',
    nameEn: 'Goalanda',
    district: 'Rajbari',
    unions: [
      { id: 'goalanda-pourashava', nameBn: 'গোয়ালন্দ পৌরসভা', nameEn: 'Goalanda Pourashava' },
      { id: 'daulatdia', nameBn: 'দৌলতদিয়া', nameEn: 'Daulatdia' },
      { id: 'uanchar', nameBn: 'উজানচর', nameEn: 'Uanchar' },
    ]
  }
];

export const OTHER_SURROUNDING_UPAZILAS = [
  { id: 'kumarkhali', nameBn: 'কুমারখালী (কুষ্টিয়া)', nameEn: 'Kumarkhali (Kushtia)' },
  { id: 'sreepur', nameBn: 'শ্রীপুর (মাগুরা)', nameEn: 'Sreepur (Magura)' },
  { id: 'fardpur-sadar', nameBn: 'ফরিদপুর সদর', nameEn: 'Faridpur Sadar' },
];
