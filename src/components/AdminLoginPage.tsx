import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { ORG_CONFIG } from '../config/org.config.js';
import { Shield, Mail, KeyRound, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, ArrowLeft, HelpCircle, X } from 'lucide-react';

interface AdminLoginPageProps {
  onSuccessLogin: () => void;
  onGoHome?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccessLogin,
  onGoHome,
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
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('ইমেইল ও পাসওয়ার্ড প্রদান আবশ্যক');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await login(email, password, rememberMe);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('লগইন সফল হয়েছে! ড্যাশবোর্ডে পুনঃনির্দেশ করা হচ্ছে...');
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/dashboard');
      }
      setTimeout(() => {
        onSuccessLogin();
      }, 500);
    } else {
      setErrorMsg(res.error || 'লগইন করতে ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড পরীক্ষা করুন।');
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-red-600 p-8 text-white text-center relative">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="ওয়েবসাইটে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-16 h-16 bg-white text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-md mb-3 font-black text-2xl border border-red-100">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-black">{ORG_CONFIG.nameBn}</h2>
          <p className="text-xs text-red-100 font-medium mt-1">প্রশাসনিক নিরাপত্তা ও স্টাফ অথেন্টিকেশন পোর্টাল</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-200 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              ইমেইল এড্রেস
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pbda.org"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-3 text-xs font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-10 py-3 text-xs font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all"
              />
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-600 cursor-pointer"
              />
              <span>মনে রাখুন (Remember Me)</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setForgotSent(false);
                setShowForgotPasswordModal(true);
              }}
              className="text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
            )}
          </button>

          {/* Demo Account Fillers */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>এক ক্লিকে রোলভিত্তিক ডেমো অ্যাকাউন্ট সিলেক্ট করুন:</span>
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoFill('superadmin@pbda.org', 'superadmin123')}
                className="px-2 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-800 text-[10px] font-bold rounded-lg transition-colors border border-gray-200 cursor-pointer"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@pbda.org', 'admin123')}
                className="px-2 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-800 text-[10px] font-bold rounded-lg transition-colors border border-gray-200 cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('volunteer@pbda.org', 'volunteer123')}
                className="px-2 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-800 text-[10px] font-bold rounded-lg transition-colors border border-gray-200 cursor-pointer"
              >
                Volunteer
              </button>
            </div>
          </div>
        </form>
      </div>

      <p className="text-[11px] text-gray-400 font-semibold text-center mt-6">
        © {new Date().getFullYear()} {ORG_CONFIG.nameBn} - গোপনীয় প্রশাসনিক প্যানেল
      </p>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <HelpCircle className="w-5 h-5" />
                <span>পাসওয়ার্ড পুনরুদ্ধার</span>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSent ? (
              <div className="space-y-3 py-2 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-gray-900">পুনরুদ্ধার নির্দেশিকা পাঠানো হয়েছে!</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  আপনার নিবন্ধিত ইমেইল (<span className="font-bold text-gray-800">{forgotEmail}</span>)-এ পাসওয়ার্ড রিসেট নির্দেশিকা পাঠানো হয়েছে। অথবা প্রধান আইটি এডমিন (<span className="font-bold text-red-600">superadmin@pbda.org</span>) এর সাথে যোগাযোগ করুন।
                </p>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="w-full py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-colors cursor-pointer"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  পাসওয়ার্ড ভুলে গেলে আপনার এডমিন ইমেইল প্রদান করুন। সেশন রিসেট করার প্রক্রিয়া ইমেইলে অথবা প্রধান প্রশাসনিক কর্মকর্তা কর্তৃক নিশ্চিত করা হবে।
                </p>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ইমেইল এড্রেস
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@pbda.org"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    রিসেট লিংক পাঠান
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
