import React from 'react';
import { BloodRequest } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { formatDateBn } from '../../utils/formatters.js';
import { AlertCircle, Hospital, Calendar, PhoneCall, PlusCircle, ArrowRight } from 'lucide-react';

interface LatestRequestsSectionProps {
  requests?: BloodRequest[];
  onOpenNewRequestModal: () => void;
  onViewAllRequestsClick: () => void;
}

export const LatestRequestsSection: React.FC<LatestRequestsSectionProps> = ({
  requests = [],
  onOpenNewRequestModal,
  onViewAllRequestsClick,
}) => {
  const { language } = useLanguage();
  const displayRequests = requests.slice(0, 4);

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              জরুরী আবেদনসমূহ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              সাম্প্রতিক রক্তের রিকুয়েস্ট
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewRequestModal}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>আবেদন পোস্ট করুন</span>
            </button>

            <button
              onClick={onViewAllRequestsClick}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 transition-colors"
            >
              <span>সকল রিকুয়েস্ট</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayRequests.map((req) => {
            const isCritical = req.priority === 'CRITICAL' || req.priority === 'URGENT';

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-sm shadow-xs">
                      {req.bloodGroup}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 animate-pulse'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {req.priority === 'CRITICAL' ? 'অতি জরুরী' : req.priority === 'URGENT' ? 'জরুরী' : 'সাধারণ'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    রোগী: {req.patientName}
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-3">
                    প্রয়োজন: {req.bagsNeeded} ব্যাগ
                  </p>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl mb-4">
                    <div className="flex items-start gap-1.5">
                      <Hospital className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{req.hospitalName} ({req.upazila})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>প্রয়োজন: {formatDateBn(req.requiredDate)}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${req.contactPhone}`}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>কল করুন ({req.contactPerson})</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
