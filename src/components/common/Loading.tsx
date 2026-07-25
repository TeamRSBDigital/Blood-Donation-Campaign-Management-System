import React from 'react';
import { Droplet } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'তথ্য লোড হচ্ছে...',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-red-100 dark:border-red-950 border-t-red-600 animate-spin" />
        <Droplet className="w-5 h-5 text-red-600 fill-current absolute inset-0 m-auto" />
      </div>
      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
