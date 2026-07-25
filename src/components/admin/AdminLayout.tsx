import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { ORG_CONFIG } from '../../config/org.config.js';
import { AdminOverview } from './AdminOverview.js';
import { DonorManagement } from './DonorManagement.js';
import { BloodRequestManagement } from './BloodRequestManagement.js';
import { ReportsAnalytics } from './ReportsAnalytics.js';
import { TelegramNotificationSettings } from './TelegramNotificationSettings.js';
import { WhatsappNotificationSettings } from './WhatsappNotificationSettings.js';
import { UserManagement } from './UserManagement.js';
import { AuditLogViewer } from './AuditLogViewer.js';
import { SystemSettings } from './SystemSettings.js';
import { DataExportCenter } from './DataExportCenter.js';
import { ForbiddenPage } from './ForbiddenPage.js';
import { UserProfileModal } from './UserProfileModal.js';
import { ChangePasswordModal } from './ChangePasswordModal.js';
import { NotificationPanel } from './NotificationPanel.js';
import {
  LayoutDashboard,
  Users,
  Droplet,
  BarChart3,
  Bot,
  MessageSquare,
  Shield,
  ShieldAlert,
  Settings,
  Download,
  LogOut,
  ArrowLeft,
  HeartHandshake,
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  User,
  Key,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../../types/index.js';

interface AdminLayoutProps {
  onBackToPublicSite: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  requiredRoles: UserRole[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToPublicSite }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, setThemeMode } = useTheme();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'ড্যাশবোর্ড হোম',
      icon: LayoutDashboard,
      requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER'],
    },
    {
      id: 'donors',
      label: 'রক্তদাতা ডাটাবেজ',
      icon: Users,
      requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER'],
    },
    {
      id: 'requests',
      label: 'রক্তের চাহিদা',
      icon: Droplet,
      requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER'],
    },
    {
      id: 'reports',
      label: 'রিপোর্ট ও এনালিটিক্স',
      icon: BarChart3,
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      id: 'telegram',
      label: 'টেলিগ্রাম বোট নোটিফিকেশন',
      icon: Bot,
      requiredRoles: ['SUPER_ADMIN'],
    },
    {
      id: 'whatsapp',
      label: 'হোয়াটসঅ্যাপ ক্লাউড এপিআই',
      icon: MessageSquare,
      requiredRoles: ['SUPER_ADMIN'],
    },
    {
      id: 'users',
      label: 'এডমিন ও ভলান্টিয়ার (RBAC)',
      icon: Shield,
      requiredRoles: ['SUPER_ADMIN'],
    },
    {
      id: 'audit',
      label: 'অডিট লোগ',
      icon: ShieldAlert,
      requiredRoles: ['SUPER_ADMIN'],
    },
    {
      id: 'export',
      label: 'ডাটা এক্সপোর্ট সেন্টার',
      icon: Download,
      requiredRoles: ['SUPER_ADMIN'],
    },
    {
      id: 'settings',
      label: 'সিস্টেম সেটিং',
      icon: Settings,
      requiredRoles: ['SUPER_ADMIN'],
    },
  ];

  const currentUserRole = user?.role || 'VOLUNTEER';

  // Filter navigation items by role permissions
  const visibleNavItems = navItems.filter((item) =>
    item.requiredRoles.includes(currentUserRole)
  );

  // Handle unauthorized URL visits or tab selections
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      const tabParam = searchParams.get('tab') || searchParams.get('page');

      const isTelegramAttempt =
        activeTab === 'telegram' ||
        tabParam === 'telegram' ||
        pathname.includes('/telegram') ||
        hash.includes('telegram');

      if (isTelegramAttempt && currentUserRole !== 'SUPER_ADMIN') {
        setActiveTab('overview');
        window.history.replaceState(null, '', '/dashboard');
        setToastMessage('You do not have permission to access this page.');
        return;
      }
    }

    const currentNav = navItems.find((n) => n.id === activeTab);
    if (currentNav && !currentNav.requiredRoles.includes(currentUserRole)) {
      setActiveTab('overview');
      window.history.replaceState(null, '', '/dashboard');
      setToastMessage('You do not have permission to access this page.');
    }
  }, [activeTab, currentUserRole]);

  // Auto-hide toast notification after 5 seconds
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const currentNav = navItems.find((n) => n.id === activeTab);
  const isTabAllowed = currentNav ? currentNav.requiredRoles.includes(currentUserRole) : true;

  const handleSelectNav = (id: string) => {
    const targetNav = navItems.find((n) => n.id === id);
    if (targetNav && !targetNav.requiredRoles.includes(currentUserRole)) {
      setActiveTab('overview');
      window.history.replaceState(null, '', '/dashboard');
      setToastMessage('You do not have permission to access this page.');
      setMobileDrawerOpen(false);
      return;
    }
    setActiveTab(id);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors flex flex-col">
      {/* Top Sticky Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left Section: Back to Public Site & Mobile Menu Toggle & Org Logo */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="মোবাইল নেভিগেশন ড্রয়ার খুলুন"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={onBackToPublicSite}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              title="পাবলিক সাইটে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold hidden md:inline">পাবলিক ওয়েবসাইট</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600 rounded-xl text-white shadow-xs">
                <HeartHandshake className="w-5 h-5 fill-current" />
              </span>
              <div className="hidden sm:block">
                <span className="font-black text-sm block leading-none">{ORG_CONFIG.shortName} Admin</span>
                <span className="text-[10px] text-slate-400 font-semibold leading-tight">{ORG_CONFIG.nameBn}</span>
              </div>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4 relative">
            <input
              type="text"
              placeholder="এডমিন প্যানেলে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          </div>

          {/* Right Section: Notification, Theme Switcher & Profile Dropdown */}
          <div className="flex items-center gap-2 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative"
                aria-label="নোটিফিকেশন দেখুন"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </button>

              <NotificationPanel
                isOpen={notificationOpen}
                onClose={() => setNotificationOpen(false)}
                onNavigateRequests={() => handleSelectNav('requests')}
              />
            </div>

            {/* Dark Mode Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                aria-label="থিম পরিবর্তন করুন"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Laptop className="w-4 h-4 text-blue-400" />
                )}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 top-12 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1 space-y-0.5 text-xs font-bold animate-in fade-in duration-150">
                  <button
                    onClick={() => {
                      setThemeMode('light');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left ${
                      theme === 'light' ? 'bg-red-50 dark:bg-red-950/60 text-red-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>লাইট থিম</span>
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('dark');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left ${
                      theme === 'dark' ? 'bg-red-50 dark:bg-red-950/60 text-red-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>ডার্ক থিম</span>
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('system');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left ${
                      theme === 'system' ? 'bg-red-50 dark:bg-red-950/60 text-red-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>সিস্টেম থিম</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
              >
                <div className="w-7 h-7 rounded-xl bg-red-600 flex items-center justify-center font-black text-xs">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-bold leading-none">{user?.name}</p>
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">{user?.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs font-bold animate-in fade-in duration-150">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 font-normal truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>প্রোফাইল বিবরণ</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowChangePasswordModal(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Key className="w-4 h-4 text-slate-400" />
                    <span>পাসওয়ার্ড পরিবর্তন</span>
                  </button>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        logout();
                        onBackToPublicSite();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/60"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>লগআউট করুন</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Body with Desktop Sidebar & Mobile Drawer */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Desktop Sidebar (hidden on mobile) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-md sticky top-20 space-y-1">
            <div className="p-3 mb-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">বর্তমান ভূমিকা</p>
              <p className="font-extrabold text-red-600 dark:text-red-400">{user?.role}</p>
            </div>

            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-72 max-w-full bg-white dark:bg-slate-900 h-full shadow-2xl p-4 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-sm">PBDA মেনু</span>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectNav(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    onBackToPublicSite();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content View with RBAC check */}
        <main className="lg:col-span-9 space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span>ড্যাশবোর্ড</span>
            <span>/</span>
            <span className="font-bold text-slate-900 dark:text-white">{currentNav?.label || 'হোম'}</span>
          </div>

          {!isTabAllowed ? (
            <ForbiddenPage
              onGoHome={() => setActiveTab('overview')}
              requiredRole={currentNav?.requiredRoles.join(' / ')}
            />
          ) : (
            <>
              {activeTab === 'overview' && <AdminOverview onNavigateTab={(tab) => handleSelectNav(tab)} />}
              {activeTab === 'donors' && <DonorManagement />}
              {activeTab === 'requests' && <BloodRequestManagement />}
              {activeTab === 'reports' && <ReportsAnalytics />}
              {activeTab === 'telegram' && <TelegramNotificationSettings />}
              {activeTab === 'whatsapp' && <WhatsappNotificationSettings />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'audit' && <AuditLogViewer />}
              {activeTab === 'export' && <DataExportCenter />}
              {activeTab === 'settings' && <SystemSettings />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onChangePasswordClick={() => setShowChangePasswordModal(true)}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Toast Notification for Unauthorized Access */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 dark:border-slate-700 shadow-2xl rounded-2xl px-4 py-3 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
