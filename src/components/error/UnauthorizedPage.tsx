import React from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';

interface UnauthorizedPageProps {
  onLogin?: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 shadow-lg">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
        Error 401
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
        লগইন প্রয়োজন (Unauthorized Access)
      </h1>

      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        এই পাতায় প্রবেশের জন্য আপনাকে অনুমোদিত এডমিন বা ভলান্টিয়ার হিসেবে লগইন করতে হবে।
      </p>

      {onLogin && (
        <button
          onClick={onLogin}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider shadow-md transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>এডমিন প্যানেলে লগইন করুন</span>
        </button>
      )}
    </div>
  );
};
