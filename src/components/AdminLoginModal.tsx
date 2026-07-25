import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { X, Shield, Lock, Mail, KeyRound, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin
}) => {
  const { t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('superadmin@pbda.org');
  const [password, setPassword] = useState('superadmin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      onSuccessLogin();
      onClose();
    } else {
      setErrorMsg(res.error || 'লগইন ব্যর্থ হয়েছে');
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t.adminDashboardTitle}</h3>
              <p className="text-xs text-slate-300">পাংশা ব্লাড ডোনার্স এসোসিয়েশন সিকিউর প্যানেল</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              এডমিন ইমেইল
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pbda.org"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              সিক্রেট পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all"
          >
            {loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
          </button>

          {/* Quick Demo Accounts Fill Helper */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>এক ক্লিকে ডেমো অ্যাকাউন্ট ফিল করুন:</span>
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoFill('superadmin@pbda.org', 'superadmin123')}
                className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-[10px] font-bold rounded-lg truncate"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@pbda.org', 'admin123')}
                className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-[10px] font-bold rounded-lg truncate"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('volunteer@pbda.org', 'volunteer123')}
                className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-[10px] font-bold rounded-lg truncate"
              >
                Volunteer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
