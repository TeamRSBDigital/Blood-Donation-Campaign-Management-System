import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { Heart, Activity, Users, ShieldAlert } from 'lucide-react';

export const WhyDonateSection: React.FC = () => {
  const { language } = useLanguage();

  const reasons = [
    {
      id: 'save-lives',
      icon: Heart,
      titleBn: 'জীবন রক্ষা করা',
      titleEn: 'Save Precious Lives',
      descBn: 'আপনার মাত্র এক ব্যাগ রক্তে ৪ জন মুমূর্ষু মানুষের নতুন জীবন লাভ হতে পারে।',
      descEn: 'A single donation can save up to 3 to 4 human lives in critical need.',
      color: 'bg-red-500',
    },
    {
      id: 'health-benefit',
      icon: Activity,
      titleBn: 'স্বাস্থ্যগত উপকারিতা',
      titleEn: 'Health Benefits',
      descBn: 'নিয়মিত রক্তদান হৃদরোগের ঝুঁকি কমায়, রক্তে অতিরিক্ত আয়রন দূর করে ও নতুন লোহিত রক্তকণিকা তৈরি করে।',
      descEn: 'Regular donation helps reduce cardiovascular risks and stimulates fresh red cell production.',
      color: 'bg-emerald-500',
    },
    {
      id: 'community',
      icon: Users,
      titleBn: 'সামাজিক দায়বদ্ধতা',
      titleEn: 'Community Impact',
      descBn: 'পাংশা উপজেলার সাধারণ মানুষের আপদকালীন বন্ধু হয়ে আত্মতৃপ্তি ও সামাজিক ভ্রাতৃত্ববোধ গড়ে ওঠে।',
      descEn: 'Fosters solidarity and social responsibility among community members.',
      color: 'bg-amber-500',
    },
    {
      id: 'emergency',
      icon: ShieldAlert,
      titleBn: 'জরুরী ব্যাকআপ সুবিধা',
      titleEn: 'Emergency Security',
      descBn: 'আমাদের নিবন্ধিত ডোনারদের নিজের বা পরিবারের প্রয়োজনে অগ্রাধিকারভিত্তিতে রক্তদানের সুযোগ থাকে।',
      descEn: 'Registered active donors get priority support during their own family medical emergencies.',
      color: 'bg-blue-500',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-gray-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            রক্তদানের তাৎপর্য
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            কেন রক্ত দেওয়া উচিত?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            রক্তদান একটি মহৎ সামাজিক দায়িত্ব। রক্তদানে কোনো শারীরিক ক্ষতি হয় না, বরং তা মানবদেহের জন্য অত্যন্ত উপকারী।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.id}
                className="p-6 rounded-3xl bg-gray-50 border border-gray-200 shadow-xs hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl ${reason.color} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {language === 'bn' ? reason.titleBn : reason.titleEn}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'bn' ? reason.descBn : reason.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
