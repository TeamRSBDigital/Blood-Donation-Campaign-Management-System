import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  setActiveTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onTabChange,
}) => {
  const { t, language } = useLanguage();

  const handleTabClick = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <footer className="bg-white text-gray-800 pt-12 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10 border-b border-gray-200">
          {/* Org Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs">
                প
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {t.orgName}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                  Pangsha Blood Donors Association
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'bn'
                ? 'পাংশা উপজেলা ও রাজবাড়ী জেলার মানুষের জরুরী রক্তদানে সেবামূলক সংস্থা। রক্তদানে জীবন বাঁচান।'
                : 'Voluntary blood donor organization serving Pangsha Upazila and Rajbari District. Dedicated to saving lives.'}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 text-red-600 fill-current" />
                <span>মানবতার সেবায় নিবেদিত</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider border-l-2 border-red-600 pl-2">
              {language === 'bn' ? 'গুরুত্বপূর্ণ লিঙ্ক' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-700">
              <li>
                <button onClick={() => handleTabClick('search')} className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer">
                  <span>›</span> {t.searchDonors}
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('requests')} className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer">
                  <span>›</span> {t.bloodRequests}
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('register')} className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer">
                  <span>›</span> {t.becomeDonor}
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('campaigns')} className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer">
                  <span>›</span> {t.campaigns}
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('gallery')} className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer">
                  <span>›</span> {language === 'bn' ? 'গ্যালারি' : 'Gallery'}
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('contact')} className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer">
                  <span>›</span> {language === 'bn' ? 'যোগাযোগ' : 'Contact'}
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('emergency')} className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer">
                  <span>›</span> {t.emergencyContacts}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact / Office */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider border-l-2 border-red-600 pl-2">
              {language === 'bn' ? 'অফিস ঠিকানা' : 'Office Location'}
            </h4>
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>পাংশা মডেল থানা রোড, পাংশা পৌরসভা, পাংশা, রাজবাড়ী-৭৭২০</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600 shrink-0" />
                <a href="tel:01812999888" className="hover:text-red-600 font-semibold text-gray-900">০১৮১২-৯৯৯৮৮৮ (হটলাইন)</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600 shrink-0" />
                <a href="mailto:info@pbdabangladesh.org" className="hover:text-red-600">info@pbdabangladesh.org</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-gray-500 gap-3">
          <p>© {new Date().getFullYear()} {t.orgName} - সকল অধিকার সংরক্ষিত।</p>
          <div className="flex gap-4">
            <span>পাংশা, রাজবাড়ী</span>
            <span>•</span>
            <span>স্বেচ্ছাসেবী রক্তদান সেবা</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
