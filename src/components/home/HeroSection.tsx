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
  const { t, language } = useLanguage();
  const [selectedGroupInput, setSelectedGroupInput] = useState<BloodGroup>('A+');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectBloodGroup(selectedGroupInput);
  };

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white pt-8 pb-16 lg:py-20">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Critical Alert Bar */}
        {criticalRequestsCount > 0 && (
          <div className="bg-red-600/90 backdrop-blur-md text-white border border-red-500/50 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
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
              className="shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-full text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-semibold shadow-inner">
              <Droplet className="w-4 h-4 text-red-500 fill-current animate-bounce" />
              <span>{ORG_CONFIG.nameBn} • রাজবাড়ী-৭৭২০</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              এক ব্যাগ রক্ত, <br />
              <span className="text-red-500">একটি নতুন জীবনের আলো।</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              পাংশা উপজেলা এবং রাজবাড়ী জেলার সাধারণ মানুষের জন্য তৈরি বৃহত্তম ডিজিটাল রক্তদাতা সন্ধান মাধ্যম। রক্ত দেওয়া কিংবা জরুরী রক্ত পেতে আমাদের ডাটাবেজ ব্যবহার করুন।
            </p>

            {/* Quick Blood Group Search Form */}
            <form onSubmit={handleSearchSubmit} className="bg-slate-800/80 p-3 sm:p-4 rounded-3xl border border-slate-700 shadow-xl space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-red-500" />
                <span>{language === 'bn' ? 'রক্তের গ্রুপ দিয়ে তাৎক্ষণিক ডোনার খুঁজুন:' : 'Search Donor by Blood Group:'}</span>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <select
                  value={selectedGroupInput}
                  onChange={(e) => setSelectedGroupInput(e.target.value as BloodGroup)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 flex-1 sm:flex-initial"
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group} {language === 'bn' ? 'গ্রুপ' : 'Group'}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ডোনার খুঁজুন' : 'Search Donors'}</span>
                </button>
              </div>

              {/* Quick Pills */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                  {language === 'bn' ? 'শর্টকাট:' : 'Quick:'}
                </span>
                {BLOOD_GROUPS.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => onSelectBloodGroup(group)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-red-600 border border-slate-700 text-xs font-bold text-red-400 hover:text-white transition-colors shrink-0"
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
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>{language === 'bn' ? 'ডোনার হিসেবে নিবন্ধন করুন' : 'Become a Donor'}</span>
              </button>

              <a
                href={`tel:${ORG_CONFIG.contacts.emergencyHotline}`}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>জরুরী হটলাইন ({ORG_CONFIG.contacts.emergencyHotline})</span>
              </a>
            </div>
          </div>

          {/* Right Hero Graphic Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white text-3xl font-black shadow-md">
                  প
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {ORG_CONFIG.nameBn}
                  </h3>
                  <p className="text-xs text-rose-400 font-semibold mt-0.5">
                    {ORG_CONFIG.taglineBn}
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>১০০% স্বেচ্ছাসেবী ও অলাভজনক মানবিক সেবা</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>যাচাইকৃত রক্তদাতাদের তালিকা ও মোবাইল নম্বর</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-red-500 shrink-0 fill-current" />
                  <span>পাংশা পৌরসভা ও ১০টি ইউনিয়নে সক্রিয় সেবা</span>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-red-950/60 to-slate-900 border border-red-900/50 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">জরুরী রক্ত প্রয়োজন?</p>
                  <p className="text-xs font-bold text-white mt-0.5">বিনামূল্যে পাব্লিক রিকুয়েস্ট পোস্ট করুন</p>
                </div>
                <button
                  onClick={onPostRequestClick}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-colors"
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
