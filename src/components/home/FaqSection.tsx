import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const { language } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'কে কে রক্ত দিতে পারবেন?',
      a: '১৮ থেকে ৬৫ বছর বয়সী যেকোনো সুস্থ পুরুষ ও নারী যাদের ওজন অন্তত ৪৫ কেজি বা তার বেশি এবং হিমোগ্লোবিন সঠিক মাত্রা (পুরুষদের ১৩.৫ ও মহিলাদের ১২.৫) বজায় আছে তারা রক্ত দিতে পারবেন।',
    },
    {
      q: 'কত দিন পর পর রক্ত দেওয়া যায়?',
      a: 'সাধারণত পুরুষরা প্রতি ৩ মাস (৯০ দিন) পর পর এবং নারীরা প্রতি ৪ মাস (১২০ দিন) পর পর নিরাপদে রক্ত দিতে পারেন।',
    },
    {
      q: 'রক্ত দিলে কি শরীরের কোনো ক্ষতি বা দুর্বলতা হয়?',
      a: 'একেবারেই না! একজন প্রাপ্তবয়স্ক মানুষের শরীরে ৪.৫ থেকে ৫.৫ লিটার রক্ত থাকে। রক্তদানে মাত্র ৩৫০-৪৫০ মিলিলিটার রক্ত নেওয়া হয়, যা শরীর আগামী ২৪-৪৮ ঘণ্টার মধ্যে তরল ঘাটতি পূরণ করে ফেলে এবং কয়েক সপ্তাহের মধ্যে নতুন রক্তকণিকা তৈরি হয়।',
    },
    {
      q: 'পাংশা ব্লাড ডোনার্স এসোসিয়েশনের মাধ্যমে কীভাবে জরুরী রক্ত পাব?',
      a: 'আমাদের ওয়েবসাইটের হোমপেজে গিয়ে প্রয়োজনীয় রক্তের গ্রুপ লিখে সার্চ করুন অথবা সরাসরি আমাদের জরুরী হটলাইনে কল দিন বা পাব্লিক ব্লাড রিকুয়েস্ট পোস্ট করুন।',
    },
    {
      q: 'রক্তদানের পূর্বে কী কী বিষয় খেয়াল রাখা দরকার?',
      a: 'রক্তদানের পূর্বে পর্যাপ্ত পানি বা তরল পান করুন, অন্তত ৬-৮ ঘণ্টা ভালো ঘুম নিশ্চিত করুন এবং খালি পেটে না গিয়ে হালকা পুষ্টিকর খাবার গ্রহণ করে আসুন।',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3 h-3" />
            <span>সাধারণ জিজ্ঞাসা</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            রক্তদান সম্পর্কিত সচরাচর প্রশ্নাবলী (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            রক্তদান সম্পর্কে আপনার মনে থাকা কিছু প্রশ্নের সহজ ও সঠিক সমাধান।
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-red-600' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/40 dark:border-slate-700/40 pt-3">
                    {faq.a}
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
