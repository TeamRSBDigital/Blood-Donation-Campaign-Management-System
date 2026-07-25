import React from 'react';
import { ServerCrash, RefreshCw } from 'lucide-react';

interface ServerErrorPageProps {
  onRetry?: () => void;
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({ onRetry }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 shadow-lg">
        <ServerCrash className="w-10 h-10" />
      </div>

      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
        Error 500
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
        সার্ভার সমস্যা (Internal Server Error)
      </h1>

      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        সার্ভারে সাময়িক সমস্যা দেখা দিয়েছে। আমাদের টিম বিষয়টি সমাধান করার চেষ্টা করছে।
      </p>

      <button
        onClick={onRetry || (() => window.location.reload())}
        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider shadow-md transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span>রিফ্রেশ করুন</span>
      </button>
    </div>
  );
};
