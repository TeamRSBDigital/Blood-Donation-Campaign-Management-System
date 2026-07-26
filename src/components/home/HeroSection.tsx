import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { BloodGroup } from '../../types/index.js';
import { BLOOD_GROUPS } from '../../constants/bloodGroups.js';
import { ORG_CONFIG } from '../../config/org.config.js';
import {
  Search,
  Droplet,
  Heart,
  PhoneCall,
  UserPlus,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface HeroSectionProps {
  onSelectBloodGroup: (group: BloodGroup) => void;
  onPostRequestClick: () => void;
  onBecomeDonorClick: () => void;
  criticalRequestsCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectBloodGroup,
  onPostRequestClick,
  onBecomeDonorClick,
  criticalRequestsCount = 2,
}) => {
  const { language } = useLanguage();
  const [selectedGroupInput, setSelectedGroupInput] = useState<BloodGroup>('A+');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectBloodGroup(selectedGroupInput);
  };

  return (
    <section className="relative overflow-hidden bg-white text-gray-900 pt-8 pb-16 lg:py-20 border-b border-gray-100">
      {/* Background Soft Red Accent Blobs */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-red-50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-rose-50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Critical Alert Bar */}
        {criticalRequestsCount > 0 && (
          <div className="bg-red-600 text-white border border-red-500 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-white/20 rounded-xl shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-300" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  {language === 'bn'
                    ? `জরুরী অ্যালার্ট: বর্তমানে ${criticalRequestsCount} টি মুমূর্ষু রোগীর রক্তের আবেদন রয়েছে!`
                    : `CRITICAL ALERT: ${criticalRequestsCount} Urgent Blood Request(s) need immediate donors!`}
                </p>
                <p className="text-[11px] text-red-100">
                  {language === 'bn' ? 'পাংশা ও রাজবাড়ীর রক্তদাতাগণ দয়া করে রক্তদানের জন্য এগিয়ে আসুন।' : 'Donors from Pangsha & Rajbari please respond urgently.'}
                </p>
              </div>
            </div>
            <button
              onClick={onPostRequestClick}
              className="shrink-0 bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold px-4 py-2 rounded-full text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span>{language === 'bn' ? 'আবেদনসমূহ দেখুন' : 'View Urgent Requests'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Main Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              <Droplet className="w-4 h-4 text-red-600 fill-current" />
              <span>{ORG_CONFIG.nameBn} • রাজবাড়ী-৭৭২০</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-gray-900">
              এক ব্যাগ রক্ত, <br />
              <span className="text-red-600">একটি নতুন জীবনের আলো।</span>
            </h1>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              পাংশা উপজেলা এবং রাজবাড়ী জেলার সাধারণ মানুষের জন্য তৈরি বৃহত্তম ডিজিটাল রক্তদাতা সন্ধান মাধ্যম। রক্ত দেওয়া কিংবা জরুরী রক্ত পেতে আমাদের ডাটাবেজ ব্যবহার করুন।
            </p>

            {/* Quick Blood Group Search Form */}
            <form onSubmit={handleSearchSubmit} className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-md space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-red-600" />
                <span>{language === 'bn' ? 'রক্তের গ্রুপ দিয়ে তাৎক্ষণিক ডোনার খুঁজুন:' : 'Search Donor by Blood Group:'}</span>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <select
                  value={selectedGroupInput}
                  onChange={(e) => setSelectedGroupInput(e.target.value as BloodGroup)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white flex-1 sm:flex-initial"
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group} {language === 'bn' ? 'গ্রুপ' : 'Group'}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ডোনার খুঁজুন' : 'Search Donors'}</span>
                </button>
              </div>

              {/* Quick Pills */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] font-semibold text-gray-500 shrink-0">
                  {language === 'bn' ? 'শর্টকাট:' : 'Quick:'}
                </span>
                {BLOOD_GROUPS.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => onSelectBloodGroup(group)}
                    className="px-3 py-1 rounded-xl bg-red-50 hover:bg-red-600 border border-red-200 text-xs font-bold text-red-700 hover:text-white transition-colors shrink-0 cursor-pointer"
                  >
                    {group}
                  </button>
                ))}
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onBecomeDonorClick}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{language === 'bn' ? 'ডোনার হিসেবে নিবন্ধন করুন' : 'Become a Donor'}</span>
              </button>

              <a
                href={`tel:${ORG_CONFIG.contacts.emergencyHotline}`}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 font-bold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>জরুরী হটলাইন ({ORG_CONFIG.contacts.emergencyHotline})</span>
              </a>
            </div>
          </div>

          {/* Right Hero Graphic Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg space-y-6 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white text-3xl font-black shadow-md">
                  প
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {ORG_CONFIG.nameBn}
                  </h3>
                  <p className="text-xs text-red-600 font-semibold mt-0.5">
                    {ORG_CONFIG.taglineBn}
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-700">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>১০০% স্বেচ্ছাসেবী ও অলাভজনক মানবিক সেবা</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>যাচাইকৃত রক্তদাতাদের তালিকা ও মোবাইল নম্বর</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-red-600 shrink-0 fill-current" />
                  <span>পাংশা পৌরসভা ও ১০টি ইউনিয়নে সক্রিয় সেবা</span>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">জরুরী রক্ত প্রয়োজন?</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">বিনামূল্যে পাব্লিক রিকুয়েস্ট পোস্ট করুন</p>
                </div>
                <button
                  onClick={onPostRequestClick}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  পোস্ট করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
