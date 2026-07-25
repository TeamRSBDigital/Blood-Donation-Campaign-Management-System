import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { Search, Phone, Droplet, Heart, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const { language } = useLanguage();

  const steps = [
    {
      number: '০১',
      icon: Search,
      titleBn: '১. রক্তের গ্রুপ সার্চ',
      titleEn: '1. Search Group',
      descBn: 'প্রয়োজনীয় রক্তের গ্রুপ ও স্থান নির্বাচন করে তালিকা বের করুন।',
    },
    {
      number: '০২',
      icon: Phone,
      titleBn: '২. ডোনারকে কল দিন',
      titleEn: '2. Call Donor',
      descBn: 'উপলব্ধ রক্তদাতার মোবাইলে সরাসরি কল করে কথা বলুন।',
    },
    {
      number: '০৩',
      icon: Droplet,
      titleBn: '৩. রক্তদান প্রক্রিয়া',
      titleEn: '3. Donate Blood',
      descBn: 'নির্ধারিত হাসপাতাল বা ব্লাড ব্যাংকে নিরাপদ রক্তদান সম্পন্ন করুন।',
    },
    {
      number: '০৪',
      icon: Heart,
      titleBn: '৪. জীবন বাঁচান',
      titleEn: '4. Save Life',
      descBn: 'আপনার সহায়তায় একটি মুমূর্ষু রোগী বেঁচে উঠবে নতুন আশায়।',
    },
  ];

  return (
    <section className="py-12 bg-slate-900 text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-red-400">
            সহজ ৪ ধাপ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            কীভাবে রক্ত পাবেন বা দেবেন?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            খুব সহজেই মুহূর্তের মধ্যে রক্তদাতা ও গ্রহীতার মধ্যে সংযোগ স্থাপন সম্ভব।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-red-500 font-mono">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-red-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {language === 'bn' ? step.titleBn : step.titleEn}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.descBn}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ArrowRight className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
