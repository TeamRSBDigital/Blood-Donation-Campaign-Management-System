import React, { useState, useEffect } from 'react';
import { Campaign, GalleryImage } from '../types/index.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Calendar, MapPin, Users, Award, Image as ImageIcon, Sparkles } from 'lucide-react';

export const CampaignsSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, gRes] = await Promise.all([
          fetch('/api/campaigns'),
          fetch('/api/gallery')
        ]);
        if (cRes.ok) setCampaigns(await cRes.json());
        if (gRes.ok) setGallery(await gRes.json());
      } catch (err) {
        console.error('Error loading campaigns and gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Campaigns Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-red-600" />
            <span>সামাজিক কর্মকাণ্ড ও ক্যাম্পেইন</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.campaignsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            পাংশা উপজেলায় আয়োজিত ব্লাড গ্রুপিং ও স্বেচ্ছায় রক্তদান ক্যাম্পেইনের তথ্য।
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              {camp.bannerUrl && (
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src={camp.bannerUrl}
                    alt={camp.titleBn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      camp.status === 'UPCOMING'
                        ? 'bg-amber-400 text-slate-900 shadow-md'
                        : 'bg-emerald-600 text-white shadow-md'
                    }`}
                  >
                    {camp.status === 'UPCOMING' ? 'আসন্ন ক্যাম্পেইন' : 'সম্পন্ন ক্যাম্পেইন'}
                  </span>
                </div>
              )}

              <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {language === 'bn' ? camp.titleBn : camp.titleEn}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'bn' ? camp.descriptionBn : camp.descriptionEn}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{camp.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{camp.date} • {camp.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>আয়োজক: <strong className="text-slate-800 dark:text-slate-200">{camp.organizer}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Photo Gallery Grid */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-red-600" />
                <span>{t.galleryTitle}</span>
              </h3>
              <p className="text-xs text-slate-500">পাংশা ব্লাড ডোনার্স এসোসিয়েশনের বিভিন্ন সমাজসেবামূলক স্মৃতির অ্যালবাম</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {gallery.map((img) => (
              <div
                key={img.id}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={img.imageUrl}
                    alt={img.titleBn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {img.date}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {language === 'bn' ? img.titleBn : img.titleEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
