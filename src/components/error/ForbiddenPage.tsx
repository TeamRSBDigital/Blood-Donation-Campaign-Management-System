import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';

interface ForbiddenPageProps {
  onBack?: () => void;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 shadow-lg">
        <Lock className="w-10 h-10" />
      </div>

      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
        Error 403
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
        অনুমতি নেই (Forbidden Access)
      </h1>

      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        আপনার এই নির্দিষ্ট প্রশাসনিক ফিচার বা পাতায় এক্সেস করার অনুমতি নেই।
      </p>

      <button
        onClick={onBack || (() => window.history.back())}
        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider shadow-md transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>পূর্ববর্তী পাতায় ফিরে যান</span>
      </button>
    </div>
  );
};
