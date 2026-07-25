import React, { useState, useEffect } from 'react';
import { DashboardStats, BloodGroup } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Users,
  CheckCircle2,
  Heart,
  AlertCircle,
  Calendar,
  Droplet,
  UserPlus,
  FileSpreadsheet,
  Send,
  Sparkles
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/reports/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center space-y-2">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">ড্যাশবোর্ড এনালিটিক্স লোড হচ্ছে...</p>
      </div>
    );
  }

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            {user?.role === 'SUPER_ADMIN' ? 'সুপার এডমিনিস্ট্রেটর' : user?.role === 'ADMIN' ? 'এডমিন' : 'ভলান্টিয়ার'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black">
            স্বাগতম, {user?.name}!
          </h2>
          <p className="text-xs text-rose-100">
            পাংশা ব্লাড ডোনার্স এসোসিয়েশন সিস্টেম স্ট্যাটাস ও রিয়েলটাইম ইনভেন্টরি ম্যানেজমেন্ট।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('donors')}
            className="inline-flex items-center gap-1.5 bg-white text-red-700 font-bold px-4 py-2 rounded-xl text-xs shadow-md hover:bg-rose-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ নতুন রক্তদাতা</span>
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="inline-flex items-center gap-1.5 bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>রিপোর্ট ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট রক্তদাতা</span>
            <Users className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalDonors || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">প্রস্তুত রক্তদাতা</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats?.availableDonors || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট রক্তদান</span>
            <Heart className="w-4 h-4 text-rose-500 fill-current" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalDonations || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">পেন্ডিং চাহিদা</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{stats?.pendingRequests || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">আসন্ন ক্যাম্পেইন</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.upcomingCampaigns || 0}</p>
        </div>
      </div>

      {/* Blood Group Inventory Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Droplet className="w-5 h-5 text-red-600 fill-current" />
            <span>গ্রুপভিত্তিক রক্তদাতা স্টক ব্রেকডাউন</span>
          </h3>
          <button
            onClick={() => onNavigateTab('donors')}
            className="text-xs font-bold text-red-600 hover:underline"
          >
            সকল তালিকা দেখুন →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {bloodGroups.map((group) => {
            const count = stats?.bloodGroupCounts?.[group] || 0;
            return (
              <div
                key={group}
                onClick={() => onNavigateTab('donors')}
                className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-red-500 transition-all cursor-pointer text-center space-y-1"
              >
                <span className="inline-block w-8 h-8 rounded-xl bg-red-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-xs">
                  {group}
                </span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{count}</p>
                <p className="text-[10px] text-slate-500 font-semibold">জন রক্তদাতা</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
