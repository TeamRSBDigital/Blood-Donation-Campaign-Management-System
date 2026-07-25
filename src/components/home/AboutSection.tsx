import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { ORG_CONFIG } from '../../config/org.config.js';
import { Target, Compass, Heart, MapPin, CheckCircle } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-red-600 fill-current" />
            <span>আমাদের পরিচিতি</span>
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {ORG_CONFIG.nameBn}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            পাংশা মডেল থানা ও রাজবাড়ী জেলার সাধারণ মানুষের আপদকালীন জরুরি রক্তের অভাব দূরীকরণে ২০২০ সাল থেকে নিরলসভাবে কাজ করে যাচ্ছে আমাদের এই মানবিক রক্তদাতা প্ল্যাটফর্ম।
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Decorative Image Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
              <div className="w-full h-64 sm:h-72 rounded-2xl bg-slate-800 relative overflow-hidden flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80"
                  alt="Blood Donation Volunteers"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="px-2.5 py-1 rounded-md bg-red-600 text-[10px] font-bold uppercase tracking-wider">
                    স্বেচ্ছাসেবী টিম
                  </span>
                  <p className="text-sm font-bold mt-1">পাংশা ব্লাড ডোনার্স এসোসিয়েশন ক্যাম্পেইন</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>পাংশা মডেল থানা রোড, রাজবাড়ী</span>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">স্থাপিত ২০২০</span>
              </div>
            </div>
          </div>

          {/* Right Core Values / Mission & Vision */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  আমাদের মূল লক্ষ্য (Mission)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                পাংশা উপজেলা এবং রাজবাড়ী জেলার প্রতিটি ইউনিয়নে একটি সুসংগঠিত, বিশ্বস্ত ও দ্রুত সাড়াদানকারী রক্তদাতাদের ডাটাবেজ তৈরি করা, যাতে কোনো মুমূর্ষু রোগী রক্তের অভাবে প্রাণ না হারায়।
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  আমাদের ভিশন (Vision)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                তরুণ সমাজকে মানবিক কাজে উদ্বুদ্ধ করে রক্তদানে সচেতনতা বৃদ্ধি করা এবং সম্পূর্ণ ফ্রী প্রযুক্তিনির্ভর স্বাস্থ্যসেবা সহায়তা প্রদান করা।
              </p>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                '১০০% স্বেচ্ছাসেবী রক্তদান সংস্থা',
                'জরুরী ২৪/৭ রক্তদাতা হেল্পলাইন',
                '১০টি ইউনিয়নে সুসংগঠিত ভলান্টিয়ার নেটওয়ার্ক',
                'ফ্রি রক্তের গ্রুপ নির্ণয় ক্যাম্পেইন',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
