import React, { useState, useEffect } from 'react';
import { DashboardStats, BloodGroup } from '../../types/index.js';
import { FileSpreadsheet, Printer, BarChart3, PieChart, Users, Droplet, MapPin } from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/reports/stats');
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        রিপোর্ট ডেটা এনালিটিক্স তৈরি হচ্ছে...
      </div>
    );
  }

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const total = stats?.totalDonors || 1;

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            <span>সিস্টেম এনালিটিক্স ও রিপোর্ট</span>
          </h2>
          <p className="text-xs text-slate-500">পাংশা ব্লাড ডোনার্স এসোসিয়েশনের বিস্তারিত ইনভেন্টরি ও লোকেশন রিপোর্ট</p>
        </div>

        <button
          onClick={handlePrintReport}
          className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>রিপোর্ট প্রিন্ট করুন</span>
        </button>
      </div>

      {/* Blood Group Percentage Bars */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-rose-600" />
          <span>রক্তের গ্রুপভিত্তিক পরিসংখ্যান ব্রেকডাউন</span>
        </h3>

        <div className="space-y-3">
          {bloodGroups.map((group) => {
            const count = stats?.bloodGroupCounts?.[group] || 0;
            const pct = Math.round((count / total) * 100);

            return (
              <div key={group} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-red-600 text-white font-black text-xs flex items-center justify-center">
                      {group}
                    </span>
                    <span>{group} গ্রুপ</span>
                  </span>
                  <span>{count} জন ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Union Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <span>ইউনিয়নভিত্তিক রক্তদাতা বন্টন (পাংশা)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(stats?.unionCounts || {}).map(([union, count]) => (
            <div
              key={union}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center"
            >
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{union}</p>
              <p className="text-lg font-black text-red-600 mt-0.5">{count} জন</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
