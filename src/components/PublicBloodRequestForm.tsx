import React, { useState } from 'react';
import { BloodGroup, RequestPriority } from '../types/index.js';
import { useLanguage } from '../context/LanguageContext.js';
import { PANGSHA_UNIONS } from '../constants/locations.js';
import { X, Droplet, AlertTriangle, Phone, Building, Calendar, CheckCircle2 } from 'lucide-react';

interface PublicBloodRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const PublicBloodRequestForm: React.FC<PublicBloodRequestFormProps> = ({
  isOpen,
  onClose,
  onRequestSubmitted
}) => {
  const { t, language } = useLanguage();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [bagsNeeded, setBagsNeeded] = useState(1);
  const [hospitalName, setHospitalName] = useState('পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স');
  const [union, setUnion] = useState('পাংশা পৌরসভা');
  const [requiredDate, setRequiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('URGENT');
  const [diseaseOrReason, setDiseaseOrReason] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !contactPhone || !hospitalName) {
      setErrorMsg('রোগীর নাম, ফোন নাম্বার এবং হাসপাতালের ঠিকানা আবশ্যক');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          bloodGroup,
          bagsNeeded,
          hospitalName,
          upazila: 'পাংশা',
          union,
          requiredDate,
          contactPerson: contactPerson || patientName,
          contactPhone,
          priority,
          diseaseOrReason,
          notes
        })
      });

      if (res.ok) {
        setSuccessMsg(true);
        onRequestSubmitted();
        setTimeout(() => {
          setSuccessMsg(false);
          onClose();
        }, 2000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'আবেদন জমা দেওয়া সম্ভব হয়নি।');
      }
    } catch (err) {
      setErrorMsg('সার্ভারে যোগাযোগ করা যাচ্ছে না।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/20 rounded-xl">
              <Droplet className="w-5 h-5 fill-current" />
            </span>
            <div>
              <h3 className="text-base font-bold">{t.postBloodRequest}</h3>
              <p className="text-xs text-rose-100">পাংশা ও পার্শ্ববর্তী হাসপাতালের জন্য জরুরী আবেদন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {successMsg ? (
          <div className="p-10 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">আবেদন সফল হয়েছে!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t.requestPostedSuccess}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  রোগীর নাম *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="যেমন: মোঃ আলিউজ্জামান (৪৫ বছর)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  রক্তের গ্রুপ *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500 outline-hidden"
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bags Needed */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  প্রয়োজনীয় ব্যাগ সংখ্যা
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bagsNeeded}
                  onChange={(e) => setBagsNeeded(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  জরুরী মাত্রা *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as RequestPriority)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-red-500 outline-hidden"
                >
                  <option value="CRITICAL">অতীব জরুরী (Critical Alert)</option>
                  <option value="URGENT">জরুরী (Urgent)</option>
                  <option value="NORMAL">সাধারণ (Normal)</option>
                </select>
              </div>
            </div>

            {/* Hospital Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                হাসপাতাল / ক্লিনিকের নাম ও ঠিকানা *
              </label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="যেমন: পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স বা রাজবাড়ী সদর হাসপাতাল"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Union */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ইউনিয়ন (পাংশা)
                </label>
                <select
                  value={union}
                  onChange={(e) => setUnion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                >
                  {PANGSHA_UNIONS.map((u) => (
                    <option key={u.id} value={u.nameBn}>{u.nameBn}</option>
                  ))}
                </select>
              </div>

              {/* Required Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  রক্তদানের তারিখ *
                </label>
                <input
                  type="date"
                  required
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Person */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  যোগাযোগের ব্যক্তির নাম
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="যেমন: রোগীর ভাই কায়সার"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ফোন নাম্বার *
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="017........"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            {/* Disease / Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                রোগীর রোগ বা অপারেশনের বিবরণ
              </label>
              <textarea
                rows={2}
                value={diseaseOrReason}
                onChange={(e) => setDiseaseOrReason(e.target.value)}
                placeholder="যেমন: ডেলিভারি রোগী, এ্যানেমিয়া বা কিডনি ডায়ালাইসিস..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                {submitting ? 'জমাদান হচ্ছে...' : 'আবেদন জমা দিন'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
