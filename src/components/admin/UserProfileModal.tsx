import React from 'react';
import { X, User, ShieldCheck, Mail, Phone, Calendar, Key, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { ROLES } from '../../constants/roles.js';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePasswordClick: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onChangePasswordClick,
}) => {
  const { user } = useAuth();

  if (!isOpen || !user) return null;

  const roleMeta = ROLES[user.role] || { labelBn: user.role, labelEn: user.role, level: 1 };

  const getPermissionsList = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return [
          'পূর্ণাঙ্গ সিস্টেম অ্যাকসেস ও কন্ট্রোল',
          'নতুন এডমিন ও ব্যবহারকারী তৈরি ও ব্যবস্থাপনা',
          'অডিট লগ পর্যবেক্ষণ ও সিস্টেম কনফিগারেশন',
          'রক্তদাতা ও চাহিদা ডাটাবেজ নিয়ন্ত্রণ'
        ];
      case 'ADMIN':
        return [
          'ড্যাশবোর্ড পর্যবেক্ষণ ও অ্যানালিটিক্স',
          'রক্তদাতা নিবন্ধন ও তথ্য আপডেট',
          'রক্তের জরুরি চাহিদার অনুমোদন ও আপডেট',
          'টেলিগ্রাম ও সিস্টেম নোটিফিকেশন হ্যান্ডলিং'
        ];
      case 'VOLUNTEER':
        return [
          'নতুন রক্তদাতার তথ্য ফরম সংগ্রহ ও তৈরি',
          'রক্তদাতার যোগাযোগের তথ্য হালনাগাদ',
          'রক্তের চাহিদার প্রাক-যাচাইকরণ'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold">{user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{roleMeta.labelBn}</span>
                </span>
                <span className="text-[11px] text-slate-300">({roleMeta.labelEn})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">ইমেইল এড্রেস</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">ফোন নাম্বার</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user.phone || '+880 1700-000000'}</p>
              </div>
            </div>
          </div>

          {/* Role Permissions Card */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>আপনার অনুমোদিত অ্যাকসেস পাওয়ার:</span>
            </h4>
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40 space-y-1.5">
              {getPermissionsList().map((perm, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password CTA */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onClose();
                onChangePasswordClick();
              }}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-red-500" />
              <span>পাসওয়ার্ড পরিবর্তন করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
