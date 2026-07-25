import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { AdminOverview } from './AdminOverview.js';
import { DonorManagement } from './DonorManagement.js';
import { BloodRequestManagement } from './BloodRequestManagement.js';
import { ReportsAnalytics } from './ReportsAnalytics.js';
import { TelegramNotificationSettings } from './TelegramNotificationSettings.js';
import { UserManagement } from './UserManagement.js';
import { AuditLogViewer } from './AuditLogViewer.js';
import { SystemSettings } from './SystemSettings.js';
import {
  LayoutDashboard,
  Users,
  Droplet,
  BarChart3,
  Bot,
  Shield,
  ShieldAlert,
  Settings,
  LogOut,
  ArrowLeft,
  HeartHandshake
} from 'lucide-react';

interface AdminLayoutProps {
  onBackToPublicSite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToPublicSite }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('overview');

  const navItems = [
    { id: 'overview', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'donors', label: 'রক্তদাতা ডাটাবেজ', icon: Users },
    { id: 'requests', label: 'রক্তের চাহিদা', icon: Droplet },
    { id: 'reports', label: 'এনালিটিক্স & রিপোর্ট', icon: BarChart3 },
    { id: 'telegram', label: 'টেলিগ্রাম বোট', icon: Bot },
    { id: 'users', label: 'এডমিন ভূমিকা', icon: Shield },
    { id: 'audit', label: 'অডিট লোগ', icon: ShieldAlert },
    { id: 'settings', label: 'সিস্টেম সেটিং', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Top Admin Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublicSite}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="পাবলিক সাইটে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600 rounded-lg text-white">
                <HeartHandshake className="w-5 h-5 fill-current" />
              </span>
              <span className="font-bold text-sm hidden sm:inline">
                PBDA Admin Control Center
              </span>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{user?.name}</p>
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">{user?.role}</span>
            </div>

            <button
              onClick={() => {
                logout();
                onBackToPublicSite();
              }}
              className="inline-flex items-center gap-1.5 bg-red-600/90 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-md sticky top-20 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Tab Content */}
        <main className="lg:col-span-9">
          {activeTab === 'overview' && <AdminOverview onNavigateTab={(tab) => setActiveTab(tab)} />}
          {activeTab === 'donors' && <DonorManagement />}
          {activeTab === 'requests' && <BloodRequestManagement />}
          {activeTab === 'reports' && <ReportsAnalytics />}
          {activeTab === 'telegram' && <TelegramNotificationSettings />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'audit' && <AuditLogViewer />}
          {activeTab === 'settings' && <SystemSettings />}
        </main>
      </div>
    </div>
  );
};
