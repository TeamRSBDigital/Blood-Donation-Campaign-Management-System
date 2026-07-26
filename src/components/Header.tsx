import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
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
  Image as ImageIcon,
  PhoneCall
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clean, non-duplicate single instance navigation
  const navItems = [
    { id: 'home', label: language === 'bn' ? '🏠 হোম' : '🏠 Home' },
    { id: 'search', label: language === 'bn' ? '🩸 রক্তদাতা খুঁজুন' : '🩸 Find Donors' },
    { id: 'requests', label: language === 'bn' ? '📝 রক্তের আবেদন' : '📝 Requests' },
    { id: 'register', label: language === 'bn' ? '❤️ রক্তদাতা হন' : '❤️ Become Donor' },
    { id: 'campaigns', label: language === 'bn' ? '📢 ক্যাম্পেইন' : '📢 Campaigns' },
    { id: 'gallery', label: language === 'bn' ? '🖼️ গ্যালারি' : '🖼️ Gallery' },
    { id: 'contact', label: language === 'bn' ? '📞 যোগাযোগ' : '📞 Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-colors shadow-xs">
      {/* Top Emergency Hotline Strip */}
      <div className="bg-red-600 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center bg-white/20 p-1 rounded-full animate-pulse">
              <Droplet className="w-3.5 h-3.5 text-white fill-current" />
            </span>
            <span className="font-semibold">{t.subTitle}</span>
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
          </div>
        </div>
      </div>

      {/* Main Header Navigation Bar (Exact 72px height) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* Logo Area */}
        <button
          onClick={() => {
            handleTabClick('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 md:gap-3 text-left group shrink-0"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-base md:text-xl shadow-md group-hover:bg-red-700 transition-all">
            প
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black leading-tight text-red-600 flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
              <span className="md:hidden">PBDA</span>
              <span className="hidden md:inline">{t.orgName}</span>
              <span className="hidden md:inline-block text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                PBDA
              </span>
            </h1>
            <p className="hidden md:block text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Pangsha Blood Donors Association
            </p>
          </div>
        </button>

        {/* Centered Navigation Links for Desktop (xl+) */}
        <nav className="hidden xl:flex items-center space-x-6 justify-center flex-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`text-sm font-bold transition-all py-2 px-1 relative cursor-pointer ${
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

        {/* Right Section for Desktop / Tablet (md+) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            title="Switch Language"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-gray-600" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Primary CTA Button */}
          <button
            onClick={() => handleTabClick('request-blood')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-full text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 fill-current text-white shrink-0" />
            <span>🩸 জরুরি রক্তের আবেদন</span>
          </button>
        </div>

        {/* Mobile Controls (<768px): Language Button + Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          <button
            onClick={toggleLanguage}
            aria-label="Switch Language"
            className="px-2.5 py-1 text-xs font-bold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>
          <button
            id="mobile-menu-toggle-btn"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="xl:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-2 shadow-xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleTabClick(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                handleTabClick('request-blood');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center shadow-md flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>🩸 জরুরি রক্তের আবেদন</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
