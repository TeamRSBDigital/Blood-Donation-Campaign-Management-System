import React, { useState, useEffect, useMemo } from 'react';
import { Donor, BloodGroup, AvailabilityStatus } from '../../types/index.js';
import { donorService, DonorFilterParams } from '../../services/donorService.js';
import { DonorProfileModal } from './donor/DonorProfileModal.js';
import { DonorFormModal } from './donor/DonorFormModal.js';
import { RecordDonationModal } from './donor/RecordDonationModal.js';
import { BulkImportModal } from './donor/BulkImportModal.js';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  Eye,
  Edit2,
  Heart,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  Users,
  Droplet,
  ShieldAlert,
  X,
  CheckSquare,
  Square
} from 'lucide-react';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const UPAZILAS = ['ALL', 'পাংশা', 'কালুখালী', 'বালিয়াকান্দি', 'রাজবাড়ী সদর', 'গোয়ালন্দ'];
const RARE_GROUPS = ['A-', 'B-', 'AB-', 'O-'];

export const DonorManagement: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('ALL');
  const [showTrash, setShowTrash] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [viewingDonor, setViewingDonor] = useState<Donor | null>(null);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recordingDonor, setRecordingDonor] = useState<Donor | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeletingPermanent, setIsDeletingPermanent] = useState(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Donors
  const fetchDonors = async () => {
    setLoading(true);
    try {
      const filters: DonorFilterParams = {
        bloodGroup: selectedBloodGroup !== 'ALL' ? selectedBloodGroup : undefined,
        upazila: selectedUpazila !== 'ALL' ? selectedUpazila : undefined,
        gender: selectedGender !== 'ALL' ? selectedGender : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        searchQuery: searchQuery.trim() || undefined,
        showTrash
      };
      const list = await donorService.getAllDonors(filters);
      setDonors(list);
    } catch (err) {
      console.error('Failed to fetch donors:', err);
      showToast('রক্তদাতাদের তালিকা লোড করা যায়নি', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
    setSelectedIds([]);
  }, [selectedBloodGroup, selectedUpazila, selectedGender, selectedStatus, showTrash, refreshKey]);

  // Handle Search Input (debounced / instant)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Client-side filtering for smooth instant search if needed
  const filteredDonors = useMemo(() => {
    if (!searchQuery.trim()) return donors;
    const q = searchQuery.toLowerCase().trim();
    return donors.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.nameEn && d.nameEn.toLowerCase().includes(q)) ||
      d.phone.includes(q) ||
      (d.whatsAppPhone && d.whatsAppPhone.includes(q)) ||
      d.bloodGroup.toLowerCase().includes(q) ||
      d.district.toLowerCase().includes(q) ||
      d.upazila.toLowerCase().includes(q) ||
      d.village.toLowerCase().includes(q)
    );
  }, [donors, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = donors.length;
    const available = donors.filter(d => d.status === 'AVAILABLE').length;
    const rare = donors.filter(d => RARE_GROUPS.includes(d.bloodGroup)).length;
    return { total, available, rare };
  }, [donors]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredDonors.length / pageSize) || 1;
  const paginatedDonors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDonors.slice(start, start + pageSize);
  }, [filteredDonors, currentPage, pageSize]);

  // Bulk Selection Handlers
  const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedDonors.map(d => d.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = paginatedDonors.map(d => d.id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isAllPageSelected = paginatedDonors.length > 0 && paginatedDonors.every(d => selectedIds.includes(d.id));

  // Single Delete / Soft Delete / Permanent Delete
  const handleDeleteConfirm = async () => {
    if (isBulkDeleting) {
      if (selectedIds.length === 0) return;
      try {
        const res = await donorService.bulkDeleteDonors(selectedIds, showTrash || isDeletingPermanent);
        showToast(res.error ? res.error : `${res.count} জন রক্তদাতা মুছে ফেলা হয়েছে`, res.error ? 'error' : 'success');
        setSelectedIds([]);
        setRefreshKey(k => k + 1);
      } catch (err) {
        showToast('বাল্ক ডিলিট সফল হয়নি', 'error');
      } finally {
        setIsBulkDeleting(false);
        setDeletingId(null);
      }
    } else if (deletingId) {
      try {
        const res = await donorService.deleteDonor(deletingId, showTrash || isDeletingPermanent);
        if (res.success) {
          showToast(showTrash || isDeletingPermanent ? 'স্থায়ীভাবে মুছে ফেলা হয়েছে' : 'ট্র্যাশে পাঠানো হয়েছে');
          setRefreshKey(k => k + 1);
        } else {
          showToast(res.error || 'ডিলিট করতে ব্যর্থ', 'error');
        }
      } catch (err) {
        showToast('ডিলিট ব্যর্থ হয়েছে', 'error');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Restore Donor from Trash
  const handleRestore = async (id: string) => {
    try {
      const res = await donorService.restoreDonor(id);
      if (res.success) {
        showToast('রক্তদাতা সফলভাবে পুনরুদ্ধার করা হয়েছে');
        setRefreshKey(k => k + 1);
      } else {
        showToast(res.error || 'পুনরুদ্ধার ব্যর্থ', 'error');
      }
    } catch (err) {
      showToast('পুনরুদ্ধার করা সম্ভব হয়নি', 'error');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const listToExport = selectedIds.length > 0
      ? donors.filter(d => selectedIds.includes(d.id))
      : filteredDonors;

    if (listToExport.length === 0) {
      showToast('এক্সপোর্ট করার মত ডাটা নেই', 'error');
      return;
    }

    const headers = ['আইডি', 'নাম', 'ইংরেজি নাম', 'রক্তের গ্রুপ', 'ফোন', 'হোয়াটসঅ্যাপ', 'লিঙ্গ', 'বয়স', 'জেলা', 'উপজেলা', 'ইউনিয়ন', 'গ্রাম', 'সর্বশেষ রক্তদান', 'স্ট্যাটাস'];
    const rows = listToExport.map(d => [
      d.id,
      `"${d.name}"`,
      `"${d.nameEn || ''}"`,
      d.bloodGroup,
      `"${d.phone}"`,
      `"${d.whatsAppPhone || ''}"`,
      d.gender === 'MALE' ? 'পুরুষ' : d.gender === 'FEMALE' ? 'নারী' : 'অন্যান্য',
      d.age,
      `"${d.district}"`,
      `"${d.upazila}"`,
      `"${d.union}"`,
      `"${d.village}"`,
      d.lastDonationDate || 'N/A',
      d.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PBDA_Donors_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`${listToExport.length} জন রক্তদাতার তথ্য CSV ফরম্যাটে এক্সপোর্ট করা হয়েছে`);
  };

  // Export to JSON
  const exportToJSON = () => {
    const listToExport = selectedIds.length > 0
      ? donors.filter(d => selectedIds.includes(d.id))
      : filteredDonors;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(listToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PBDA_Donors_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`${listToExport.length} জন রক্তদাতার তথ্য JSON ফরম্যাটে ডাউনলোড হয়েছে`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border animate-bounce ${
          toastMessage.type === 'success'
            ? 'bg-emerald-600 text-white border-emerald-500'
            : 'bg-red-600 text-white border-red-500'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-extrabold text-[11px] uppercase tracking-wider">
              অ্যাডমিন মডিউল
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              {showTrash ? 'রক্তদাতা সফট ডিলিট ট্র্যাশ' : 'রক্তদাতা ডাটাবেজ ম্যানেজমেন্ট'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            পাংশা ব্লাড ডোনার্স এসোসিয়েশনের সকল নিবন্ধিত রক্তদাতাদের তথ্য পর্যবেক্ষণ ও নিয়ন্ত্রণ করুন।
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setShowTrash(!showTrash);
              setSelectedIds([]);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 border transition-all ${
              showTrash
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{showTrash ? 'সক্রিয় তালিকা দেখুন' : 'ট্র্যাশ ফোল্ডার'}</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>বাল্ক ইম্পোর্ট</span>
          </button>

          <button
            onClick={() => {
              setEditingDonor(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all scale-100 hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন রক্তদাতা যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-2xl text-red-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">মোট রক্তদাতা</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.total} জন</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">রক্তদানে প্রস্তুত</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.available} জন</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-2xl text-purple-600">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">বিরল গ্রুপ (Rare)</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">{stats.rare} জন</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-2xl text-amber-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">ফিল্টারড আইটেম</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{filteredDonors.length} জন</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Instant Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="নাম, ফোন নম্বর, ব্লাড গ্রুপ, গ্রাম দিয়ে সার্চ..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action Export & Bulk Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {selectedIds.length > 0 && (
              <button
                onClick={() => {
                  setIsBulkDeleting(true);
                  setDeletingId('BULK');
                }}
                className="px-3.5 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>নির্বাচন করা ({selectedIds.length}) মুছুন</span>
              </button>
            )}

            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors"
              title="CSV ফাইল এক্সপোর্ট"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV এক্সপোর্ট</span>
            </button>

            <button
              onClick={exportToJSON}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
              title="JSON ব্যাকআপ ফাইল"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span>JSON ব্যাকআপ</span>
            </button>

            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700"
              title="রিফ্রেশ"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Blood Group */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">রক্তের গ্রুপ</label>
            <select
              value={selectedBloodGroup}
              onChange={e => { setSelectedBloodGroup(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="ALL">সকল গ্রুপ</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* Availability Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">স্ট্যাটাস</label>
            <select
              value={selectedStatus}
              onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="ALL">সকল স্ট্যাটাস</option>
              <option value="AVAILABLE">প্রস্তুত (Available)</option>
              <option value="UNAVAILABLE">সাময়িক অনুপস্থিত</option>
              <option value="TEMP_UNAVAILABLE">অসুস্থতা / ব্রেক</option>
              <option value="RESTRICTED">মেডিকেল কারণে বাধা</option>
            </select>
          </div>

          {/* Upazila */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">উপজেলা</label>
            <select
              value={selectedUpazila}
              onChange={e => { setSelectedUpazila(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="ALL">সকল উপজেলা</option>
              {UPAZILAS.filter(u => u !== 'ALL').map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">লিঙ্গ</label>
            <select
              value={selectedGender}
              onChange={e => { setSelectedGender(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="ALL">সকল লিঙ্গ</option>
              <option value="MALE">পুরুষ</option>
              <option value="FEMALE">নারী</option>
              <option value="OTHER">অন্যান্য</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-600" />
            <p>রক্তদাতার ডাটা লোড করা হচ্ছে...</p>
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Droplet className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="font-extrabold text-slate-700 dark:text-slate-300">কোনো রক্তদাতা পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? `"${searchQuery}" এর সাথে মিলে এমন কোনো রক্তদাতা নেই।` : 'আপনার ফিল্টার অনুযায়ী ডাটা খালি।'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={handleSelectAllOnPage}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">রক্তদাতা</th>
                  <th className="p-4">গ্রুপ</th>
                  <th className="p-4">যোগাযোগ</th>
                  <th className="p-4">ঠিকানা</th>
                  <th className="p-4">সর্বশেষ রক্তদান</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {paginatedDonors.map((d) => {
                  const isSelected = selectedIds.includes(d.id);
                  const isAvailable = d.status === 'AVAILABLE';

                  return (
                    <tr
                      key={d.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(d.id)}
                          className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                        />
                      </td>

                      {/* Photo & Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {d.photoUrl ? (
                              <img
                                src={d.photoUrl}
                                alt={d.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center border border-slate-700">
                                {d.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{d.name}</span>
                              {d.isVerified && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" title="ভেরিফাইড" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                              <span>{d.gender === 'MALE' ? 'পুরুষ' : 'নারী'}, {d.age} বছর</span>
                              {d.occupation && <span>• {d.occupation}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Blood Group */}
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-10 h-8 rounded-xl bg-red-600 text-white font-black text-xs shadow-2xs">
                          {d.bloodGroup}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="space-y-1 font-mono">
                          <a
                            href={`tel:${d.phone}`}
                            className="font-bold text-slate-800 dark:text-slate-200 hover:text-red-600 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{d.phone}</span>
                          </a>
                          {d.whatsAppPhone && (
                            <a
                              href={`https://wa.me/88${d.whatsAppPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-teal-600 font-bold flex items-center gap-1 hover:underline"
                            >
                              <MessageSquare className="w-3 h-3 text-teal-600" />
                              <span>{d.whatsAppPhone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="p-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          <p className="font-bold text-slate-900 dark:text-white">{d.village}</p>
                          <p className="text-[10px] text-slate-400">{d.union}, {d.upazila}</p>
                        </div>
                      </td>

                      {/* Last Donation */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {d.lastDonationDate ? (
                            <span>{d.lastDonationDate}</span>
                          ) : (
                            <span className="text-slate-400 italic">নতুন রক্তদাতা</span>
                          )}
                          <p className="text-[10px] text-slate-400">মোট: {d.totalDonations || 0} বার</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            প্রস্তুত
                          </span>
                        ) : d.status === 'RESTRICTED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-extrabold text-[10px]">
                            <ShieldAlert className="w-3 h-3" />
                            নিষিদ্ধ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[10px]">
                            <Clock className="w-3 h-3" />
                            অনুপস্থিত
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {showTrash ? (
                            <>
                              <button
                                onClick={() => handleRestore(d.id)}
                                className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 font-bold text-xs"
                                title="পুনরুদ্ধার করুন"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingId(d.id);
                                  setIsDeletingPermanent(true);
                                }}
                                className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 font-bold text-xs"
                                title="স্থায়ীভাবে মুছুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setViewingDonor(d)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold"
                                title="প্রোফাইল দেখুন"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingDonor(d);
                                  setIsFormOpen(true);
                                }}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold"
                                title="এডিট করুন"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setRecordingDonor(d)}
                                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 hover:bg-rose-100 font-bold"
                                title="রক্তদানের ইতিহাস রেকর্ড"
                              >
                                <Heart className="w-4 h-4 fill-current" />
                              </button>

                              <button
                                onClick={() => {
                                  setDeletingId(d.id);
                                  setIsDeletingPermanent(false);
                                }}
                                className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 hover:bg-red-100 font-bold"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-bold">
            <span>দেখাচ্ছে {paginatedDonors.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} থেকে {Math.min(currentPage * pageSize, filteredDonors.length)} (মোট {filteredDonors.length} জন)</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold outline-none"
            >
              <option value={10}>১০ টি প্রতি পেজে</option>
              <option value={25}>২৫ টি প্রতি পেজে</option>
              <option value={50}>৫০ টি প্রতি পেজে</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-black text-slate-800 dark:text-slate-200">
              পেজ {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals Orchestration */}
      {viewingDonor && (
        <DonorProfileModal
          donor={viewingDonor}
          onClose={() => setViewingDonor(null)}
          onEdit={(d) => {
            setViewingDonor(null);
            setEditingDonor(d);
            setIsFormOpen(true);
          }}
          onRecordDonation={(d) => {
            setViewingDonor(null);
            setRecordingDonor(d);
          }}
        />
      )}

      {isFormOpen && (
        <DonorFormModal
          donor={editingDonor}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDonor(null);
          }}
          onSuccess={(d) => {
            showToast(editingDonor ? 'রক্তদাতার তথ্য পরিবর্তন সফল হয়েছে' : 'নতুন রক্তদাতা যুক্ত করা হয়েছে');
            setRefreshKey(k => k + 1);
          }}
        />
      )}

      {recordingDonor && (
        <RecordDonationModal
          donor={recordingDonor}
          onClose={() => setRecordingDonor(null)}
          onSuccess={() => {
            showToast('রক্তদানের ইতিহাস ডাটাবেজে সংরক্ষণ করা হয়েছে');
            setRefreshKey(k => k + 1);
          }}
        />
      )}

      {isImportOpen && (
        <BulkImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="p-3 bg-red-100 dark:bg-red-950/80 text-red-600 rounded-2xl w-fit">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBulkDeleting
                  ? `${selectedIds.length} জন রক্তদাতা মুছে ফেলার নিশ্চিতকরণ`
                  : showTrash || isDeletingPermanent
                  ? 'রক্তদাতা স্থায়ীভাবে মুছে ফেলা'
                  : 'রক্তদাতা সফট ডিলিট'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isDeletingPermanent || showTrash
                  ? 'এই তথ্য স্থায়ীভাবে মুছে ফেলা হবে এবং আর ফিরিয়ে আনা সম্ভব হবে না!'
                  : 'রক্তদাতাকে ট্র্যাশ ফোল্ডারে পাঠানো হবে। প্রয়োজনে পরবর্তীতে ট্র্যাশ থেকে পুনরুদ্ধার করা যাবে।'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeletingId(null);
                  setIsBulkDeleting(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                বাতিল
              </button>

              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
