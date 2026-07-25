import React, { useState, useEffect } from 'react';
import { Donor, DonationHistory } from '../../types/index.js';
import { donorService } from '../../services/donorService.js';
import { RecordDonationModal } from '../admin/donor/RecordDonationModal.js';
import { DonationHistoryTable } from '../admin/donor/DonationHistoryTable.js';
import {
  User,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  Droplet,
  Heart,
  Edit2,
  ShieldAlert,
  Activity,
  CheckCircle,
  Clock,
  Briefcase,
  AlertCircle,
  FileText,
  Camera,
  Upload,
  X,
  Trash2,
  Check,
  Copy,
  Plus,
  RefreshCw,
  Award,
  Info,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Building,
  Sparkles
} from 'lucide-react';

interface DonorProfileProps {
  donor: Donor;
  onUpdateDonor?: (updatedDonor: Donor) => void;
  onEdit?: (donor: Donor) => void;
  onClose?: () => void;
  showAdminActions?: boolean;
}

// Bengali Preset Avatars
const PRESET_AVATARS = [
  { id: 'm1', label: 'পুরুষ ১', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' },
  { id: 'm2', label: 'পুরুষ ২', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250' },
  { id: 'm3', label: 'পুরুষ ৩', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250' },
  { id: 'f1', label: 'নারী ১', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250' },
  { id: 'f2', label: 'নারী ২', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250' },
  { id: 'f3', label: 'নারী ৩', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250' }
];

export const DonorProfile: React.FC<DonorProfileProps> = ({
  donor: initialDonor,
  onUpdateDonor,
  onEdit,
  onClose,
  showAdminActions = true
}) => {
  const [donor, setDonor] = useState<Donor>(initialDonor);
  const [history, setHistory] = useState<DonationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Photo Management Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoInputUrl, setPhotoInputUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // Record Donation Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Feedback Toasts & Copy State
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setDonor(initialDonor);
  }, [initialDonor]);

  // Load Donation History
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const records = await donorService.getDonationHistory(donor.id);
      setHistory(records);
    } catch (err) {
      console.error('Failed to load donation history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [donor.id]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Medical Eligibility Calculation
  const intervalDays = 90;
  let isEligible = true;
  let nextEligibleDateStr = '';
  let daysRemaining = 0;

  if (donor.lastDonationDate) {
    const lastDate = new Date(donor.lastDonationDate);
    if (!isNaN(lastDate.getTime())) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + intervalDays);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = nextDate.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      nextEligibleDateStr = nextDate.toISOString().split('T')[0];
      if (daysRemaining > 0) {
        isEligible = false;
      }
    }
  }

  if (donor.canDonate === false || donor.status === 'RESTRICTED') {
    isEligible = false;
  }

  // Handle Photo File Select
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('ছবিটির সাইজ সর্বোচ্চ 5MB হতে পারবে।');
      return;
    }

    setPhotoError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Save New Profile Photo
  const handleSavePhoto = async () => {
    const newPhotoUrl = photoPreview || photoInputUrl.trim();
    if (!newPhotoUrl && photoInputUrl.trim() === '') {
      setPhotoError('অনুগ্রহ করে ছবি নির্বাচন করুন বা ইউআরএল প্রদান করুন');
      return;
    }

    setSavingPhoto(true);
    setPhotoError('');

    try {
      const res = await donorService.updateDonor(donor.id, {
        photoUrl: newPhotoUrl
      });

      if (res.error) {
        setPhotoError(res.error);
      } else if (res.donor) {
        setDonor(res.donor);
        if (onUpdateDonor) onUpdateDonor(res.donor);
        showToast('প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে');
        setIsPhotoModalOpen(false);
        setPhotoPreview(null);
        setPhotoInputUrl('');
      }
    } catch (err: any) {
      setPhotoError(err.message || 'ছবি সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSavingPhoto(false);
    }
  };

  // Remove Profile Photo
  const handleRemovePhoto = async () => {
    setSavingPhoto(true);
    try {
      const res = await donorService.updateDonor(donor.id, {
        photoUrl: ''
      });

      if (res.error) {
        setPhotoError(res.error);
      } else if (res.donor) {
        setDonor(res.donor);
        if (onUpdateDonor) onUpdateDonor(res.donor);
        showToast('প্রোফাইল ছবি রিমুভ করা হয়েছে');
        setIsPhotoModalOpen(false);
        setPhotoPreview(null);
        setPhotoInputUrl('');
      }
    } catch (err: any) {
      setPhotoError(err.message || 'ছবি মুছে ফেলা সম্ভব হয়নি');
    } finally {
      setSavingPhoto(false);
    }
  };

  // Copy Phone Handler
  const handleCopyPhone = () => {
    navigator.clipboard.writeText(donor.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Format WhatsApp Link
  const cleanPhone = (donor.whatsAppPhone || donor.phone).replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `আসসালামু আলাইকুম ${donor.name}, পাংশা ব্লাড ডোনার্স এসোসিয়েশন থেকে রক্তের প্রয়োজনে আপনার সাথে কথা বলতে চাচ্ছি।`
  )}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-4xl w-full mx-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border animate-bounce ${
          toastMessage.type === 'success'
            ? 'bg-emerald-600 text-white border-emerald-500'
            : 'bg-red-600 text-white border-red-500'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 text-white p-6 md:p-8 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Photo with Camera Manage Button */}
          <div className="relative shrink-0 group">
            {donor.photoUrl ? (
              <img
                src={donor.photoUrl}
                alt={donor.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-white/40 shadow-2xl bg-white"
              />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-slate-950 text-white font-black text-4xl flex items-center justify-center border-4 border-white/40 shadow-2xl">
                {donor.name.charAt(0)}
              </div>
            )}

            {/* Blood Group Badge Over Photo */}
            <span className="absolute -bottom-2 -right-2 px-3 py-1 bg-white text-red-600 font-black text-xs md:text-sm rounded-xl shadow-lg border border-red-100 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 fill-current text-red-600" />
              <span>{donor.bloodGroup}</span>
            </span>

            {/* Change Photo Overlay Button */}
            <button
              onClick={() => {
                setPhotoPreview(donor.photoUrl || null);
                setPhotoInputUrl(donor.photoUrl || '');
                setPhotoError('');
                setIsPhotoModalOpen(true);
              }}
              className="absolute inset-0 bg-black/50 rounded-3xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
              title="প্রোফাইল ছবি পরিবর্তন করুন"
            >
              <Camera className="w-6 h-6 mb-1 text-white" />
              <span className="text-[10px] font-bold">ছবি পরিবর্তন</span>
            </button>
          </div>

          {/* Profile Basic Meta */}
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black">{donor.name}</h1>
              {donor.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>যাচাইকৃত রক্তদাতা</span>
                </span>
              )}
            </div>

            {donor.nameEn && (
              <p className="text-sm text-rose-100 font-medium tracking-wide">{donor.nameEn}</p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-rose-100 pt-1 font-semibold">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-rose-200" />
                <span>বয়স: <strong className="text-white">{donor.age} বছর</strong></span>
              </span>
              <span>•</span>
              <span>লিঙ্গ: <strong className="text-white">{donor.gender === 'MALE' ? 'পুরুষ' : donor.gender === 'FEMALE' ? 'নারী' : 'অন্যান্য'}</strong></span>
              {donor.occupation && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-rose-200" />
                    <span>{donor.occupation}</span>
                  </span>
                </>
              )}
            </div>

            {/* Quick Status Pill */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
              {isEligible ? (
                <span className="px-3.5 py-1.5 bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>রক্তদানে প্রস্তুত (Eligible)</span>
                </span>
              ) : (
                <span className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>
                    {daysRemaining > 0
                      ? `পরবর্তী দান ${daysRemaining} দিন পর (${nextEligibleDateStr})`
                      : 'সাময়িক রক্তদানে বাধা / অনুপযুক্ত'}
                  </span>
                </span>
              )}

              <button
                onClick={() => {
                  setPhotoPreview(donor.photoUrl || null);
                  setPhotoInputUrl(donor.photoUrl || '');
                  setPhotoError('');
                  setIsPhotoModalOpen(true);
                }}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors inline-flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>ছবি ম্যানেজ করুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Interactive Action Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Contact Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${donor.phone}`}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl shadow-md transition-colors"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span>কল দিন: {donor.phone}</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-3.5 py-2 rounded-xl shadow-md transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>হোয়াটসঅ্যাপ</span>
          </a>

          <button
            onClick={handleCopyPhone}
            className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 font-bold flex items-center gap-1"
            title="ফোন নম্বর কপি করুন"
          >
            {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedPhone ? 'কপি হয়েছে' : 'কপি'}</span>
          </button>
        </div>

        {/* Management Actions */}
        {showAdminActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl shadow-md transition-colors"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>নতুন দান রেকর্ড করুন</span>
            </button>

            {onEdit && (
              <button
                onClick={() => onEdit(donor)}
                className="inline-flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold px-3.5 py-2 rounded-xl transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>এডিট প্রোফাইল</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Profile Details Grid */}
      <div className="p-6 md:p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300">
        {/* 1. Blood Donation & Eligibility Overview Banner */}
        <div className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 dark:from-red-950/40 dark:via-rose-950/30 dark:to-orange-950/20 border border-red-200 dark:border-red-900/60 rounded-3xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-red-900 dark:text-red-300 flex items-center gap-2 text-sm">
              <Droplet className="w-4 h-4 text-red-600 fill-current" />
              <span>রক্তদান ও মেডিকেল মোট স্ট্যাটাস</span>
            </h2>
            <span className="px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] tracking-wide">
              {donor.bloodGroup} রক্তদাতা
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-red-100 dark:border-red-900/40">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">সর্বশেষ রক্তদান:</span>
              <span className="font-black text-slate-900 dark:text-white text-xs md:text-sm">
                {donor.lastDonationDate || 'কখনো দেওয়া হয়নি'}
              </span>
            </div>

            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-red-100 dark:border-red-900/40">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">মোট দান সম্পন্ন:</span>
              <span className="font-black text-red-600 dark:text-red-400 text-xs md:text-sm">
                {donor.totalDonations || 0} বার
              </span>
            </div>

            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-red-100 dark:border-red-900/40">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">পরবর্তী রক্তদানের তারিখ:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs md:text-sm">
                {nextEligibleDateStr || 'এখনই সম্ভব'}
              </span>
            </div>

            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-red-100 dark:border-red-900/40">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">মেডিকেল স্ট্যাটাস:</span>
              <span className={`font-black text-xs md:text-sm ${isEligible ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isEligible ? 'সম্পূর্ণ উপযুক্ত' : 'সাময়িক বিরত'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Personal & Address Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Box */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
              <User className="w-4 h-4 text-red-600" />
              <span>ব্যক্তিগত ও সামাজিক তথ্য</span>
            </h3>

            <div className="space-y-2 font-medium">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">নাম (বাংলা):</span>
                <span className="font-bold text-slate-900 dark:text-white">{donor.name}</span>
              </div>

              {donor.nameEn && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Name (English):</span>
                  <span className="font-bold text-slate-900 dark:text-white">{donor.nameEn}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">পেশা (Occupation):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{donor.occupation || 'N/A'}</span>
              </div>

              {donor.fatherOrSpouseName && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">পিতা/স্বামীর নাম:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{donor.fatherOrSpouseName}</span>
                </div>
              )}

              {donor.nidOrBirthCert && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">এনআইডি/জন্ম নিবন্ধন:</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{donor.nidOrBirthCert}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">হোয়াটসঅ্যাপ নম্বর:</span>
                <span className="font-bold font-mono text-teal-600">{donor.whatsAppPhone || donor.phone}</span>
              </div>
            </div>
          </div>

          {/* Address & Geographical Info Box */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>ঠিকানা ও অবস্থান (পাংশা ও পার্শ্ববর্তী এলাকা)</span>
            </h3>

            <div className="space-y-2 font-medium">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">গ্রাম / মহল্লা:</span>
                <span className="font-bold text-slate-900 dark:text-white">{donor.village}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">ইউনিয়ন / ওয়ার্ড:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{donor.union}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">উপজেলা:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{donor.upazila}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">জেলা:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{donor.district}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">বিভাগ:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{donor.division || 'ঢাকা'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Detailed Medical Health Parameters */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>মেডিকেল ও স্বাস্থ্য বিবরণী (Medical Parameters)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">হিমোগ্লোবিন লেভেল:</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-xs">{donor.hemoglobinLevel || 'যাচাইকৃত (উপযুক্ত)'}</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">ওজন (Weight):</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                {donor.weightKg ? `${donor.weightKg} কেজি` : 'উপযুক্ত (>৫০ কেজি)'}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">ব্লাড প্রেশার:</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-xs">{donor.bpNotes || 'স্বাভাবিক'}</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">ডায়াবেটিস:</span>
              <span className={`font-extrabold text-xs ${donor.hasDiabetes ? 'text-amber-600' : 'text-emerald-600'}`}>
                {donor.hasDiabetes ? 'আছে (নিয়ন্ত্রিত)' : 'নেই'}
              </span>
            </div>
          </div>

          {/* Medical Warnings or Illness Notes */}
          {(donor.hasHepatitis || donor.otherDiseases || donor.medicalNotes) && (
            <div className="space-y-2 pt-1">
              {donor.hasHepatitis && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl text-red-900 dark:text-red-300 flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs">হেপাটাইটিস / জন্ডিস সংক্রান্ত রেকর্ড</h4>
                    <p className="text-[11px] opacity-90 mt-0.5">রক্তদাতার মেডিকেল ফাইলে হেপাটাইটিসের উল্লেখ রয়েছে। রক্ত গ্রহণের পূর্বে ল্যাব পরীক্ষা বাধ্যতামূলক।</p>
                  </div>
                </div>
              )}

              {donor.otherDiseases && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-amber-900 dark:text-amber-300">
                  <p className="font-bold text-[11px] mb-0.5">অন্যান্য শারীরিক অসুস্থতা / রেকর্ড:</p>
                  <p className="text-xs">{donor.otherDiseases}</p>
                </div>
              )}

              {donor.medicalNotes && (
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="font-bold text-slate-400 text-[10px] uppercase mb-1">অতিরিক্ত মেডিকেল নোটস:</p>
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{donor.medicalNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Emergency Contact Details */}
        {(donor.emergencyContactName || donor.emergencyContactPhone) && (
          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-3xl border border-amber-200 dark:border-amber-900/40 space-y-3">
            <h3 className="font-extrabold text-amber-900 dark:text-amber-400 flex items-center gap-2 text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>জরুরী যোগাযোগ (Emergency Contact)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-semibold">
              <div>
                <span className="text-[10px] text-slate-400 block">যোগাযোগকারীর নাম:</span>
                <span className="text-slate-900 dark:text-white">{donor.emergencyContactName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">সম্পর্ক:</span>
                <span className="text-slate-900 dark:text-white">{donor.emergencyContactRelation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">জরুরী ফোন নম্বর:</span>
                <a href={`tel:${donor.emergencyContactPhone}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  {donor.emergencyContactPhone || 'N/A'}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 5. Blood Donation History Table & Timeline */}
        <div className="pt-2">
          <DonationHistoryTable
            donor={donor}
            history={history}
            onHistoryChange={fetchHistory}
            onDonorUpdate={updated => {
              setDonor(updated);
              if (onUpdateDonor) onUpdateDonor(updated);
            }}
            showAddButton={showAdminActions}
            allowDelete={showAdminActions}
          />
        </div>

        {/* Audit Meta Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex flex-wrap justify-between gap-2 font-mono">
          <span>আইডি: {donor.id}</span>
          <span>নিবন্ধন তারিখ: {new Date(donor.createdAt).toLocaleDateString('bn-BD')}</span>
          <span>সর্বশেষ আপডেট: {new Date(donor.updatedAt).toLocaleDateString('bn-BD')}</span>
        </div>
      </div>

      {/* 6. PROFILE PHOTO MANAGEMENT MODAL */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-base">প্রোফাইল ছবি ম্যানেজমেন্ট</h3>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {photoError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-bold">
                  {photoError}
                </div>
              )}

              {/* Photo Preview Container */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="relative">
                  {photoPreview || photoInputUrl ? (
                    <img
                      src={photoPreview || photoInputUrl}
                      alt="Preview"
                      className="w-32 h-32 rounded-3xl object-cover border-4 border-red-500 shadow-xl bg-slate-100"
                      onError={() => setPhotoError('ছবির ইউআরএল টি লোড করা যাচ্ছে না')}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-3xl bg-slate-800 text-white font-black text-4xl flex items-center justify-center border-4 border-slate-700 shadow-xl">
                      {donor.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-bold">
                  {photoPreview ? 'নতুন ছবি প্রিভিউ' : 'বর্তমান ছবি'}
                </span>
              </div>

              {/* Upload Methods */}
              <div className="space-y-3">
                {/* File Upload Button */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ডিভাইস থেকে ছবি আপলোড করুন:
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer font-bold text-slate-800 dark:text-slate-200 transition-colors">
                    <Upload className="w-4 h-4 text-red-600" />
                    <span>গ্যালারি বা ক্যামেরা থেকে ছবি বেছে নিন</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Avatars */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    অথবা ডেমো অ্যাভাটার বেছে নিন:
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => {
                          setPhotoPreview(avatar.url);
                          setPhotoInputUrl(avatar.url);
                          setPhotoError('');
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                          photoPreview === avatar.url || photoInputUrl === avatar.url
                            ? 'border-red-600 scale-105 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <img src={avatar.url} alt={avatar.label} className="w-full h-12 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL Input */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    অথবা ইমেজের ওয়েব লিংক (URL) দিন:
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={photoInputUrl}
                    onChange={(e) => {
                      setPhotoInputUrl(e.target.value);
                      setPhotoPreview(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                {donor.photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={savingPhoto}
                    className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 font-bold flex items-center gap-1.5 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ছবি রিমুভ</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePhoto}
                    disabled={savingPhoto}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingPhoto ? 'সংরক্ষণ হচ্ছে...' : 'ছবি সংরক্ষণ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Donation Modal */}
      {isRecordModalOpen && (
        <RecordDonationModal
          donor={donor}
          onClose={() => setIsRecordModalOpen(false)}
          onSuccess={() => {
            showToast('রক্তদানের ইতিহাস সংরক্ষণ সফল হয়েছে!');
            // Refresh history and donor data
            fetchHistory();
            donorService.getDonorById(donor.id).then(updated => {
              if (updated) {
                setDonor(updated);
                if (onUpdateDonor) onUpdateDonor(updated);
              }
            });
          }}
        />
      )}
    </div>
  );
};
