import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { BloodGroup } from '../../types/index.js';
import { BLOOD_GROUPS, BLOOD_GROUP_COMPATIBILITY, RARE_BLOOD_GROUPS } from '../../constants/bloodGroups.js';
import { Droplet, ArrowRight, ShieldAlert } from 'lucide-react';

interface BloodGroupSelectorSectionProps {
  onSelectGroup: (group: BloodGroup) => void;
}

export const BloodGroupSelectorSection: React.FC<BloodGroupSelectorSectionProps> = ({ onSelectGroup }) => {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              রক্তের গ্রুপ ও ম্যাচিং নির্দেশিকা
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              সকল ব্লুড গ্রুপ নির্বাচন করুন
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            যেকোনো একটি রক্তের গ্রুপে ক্লিক করে ঐ নির্দিষ্ট গ্রুপের নিবন্ধিত রক্তদাতাদের সম্পূর্ণ তালিকা দেখুন।
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {BLOOD_GROUPS.map((group) => {
            const isRare = RARE_BLOOD_GROUPS.includes(group);
            const canGiveTo = BLOOD_GROUP_COMPATIBILITY[group]?.canGiveTo.join(', ') || '';

            return (
              <div
                key={group}
                onClick={() => onSelectGroup(group)}
                className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                      <Droplet className="w-4 h-4 fill-current" />
                    </span>
                    {isRare && (
                      <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[9px] font-bold">
                        রেয়ার
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {group}
                  </h3>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    দিতে পারবে: <span className="font-semibold text-slate-700 dark:text-slate-300">{canGiveTo}</span>
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-red-600 dark:text-red-400">
                  <span>খুঁজুন</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
