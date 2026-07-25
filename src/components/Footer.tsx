import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { Heart, Phone, Mail, MapPin, Shield, Droplet, ExternalLink } from 'lucide-react';

interface FooterProps {
  setActiveTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
  onOpenAdminLogin?: () => void;
  onOpenLoginModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onTabChange,
  onOpenAdminLogin,
  onOpenLoginModal
}) => {
  const { t, language } = useLanguage();

  const handleTabClick = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleOpenLogin = () => {
    if (onOpenAdminLogin) onOpenAdminLogin();
    if (onOpenLoginModal) onOpenLoginModal();
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Org Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                প
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {t.orgName}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  Pangsha Blood Donors Association
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'পাংশা উপজেলা ও রাজবাড়ী জেলার মানুষের জরুরী রক্তদানে সেবামূলক সংস্থা। রক্তদানে জীবন বাঁচান।'
                : 'Voluntary blood donor organization serving Pangsha Upazila and Rajbari District. Dedicated to saving lives.'}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-red-400 text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                <span>মানবতার সেবায় নিবেদিত</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-red-600 pl-2">
              {language === 'bn' ? 'গুরুত্বপূর্ণ লিঙ্ক' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleTabClick('search')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <span>›</span> {t.searchDonors}
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('requests')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <span>›</span> {t.bloodRequests}
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('campaigns')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <span>›</span> {t.campaigns}
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('register')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <span>›</span> {t.becomeDonor}
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('emergency')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <span>›</span> {t.emergencyContacts}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact / Office */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-red-600 pl-2">
              {language === 'bn' ? 'অফিস ঠিকানা' : 'Office Location'}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>পাংশা মডেল থানা রোড, পাংশা পৌরসভা, পাংশা, রাজবাড়ী-৭৭২০</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <a href="tel:01812999888" className="hover:text-white font-semibold text-slate-200">০১৮১২-৯৯৯৮৮৮ (হটলাইন)</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <a href="mailto:info@pbdabangladesh.org" className="hover:text-white">info@pbdabangladesh.org</a>
              </div>
            </div>
          </div>

          {/* Administration */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-red-600 pl-2">
              {language === 'bn' ? 'প্রশাসনিক প্যানেল' : 'Administration'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'অনুমোদিত এডমিন ও ভলান্টিয়ারদের জন্য ডায়নামিক ডাটাবেজ প্যানেল।'
                : 'Secure portal for authorized administrators and volunteer leads.'}
            </p>
            <button
              onClick={handleOpenLogin}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.adminLogin}</span>
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs uppercase tracking-widest font-medium text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} {t.orgName} - সকল অধিকার সংরক্ষিত।</p>
          <div className="flex gap-6">
            <span>পাংশা, রাজবাড়ী</span>
            <span>•</span>
            <span>গোপনীয়তা নীতি</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
