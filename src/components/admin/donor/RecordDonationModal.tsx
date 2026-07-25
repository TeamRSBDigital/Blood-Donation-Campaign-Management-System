import React, { useState } from 'react';
import { Donor } from '../../../types/index.js';
import { apiClient } from '../../../services/apiClient.js';
import { X, Heart, Calendar, Building, User, MapPin, CheckCircle } from 'lucide-react';

interface RecordDonationModalProps {
  donor: Donor | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordDonationModal: React.FC<RecordDonationModalProps> = ({
  donor,
  onClose,
  onSuccess
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospitalName, setHospitalName] = useState('পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স');
  const [patientName, setPatientName] = useState('');
  const [bagsCount, setBagsCount] = useState(1);
  const [location, setLocation] = useState('পাংশা, রাজবাড়ী');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!donor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !hospitalName) {
      setError('তারিখ এবং হাসপাতালের নাম পূরণ করা আবশ্যক');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Add donation history
      const resHistory = await apiClient(`/donors/${donor.id}/history`, {
        method: 'POST',
        body: JSON.stringify({
          date,
          hospitalName,
          patientName,
          bagsCount,
          location,
          notes
        })
      });

      if (resHistory.error) {
        setError(resHistory.error);
        setSubmitting(false);
        return;
      }

      // 2. Update donor lastDonationDate and increment totalDonations
      await apiClient(`/donors/${donor.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          lastDonationDate: date,
          totalDonations: (donor.totalDonations || 0) + bagsCount
        })
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'রেকর্ড সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">রক্তদানের ইতিহাস সংযোজন</h3>
              <p className="text-xs text-red-100">{donor.name} ({donor.bloodGroup})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              রক্তদানের তারিখ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              হাসপাতাল / ব্লাড ব্যাংক <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স"
              value={hospitalName}
              onChange={e => setHospitalName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                রোগীর নাম (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="রোগীর নাম..."
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ব্যাগ সংখ্যা
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={bagsCount}
                onChange={e => setBagsCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              লোকেশন / স্থান
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              অতিরিক্ত তথ্য / নোটস
            </label>
            <textarea
              rows={2}
              placeholder="জরুরী প্রয়োজনে রক্তদান করেছেন..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'সংরক্ষণ হচ্ছে...' : 'রেকর্ড সংরক্ষণ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
