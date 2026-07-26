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

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsBottomSheetOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Fixed Mobile Bottom Navigation Bar - Visible strictly below 768px (md breakpoint) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-white border-t border-gray-200 rounded-t-[20px] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-around w-full h-[72px] px-2 max-w-md mx-auto relative">
          
          {/* 1. 🏠 Home Button */}
          <button
            onClick={() => handleTabClick('home')}
            aria-label={language === 'bn' ? 'হোম' : 'Home'}
            aria-current={activeTab === 'home' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 relative cursor-pointer active:scale-95 transition-transform ${
              activeTab === 'home' ? 'text-red-600 font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {activeTab === 'home' && (
              <span className="absolute top-0 w-8 h-1 bg-red-600 rounded-b-full shadow-xs" />
            )}
            <Home className={`w-5 h-5 transition-colors ${activeTab === 'home' ? 'text-red-600' : 'text-gray-500'}`} />
            <span className="text-[10px] leading-tight mt-1 truncate max-w-[64px]">
              {language === 'bn' ? 'হোম' : 'Home'}
            </span>
          </button>

          {/* 2. 🩸 Find Donor Button */}
          <button
            onClick={() => handleTabClick('search')}
            aria-label={language === 'bn' ? 'ডোনার খুঁজুন' : 'Find Donor'}
            aria-current={activeTab === 'search' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 relative cursor-pointer active:scale-95 transition-transform ${
              activeTab === 'search' ? 'text-red-600 font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {activeTab === 'search' && (
              <span className="absolute top-0 w-8 h-1 bg-red-600 rounded-b-full shadow-xs" />
            )}
            <Search className={`w-5 h-5 transition-colors ${activeTab === 'search' ? 'text-red-600' : 'text-gray-500'}`} />
            <span className="text-[10px] leading-tight mt-1 truncate max-w-[64px]">
              {language === 'bn' ? 'ডোনার খুঁজুন' : 'Find Donor'}
            </span>
          </button>

          {/* 3. 🚨 Blood Request (Center Action Button - Floating Raised Circle) */}
          <button
            onClick={() => handleTabClick('request-blood')}
            aria-label={language === 'bn' ? 'রক্তের আবেদন' : 'Request Blood'}
            aria-current={activeTab === 'request-blood' ? 'page' : undefined}
            className="flex-1 flex flex-col items-center justify-center h-full min-h-[48px] relative cursor-pointer group"
          >
            <div className="-mt-6 w-13 h-13 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white group-active:scale-90 group-hover:bg-red-700 transition-all">
              <AlertTriangle className="w-6 h-6 fill-current text-white" />
            </div>
            <span className={`text-[10px] font-bold leading-tight mt-0.5 truncate max-w-[68px] ${
              activeTab === 'request-blood' ? 'text-red-600' : 'text-gray-700'
            }`}>
              {language === 'bn' ? 'রক্তের আবেদন' : 'Request Blood'}
            </span>
          </button>

          {/* 4. ❤️ Become Donor Button */}
          <button
            onClick={() => handleTabClick('register')}
            aria-label={language === 'bn' ? 'রক্তদাতা হন' : 'Become Donor'}
            aria-current={activeTab === 'register' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 relative cursor-pointer active:scale-95 transition-transform ${
              activeTab === 'register' ? 'text-red-600 font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {activeTab === 'register' && (
              <span className="absolute top-0 w-8 h-1 bg-red-600 rounded-b-full shadow-xs" />
            )}
            <Heart className={`w-5 h-5 transition-colors ${activeTab === 'register' ? 'text-red-600' : 'text-gray-500'}`} />
            <span className="text-[10px] leading-tight mt-1 truncate max-w-[64px]">
              {language === 'bn' ? 'রক্তদাতা হন' : 'Become Donor'}
            </span>
          </button>

          {/* 5. ☰ More Button (Triggers Bottom Sheet) */}
          <button
            onClick={() => setIsBottomSheetOpen(true)}
            aria-label={language === 'bn' ? 'আরও মেনু' : 'More Menu'}
            className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 relative cursor-pointer active:scale-95 transition-transform ${
              isBottomSheetOpen ? 'text-red-600 font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {isBottomSheetOpen && (
              <span className="absolute top-0 w-8 h-1 bg-red-600 rounded-b-full shadow-xs" />
            )}
            <Menu className={`w-5 h-5 transition-colors ${isBottomSheetOpen ? 'text-red-600' : 'text-gray-500'}`} />
            <span className="text-[10px] leading-tight mt-1 truncate max-w-[64px]">
              {language === 'bn' ? 'আরও' : 'More'}
            </span>
          </button>

        </div>
      </nav>

      {/* Smooth Bottom Sheet Drawer */}
      {isBottomSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsBottomSheetOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Sheet Container */}
          <div
            className="relative z-10 w-full bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'calc(1.5rem + max(0px, env(safe-area-inset-bottom)))' }}
          >
            {/* Grab Handle Header */}
            <div className="sticky top-0 bg-white z-10 pt-3 pb-3 px-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  প
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    {ORG_CONFIG.nameBn}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-medium">মেনু ও প্রয়োজনীয় লিংকসমূহ</p>
                </div>
              </div>

              {/* Close Handle */}
              <button
                onClick={() => setIsBottomSheetOpen(false)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Sections */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
                  প্রধান পাতাসমূহ
                </p>

                {/* Campaign */}
                <button
                  onClick={() => handleTabClick('campaigns')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-gray-800 hover:text-red-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span>📢 {language === 'bn' ? 'ক্যাম্পেইন ও কর্মসূচি' : 'Campaign'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                {/* Gallery */}
                <button
                  onClick={() => handleTabClick('gallery')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-gray-800 hover:text-red-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span>🖼️ {language === 'bn' ? 'গ্যালারি ও অ্যালবাম' : 'Gallery'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                {/* Emergency Contact */}
                <button
                  onClick={() => handleTabClick('emergency')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-gray-800 hover:text-red-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <span>📞 {language === 'bn' ? 'জরুরী মোবাইল ডাইরেক্টরি' : 'Emergency Contact'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                {/* Contact Us */}
                <button
                  onClick={() => handleTabClick('contact')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-gray-800 hover:text-red-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>💬 {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                {/* About Organization */}
                <button
                  onClick={() => {
                    setIsBottomSheetOpen(false);
                    setActiveLegalModal('about');
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-gray-800 hover:text-red-600 font-bold text-xs transition-colors cursor-pointer"
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

              {/* Language & Policy Section */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">
                  পছন্দ ও নীতি
                </p>

                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <span>ভাষা / Language</span>
                  </div>
                  <span className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {language === 'bn' ? 'English' : 'বাংলা'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Privacy Policy */}
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

                  {/* Terms */}
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

              {/* Emergency Helpline Banner */}
              <div className="p-4 rounded-2xl bg-red-600 text-white space-y-2 shadow-md">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-white fill-current" />
                  <span className="text-xs font-bold">২৪/৭ জরুরি ব্লাড হেল্পলাইন</span>
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

      {/* Legal / Policy Modals */}
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
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
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
