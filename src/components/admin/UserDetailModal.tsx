import React from 'react';
import { AdminUser } from '../../types/index.js';
import { Shield, Mail, Phone, Calendar, Clock, Lock, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface UserDetailModalProps {
  user: AdminUser | null;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-bold rounded-full text-xs flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> সুপার এডমিন (Super Admin)</span>;
      case 'ADMIN':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold rounded-full text-xs flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> এডমিন (Admin)</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold rounded-full text-xs">ভলান্টিয়ার (Volunteer)</span>;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'SUSPENDED':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold rounded-full text-xs flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> স্থগিত (Suspended)</span>;
      case 'INACTIVE':
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-bold rounded-full text-xs flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> নিষ্ক্রিয় (Inactive)</span>;
      default:
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold rounded-full text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> সক্রিয় (Active)</span>;
    }
  };

  const getPermissionsList = (role: string) => {
    if (role === 'SUPER_ADMIN') {
      return [
        'পূর্ণ সিস্টেম অ্যাক্সেস ও ডাটাবেজ ব্যাকআপ/রিস্টোর',
        'এডমিন ও ভলান্টিয়ার যোগ, পরিবর্তন ও রিমুভ',
        'সকল রক্তদাতা ও রক্ত আবেদন অনুমোদন/বাতিল',
        'সিস্টেম কনফিগারেশন, নোটিফিকেশন ও মেসেজিং সেটিংস'
      ];
    } else if (role === 'ADMIN') {
      return [
        'রক্তদাতা ও রক্ত আবেদন ব্যবস্থাপনা (অনুমোদন/এডিট)',
        'ক্যাম্পেইন ও এমার্জেন্সি কনট্যাক্ট কন্টেন্ট আপডেট',
        'আরবিএসি ইউজার তালিকা দেখার অনুমতি (View Only)'
      ];
    }
    return [
      'রক্তদাতা ও রক্তের আবেদন নিবন্ধনে সহায়তা',
      'ক্যাম্পেন ও প্রচারণায় অংশগ্রহণ'
    ];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 font-black text-2xl flex items-center justify-center border border-red-200 dark:border-red-900 shadow-inner">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              user.name.slice(0, 2)
            )}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{user.name}</h3>
            <p className="text-xs font-mono text-slate-500">{user.id}</p>
            <div className="flex items-center gap-2 mt-2">
              {getRoleBadge(user.role)}
              {getStatusBadge(user.status)}
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-2 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> ইমেইল ঠিকানা</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> মোবাইল নম্বর</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> নিবন্ধনের সময়</span>
              <span className="text-slate-800 dark:text-slate-200">{new Date(user.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> সর্বশেষ লগইন</span>
              <span className="text-slate-800 dark:text-slate-200">{user.lastLogin ? new Date(user.lastLogin).toLocaleString('bn-BD') : 'তথ্য নেই'}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">অ্যাকাউন্ট পারমিশন ও এক্সেস লেভেল:</h4>
            <ul className="space-y-1.5">
              {getPermissionsList(user.role).map((perm, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
