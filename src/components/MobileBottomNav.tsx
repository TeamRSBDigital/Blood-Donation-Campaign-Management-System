import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { ORG_CONFIG } from '../config/org.config.js';
import {
  Home,
  Search,
  AlertTriangle,
  Heart,
  Menu,
  X,
  Calendar,
  Image as ImageIcon,
  PhoneCall,
  Info,
  Globe,
  ShieldCheck,
  FileText,
  Phone,
  ChevronRight,
  Droplet
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { language, toggleLanguage } = useLanguage();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'about' | null>(null);

  const mainNavItems = [
    {
      id: 'home',
      labelBn: 'হোম',
      labelEn: 'Home',
      icon: Home,
    },
    {
      id: 'search',
      labelBn: 'ডোনার খুঁজুন',
      labelEn: 'Find Donor',
      icon: Search,
    },
    {
      id: 'request-blood',
      labelBn: 'রক্তের আবেদন',
      labelEn: 'Request Blood',
      icon: AlertTriangle,
      isEmergencyBadge: true,
    },
    {
      id: 'register',
      labelBn: 'রক্তদাতা হন',
      labelEn: 'Become Donor',
      icon: Heart,
    },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsBottomSheetOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar - Visible only below 768px (md breakpoint) */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const label = language === 'bn' ? item.labelBn : item.labelEn;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 px-0.5 relative transition-all cursor-pointer ${
                  isActive ? 'text-red-600 font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-600 rounded-b-full shadow-xs animate-in fade-in duration-200" />
                )}

                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-red-600' : ''}`} />
                  {item.isEmergencyBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </div>

                <span className="text-[10px] sm:text-[11px] leading-tight mt-1 truncate max-w-[68px]">
                  {label}
                </span>
              </button>
            );
          })}

          {/* More Menu Button */}
          <button
            onClick={() => setIsBottomSheetOpen(true)}
            aria-label={language === 'bn' ? 'আরও মেনু বিকল্প' : 'More Menu Options'}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 px-0.5 relative transition-all cursor-pointer ${
              isBottomSheetOpen ? 'text-red-600 font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px] leading-tight mt-1 truncate">
              {language === 'bn' ? 'আরও' : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Backdrop & Modal */}
      {isBottomSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Dark Backdrop Overlay */}
          <div
            onClick={() => setIsBottomSheetOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Bottom Sheet Container */}
          <div
            className="relative z-10 bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'calc(1.5rem + max(0px, env(safe-area-inset-bottom)))' }}
          >
            {/* Grab Handle Header */}
            <div className="sticky top-0 bg-white z-10 pt-3 pb-2 px-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                  প
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    {ORG_CONFIG.nameBn}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-medium">মেনু ও প্রয়োজনীয় তথ্য</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsBottomSheetOpen(false)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Sheet Content Items */}
            <div className="p-5 space-y-5">
              {/* Main Secondary Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
                  ন্যাভিগেশন অপশন
                </p>

                <button
                  onClick={() => handleTabClick('campaigns')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-gray-800 hover:text-red-600 font-bold text-xs transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span>📢 {language === 'bn' ? 'ক্যাম্পেইন ও কর্মসূচি' : 'Campaigns'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => handleTabClick('gallery')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-gray-800 hover:text-red-600 font-bold text-xs transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span>🖼️ {language === 'bn' ? 'গ্যালারি ও ফটো অ্যালবাম' : 'Gallery'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => handleTabClick('emergency')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-gray-800 hover:text-red-600 font-bold text-xs transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <span>📞 {language === 'bn' ? 'জরুরী মোবাইল ডাইরেক্টরি' : 'Emergency Directory'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => handleTabClick('contact')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-gray-800 hover:text-red-600 font-bold text-xs transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>💬 {language === 'bn' ? 'আমাদের সাথে যোগাযোগ' : 'Contact Us'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => {
                    setIsBottomSheetOpen(false);
                    setActiveLegalModal('about');
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-gray-800 hover:text-red-600 font-bold text-xs transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                      <Info className="w-4 h-4" />
                    </div>
                    <span>ℹ️ {language === 'bn' ? 'সংগঠনের পরিচিতি' : 'About Organization'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Preferences & Policy Section */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">
                  সেটিংস ও নিয়মাবলী
                </p>

                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <span>ভাষা পরিবর্তন (Language)</span>
                  </div>
                  <span className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] uppercase tracking-wider">
                    {language === 'bn' ? 'English' : 'বাংলা'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setIsBottomSheetOpen(false);
                      setActiveLegalModal('privacy');
                    }}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-[11px] flex items-center gap-1.5 justify-center border border-gray-200 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                    <span>গোপনীয়তা নীতি</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsBottomSheetOpen(false);
                      setActiveLegalModal('terms');
                    }}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-[11px] flex items-center gap-1.5 justify-center border border-gray-200 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                    <span>ব্যবহারের শর্তাবলী</span>
                  </button>
                </div>
              </div>

              {/* Emergency Hotline Banner in Sheet */}
              <div className="p-4 rounded-2xl bg-red-600 text-white space-y-2 shadow-md">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-white fill-current" />
                  <span className="text-xs font-bold">২৪/৭ জরুরী ব্লাড হেল্পলাইন</span>
                </div>
                <a
                  href={`tel:${ORG_CONFIG.contacts.emergencyHotline}`}
                  className="block text-center w-full py-2 bg-white text-red-700 font-black rounded-xl text-xs hover:bg-red-50 transition-colors shadow-xs"
                >
                  কল করুন: {ORG_CONFIG.contacts.emergencyHotline}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information / Policy Modals */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 border border-gray-200 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {activeLegalModal === 'privacy' && 'গোপনীয়তা নীতি (Privacy Policy)'}
                {activeLegalModal === 'terms' && 'ব্যবহারের শর্তাবলী (Terms & Conditions)'}
                {activeLegalModal === 'about' && 'সংগঠন সম্পর্কিত তথ্য (About Us)'}
              </h3>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-2.5 leading-relaxed font-medium">
              {activeLegalModal === 'privacy' && (
                <>
                  <p>পাংশা ব্লাড ডোনার্স এসোসিয়েশন (PBDA) সকল রক্তদাতা এবং গ্রহীতাদের ব্যক্তিগত তথ্যের নিরাপত্তা ও গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ।</p>
                  <p>১. আপনার ফোন নম্বর ও রক্তের গ্রুপ শুধুমাত্র জরুরী প্রয়োজনে রক্তগ্রহীতাদের সাথে যোগাযোগের উদ্দেশ্যে প্রকাশ করা হয়।</p>
                  <p>২. আপনার সম্মতি ব্যতীত কোনো বাণিজ্যিক প্রতিষ্ঠানে তথ্য বিক্রি বা শেয়ার করা হয় না।</p>
                </>
              )}

              {activeLegalModal === 'terms' && (
                <>
                  <p>১. রক্তদান একটি ১০০% সম্পূর্ণ স্বেচ্ছাসেবী ও বিনামূল্যে মানবিক সেবা। কোনো প্রকার আর্থিক লেনদেন কঠোরভাবে নিষিদ্ধ।</p>
                  <p>২. মিথ্যা তথ্য প্রদান বা অসদুপায় অবলম্বন করলে অ্যাকাউন্ট স্থায়ীভাবে বাতিল করা হবে।</p>
                  <p>৩. নিরাপদ রক্তদানের জন্য স্বাস্থ্যগত যোগ্যতা থাকা আবশ্যক।</p>
                </>
              )}

              {activeLegalModal === 'about' && (
                <>
                  <p className="font-bold text-gray-900">{ORG_CONFIG.nameBn}</p>
                  <p>স্থান: পাংশা উপজেলা, রাজবাড়ী জেলা।</p>
                  <p>প্রতিষ্ঠালগ্ন থেকে আমরা রাজবাড়ী জেলা ও আশেপাশের উপজেলায় বিনামূল্যে রক্তদাতা ও মুমূর্ষু রোগীদের মাঝে দ্রুত যোগাযোগের সেতু হিসেবে কাজ করছি।</p>
                </>
              )}
            </div>

            <button
              onClick={() => setActiveLegalModal(null)}
              className="w-full py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </>
  );
};
