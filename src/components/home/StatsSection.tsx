import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { Users, UserCheck, HeartPulse, Award } from 'lucide-react';

interface StatsSectionProps {
  stats?: {
    totalDonors?: number;
    availableDonors?: number;
    totalRequests?: number;
    totalDonations?: number;
  };
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats = {
    totalDonors: 2540,
    availableDonors: 1420,
    totalRequests: 890,
    totalDonations: 1850,
  },
}) => {
  const { language } = useLanguage();

  const statCards = [
    {
      id: 'donors',
      icon: Users,
      count: stats.totalDonors || 2540,
      labelBn: 'মোট নিবন্ধিত রক্তদাতা',
      labelEn: 'Total Registered Donors',
      badgeBn: 'পাংশা ও রাজবাড়ী',
      badgeEn: 'Pangsha & Rajbari',
      color: 'from-red-500 to-rose-600',
      iconBg: 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400',
    },
    {
      id: 'available',
      icon: UserCheck,
      count: stats.availableDonors || 1420,
      labelBn: 'প্রস্তুত রক্তদাতা (Available)',
      labelEn: 'Available Donors Now',
      badgeBn: 'প্রস্তুত আছেন',
      badgeEn: 'Ready to Donate',
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'requests',
      icon: HeartPulse,
      count: stats.totalRequests || 890,
      labelBn: 'সম্পন্ন রক্তদান রিকুয়েস্ট',
      labelEn: 'Fulfilled Blood Requests',
      badgeBn: 'সফলভাবে সম্পন্ন',
      badgeEn: 'Successfully Managed',
      color: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'donations',
      icon: Award,
      count: stats.totalDonations || 1850,
      labelBn: 'একত্রিত মোট রক্ত ব্যাগ',
      labelEn: 'Total Blood Bags Collected',
      badgeBn: 'মানবিক সাহায্য',
      badgeEn: 'Life Saver Bags',
      color: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <section className="py-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const IconComponent = card.icon;
            const formattedCount = card.count.toLocaleString('bn-BD');

            return (
              <div
                key={card.id}
                className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${card.iconBg} group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                    {language === 'bn' ? card.badgeBn : card.badgeEn}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formattedCount}+
                  </p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-tight">
                    {language === 'bn' ? card.labelBn : card.labelEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
