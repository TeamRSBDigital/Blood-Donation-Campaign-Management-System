import React, { useState, useEffect, useMemo } from 'react';
import { Donor, DonationHistory } from '../../../types/index.js';
import { donorService } from '../../../services/donorService.js';
import { apiClient } from '../../../services/apiClient.js';
import { EligibilityBadge } from '../../common/EligibilityBadge.js';
import { formatDateBn, toBengaliNumeral } from '../../../utils/formatters.js';
import {
  Calendar,
  Building,
  Droplet,
  Plus,
  Heart,
  RefreshCw,
  Trash2,
  X,
  Search,
  FileText,
  CheckCircle2,
  MapPin,
  User,
  Award,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export interface DonationHistoryTableProps {
  donor: Donor;
  history?: DonationHistory[];
  onHistoryChange?: () => void;
  onDonorUpdate?: (updatedDonor: Donor) => void;
  showAddButton?: boolean;
  allowDelete?: boolean;
  className?: string;
}

export const DonationHistoryTable: React.FC<DonationHistoryTableProps> = ({
  donor,
  history: initialHistory,
  onHistoryChange,
  onDonorUpdate,
  showAddButton = true,
  allowDelete = true,
  className = ''
}) => {
  const [history, setHistory] = useState<DonationHistory[]>(initialHistory || []);
  const [loading, setLoading] = useState(!initialHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states for new record modal
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospitalName, setHospitalName] = useState('পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স');
  const [patientName, setPatientName] = useState('');
  const [bagsCount, setBagsCount] = useState(1);
  const [location, setLocation] = useState('পাংশা, রাজবাড়ী');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync or fetch history
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const records = await donorService.getDonationHistory(donor.id);
      setHistory(records);
    } catch (err) {
      console.error('Failed to load donation records:', err);
      showToast('ইতিহাস লোড করা সম্ভব হয়নি', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialHistory) {
      setHistory(initialHistory);
      setLoading(false);
    } else {
      fetchHistory();
    }
  }, [donor.id, initialHistory]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filter history by search term (hospital, patient, location, notes)
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      item =>
        item.hospitalName.toLowerCase().includes(q) ||
        (item.patientName && item.patientName.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        item.date.includes(q)
    );
  }, [history, searchQuery]);

  // Calculate stats
  const totalBags = useMemo(() => {
    return history.reduce((sum, item) => sum + (item.bagsCount || 1), 0);
  }, [history]);

  // Handle Add Record
  const handleAddRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !hospitalName.trim()) {
      setFormError('তারিখ এবং হাসপাতালের নাম পূরণ করা আবশ্যক');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      // 1. Post new history record
      const resHistory = await apiClient(`/donors/${donor.id}/history`, {
        method: 'POST',
        body: JSON.stringify({
          date,
          hospitalName: hospitalName.trim(),
          patientName: patientName.trim(),
          bagsCount: Number(bagsCount) || 1,
          location: location.trim(),
          notes: notes.trim()
        })
      });

      if (resHistory.error) {
        setFormError(resHistory.error);
        setSubmitting(false);
        return;
      }

      // 2. Update donor totalDonations and lastDonationDate
      const newTotalDonations = (donor.totalDonations || 0) + (Number(bagsCount) || 1);
      const updatedLastDate =
        !donor.lastDonationDate || date > donor.lastDonationDate ? date : donor.lastDonationDate;

      const resDonor = await donorService.updateDonor(donor.id, {
        lastDonationDate: updatedLastDate,
        totalDonations: newTotalDonations
      });

      if (resDonor.donor && onDonorUpdate) {
        onDonorUpdate(resDonor.donor);
      }

      showToast('রক্তদানের রেকর্ড সফলভাবে সংযোজিত হয়েছে');
      setIsAddModalOpen(false);
      resetForm();

      // Refresh list
      await fetchHistory();
      if (onHistoryChange) onHistoryChange();
    } catch (err: any) {
      setFormError(err.message || 'রেকর্ড সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setHospitalName('পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স');
    setPatientName('');
    setBagsCount(1);
    setLocation('পাংশা, রাজবাড়ী');
    setNotes('');
    setFormError('');
  };

  // Handle Delete History Item
  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('আপনি কি এই রক্তদানের রেকর্ডটি মুছে ফেলতে চান?')) return;

    setDeletingId(id);
    try {
      const res = await apiClient(`/donors/${donor.id}/history/${id}`, {
        method: 'DELETE'
      });

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('রেকর্ডটি মুছে ফেলা হয়েছে');
        await fetchHistory();
        if (onHistoryChange) onHistoryChange();
      }
    } catch (err: any) {
      showToast(err.message || 'মুছে ফেলা সম্ভব হয়নি', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toast notification */}
      {toast && (
        <div
          className={`p-3 text-xs font-bold rounded-2xl border shadow-lg transition-all animate-in fade-in slide-in-from-top-2 flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header & Summary Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-extrabold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {donor.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px]">
                  {donor.bloodGroup}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                সর্বমোট রক্তদান: <strong className="text-slate-900 dark:text-white font-bold">{toBengaliNumeral(totalBags || donor.totalDonations || 0)} বার ({toBengaliNumeral(history.length)} রেকর্ড)</strong>
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />

          {/* Eligibility Badge */}
          <EligibilityBadge lastDonationDate={donor.lastDonationDate} showNextDate={true} size="md" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
          </button>

          {showAddButton && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন রক্তদান রেকর্ড</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input Filter for History */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="হাসপাতাল, রোগীর নাম বা স্থান দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
            <span className="text-xs">রক্তদানের ইতিহাস লোড করা হচ্ছে...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-500 mx-auto flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-slate-700 dark:text-slate-300 text-xs">
                {searchQuery ? 'সন্ধান অনুযায়ী কোনো রক্তদানের রেকর্ড পাওয়া যায়নি' : 'পূর্বে কোনো রক্তদানের রেকর্ড পাওয়া যায়নি'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {searchQuery
                  ? 'অনুগ্রহ করে ভিন্ন কীওয়ার্ড দিয়ে চেষ্টা করুন।'
                  : 'নতুন রক্তদান সম্পাদন করা হলে উপরের "নতুন রক্তদান রেকর্ড" বোতামে ক্লিক করুন।'}
              </p>
            </div>
            {!searchQuery && showAddButton && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>প্রথম রক্তদান রেকর্ড যোগ করুন</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">তারিখ (Date)</th>
                  <th className="py-3.5 px-4">হাসপাতাল / স্থান</th>
                  <th className="py-3.5 px-4 text-center">ইউনিট (Bags)</th>
                  <th className="py-3.5 px-4">রোগীর নাম</th>
                  <th className="py-3.5 px-4">নোটস ও বিবরণ</th>
                  {allowDelete && <th className="py-3.5 px-4 text-right">অ্যাকশন</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredHistory.map(record => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {formatDateBn(record.date)}
                        </span>
                      </div>
                    </td>

                    {/* Hospital & Location */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{record.hospitalName}</span>
                        </div>
                        {record.location && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{record.location}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Bags Count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300 font-black text-xs border border-red-200 dark:border-red-900">
                        <Droplet className="w-3 h-3 text-red-600 fill-current" />
                        <span>{toBengaliNumeral(record.bagsCount || 1)} ব্যাগ</span>
                      </span>
                    </td>

                    {/* Patient Name */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {record.patientName ? (
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{record.patientName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-normal">—</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {record.notes ? (
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 italic bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          "{record.notes}"
                        </p>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-normal">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    {allowDelete && (
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          disabled={deletingId === record.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors disabled:opacity-50"
                          title="রেকর্ড মুছে ফেলুন"
                        >
                          {deletingId === record.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD NEW RECORD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">নতুন রক্তদান রেকর্ড সংযোজন</h3>
                  <p className="text-xs text-red-100">
                    {donor.name} ({donor.bloodGroup})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="m-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddRecordSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-600" />
                  <span>রক্তদানের তারিখ *</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-red-600" />
                  <span>হাসপাতাল / রক্তদান স্থান *</span>
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  placeholder="যেমন: পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-red-600" />
                    <span>ইউনিট / ব্যাগ সংখ্যা</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={bagsCount}
                    onChange={e => setBagsCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-red-600" />
                    <span>রোগীর নাম (ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="রোগীর নাম"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>ঠিকানা / অবস্থান</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="যেমন: পাংশা, রাজবাড়ী"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>নোটস / অতিরিক্ত বিবরণ</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="যেমন: জরুরি মুমূর্ষু রোগীর রক্তদান"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
