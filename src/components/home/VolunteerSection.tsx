import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { ORG_CONFIG } from '../../config/org.config.js';
import { Users, UserPlus, HeartHandshake, PhoneCall } from 'lucide-react';

interface VolunteerSectionProps {
  onJoinVolunteerClick: () => void;
}

export const VolunteerSection: React.FC<VolunteerSectionProps> = ({ onJoinVolunteerClick }) => {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Subtle Background Art */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 max-w-2xl relative z-10 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>ভলান্টিয়ার টিম জয়েন করুন</span>
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              পাংশার মানবিক যাত্রায় একজন গর্বিত ভলান্টিয়ার হতে চান?
            </h2>

            <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
              সামাজিক সেবা ও রক্তদানে আমাদের সংগঠনের সাথে যুক্ত হয়ে রক্তদাতা সমন্বয় ও জরুরি সাহায্য পৌঁছে দিতে এগিয়ে আসুন। আপনার ছোট একটি উদ্যোগ বাঁচাতে পারে মূল্যবান প্রাণ।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 relative z-10 w-full lg:w-auto">
            <button
              onClick={onJoinVolunteerClick}
              className="w-full sm:w-auto bg-white text-red-700 hover:bg-slate-100 font-extrabold px-8 py-4 rounded-full text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>নিবন্ধন করুন</span>
            </button>

            <a
              href={`tel:${ORG_CONFIG.contacts.primaryPhone}`}
              className="w-full sm:w-auto bg-slate-950/40 hover:bg-slate-950/60 border border-white/30 text-white font-bold px-6 py-4 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-amber-300" />
              <span>কথা বলুন</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
