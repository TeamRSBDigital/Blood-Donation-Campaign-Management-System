import React, { useState, useEffect } from 'react';
import { EmergencyContact } from '../types/index.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Phone, Building, Ambulance, ShieldCheck, MapPin, Copy, Check, AlertCircle } from 'lucide-react';

export const EmergencyDirectory: React.FC = () => {
  const { t, language } = useLanguage();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch('/api/emergency');
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
        }
      } catch (err) {
        console.error('Failed to load emergency contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleCopy = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HOSPITAL': return <Building className="w-5 h-5 text-red-600" />;
      case 'AMBULANCE': return <Ambulance className="w-5 h-5 text-amber-500" />;
      case 'BLOOD_BANK': return <Building className="w-5 h-5 text-rose-600" />;
      default: return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-bold">
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span>২৪/৭ জরুরী হেল্পলাইন ডিরেক্টরি</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.emergencyHotlines}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            পাংশা উপজেলা ও রাজবাড়ী জেলার গুরুত্বপূর্ণ হাসপাতাল, এ্যাম্বুলেন্স ও ব্লাড ডোনার টিম হটলাইন।
          </p>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">জরুরী নাম্বার লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {contacts.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md flex items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
                      {getCategoryIcon(item.category)}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {language === 'bn' ? item.titleBn : item.titleEn}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>{item.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <span className="text-base font-black text-red-600 dark:text-red-400 tracking-wider">
                      {item.phone}
                    </span>
                    {item.phoneSecondary && (
                      <span className="text-xs text-slate-500">/ {item.phoneSecondary}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    href={`tel:${item.phone}`}
                    className="inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>কল করুন</span>
                  </a>

                  <button
                    onClick={() => handleCopy(item.id, item.phone)}
                    className="inline-flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === item.id ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
