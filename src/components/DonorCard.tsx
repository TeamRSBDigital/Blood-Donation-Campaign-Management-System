import React, { useState } from 'react';
import { Donor } from '../types/index.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Phone,
  Copy,
  Check,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Droplet,
  MessageCircle,
  Eye,
  Award
} from 'lucide-react';

interface DonorCardProps {
  donor: Donor;
  onSelectDonor: (donor: Donor) => void;
}

export const DonorCard: React.FC<DonorCardProps> = ({ donor, onSelectDonor }) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const isAvailable = donor.status === 'AVAILABLE';

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(donor.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format clean phone for WhatsApp
  const cleanPhone = donor.phone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `আসসালামু আলাইকুম ${donor.name}, পাংশা ব্লাড ডোনার্স এসোসিয়েশন থেকে জরুরী রক্তের প্রয়োজনে যোগাযোগ করছি।`
  )}`;

  return (
    <div
      onClick={() => onSelectDonor(donor)}
      className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:shadow-xl hover:border-red-300 dark:hover:border-red-700/60 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Status & Verification Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
              {donor.bloodGroup}
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {donor.name}
                </h3>
                {donor.isVerified && (
                  <span title="যাচাইকৃত রক্তদাতা" className="text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 fill-emerald-100 dark:fill-emerald-950/60" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {donor.age} বছর • {donor.gender === 'MALE' ? 'পুরুষ' : donor.gender === 'FEMALE' ? 'নারী' : 'অন্যান্য'}
              </p>
            </div>
          </div>

          {/* Availability Badge */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-xs ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            {isAvailable ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.readyToDonate}</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-amber-600" />
                <span>{t.notReadyYet}</span>
              </>
            )}
          </span>
        </div>

        {/* Location & Stats Info */}
        <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-700/60 text-xs">
          <div className="flex items-center text-slate-600 dark:text-slate-300 gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate">
              {donor.union}, {donor.village} (পাংশা)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>সর্বশেষ দান:</span>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {donor.lastDonationDate || 'কখনো দেওয়া হয়নি'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>মোট রক্তদান:</span>
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
              {donor.totalDonations} বার
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-2 flex items-center gap-2">
        <a
          href={`tel:${donor.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-xs transition-colors"
        >
          <Phone className="w-3.5 h-3.5 fill-current" />
          <span>{t.callNow}</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="হোয়াটসঅ্যাপে বার্তা পাঠান"
          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </a>

        <button
          onClick={handleCopyPhone}
          title="ফোন নাম্বার কপি করুন"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>

        <button
          onClick={() => onSelectDonor(donor)}
          title="প্রোফাইল দেখুন"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
