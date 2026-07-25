import React, { useState, useEffect } from 'react';
import { Donor, BloodGroup, AvailabilityStatus } from '../../../types/index.js';
import { donorService } from '../../../services/donorService.js';
import {
  X,
  User,
  Phone,
  MapPin,
  Activity,
  ShieldAlert,
  Upload,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Droplet,
  Trash2
} from 'lucide-react';

interface DonorFormModalProps {
  donor: Donor | null; // null for Create, object for Edit
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (donor: Donor) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DIVISIONS = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];
const DISTRICTS = ['রাজবাড়ী', 'ফরিদপুর', 'কুষ্টিয়া', 'ঝিনাইদহ', 'মাগুরা', 'পাবনা', 'ঢাকা'];
const UPAZILAS = ['পাংশা', 'কালুখালী', 'বালিয়াকান্দি', 'রাজবাড়ী সদর', 'গোয়ালন্দ'];
const UNIONS = ['পাংশা পৌরসভা', 'হাবাসপুর', 'বাহাদুরপুর', 'কসমাজ', 'বাবুপাড়া', 'মাছপাড়া', 'সরসFeature', 'যশাই', 'মৌরাট', 'পাট্টা'];

export const DonorFormModal: React.FC<DonorFormModalProps> = ({
  donor,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<Donor>>({
    name: '',
    nameEn: '',
    bloodGroup: 'A+',
    phone: '',
    whatsAppPhone: '',
    alternativePhone: '',
    email: '',
    photoUrl: '',
    gender: 'MALE',
    dob: '',
    age: 25,
    weightKg: 60,
    occupation: '',
    division: 'ঢাকা',
    district: 'রাজবাড়ী',
    upazila: 'পাংশা',
    union: 'পাংশা পৌরসভা',
    village: '',
    lastDonationDate: '',
    hemoglobinLevel: '13.5 g/dL',
    bpNotes: '120/80 mmHg',
    hasDiabetes: false,
    hasHepatitis: false,
    otherDiseases: '',
    medicalNotes: '',
    canDonate: true,
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    status: 'AVAILABLE',
    isVerified: true
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'address' | 'medical' | 'emergency'>('personal');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneDuplicateError, setPhoneDuplicateError] = useState('');
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    if (donor) {
      setFormData({
        ...donor,
        dob: donor.dob || '',
        whatsAppPhone: donor.whatsAppPhone || '',
        alternativePhone: donor.alternativePhone || '',
        email: donor.email || '',
        photoUrl: donor.photoUrl || '',
        weightKg: donor.weightKg || 60,
        occupation: donor.occupation || '',
        division: donor.division || 'ঢাকা',
        otherDiseases: donor.otherDiseases || '',
        medicalNotes: donor.medicalNotes || '',
        emergencyContactName: donor.emergencyContactName || '',
        emergencyContactRelation: donor.emergencyContactRelation || '',
        emergencyContactPhone: donor.emergencyContactPhone || '',
      });
    } else {
      setFormData({
        name: '',
        nameEn: '',
        bloodGroup: 'A+',
        phone: '',
        whatsAppPhone: '',
        alternativePhone: '',
        email: '',
        photoUrl: '',
        gender: 'MALE',
        dob: '',
        age: 25,
        weightKg: 60,
        occupation: '',
        division: 'ঢাকা',
        district: 'রাজবাড়ী',
        upazila: 'পাংশা',
        union: 'পাংশা পৌরসভা',
        village: '',
        lastDonationDate: '',
        hemoglobinLevel: '13.5 g/dL',
        bpNotes: '120/80 mmHg',
        hasDiabetes: false,
        hasHepatitis: false,
        otherDiseases: '',
        medicalNotes: '',
        canDonate: true,
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactPhone: '',
        status: 'AVAILABLE',
        isVerified: true
      });
    }
    setErrorMessage('');
    setPhoneDuplicateError('');
    setPhotoError('');
    setActiveTab('personal');
  }, [donor, isOpen]);

  if (!isOpen) return null;

  // Handle DOB change and auto calculate age
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let calculatedAge = formData.age || 25;
    if (val) {
      const birthYear = new Date(val).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear) && birthYear > 1900 && birthYear < currentYear) {
        calculatedAge = currentYear - birthYear;
      }
    }
    setFormData(prev => ({
      ...prev,
      dob: val,
      age: calculatedAge
    }));
  };

  // Duplicate phone check on blur
  const handlePhoneBlur = async () => {
    if (!formData.phone || formData.phone.trim().length < 11) return;
    setPhoneChecking(true);
    setPhoneDuplicateError('');
    try {
      const exists = await donorService.checkPhoneExists(formData.phone.trim(), donor?.id);
      if (exists) {
        setPhoneDuplicateError('এই ফোন নাম্বারটি দ্বারা ইতিমধ্যে একজন রক্তদাতা নিবন্ধিত রয়েছেন।');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPhoneChecking(false);
    }
  };

  // Image Upload handler with 2MB validation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    if (!file) return;

    // Validate size: 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('ছবির সাইজ ২ মেগাবাইটের (2MB) বেশি হতে পারবে না।');
      return;
    }

    // Validate type: jpg, jpeg, png, webp
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setPhotoError('শুধুমাত্র JPG, JPEG, PNG, WEBP ফরম্যাটের ছবি আপলোড করা যাবে।');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.name?.trim()) {
      setErrorMessage('রক্তদাতার নাম আবশ্যিক।');
      setActiveTab('personal');
      return;
    }

    if (!formData.bloodGroup) {
      setErrorMessage('রক্তের গ্রুপ নির্বাচন করুন।');
      setActiveTab('personal');
      return;
    }

    if (!formData.phone?.trim() || formData.phone.trim().length < 11) {
      setErrorMessage('সঠিক ১১ ডিজিটের ফোন নাম্বার দিন।');
      setActiveTab('contact');
      return;
    }

    if (!formData.village?.trim()) {
      setErrorMessage('গ্রাম / এলাকার নাম লিখুন।');
      setActiveTab('address');
      return;
    }

    if (phoneDuplicateError) {
      setErrorMessage('এই ফোন নাম্বারটি ইতিমধ্যেই অন্য এক রক্তদাতার আছে। অনুগ্রহ করে পরিবর্তন করুন।');
      setActiveTab('contact');
      return;
    }

    setSubmitting(true);

    try {
      if (donor) {
        // Update
        const res = await donorService.updateDonor(donor.id, formData);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.donor) {
          onSuccess(res.donor);
          onClose();
        }
      } else {
        // Create
        const res = await donorService.createDonor(formData);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.donor) {
          onSuccess(res.donor);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full my-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">
                {donor ? 'রক্তদাতার তথ্য পরিবর্তন' : 'নতুন রক্তদাতা নিবন্ধন'}
              </h2>
              <p className="text-xs text-red-100">পাংশা ব্লাড ডোনার্স এসোসিয়েশন ডাটাবেজ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 dark:bg-slate-800 p-2 flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'personal'
                ? 'bg-white dark:bg-slate-900 text-red-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ব্যক্তিগত তথ্য</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'contact'
                ? 'bg-white dark:bg-slate-900 text-red-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>যোগাযোগ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'address'
                ? 'bg-white dark:bg-slate-900 text-red-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>ঠিকানা</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('medical')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'medical'
                ? 'bg-white dark:bg-slate-900 text-red-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>মেডিকেল ও ছবি</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'emergency'
                ? 'bg-white dark:bg-slate-900 text-red-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>জরুরী কন্টাক্ট</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="m-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: PERSONAL INFO */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সম্পূর্ণ নাম (বাংলায়) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ জহিরুল ইসলাম"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ইংরেজি নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Md. Zahirul Islam"
                    value={formData.nameEn || ''}
                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    রক্তের গ্রুপ <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map(bg => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                        className={`py-2 rounded-xl font-black text-sm border transition-all ${
                          formData.bloodGroup === bg
                            ? 'bg-red-600 text-white border-red-600 shadow-md scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-red-400'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    লিঙ্গ <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'পুরুষ', val: 'MALE' },
                      { label: 'নারী', val: 'FEMALE' },
                      { label: 'অন্যান্য', val: 'OTHER' }
                    ].map(g => (
                      <button
                        key={g.val}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: g.val as any })}
                        className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                          formData.gender === g.val
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    জন্ম তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={handleDobChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বয়স (বছর)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={formData.age || ''}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">১৮ থেকে ৬৫ বছরের মধ্যে হতে হবে</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ওজন (কেজি)
                  </label>
                  <input
                    type="number"
                    min="45"
                    max="150"
                    placeholder="যেমন: 65"
                    value={formData.weightKg || ''}
                    onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">সর্বনিম্ন ৫০ কেজি থাকা বাঞ্ছনীয়</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  পেশা
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ছাত্র / শিক্ষক / ব্যবসায়ী / চাকরিজীবী"
                  value={formData.occupation || ''}
                  onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT INFO */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  মোবাইল নাম্বার <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01712345678"
                  value={formData.phone || ''}
                  onChange={e => {
                    setFormData({ ...formData, phone: e.target.value });
                    setPhoneDuplicateError('');
                  }}
                  onBlur={handlePhoneBlur}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-mono font-bold ${
                    phoneDuplicateError
                      ? 'border-red-500'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {phoneChecking && (
                  <span className="text-[10px] text-slate-400 mt-1 block">ফোন নম্বর যাচাই করা হচ্ছে...</span>
                )}
                {phoneDuplicateError && (
                  <span className="text-[11px] text-red-600 font-bold mt-1 block flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {phoneDuplicateError}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    হোয়াটসঅ্যাপ নাম্বার (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    placeholder="01712345678"
                    value={formData.whatsAppPhone || ''}
                    onChange={e => setFormData({ ...formData, whatsAppPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বিকল্প মোবাইল নাম্বার (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    placeholder="01812345678"
                    value={formData.alternativePhone || ''}
                    onChange={e => setFormData({ ...formData, alternativePhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ইমেইল এড্রেস (ঐচ্ছিক)
                </label>
                <input
                  type="email"
                  placeholder="donor@example.com"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: ADDRESS */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বিভাগ
                  </label>
                  <select
                    value={formData.division || 'ঢাকা'}
                    onChange={e => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-bold"
                  >
                    {DIVISIONS.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    জেলা
                  </label>
                  <select
                    value={formData.district || 'রাজবাড়ী'}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-bold"
                  >
                    {DISTRICTS.map(dis => (
                      <option key={dis} value={dis}>{dis}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    উপজেলা / থানা
                  </label>
                  <select
                    value={formData.upazila || 'পাংশা'}
                    onChange={e => setFormData({ ...formData, upazila: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-bold"
                  >
                    {UPAZILAS.map(upz => (
                      <option key={upz} value={upz}>{upz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ইউনিয়ন / পৌরসভা
                  </label>
                  <select
                    value={formData.union || 'পাংশা পৌরসভা'}
                    onChange={e => setFormData({ ...formData, union: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-bold"
                  >
                    {UNIONS.map(un => (
                      <option key={un} value={un}>{un}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  গ্রাম / মহল্লা / রোড <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: কলেজ রোড, ২ নং ওয়ার্ড"
                  value={formData.village || ''}
                  onChange={e => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MEDICAL & PHOTO */}
          {activeTab === 'medical' && (
            <div className="space-y-4">
              {/* Photo Upload Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  রক্তদাতার ছবি (সর্বোচ্চ ২ MB)
                </label>

                <div className="flex items-center gap-4">
                  {formData.photoUrl ? (
                    <div className="relative shrink-0">
                      <img
                        src={formData.photoUrl}
                        alt="Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-red-500 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photoUrl: '' })}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xs"
                        title="ছবি মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center shrink-0 border-2 border-dashed border-slate-300 dark:border-slate-600">
                      <User className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>ছবি ফাইল আপলোড করুন</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="text-[10px] text-slate-400">
                      অথবা পাবলিক ছবি URL লিখুন:
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={formData.photoUrl || ''}
                      onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] outline-none"
                    />
                  </div>
                </div>

                {photoError && (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1 pt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {photoError}
                  </p>
                )}
              </div>

              {/* Medical Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সর্বশেষ রক্তদানের তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.lastDonationDate || ''}
                    onChange={e => setFormData({ ...formData, lastDonationDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    স্ট্যাটাস ওভাররাইড
                  </label>
                  <select
                    value={formData.status || 'AVAILABLE'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as AvailabilityStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-bold"
                  >
                    <option value="AVAILABLE">প্রস্তুত (Available)</option>
                    <option value="UNAVAILABLE">সাময়িক অনুপস্থিত (Unavailable)</option>
                    <option value="TEMP_UNAVAILABLE">অসুস্থতা / ব্রেকে আছেন</option>
                    <option value="RESTRICTED">মেডিকেল কারণে নিষিদ্ধ (Restricted)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    হিমোগ্লোবিন রেট (যেমন: 13.5 g/dL)
                  </label>
                  <input
                    type="text"
                    value={formData.hemoglobinLevel || ''}
                    onChange={e => setFormData({ ...formData, hemoglobinLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ব্লাড প্রেশার নোটস (যেমন: 120/80 mmHg)
                  </label>
                  <input
                    type="text"
                    value={formData.bpNotes || ''}
                    onChange={e => setFormData({ ...formData, bpNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Health Checkboxes */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  স্বাস্থ্যগত তথ্যাবলী
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasDiabetes || false}
                      onChange={e => setFormData({ ...formData, hasDiabetes: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">ডায়াবেটিস আছে</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasHepatitis || false}
                      onChange={e => setFormData({ ...formData, hasHepatitis: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">হেপাটাইটিস / জন্ডিস history</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canDonate !== false}
                      onChange={e => setFormData({ ...formData, canDonate: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">রক্তদানে সক্ষম</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  অন্যান্য রোগ / মেডিকেল নোটস
                </label>
                <textarea
                  rows={2}
                  placeholder="অন্যান্য কোনো স্বাস্থ্য সমস্যা থাকলে লিখুন..."
                  value={formData.medicalNotes || ''}
                  onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 5: EMERGENCY CONTACT */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-900 dark:text-amber-300 text-xs">
                জরুরী প্রয়োজনে রক্তদাতার অভিভাবক বা নিকটাত্মীয়ের মোবাইল নাম্বার প্রদান করুন।
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  জরুরী কন্টাক্ট নাম
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  value={formData.emergencyContactName || ''}
                  onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সম্পর্ক
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: পিতা / ভাই / মাতা"
                    value={formData.emergencyContactRelation || ''}
                    onChange={e => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    জরুরী ফোন নাম্বার
                  </label>
                  <input
                    type="tel"
                    placeholder="01700000000"
                    value={formData.emergencyContactPhone || ''}
                    onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Action Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white font-bold transition-colors"
            >
              বাতিল
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'emergency' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'personal') setActiveTab('contact');
                    else if (activeTab === 'contact') setActiveTab('address');
                    else if (activeTab === 'address') setActiveTab('medical');
                    else if (activeTab === 'medical') setActiveTab('emergency');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold transition-colors"
                >
                  পরবর্তী ধাপ
                </button>
              ) : null}

              <button
                type="submit"
                disabled={submitting || Boolean(phoneDuplicateError)}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <span>সংরক্ষণ হচ্ছে...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{donor ? 'হালনাগাদ সংরক্ষণ' : 'রক্তদাতা সংরক্ষণ'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
