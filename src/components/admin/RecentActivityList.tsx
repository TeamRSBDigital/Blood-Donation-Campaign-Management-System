import React from 'react';
import { Activity, Shield, UserCheck, Droplet, AlertCircle, Clock } from 'lucide-react';

export interface ActivityItem {
  id: string;
  user: string;
  role: string;
  action: string;
  details: string;
  timestamp: string;
  category: 'DONOR' | 'REQUEST' | 'AUTH' | 'SYSTEM';
}

interface RecentActivityListProps {
  activities?: ActivityItem[];
  title?: string;
  limit?: number;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
  title = 'সাম্প্রতিক অ্যাক্টিভিটি লগ',
  limit = 5,
}) => {
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      user: 'সুপার এডমিন',
      role: 'SUPER_ADMIN',
      action: 'এডমিন লগইন',
      details: 'সুপার এডমিন প্যানেলে সফলভাবে লগইন করেছেন',
      timestamp: '৫ মিনিট আগে',
      category: 'AUTH',
    },
    {
      id: '2',
      user: 'আরিফুল ইসলাম',
      role: 'ADMIN',
      action: 'রক্তদাতা আপডেট',
      details: 'মোঃ রফিক (A+) রক্তদাতার শেষ রক্তদানের তারিখ হালনাগাদ করা হয়েছে',
      timestamp: '২৫ মিনিট আগে',
      category: 'DONOR',
    },
    {
      id: '3',
      user: 'ভলান্টিয়ার টিম',
      role: 'VOLUNTEER',
      action: 'জরুরী রিকোয়েস্ট যোগ',
      details: 'পাংশা উপজেলা হাসপাতালের জন্য AB+ রক্তের চাহিদা পোস্ট করা হয়েছে',
      timestamp: '১ ঘণ্টা আগে',
      category: 'REQUEST',
    },
    {
      id: '4',
      user: 'সিস্টেম',
      role: 'SYSTEM',
      action: 'টেলিগ্রাম বোট এলার্ট',
      details: 'জরুরী রক্তের চাহিদা সাকসেসফুলি টেলিগ্রাম চ্যানেলে ব্রডকাস্ট হয়েছে',
      timestamp: '২ ঘণ্টা আগে',
      category: 'SYSTEM',
    },
  ];

  const items = (activities || defaultActivities).slice(0, limit);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-600" />
          <span>{title}</span>
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>রিয়েলটাইম আপডেট</span>
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                item.category === 'AUTH'
                  ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                  : item.category === 'DONOR'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                  : item.category === 'REQUEST'
                  ? 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
              }`}
            >
              {item.category === 'AUTH' ? (
                <Shield className="w-4 h-4" />
              ) : item.category === 'DONOR' ? (
                <UserCheck className="w-4 h-4" />
              ) : item.category === 'REQUEST' ? (
                <Droplet className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.user}
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-extrabold uppercase">
                    {item.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{item.action}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                {item.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
