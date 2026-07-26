import React, { useState, useEffect } from 'react';
import {
  Users,
  Filter,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';
import {
  BroadcastTargetFilter,
  RecipientCalculationResult,
  BloodGroup
} from '../../../types/index.js';
import { communicationService } from '../../../services/communicationService.js';
import { donorService } from '../../../services/donorService.js';

interface TargetAudienceSelectorProps {
  filter: BroadcastTargetFilter;
  onChangeFilter: (newFilter: BroadcastTargetFilter) => void;
  onCalculated?: (result: RecipientCalculationResult) => void;
}

const ALL_BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const TargetAudienceSelector: React.FC<TargetAudienceSelectorProps> = ({
  filter,
  onChangeFilter,
  onCalculated
}) => {
  const [calculation, setCalculation] = useState<RecipientCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [donorsList, setDonorsList] = useState<Array<{ id: string; name: string; phone: string; bloodGroup: string; district: string }>>([]);
  const [searchDonorQuery, setSearchDonorQuery] = useState('');

  // Load donors for individual donor picker
  useEffect(() => {
    donorService.getAllDonors().then(res => {
      if (Array.isArray(res)) {
        setDonorsList(res.map((d: any) => ({
          id: d.id,
          name: d.name,
          phone: d.phone,
          bloodGroup: d.bloodGroup,
          district: d.district || ''
        })));
      }
    }).catch(err => console.error(err));
  }, []);

  // Recalculate target audience when filter changes
  useEffect(() => {
    let isSubscribed = true;
    setLoading(true);

    communicationService.calculateTargetRecipients(filter)
      .then(res => {
        if (isSubscribed) {
          setCalculation(res);
          setLoading(false);
          if (onCalculated) onCalculated(res);
        }
      })
      .catch(err => {
        console.error(err);
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [filter]);

  const toggleBloodGroup = (bg: string) => {
    const current = filter.bloodGroups || [];
    const updated = current.includes(bg)
      ? current.filter(g => g !== bg)
      : [...current, bg];
    onChangeFilter({ ...filter, bloodGroups: updated });
  };

  const toggleAvailability = (st: string) => {
    const current = filter.availabilityStatus || [];
    const updated = current.includes(st)
      ? current.filter(s => s !== st)
      : [...current, st];
    onChangeFilter({ ...filter, availabilityStatus: updated });
  };

  const toggleVerification = (v: string) => {
    const current = filter.verificationStatus || [];
    const updated = current.includes(v)
      ? current.filter(x => x !== v)
      : [...current, v];
    onChangeFilter({ ...filter, verificationStatus: updated });
  };

  const toggleGender = (g: string) => {
    const current = filter.gender || [];
    const updated = current.includes(g)
      ? current.filter(x => x !== g)
      : [...current, g];
    onChangeFilter({ ...filter, gender: updated });
  };

  const toggleRole = (r: string) => {
    const current = filter.targetRoles || [];
    const updated = current.includes(r)
      ? current.filter(x => x !== r)
      : [...current, r];
    onChangeFilter({ ...filter, targetRoles: updated });
  };

  const toggleIndividualDonor = (id: string) => {
    const current = filter.individualDonorIds || [];
    const updated = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];
    onChangeFilter({ ...filter, individualDonorIds: updated });
  };

  const resetFilters = () => {
    onChangeFilter({});
  };

  return (
    <div className="space-y-5 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
      {/* Real-time Matching Summary Card */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xs font-medium text-red-100 flex items-center gap-1">
              <span>টার্গেট প্রাপক সংখ্যা (Realtime Audience)</span>
              {loading && <span className="animate-spin text-white">⏳</span>}
            </div>
            <div className="text-2xl font-black tracking-tight">
              {calculation ? calculation.totalUniqueRecipients : 0} জন
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <div className="bg-white/15 px-3 py-1.5 rounded-xl backdrop-blur-md">
            ডোনার: {calculation ? calculation.totalMatchingDonors : 0}
          </div>
          <div className="bg-white/15 px-3 py-1.5 rounded-xl backdrop-blur-md">
            এডমিন/ভলান্টিয়ার: {calculation ? calculation.totalMatchingUsers : 0}
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="bg-white text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            ফিল্টার রিসেট
          </button>
        </div>
      </div>

      {/* Primary Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Blood Group Target */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>১. রক্তের গ্রুপ (Blood Group)</span>
            <span className="text-[10px] text-slate-400">
              {filter.bloodGroups && filter.bloodGroups.length > 0
                ? `${filter.bloodGroups.length} টি সিলেক্টেড`
                : 'সকল গ্রুপ (All)'}
            </span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_BLOOD_GROUPS.map(bg => {
              const selected = filter.bloodGroups?.includes(bg);
              return (
                <button
                  key={bg}
                  type="button"
                  onClick={() => toggleBloodGroup(bg)}
                  className={`py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                    selected
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-400'
                  }`}
                >
                  {bg}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Geographic Target */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>২. ভৌগোলিক এলাকা (District / Upazila)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block mb-1">জেলা (District)</span>
              <select
                value={filter.district || 'ALL'}
                onChange={e => onChangeFilter({ ...filter, district: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="ALL">সকল জেলা (All)</option>
                <option value="Rajbari">রাজবাড়ী (Rajbari)</option>
                <option value="Faridpur">ফরিদপুর (Faridpur)</option>
                <option value="Kushtia">কুষ্টিয়া (Kushtia)</option>
                <option value="Magura">মাগুরা (Magura)</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block mb-1">উপজেলা (Upazila)</span>
              <select
                value={filter.upazila || 'ALL'}
                onChange={e => onChangeFilter({ ...filter, upazila: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="ALL">সকল উপজেলা (All)</option>
                <option value="Pangsha">পাংশা (Pangsha)</option>
                <option value="Rajbari Sadar">রাজবাড়ী সদর</option>
                <option value="Baliakandi">বালিয়াকান্দি</option>
                <option value="Goalanda">গোয়ালন্দ</option>
                <option value="Kalukhali">কালুখালী</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Availability Status */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>৩. রক্তদানের উপযোগিতা (Availability)</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'AVAILABLE', label: 'প্রস্তুত (Available)' },
              { id: 'UNAVAILABLE', label: 'কুলডাউনে আছে (Unavailable)' },
              { id: 'TEMP_UNAVAILABLE', label: 'সাময়িক অনুপস্থিত' },
              { id: 'MEDICAL_HOLD', label: 'মেডিকেল হোল্ড' }
            ].map(st => {
              const selected = filter.availabilityStatus?.includes(st.id);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => toggleAvailability(st.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                    selected
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Eligibility Filter */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>৪. রক্তদানের তারিখ / সময়সীমা (Eligibility Timeframe)</span>
          </label>
          <select
            value={filter.eligibilityFilter || 'ALL'}
            onChange={e => onChangeFilter({ ...filter, eligibilityFilter: e.target.value as any })}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
          >
            <option value="ALL">সকল সময়সীমা (All Donors)</option>
            <option value="ELIGIBLE_NOW">আজই প্রস্তুত রক্তদাতা (Eligible Today)</option>
            <option value="ELIGIBLE_THIS_WEEK">চলতি সপ্তাহে প্রস্তুত হচ্ছেন (Eligible This Week)</option>
            <option value="IN_COOLDOWN">বর্তমানে কুলডাউন অবস্থায় আছেন (In Cooldown)</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Accordion */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full py-2 px-4 rounded-2xl bg-slate-200/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-between hover:bg-slate-300/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-red-500" />
            অ্যাডভান্সড ফিল্টারস (ভেরিফিকেশন, জেন্ডার, রোল, ইন্ডিভিজুয়াল ডোনার)
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
            {/* Verification Status */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">ভেরিফিকেশন স্ট্যাটাস</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'VERIFIED', label: 'ভেরিফাইড (Verified)' },
                  { id: 'PENDING', label: 'পেন্ডিং (Pending)' },
                  { id: 'REJECTED', label: 'বাতিলকৃত' }
                ].map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => toggleVerification(v.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                      filter.verificationStatus?.includes(v.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Roles */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">টার্গেট রোলস (ভলান্টিয়ার ও এডমিন)</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'VOLUNTEER', label: 'ভলান্টিয়ার (Volunteers)' },
                  { id: 'ADMIN', label: 'এডমিন (Admins)' },
                  { id: 'SUPER_ADMIN', label: 'সুপার এডমিন' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRole(r.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                      filter.targetRoles?.includes(r.id)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">জেন্ডার (Gender)</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'MALE', label: 'পুরুষ (Male)' },
                  { id: 'FEMALE', label: 'নারী (Female)' }
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGender(g.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                      filter.gender?.includes(g.id)
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Individual Donor Selection */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">নির্দিষ্ট রক্তদাতা সিলেক্ট করুন</span>
              <input
                type="text"
                placeholder="নাম বা রক্ত দিয়ে খুঁজুন..."
                value={searchDonorQuery}
                onChange={e => setSearchDonorQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-white"
              />
              {searchDonorQuery && (
                <div className="max-h-28 overflow-y-auto bg-slate-100 dark:bg-slate-900 rounded-xl p-1.5 space-y-1 text-xs">
                  {donorsList
                    .filter(d => d.name.toLowerCase().includes(searchDonorQuery.toLowerCase()) || d.bloodGroup.includes(searchDonorQuery))
                    .map(d => {
                      const selected = filter.individualDonorIds?.includes(d.id);
                      return (
                        <div
                          key={d.id}
                          onClick={() => toggleIndividualDonor(d.id)}
                          className={`p-1.5 rounded-lg cursor-pointer flex items-center justify-between text-xs font-bold ${
                            selected ? 'bg-red-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{d.name} ({d.bloodGroup})</span>
                          <span>{d.phone}</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recipient Breakdown Sample Preview */}
      {calculation && calculation.matchingSample.length > 0 && (
        <div className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs">
          <div className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span>ম্যাচিং প্রাপকের নমুনা (Sample Matching Audience):</span>
            <span className="text-[10px] text-slate-400">প্রথম ১০ টি দেখানো হচ্ছে</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {calculation.matchingSample.map(s => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              >
                <UserCheck className="w-3 h-3 text-emerald-500" />
                {s.name} ({s.bloodGroup}) - {s.upazila}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
