import React, { useState } from 'react';
import { GalleryImage } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Image as ImageIcon, Calendar, ZoomIn, X } from 'lucide-react';

interface GallerySectionProps {
  images?: GalleryImage[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ images = [] }) => {
  const { language } = useLanguage();
  const [activeLightbox, setActiveLightbox] = useState<GalleryImage | null>(null);

  // Default fallback photos if list is empty
  const defaultImages: GalleryImage[] = images.length > 0 ? images : [
    {
      id: 'g1',
      titleBn: 'পাংশা পাইলট স্কুল বিনামূল্যে রক্ত গ্রুপ নির্ণয় ক্যাম্পেইন',
      titleEn: 'Pangsha Pilot School Free Blood Grouping Campaign',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      category: 'CAMPAIGN',
      date: '2025-02-21',
    },
    {
      id: 'g2',
      titleBn: 'বিশ্ব রক্তদাতা দিবস র‍্যালি ও আলোচনা সভা',
      titleEn: 'World Blood Donor Day Rally & Discussion',
      imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80',
      category: 'AWARENESS',
      date: '2025-06-14',
    },
    {
      id: 'g3',
      titleBn: 'জরুরী রক্তের প্রয়োজনে ভলান্টিয়ারদের সরাসরি রক্তদান',
      titleEn: 'Direct Volunteer Blood Donation in Hospital',
      imageUrl: 'https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?auto=format&fit=crop&w=800&q=80',
      category: 'DONATION',
      date: '2025-08-10',
    },
    {
      id: 'g4',
      titleBn: 'রাজবাড়ী সদর হাসপাতাল সংবর্ধনা ও বর্ষপূর্তি',
      titleEn: 'Rajbari District Hospital Volunteer Honor',
      imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
      category: 'EVENT',
      date: '2025-11-15',
    },
  ];

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            গ্যালারি ও অ্যাক্টিভিটি
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            আমাদের কার্যক্রম ও স্মৃতির অ্যালবাম
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            পাংশা মডেল থানা ও রাজবাড়ীর বিভিন্ন স্থান থেকে পরিচালিত সেবামূলক ক্যাম্পেইনের একাংশ।
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {defaultImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setActiveLightbox(img)}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="w-full h-52 bg-slate-800 relative overflow-hidden">
                <img
                  src={img.imageUrl}
                  alt={img.titleBn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="p-3 bg-red-600/90 rounded-full shadow-lg">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                  {img.titleBn}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">
                    {img.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-red-500" />
                    {img.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeLightbox && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white">
              <button
                onClick={() => setActiveLightbox(null)}
                className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full z-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={activeLightbox.imageUrl}
                alt={activeLightbox.titleBn}
                className="w-full max-h-[60vh] object-cover"
              />

              <div className="p-6 space-y-2">
                <h3 className="text-base font-bold">{activeLightbox.titleBn}</h3>
                <p className="text-xs text-slate-400">{activeLightbox.titleEn}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
