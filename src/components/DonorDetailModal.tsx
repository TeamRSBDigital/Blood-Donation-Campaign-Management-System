import React, { useState, useEffect } from 'react';
import { Donor, DonationHistory } from '../types/index.js';
import { useLanguage } from '../context/LanguageContext.js';
import { EligibilityBadge } from './common/EligibilityBadge.js';
import {
  X,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  MapPin,
  CheckCircle2,
  Award,
  Activity,
  User,
  ShieldAlert,
  FileText
} from 'lucide-react';

interface DonorDetailModalProps {
  donor: Donor | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const DonorDetailModal: React.FC<DonorDetailModalProps> = ({ donor, onClose }) => {
  const { t, language } = useLanguage();
  const [history, setHistory] = useState<DonationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!donor) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/donors/${donor.id}/history`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error('Failed to load donor history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [donor]);

  if (!donor) return null;

  const isAvailable = donor.status === 'AVAILABLE';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(donor.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = donor.phone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `আসসালামু আলাইকুম ${donor.name}, পাংশা ব্লাড ডোনার্স এসোসিয়েশন থেকে আপনার সাথে রক্তের প্রয়োজনে কথা বলতে চাচ্ছি।`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-red-600 font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
              {donor.bloodGroup}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold">{donor.name}</h2>
                {donor.isVerified && (
                  <span className="bg-emerald-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>যাচাইকৃত</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-100 mt-1">
                {donor.age} বছর • {donor.gender === 'MALE' ? 'পুরুষ' : 'নারী'} • মোট রক্তদান: {donor.totalDonations} বার
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Quick Contact Bar */}
          <div className="bg-rose-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-rose-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">মোবাইল নাম্বার:</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-wider">{donor.phone}</p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${donor.phone}`}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-colors"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>{t.callNow}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <button
                onClick={handleCopyPhone}
                className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal & Address Info */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>স্থান ও ঠিকানা</span>
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <p><span className="text-slate-400">জেলা:</span> <strong className="text-slate-900 dark:text-white">{donor.district || 'Rajbari'}</strong></p>
                <p><span className="text-slate-400">উপজেলা:</span> <strong className="text-slate-900 dark:text-white">{donor.upazila || 'Pangsha'}</strong></p>
                <p><span className="text-slate-400">ইউনিয়ন:</span> <strong className="text-slate-900 dark:text-white">{donor.union}</strong></p>
                <p><span className="text-slate-400">গ্রাম/মহল্লা:</span> {donor.village || 'N/A'}</p>
              </div>
            </div>

            {/* Status & Medical Parameters */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>অবস্থা ও স্বাস্থ্য তথ্য</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="pt-1">
                  <p className="text-slate-400 mb-1">রক্তদানের যোগ্যতা ও স্ট্যাটাস:</p>
                  <EligibilityBadge
                    lastDonationDate={donor.lastDonationDate}
                    showNextDate={true}
                    showDetails={true}
                    size="md"
                  />
                </div>
                <p><span className="text-slate-400">সর্বশেষ রক্তদান:</span> <strong className="text-slate-900 dark:text-white">{donor.lastDonationDate || 'কখনো দেওয়া হয়নি'}</strong></p>
                <p><span className="text-slate-400">হিমোগ্লোবিন:</span> <strong className="text-emerald-600 dark:text-emerald-400">{donor.hemoglobinLevel || 'যাচাইকৃত'}</strong></p>
                <p><span className="text-slate-400">ওজন:</span> {donor.weightKg ? `${donor.weightKg} কেজি` : 'উপযুক্ত (>৫০ কেজি)'}</p>
                {donor.medicalNotes && (
                  <p><span className="text-slate-400">মেডিকেল নোট:</span> {donor.medicalNotes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Donation History Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>রক্তদানের বিস্তারিত ইতিহাস</span>
              </span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                {history.length} টি রেকর্ড
              </span>
            </h3>

            {loadingHistory ? (
              <p className="text-xs text-slate-400 py-4 text-center">ইতিহাস লোড করা হচ্ছে...</p>
            ) : history.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-500">
                {t.noHistoryYet}
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-700 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{record.hospitalName}</p>
                      {record.patientName && (
                        <p className="text-slate-500 dark:text-slate-400">রোগী: {record.patientName}</p>
                      )}
                      {record.notes && (
                        <p className="text-slate-400 italic mt-0.5">{record.notes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded text-[11px]">
                        {record.date}
                      </span>
                      {record.verifiedBy && (
                        <p className="text-[10px] text-emerald-600 mt-1">✓ Verified</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
