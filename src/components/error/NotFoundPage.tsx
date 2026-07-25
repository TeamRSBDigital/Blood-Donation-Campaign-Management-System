import React from 'react';
import { Home, SearchX } from 'lucide-react';

interface NotFoundPageProps {
  onGoHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-6 shadow-lg">
        <SearchX className="w-10 h-10" />
      </div>

      <span className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
        Error 404
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
        পৃষ্ঠাটি পাওয়া যায়নি (Page Not Found)
      </h1>

      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        আপনি যে লিংকটি অনুসন্ধান করছেন তা পরিবর্তিত হতে পারে অথবা বর্তমানে উপলব্ধ নেই।
      </p>

      <button
        onClick={onGoHome || (() => window.location.href = '/')}
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider shadow-md transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>হোমপেজে ফিরে যান</span>
      </button>
    </div>
  );
};
