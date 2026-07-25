import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { ORG_CONFIG } from '../../config/org.config.js';
import { MapPin, Phone, Mail, Facebook, MessageCircle, Clock } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            যোগাযোগের ঠিকানা
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            আমাদের সাথে যুক্ত হন
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            যে কোনো প্রয়োজনে সরাসরি আমাদের কার্যালয়ে আসুন বা হেল্পলাইনে কল করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">প্রধান কার্যালয়</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    পাংশা মডেল থানা রোড, বাসস্ট্যান্ড সংলগ্ন, পাংশা পৌরসভা, রাজবাড়ী-৭৭২০, বাংলাদেশ।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">জরুরী হেল্পলাইন</h3>
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">
                    {ORG_CONFIG.contacts.emergencyHotline}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    সাধারণ ফোন: {ORG_CONFIG.contacts.primaryPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">সেবার সময়সূচী</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    জরুরী রক্ত সংগ্রহ: ২৪ ঘণ্টা (৭ দিন)
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    অফিস খোলা: সকাল ৯:০০ - রাত ৯:০০
                  </p>
                </div>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <a
                href={ORG_CONFIG.contacts.facebookGroup}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Facebook className="w-4 h-4" />
                <span>ফেসবুক গ্রুপ</span>
              </a>

              <a
                href={`https://wa.me/${ORG_CONFIG.contacts.primaryPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপ</span>
              </a>
            </div>
          </div>

          {/* Map Placeholder Card */}
          <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-2 border border-slate-800 shadow-sm min-h-[320px] flex flex-col relative overflow-hidden">
            <iframe
              title="Pangsha Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14608.271775791694!2d89.5786411!3d23.7806509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fe88307db49561%3A0xc3f0b2fbeec9631d!2sPangsha%2C%20Bangladesh!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
              className="w-full h-full min-h-[340px] rounded-2xl border-0 filter grayscale opacity-80 hover:opacity-100 transition-opacity"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
};
