import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { BloodGroup } from '../types/index.js';
import {
  Search,
  Droplet,
  Heart,
  Users,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  ArrowRight
} from 'lucide-react';

interface HeroProps {
  onSelectBloodGroup?: (group: BloodGroup) => void;
  onSearchBloodGroup?: (group: BloodGroup) => void;
  onPostRequestClick?: () => void;
  onOpenPublicRequestModal?: () => void;
  onSearchGeneral?: () => void;
  stats?: {
    totalDonors?: number;
    availableDonors?: number;
    totalDonations?: number;
    criticalRequests?: number;
  };
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const Hero: React.FC<HeroProps> = ({
  onSelectBloodGroup,
  onSearchBloodGroup,
  onPostRequestClick,
  onOpenPublicRequestModal,
  onSearchGeneral,
  stats = { totalDonors: 2540, availableDonors: 1280, totalDonations: 850, criticalRequests: 0 }
}) => {
  const { t, language } = useLanguage();

  const handleGroupSelect = (group: BloodGroup) => {
    if (onSelectBloodGroup) onSelectBloodGroup(group);
    if (onSearchBloodGroup) onSearchBloodGroup(group);
  };

  const handlePostRequest = () => {
    if (onPostRequestClick) onPostRequestClick();
    if (onOpenPublicRequestModal) onOpenPublicRequestModal();
  };

  const criticalCount = stats?.criticalRequests || 0;
  const totalDonorsVal = stats?.totalDonors ?? 2540;

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 lg:py-12 border-b border-slate-200 dark:border-slate-800">
      {/* Background Geometric Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-red-50 dark:bg-red-950/20 rounded-bl-full -z-10 opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200 dark:bg-slate-800/40 rounded-tr-full -z-10 opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Urgent Alert Banner */}
        {criticalCount > 0 && (
          <div className="bg-red-600 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex items-center justify-between flex-wrap gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-white/20 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-amber-300" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  {language === 'bn'
                    ? `জরুরী অ্যালার্ট: বর্তমানে ${criticalCount} টি জরুরি রক্তের আবেদন অপেক্ষমাণ রয়েছে!`
                    : `CRITICAL ALERT: ${criticalCount} Urgent Blood Request(s) currently open!`}
                </p>
                <p className="text-[11px] text-red-100">
                  {language === 'bn' ? 'দয়া করে রক্তদানে এগিয়ে আসুন।' : 'Please check required blood group and help save lives.'}
                </p>
              </div>
            </div>
            {onSearchGeneral && (
              <button
                onClick={onSearchGeneral}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              >
                <span>{t.urgentBloodBoard}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Geometric Balance Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Hero Title & Blood Group Selector */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor" className="text-red-600">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-bold w-fit mb-3">
                <Droplet className="w-3.5 h-3.5 fill-current" />
                <span>পাংশা ব্লাড ব্যাংক ও ডোনার নেটওয়ার্ক</span>
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-3 leading-tight tracking-tight">
                রক্ত দান করুন, <br />
                <span className="text-red-600 dark:text-red-500">জীবন বাঁচান।</span>
              </h2>

              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
                পাংশা উপজেলার সবচেয়ে বড় রক্তদাতা ডাটাবেজ। আপনার প্রয়োজনে সঠিক রক্তদাতার সন্ধান পান মুহূর্তেই।
              </p>

              {/* Blood Group Filter Grid */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  রক্তের গ্রুপ দিয়ে সার্চ করুন:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {BLOOD_GROUPS.map((group) => (
                    <button
                      key={group}
                      onClick={() => handleGroupSelect(group)}
                      className="w-12 h-12 rounded-xl border-2 border-red-100 dark:border-slate-700 bg-red-50 dark:bg-slate-800 text-red-600 dark:text-red-400 font-bold hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5"
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Sub Info Row: Emergency Hotline & Donor Counter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-red-600 p-6 rounded-3xl text-white shadow-xl shadow-red-200 dark:shadow-red-950/40 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">জরুরী যোগাযোগ</p>
                  <p className="text-2xl font-black">০১৮১২-৯৯৯৮৮৮</p>
                </div>
                <p className="text-xs mt-3 opacity-90">২৪/৭ আমাদের স্বেচ্ছাসেবকরা আপনার পাশে।</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">নিবন্ধিত মোট ডোনার</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                  {totalDonorsVal.toLocaleString('bn-BD')}+
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>প্রস্তুত রক্তদাতা সক্রিয় আছেন</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Banner Action Card & Live Highlights */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Quick Action Box */}
            <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full space-y-6">
              <div>
                <span className="px-3 py-1 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full tracking-wider uppercase">
                  AVAILABLE NOW
                </span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-3">
                  জরুরী প্রয়োজনে রক্ত লাগলে পোস্ট দিন
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  পছন্দের রক্তদাতার সাড়াদানে হাসপাতাল বা চিকিৎসাকেন্দ্রে সরাসরি যোগাযোগের সুব্যবস্থা রয়েছে।
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handlePostRequest}
                  className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-200 dark:shadow-red-950/40 transition-all flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>জরুরী রক্তের রিকুয়েস্ট করুন</span>
                </button>
                {onSearchGeneral && (
                  <button
                    onClick={onSearchGeneral}
                    className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>সকল রক্তদাতা তালিকা দেখুন</span>
                  </button>
                )}
              </div>
            </section>

            {/* Campaign Widget */}
            <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-3">চলমান ক্যাম্পেইন</h3>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
                    Upcoming Event
                  </p>
                  <p className="font-bold text-sm">পাংশা ব্লাড ড্রাইভ ও ফ্রী রক্তের গ্রুপ নির্ণয়</p>
                  <p className="text-[10px] opacity-70 mt-1">পাংশা সরকারী কলেজ প্রাঙ্গণ • প্রতিদিন সেবা খোলা</p>
                </div>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white opacity-5 rounded-full pointer-events-none" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
