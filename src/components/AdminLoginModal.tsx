import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { ORG_CONFIG } from '../config/org.config.js';
import { X, Shield, Mail, KeyRound, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const { t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('superadmin@pbda.org');
  const [password, setPassword] = useState('superadmin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('ইমেইল ও পাসওয়ার্ড প্রদান আবশ্যক');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('লগইন সফল হয়েছে! ড্যাশবোর্ডে পুনঃনির্দেশ করা হচ্ছে...');
      setTimeout(() => {
        onSuccessLogin();
        onClose();
        setSuccessMsg('');
      }, 800);
    } else {
      setErrorMsg(res.error || 'লগইন করতে ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড পরীক্ষা করুন।');
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 text-white relative">
          <button
            onClick={onClose}
            aria-label="মোডাল বন্ধ করুন"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shrink-0 border border-white/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{ORG_CONFIG.nameBn}</h3>
              <p className="text-xs text-rose-200 font-medium">এডমিন ও স্টাফ অথেন্টিকেশন প্যানেল</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold rounded-2xl border border-red-200 dark:border-red-900/60 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ইমেইল এড্রেস
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pbda.org"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden transition-all"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <span>মনে রাখুন</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotPasswordDialog(true)}
              className="font-bold text-red-600 hover:underline dark:text-red-400 text-xs"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <span>ড্যাশবোর্ডে লগইন করুন</span>
            )}
          </button>

          {/* Quick Demo Fill Helper */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>এক ক্লিকে রোলভিত্তিক ডেমো অ্যাকাউন্ট দিন:</span>
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

        {/* Forgot Password Modal Dialog Popup */}
        {showForgotPasswordDialog && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs p-6 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 text-center space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm">
              <HelpCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  পাসওয়ার্ড রিসেট নির্দেশনা
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  নিরাপত্তা ব্যবস্থার কারণে সর্বসাধারণের পাসওয়ার্ড রিসেট বন্ধ রাখা হয়েছে। আপনার পাসওয়ার্ড রিসেট বা রিকভারির জন্য সরাসরি{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    পাংশা ব্লাড ডোনার্স এসোসিয়েশন
                  </span>{' '}
                  সুপার এডমিনের সাথে যোগাযোগ করুন।
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotPasswordDialog(false)}
                className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs hover:bg-slate-800"
              >
                ঠিক আছে, বুঝতে পেরেছি
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
