import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface ForbiddenPageProps {
  onGoHome: () => void;
  requiredRole?: string;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ onGoHome, requiredRole }) => {
  return (
    <div className="min-h-[450px] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black tracking-widest text-red-600 dark:text-red-400 uppercase bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-200 dark:border-red-900">
            403 FORBIDDEN
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            প্রবেশাধিকার সংরক্ষিত
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            আপনার বর্তমান একাউন্ট রোল দিয়ে এই সেকশনে প্রবেশের অনুমতি নেই। শুধুমাত্র{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {requiredRole || 'সুপার এডমিন'}
            </span>{' '}
            এই সেকশনটি পরিচালনা করতে পারেন।
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onGoHome}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md"
          >
            <Home className="w-4 h-4 text-red-400" />
            <span>ড্যাশবোর্ড হোমে ফিরে যান</span>
          </button>
        </div>
      </div>
    </div>
  );
};
