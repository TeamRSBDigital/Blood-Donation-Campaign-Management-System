import React, { useState } from 'react';
import { Donor } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { formatDateBn } from '../../utils/formatters.js';
import { getAvatarUrl, getBloodGroupBadgeColor } from '../../utils/helpers.js';
import { DonorDetailModal } from '../DonorDetailModal.js';
import { MapPin, PhoneCall, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface RecentDonorsSectionProps {
  donors?: Donor[];
  onViewAllDonorsClick: () => void;
}

export const RecentDonorsSection: React.FC<RecentDonorsSectionProps> = ({
  donors = [],
  onViewAllDonorsClick,
}) => {
  const { language } = useLanguage();
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  const displayDonors = donors.slice(0, 6);

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              যাচাইকৃত রক্তদাতাগণ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              সম্প্রতি সক্রিয় ডোনারগণ
            </h2>
          </div>
          <button
            onClick={onViewAllDonorsClick}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 uppercase tracking-wider group shrink-0"
          >
            <span>সকল রক্তদাতা দেখুন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Donors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDonors.map((donor) => {
            const badgeColor = getBloodGroupBadgeColor(donor.bloodGroup);
            const avatar = getAvatarUrl(donor.name, donor.photoUrl);

            return (
              <div
                key={donor.id}
                className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatar}
                        alt={donor.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {donor.name}
                          </h3>
                          {donor.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>{donor.union}, {donor.upazila}</span>
                        </p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-xl text-xs font-black border ${badgeColor}`}>
                      {donor.bloodGroup}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 mb-4">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>সর্বশেষ রক্তদান:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">
                        {donor.lastDonationDate ? formatDateBn(donor.lastDonationDate) : 'নতুন রক্তদাতা'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>মোট রক্তদান:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">
                        {donor.totalDonations} বার
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${donor.phone}`}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>কল দিন</span>
                  </a>

                  <button
                    onClick={() => setSelectedDonor(donor)}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold py-2.5 px-3 rounded-2xl transition-colors"
                  >
                    বিস্তারিত
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for detail */}
        {selectedDonor && (
          <DonorDetailModal
            donor={selectedDonor}
            isOpen={!!selectedDonor}
            onClose={() => setSelectedDonor(null)}
          />
        )}
      </div>
    </section>
  );
};
