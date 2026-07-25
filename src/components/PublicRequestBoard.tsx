import React, { useState, useEffect } from 'react';
import { BloodRequest, BloodGroup } from '../types/index.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Droplet,
  Phone,
  AlertCircle,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  Filter,
  Users,
  Sparkles
} from 'lucide-react';

interface PublicRequestBoardProps {
  onOpenNewRequestModal: () => void;
  onFilterDonorsForGroup: (group: BloodGroup) => void;
}

export const PublicRequestBoard: React.FC<PublicRequestBoardProps> = ({
  onOpenNewRequestModal,
  onFilterDonorsForGroup
}) => {
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to load blood requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (filterPriority === 'ALL') return true;
    return r.priority === filterPriority;
  });

  // Helper function to return compatible blood groups for donor matching
  const getCompatibleDonorGroups = (group: BloodGroup): string[] => {
    switch (group) {
      case 'A+': return ['A+', 'A-', 'O+', 'O-'];
      case 'A-': return ['A-', 'O-'];
      case 'B+': return ['B+', 'B-', 'O+', 'O-'];
      case 'B-': return ['B-', 'O-'];
      case 'AB+': return ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      case 'AB-': return ['A-', 'B-', 'AB-', 'O-'];
      case 'O+': return ['O+', 'O-'];
      case 'O-': return ['O-'];
      default: return [group];
    }
  };

  return (
    <section className="py-10 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Board Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span>জরুরী রক্তের চাহিদা বোর্ড</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t.urgentBloodBoard}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.urgentBloodNotice}
            </p>
          </div>

          <button
            onClick={onOpenNewRequestModal}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-md transition-all shrink-0"
          >
            <Droplet className="w-4 h-4 fill-current" />
            <span>+ {t.postBloodRequest}</span>
          </button>
        </div>

        {/* Priority Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>ফিল্টার:</span>
            <button
              onClick={() => setFilterPriority('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPriority === 'ALL'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              সকল আবেদন ({requests.length})
            </button>
            <button
              onClick={() => setFilterPriority('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPriority === 'CRITICAL'
                  ? 'bg-red-700 text-white font-bold'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
              }`}
            >
              অতীব জরুরী (Critical)
            </button>
            <button
              onClick={() => setFilterPriority('URGENT')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPriority === 'URGENT'
                  ? 'bg-amber-500 text-slate-900 font-bold'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
              }`}
            >
              জরুরী (Urgent)
            </button>
          </div>
        </div>

        {/* Requests Cards List */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">রক্তের আবেদন তালিকা লোড হচ্ছে...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">বর্তমানে কোনো পেন্ডিং রক্তের চাহিদা নেই</h3>
            <p className="text-xs text-slate-500 mt-1">সবাই সুস্থ থাকুন। আলহামদুলিল্লাহ!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRequests.map((req) => {
              const isCritical = req.priority === 'CRITICAL';
              const isFulfilled = req.status === 'FULFILLED';
              const compatibleGroups = getCompatibleDonorGroups(req.bloodGroup);

              return (
                <div
                  key={req.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm transition-all relative overflow-hidden space-y-4 ${
                    isCritical
                      ? 'border-red-500/80 dark:border-red-800 bg-red-50/20 dark:bg-red-950/10'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Top Header Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                        {req.bloodGroup}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {req.patientName}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          ব্যাগ সংখ্যা: <strong className="text-red-600 font-extrabold">{req.bagsNeeded} ব্যাগ</strong>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${
                        isFulfilled
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isCritical
                          ? 'bg-red-600 text-white border-red-700 animate-pulse shadow-xs'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {isFulfilled ? 'সম্পন্ন' : isCritical ? 'অতীব জরুরী' : 'জরুরী'}
                    </span>
                  </div>

                  {/* Hospital & Time Details */}
                  <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">{req.hospitalName}</p>
                        <p className="text-slate-500 dark:text-slate-400">ইউনিয়ন: {req.union || 'পাংশা'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>প্রয়োজনের তারিখ: <strong className="text-slate-800 dark:text-slate-200">{req.requiredDate}</strong></span>
                      </span>
                    </div>

                    {req.diseaseOrReason && (
                      <p className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-600 dark:text-slate-300 italic text-[11px]">
                        কারণ: "{req.diseaseOrReason}"
                      </p>
                    )}
                  </div>

                  {/* Compatible Donor Helper */}
                  <div className="p-2.5 bg-rose-50/80 dark:bg-slate-800/80 rounded-xl border border-rose-100 dark:border-slate-700/80 text-[11px] flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-rose-800 dark:text-rose-300 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>উপযুক্ত রক্তদাতা গ্রুপ:</span>
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {compatibleGroups.join(', ')}
                    </span>
                  </div>

                  {/* Contact Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={`tel:${req.contactPhone}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                      <span>কল করুন: {req.contactPhone}</span>
                    </a>

                    <button
                      onClick={() => onFilterDonorsForGroup(req.bloodGroup)}
                      className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-red-600" />
                      <span>ডোনার খুঁজুন</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
