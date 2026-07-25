import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  Heart,
  Phone,
  Search,
  Shield,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  Droplet,
  UserCheck,
  Calendar,
  AlertTriangle,
  LayoutDashboard,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
  onOpenAdminLogin?: () => void;
  onOpenLoginModal?: () => void;
  onOpenPublicRequestModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onTabChange,
  onOpenAdminLogin,
  onOpenLoginModal,
  onOpenPublicRequestModal
}) => {
  const handleTabClick = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleOpenLogin = () => {
    if (onOpenAdminLogin) onOpenAdminLogin();
    if (onOpenLoginModal) onOpenLoginModal();
  };
  const { t, language, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.home, icon: Heart },
    { id: 'search', label: t.searchDonors, icon: Search },
    { id: 'requests', label: t.bloodRequests, icon: Droplet },
    { id: 'campaigns', label: t.campaigns, icon: Calendar },
    { id: 'register', label: t.becomeDonor, icon: UserCheck },
    { id: 'emergency', label: t.emergencyContacts, icon: AlertTriangle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      {/* Top Emergency Hotline Bar */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white text-xs sm:text-sm py-1.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center bg-white/20 p-1 rounded-full animate-pulse">
              <Droplet className="w-3.5 h-3.5 text-white fill-current" />
            </span>
            <span>{t.subTitle}</span>
            <span className="hidden sm:inline opacity-75">|</span>
            <span className="hidden sm:inline text-rose-100 italic">{t.motto}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:01812999888"
              className="inline-flex items-center gap-1.5 bg-white text-red-700 font-bold px-2.5 py-0.5 rounded-full hover:bg-red-50 transition-all text-xs shadow-sm"
            >
              <Phone className="w-3 h-3 fill-current" />
              <span>২৪/৭ হেল্পলাইন: 01812999888</span>
            </a>
            {onOpenPublicRequestModal && (
              <button
                onClick={onOpenPublicRequestModal}
                className="hidden md:inline-flex items-center gap-1 bg-amber-400 text-slate-900 font-bold px-2.5 py-0.5 rounded-full text-xs hover:bg-amber-300 transition-colors shadow-xs"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>জরুরী রক্তের চাহিদা</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => {
            handleTabClick('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            প
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-red-700 dark:text-red-500 flex items-center gap-1.5">
              <span>{t.orgName}</span>
              <span className="text-[10px] font-extrabold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                PBDA
              </span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              Pangsha Blood Donors Association
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400 pb-1'
                    : 'text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            title="Switch Language"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.langBtn}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Mode"
            className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Admin Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTabClick('admin')}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.dashboard}</span>
              </button>
              <button
                onClick={logout}
                title={t.logout}
                className="p-2 rounded-full text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleOpenLogin}
              className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t.adminLogin}</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 space-y-3 shadow-xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleTabClick(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{theme === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড'}</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleTabClick('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider text-center"
              >
                {t.dashboard}
              </button>
            ) : (
              <button
                onClick={() => {
                  handleOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider text-center"
              >
                {t.adminLogin}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
