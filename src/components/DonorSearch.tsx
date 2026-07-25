import React, { useState, useEffect, useRef } from 'react';
import { Donor, BloodGroup } from '../types/index.js';
import { PANGSHA_UNIONS, RAJBARI_UPAZILAS, RAJBARI_DISTRICTS } from '../constants/locations.js';
import { BLOOD_GROUPS, BLOOD_GROUP_COMPATIBILITY } from '../constants/bloodGroups.js';
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
  ChevronDown,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';

interface DonorSearchProps {
  initialBloodGroup?: BloodGroup | 'ALL';
}

const ALL_BLOOD_GROUPS: (BloodGroup | 'ALL')[] = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonorSearch: React.FC<DonorSearchProps> = ({ initialBloodGroup = 'ALL' }) => {
  const { t, language } = useLanguage();

  // Read initial query params from window.location.search if present
  const getInitialParam = (key: string, defaultVal: string) => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get(key) || searchParams.get(key.replace(/([A-Z])/g, '_$1').toLowerCase()) || defaultVal;
    }
    return defaultVal;
  };

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'ALL'>(() => {
    const fromUrl = getInitialParam('bloodGroup', initialBloodGroup) as BloodGroup | 'ALL';
    return ALL_BLOOD_GROUPS.includes(fromUrl) ? fromUrl : initialBloodGroup;
  });
  const [selectedUnion, setSelectedUnion] = useState<string>(() => getInitialParam('union', 'ALL'));
  const [selectedUpazila, setSelectedUpazila] = useState<string>(() => getInitialParam('upazila', 'Pangsha'));
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => getInitialParam('district', 'Rajbari'));
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedDonorForModal, setSelectedDonorForModal] = useState<Donor | null>(null);

  // Autocomplete dropdown state for Blood Group
  const [bgAutocompleteOpen, setBgAutocompleteOpen] = useState(false);
  const [bgFilterInput, setBgFilterInput] = useState('');
  const bgDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state (20 donors per page as required)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Debounce search input by 300ms for optimal performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (initialBloodGroup && initialBloodGroup !== 'ALL') {
      setSelectedGroup(initialBloodGroup);
    }
  }, [initialBloodGroup]);

  // Click outside listener for blood group autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bgDropdownRef.current && !bgDropdownRef.current.contains(event.target as Node)) {
        setBgAutocompleteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update URL search parameters without page reload & update dynamic title
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (selectedGroup !== 'ALL') url.searchParams.set('blood_group', selectedGroup);
      else url.searchParams.delete('blood_group');

      if (selectedUnion !== 'ALL') url.searchParams.set('union', selectedUnion);
      else url.searchParams.delete('union');

      if (selectedUpazila !== 'ALL') url.searchParams.set('upazila', selectedUpazila);
      else url.searchParams.delete('upazila');

      if (selectedDistrict !== 'ALL') url.searchParams.set('district', selectedDistrict);
      else url.searchParams.delete('district');

      window.history.replaceState({}, '', url.toString());

      // Set dynamic SEO metadata title
      const titleGroup = selectedGroup !== 'ALL' ? `${selectedGroup} ` : '';
      document.title = `${titleGroup}রক্তদাতা অনুসন্ধান - পাংশা ব্লাড ডোনার্স এসোসিয়েশন`;
    }
  }, [selectedGroup, selectedUnion, selectedUpazila, selectedDistrict]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGroup !== 'ALL') params.append('bloodGroup', selectedGroup);
      if (selectedUnion !== 'ALL') params.append('union', selectedUnion);
      if (selectedUpazila !== 'ALL') params.append('upazila', selectedUpazila);
      if (selectedDistrict !== 'ALL') params.append('district', selectedDistrict);
      if (debouncedQuery.trim()) params.append('searchQuery', debouncedQuery.trim());
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
  }, [selectedGroup, selectedUnion, selectedUpazila, selectedDistrict, debouncedQuery, availableOnly]);

  const handleResetFilters = () => {
    setSelectedGroup('ALL');
    setSelectedUnion('ALL');
    setSelectedUpazila('Pangsha');
    setSelectedDistrict('Rajbari');
    setSearchQuery('');
    setDebouncedQuery('');
    setAvailableOnly(false);
  };

  // Compatible blood groups helper for empty states
  const compatibleGroups = selectedGroup !== 'ALL'
    ? (BLOOD_GROUP_COMPATIBILITY[selectedGroup as BloodGroup]?.canReceiveFrom || []).filter(g => g !== selectedGroup)
    : [];

  // Paginated list calculation
  const totalPages = Math.ceil(donors.length / pageSize) || 1;
  const paginatedDonors = donors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Filtered Blood Groups for Autocomplete
  const filteredBgList = ALL_BLOOD_GROUPS.filter(g =>
    g.toLowerCase().includes(bgFilterInput.toLowerCase().trim())
  );

  return (
    <section className="py-8 lg:py-12 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Page Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-bold">
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>পাংশা ব্লাড ব্যাংক ও ডোনার নেটওয়ার্ক</span>
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            পাবলিক রক্তদাতা সার্চ ও ডিরেক্টরি
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-medium">
            যেকোনো রক্তের গ্রুপ, ইউনিয়ন, উপজেলা ও মোবাইল নম্বর দিয়ে বিনামূল্যে তাৎক্ষণিক সরাসরি রক্তদাতা খুঁজুন।
          </p>
        </div>

        {/* Search Control Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          {/* Main Large Search Bar with Autocomplete Blood Group Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              ১. রক্তের গ্রুপ নির্বাচন করুন (Searchable Dropdown / Autocomplete):
            </label>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Custom Searchable Autocomplete Dropdown */}
              <div className="md:col-span-5 relative" ref={bgDropdownRef}>
                <div
                  onClick={() => setBgAutocompleteOpen(!bgAutocompleteOpen)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-red-500/40 hover:border-red-500 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer shadow-xs transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-red-600 text-white font-extrabold text-sm flex items-center justify-center">
                      {selectedGroup === 'ALL' ? 'সকল' : selectedGroup}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedGroup === 'ALL' ? 'সকল রক্তের গ্রুপ (All Blood Groups)' : `${selectedGroup} গ্রুপ`}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${bgAutocompleteOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Autocomplete Dropdown List */}
                {bgAutocompleteOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      autoFocus
                      placeholder="গ্রুপ টাইপ করুন (A+, B+, O-)..."
                      value={bgFilterInput}
                      onChange={(e) => setBgFilterInput(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {filteredBgList.map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => {
                            setSelectedGroup(bg);
                            setBgAutocompleteOpen(false);
                            setBgFilterInput('');
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                            selectedGroup === bg
                              ? 'bg-red-600 text-white'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{bg === 'ALL' ? 'সকল গ্রুপ (All Groups)' : `Blood Group ${bg}`}</span>
                          {selectedGroup === bg && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text Search Input (Name / Mobile Number) */}
              <div className="md:col-span-5 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম বা মোবাইল নম্বর লিখে খুঁজুন (যেমন: 01711...)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              </div>

              {/* Reset Button */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                  <span>রিসেট</span>
                </button>
              </div>
            </div>

            {/* Quick Pills Selector */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">দ্রুত নির্বাচন:</span>
              {ALL_BLOOD_GROUPS.map((group) => {
                const isActive = selectedGroup === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-md scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {group === 'ALL' ? 'সকল' : group}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Filters Row */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* District Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                জেলা (District):
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="ALL">সকল জেলা (All Districts)</option>
                {RAJBARI_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.nameEn}>
                    {d.nameBn} ({d.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                উপজেলা (Upazila):
              </label>
              <select
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="ALL">সকল উপজেলা (All Upazilas)</option>
                {RAJBARI_UPAZILAS.map((up) => (
                  <option key={up.id} value={up.nameEn}>
                    {up.nameBn} ({up.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Union Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ইউনিয়ন (Pangsha Union):
              </label>
              <select
                value={selectedUnion}
                onChange={(e) => setSelectedUnion(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="ALL">{t.allUnions}</option>
                {PANGSHA_UNIONS.map((u) => (
                  <option key={u.id} value={u.nameBn}>
                    {u.nameBn} ({u.nameEn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability Checkbox & Result Summary */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded-md focus:ring-red-500 border-slate-300"
              />
              <span>শুধু প্রস্তুত রক্তদাতা দেখান (Ready to Donate Only)</span>
            </label>

            <div className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <span>মোট পাওয়া গেছে:</span>
              <span className="bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-black px-2.5 py-0.5 rounded-md text-xs">
                {donors.length} জন রক্তদাতা
              </span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">রক্তদাতাদের সঠিক তালিকা লোড হচ্ছে...</p>
          </div>
        ) : donors.length === 0 ? (
          /* Empty State Requirement: "No donor found for this blood group." & Suggest nearby blood groups */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">
                No donor found for this blood group.
              </h3>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                এই রক্তের গ্রুপের জন্য কোনো রক্তদাতা পাওয়া যায়নি।
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                আপনার নির্বাচিত ফিল্টারে কোনো রক্তদাতা মেলেনি। অনুগ্রহ করে অন্য কোনো গ্রুপ অথবা স্থান নির্বাচন করে চেষ্টা করুন।
              </p>
            </div>

            {/* Compatible Blood Groups Suggestion */}
            {compatibleGroups.length > 0 && (
              <div className="bg-rose-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-rose-100 dark:border-slate-700 max-w-lg mx-auto space-y-3">
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>সামঞ্জস্যপূর্ণ বিকল্প রক্তের গ্রুপসমূহ (Compatible Groups):</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {compatibleGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-red-600 dark:text-red-300 font-black text-xs border border-red-200 dark:border-slate-600 hover:bg-red-600 hover:text-white transition-colors shadow-xs"
                    >
                      {group} গ্রুপ দিয়ে খুঁজুন
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>সকল ফিল্টার রিসেট করুন</span>
            </button>
          </div>
        ) : (
          /* Donor Grid & Pagination */
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

            {/* Pagination Controls (20 donors per page) */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  মোট {donors.length} জনের মধ্যে {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, donors.length)} জন রক্তদাতা দেখাচ্ছে
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    পূর্ববর্তী
                  </button>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-3">
                    পৃষ্ঠা {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    পরবর্তী
                  </button>
                </div>
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
