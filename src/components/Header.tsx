import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Heart,
  Phone,
  Search,
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
  onOpenPublicRequestModal?: () => void;
  onOpenDonorRegisterModal?: () => void;
  onOpenRequestModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onTabChange,
  onOpenPublicRequestModal,
  onOpenRequestModal
}) => {
  const handleTabClick = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const { t, language, toggleLanguage } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.home, icon: Heart },
    { id: 'search', label: t.searchDonors, icon: Search },
    { id: 'requests', label: t.bloodRequests, icon: Droplet },
    { id: 'request-blood', label: 'রক্তের আবেদন', icon: AlertTriangle },
    { id: 'campaigns', label: t.campaigns, icon: Calendar },
    { id: 'register', label: t.becomeDonor, icon: UserCheck },
    { id: 'emergency', label: t.emergencyContacts, icon: AlertTriangle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-colors duration-200">
      {/* Top Emergency Hotline Bar */}
      <div className="bg-red-600 text-white text-xs sm:text-sm py-1.5 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center bg-white/20 p-1 rounded-full animate-pulse">
              <Droplet className="w-3.5 h-3.5 text-white fill-current" />
            </span>
            <span>{t.subTitle}</span>
            <span className="hidden sm:inline opacity-75">|</span>
            <span className="hidden sm:inline text-red-100 italic">{t.motto}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:01812999888"
              className="inline-flex items-center gap-1.5 bg-white text-red-700 font-bold px-3 py-0.5 rounded-full hover:bg-red-50 transition-all text-xs shadow-xs"
            >
              <Phone className="w-3 h-3 fill-current" />
              <span>২৪/৭ হেল্পলাইন: 01812999888</span>
            </a>
            {(onOpenPublicRequestModal || onOpenRequestModal) && (
              <button
                onClick={onOpenPublicRequestModal || onOpenRequestModal}
                className="hidden md:inline-flex items-center gap-1 bg-amber-400 text-gray-900 font-bold px-2.5 py-0.5 rounded-full text-xs hover:bg-amber-300 transition-colors shadow-xs"
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
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:bg-red-700 transition-all">
            প
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-red-600 flex items-center gap-1.5">
              <span>{t.orgName}</span>
              <span className="text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                PBDA
              </span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
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
                className={`text-sm font-semibold transition-colors py-1 ${
                  isActive
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-700 hover:text-red-600'
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-gray-500" />
            <span>{t.langBtn}</span>
          </button>

          {/* User Session status (if already authenticated) */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTabClick('admin')}
                className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                <span>ড্যাশবোর্ড</span>
              </button>
              <button
                onClick={logout}
                title={t.logout}
                className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 text-xs font-bold border border-gray-200 rounded-lg text-gray-700"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>
          <button
            id="mobile-menu-toggle-btn"
            aria-label="নেভিগেশন মেনু খুলুন বা বন্ধ করুন"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="lg:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-2 shadow-lg">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleTabClick(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {isAuthenticated && (
            <div className="pt-3 border-t border-gray-200 flex items-center gap-2">
              <button
                onClick={() => {
                  handleTabClick('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider text-center"
              >
                ড্যাশবোর্ড
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                লগআউট
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
