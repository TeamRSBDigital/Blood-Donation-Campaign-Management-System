import React, { useState, useEffect } from 'react';
import { Donor, BloodGroup } from '../types/index.js';
import { PANGSHA_UNIONS, RAJBARI_UPAZILAS } from '../constants/locations.js';
import { useLanguage } from '../context/LanguageContext.js';
import { DonorCard } from './DonorCard.js';
import { DonorDetailModal } from './DonorDetailModal.js';
import {
  Search,
  Filter,
  RefreshCw,
  Droplet,
  Users,
  CheckCircle2,
  XCircle,
  SlidersHorizontal
} from 'lucide-react';

interface DonorSearchProps {
  initialBloodGroup?: BloodGroup | 'ALL';
}

const BLOOD_GROUPS: (BloodGroup | 'ALL')[] = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonorSearch: React.FC<DonorSearchProps> = ({ initialBloodGroup = 'ALL' }) => {
  const { t, language } = useLanguage();

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'ALL'>(initialBloodGroup);
  const [selectedUnion, setSelectedUnion] = useState<string>('ALL');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('Pangsha');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedDonorForModal, setSelectedDonorForModal] = useState<Donor | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    setSelectedGroup(initialBloodGroup);
  }, [initialBloodGroup]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGroup !== 'ALL') params.append('bloodGroup', selectedGroup);
      if (selectedUnion !== 'ALL') params.append('union', selectedUnion);
      if (selectedUpazila !== 'ALL') params.append('upazila', selectedUpazila);
      if (searchQuery.trim()) params.append('searchQuery', searchQuery.trim());
      if (availableOnly) params.append('availableOnly', 'true');

      const res = await fetch(`/api/donors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDonors(data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to fetch donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedGroup, selectedUnion, selectedUpazila, availableOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonors();
  };

  const handleResetFilters = () => {
    setSelectedGroup('ALL');
    setSelectedUnion('ALL');
    setSelectedUpazila('Pangsha');
    setSearchQuery('');
    setAvailableOnly(false);
  };

  // Paginated list calculation
  const totalPages = Math.ceil(donors.length / pageSize) || 1;
  const paginatedDonors = donors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="py-10 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-bold">
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>পাংশা ব্লাড ব্যাংক ও ডোনার ডিরেক্টরি</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.searchDonors}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            রক্তের গ্রুপ, ইউনিয়ন বা মোবাইল নাম্বার দিয়ে পাংশা উপজেলার নিবন্ধিত রক্তদাতাদের খুঁজুন।
          </p>
        </div>

        {/* Filter Toolbar Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          {/* Blood Group Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              ১. রক্তের গ্রুপ সিলেক্ট করুন:
            </label>
            <div className="flex flex-wrap gap-2">
              {BLOOD_GROUPS.map((group) => {
                const isActive = selectedGroup === group;
                return (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-150 ${
                      isActive
                        ? 'bg-red-600 text-white shadow-md scale-105 ring-2 ring-red-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {group === 'ALL' ? (language === 'bn' ? 'সকল গ্রুপ' : 'All Groups') : group}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Text Search Controls */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Union Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ২. ইউনিয়ন (পাংশা):
              </label>
              <select
                value={selectedUnion}
                onChange={(e) => setSelectedUnion(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              >
                <option value="ALL">{t.allUnions}</option>
                {PANGSHA_UNIONS.map((u) => (
                  <option key={u.id} value={u.nameBn}>
                    {u.nameBn} ({u.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                উপজেলা:
              </label>
              <select
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              >
                {RAJBARI_UPAZILAS.map((up) => (
                  <option key={up.id} value={up.nameEn}>
                    {up.nameBn} ({up.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Text Search Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                নাম/ফোন দিয়ে খুঁজুন:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchByMobile}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Submit & Reset Buttons */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>খুঁজুন</span>
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                title="ফিল্টার রিসেট করুন"
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Toggle Availability Filter & Result Summary */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded-md focus:ring-red-500 border-slate-300"
              />
              <span>{t.availabilityFilter} (প্রস্তুত রক্তদাতা)</span>
            </label>

            <div className="text-slate-500 dark:text-slate-400 font-medium">
              ফলাফল: <strong className="text-slate-900 dark:text-white font-bold">{donors.length}</strong> {t.searchResultCount}
            </div>
          </div>
        </div>

        {/* Donors Grid / Loading / Empty State */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">রক্তদাতাদের তালিকা ডাটাবেজ থেকে লোড হচ্ছে...</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              কোনো রক্তদাতা খুঁজে পাওয়া যায়নি
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t.noDonorsFound}
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>সকল ফিল্টার ক্লিয়ার করুন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedDonors.map((donor) => (
                <DonorCard
                  key={donor.id}
                  donor={donor}
                  onSelectDonor={(d) => setSelectedDonorForModal(d)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  পূর্ববর্তী
                </button>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-3">
                  পৃষ্ঠা {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  পরবর্তী
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Donor Detailed Modal */}
      <DonorDetailModal
        donor={selectedDonorForModal}
        onClose={() => setSelectedDonorForModal(null)}
      />
    </section>
  );
};
