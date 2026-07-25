import React, { useState } from 'react';
import { BloodGroup, RequestPriority, BloodRequest } from '../types/index.js';
import { useLanguage } from '../context/LanguageContext.js';
import { PANGSHA_UNIONS, RAJBARI_UPAZILAS, RAJBARI_DISTRICTS } from '../constants/locations.js';
import { BLOOD_GROUPS } from '../constants/bloodGroups.js';
import {
  Droplet,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Building,
  Calendar,
  User,
  MapPin,
  FileText,
  Clock,
  Copy,
  Share2,
  ArrowRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

interface PublicBloodRequestPageProps {
  onNavigateRequests?: () => void;
}

export const PublicBloodRequestPage: React.FC<PublicBloodRequestPageProps> = ({
  onNavigateRequests
}) => {
  const { t } = useLanguage();

  // Form Fields
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [bagsNeeded, setBagsNeeded] = useState(1);
  const [hospitalName, setHospitalName] = useState('');
  const [requiredDate, setRequiredDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [requiredTime, setRequiredTime] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [division, setDivision] = useState('ঢাকা');
  const [district, setDistrict] = useState('রাজবাড়ী');
  const [upazila, setUpazila] = useState('পাংশা');
  const [union, setUnion] = useState('');
  const [exactAddress, setExactAddress] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('URGENT');
  const [diseaseOrReason, setDiseaseOrReason] = useState('');
  const [notes, setNotes] = useState('');

  // States
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<BloodRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Validation
  const validateForm = (): boolean => {
    setErrorMsg('');

    const cleanPatient = patientName.trim();
    const cleanHospital = hospitalName.trim();
    const cleanPhone = contactPhone.trim();
    const cleanContactPerson = contactPerson.trim();

    if (!cleanPatient) {
      setErrorMsg('রোগীর নাম আবশ্যক।');
      return false;
    }
    if (!bloodGroup) {
      setErrorMsg('রক্তের গ্রুপ নির্বাচন করুন।');
      return false;
    }
    if (!cleanHospital) {
      setErrorMsg('হাসপাতাল বা ক্লিনিকের নাম ও ঠিকানা আবশ্যক।');
      return false;
    }
    if (!requiredDate) {
      setErrorMsg('রক্ত প্রয়োজনের তারিখ নির্বাচন করুন।');
      return false;
    }

    // Check past date
    const todayStr = new Date().toISOString().split('T')[0];
    if (requiredDate < todayStr) {
      setErrorMsg('রক্ত প্রয়োজনের তারিখ অতীতের হতে পারবে না।');
      return false;
    }

    if (!cleanContactPerson) {
      setErrorMsg('যোগাযোগের ব্যক্তির নাম দিন।');
      return false;
    }

    if (!cleanPhone) {
      setErrorMsg('যোগাযোগের জন্য মোবাইল নম্বর আবশ্যক।');
      return false;
    }

    // BD Phone Regex
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg('অনুগ্রহ করে ১১ ডিজিটের সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)।');
      return false;
    }

    if (whatsAppNumber.trim() && !phoneRegex.test(whatsAppNumber.trim())) {
      setErrorMsg('হোয়াটসঅ্যাপ নম্বরটি ১১ ডিজিটের সঠিক মোবাইল নম্বর হতে হবে।');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim(),
          bloodGroup,
          bagsNeeded: Number(bagsNeeded) > 0 ? Number(bagsNeeded) : 1,
          hospitalName: hospitalName.trim(),
          requiredDate,
          requiredTime,
          contactPerson: contactPerson.trim(),
          contactPhone: contactPhone.trim(),
          whatsAppNumber: whatsAppNumber.trim(),
          division: division.trim(),
          district: district.trim(),
          upazila: upazila.trim(),
          union: union.trim(),
          exactAddress: exactAddress.trim(),
          doctorName: doctorName.trim(),
          priority,
          diseaseOrReason: diseaseOrReason.trim(),
          notes: notes.trim()
        })
      });

      if (res.ok) {
        const data: BloodRequest = await res.json();
        setSubmittedRequest(data);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setErrorMsg('সার্ভারে যোগাযোগ করা যাচ্ছে না। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to copy request summary to clipboard
  const handleCopyDetails = () => {
    if (!submittedRequest) return;
    const text = `🚨 *জরুরী রক্তের আবেদন - পাংশা ব্লাড ডোনার্স এসোসিয়েশন*
📌 আবেদন নম্বর: ${submittedRequest.requestNumber || submittedRequest.id}
🩸 রক্তের গ্রুপ: ${submittedRequest.bloodGroup} (${submittedRequest.bagsNeeded} ব্যাগ)
👤 রোগীর নাম: ${submittedRequest.patientName}
🏥 হাসপাতাল: ${submittedRequest.hospitalName}
📍 ঠিকানা: ${submittedRequest.upazila}, ${submittedRequest.district}
📅 প্রয়োজনের তারিখ: ${submittedRequest.requiredDate} ${submittedRequest.requiredTime ? `(${submittedRequest.requiredTime})` : ''}
📞 যোগাযোগ: ${submittedRequest.contactPhone} (${submittedRequest.contactPerson})
⚡ জরুরী মাত্রা: ${submittedRequest.priority === 'CRITICAL' ? 'অতীব জরুরী' : submittedRequest.priority === 'URGENT' ? 'জরুরী' : 'সাধারণ'}
স্ট্যাটাস: ${submittedRequest.status}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Helper to share to WhatsApp
  const handleShareWhatsApp = () => {
    if (!submittedRequest) return;
    const text = `🚨 *জরুরী রক্তের আবেদন - PBDA*
📌 আবেদন নম্বর: ${submittedRequest.requestNumber || submittedRequest.id}
🩸 রক্তের গ্রুপ: ${submittedRequest.bloodGroup} (${submittedRequest.bagsNeeded} ব্যাগ)
👤 রোগীর নাম: ${submittedRequest.patientName}
🏥 হাসপাতাল: ${submittedRequest.hospitalName}, ${submittedRequest.upazila}
📅 প্রয়োজনের তারিখ: ${submittedRequest.requiredDate}
📞 যোগাযোগ: ${submittedRequest.contactPhone} (${submittedRequest.contactPerson})`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-rose-100">
              <Droplet className="w-3.5 h-3.5 fill-current text-white" />
              <span>জরুরী রক্তের সহায়তার আবেদন</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              জরুরী রক্তের রিকুয়েস্ট পোস্ট করুন
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 font-medium">
              আপনার বা আপনার নিকটজনের জন্য অবিলম্বে রক্তের প্রয়োজন হলে নিচের ফর্মটি সঠিকভাবে পূরণ করে জমা দিন। আমাদের ভলান্টিয়ার টিম দ্রুত যোগাযোগ করবেন।
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Droplet className="w-64 h-64 fill-current text-white" />
          </div>
        </div>

        {/* Success View */}
        {submittedRequest ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                আবেদন সফলভাবে গ্রহণ করা হয়েছে
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                রক্তের আবেদন জমা হয়েছে!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                আপনার রক্তের রিকুয়েস্টটি আমাদের সিস্টেমে ও এডমিন বোর্ডে লাইভ যুক্ত হয়েছে। নিচে আপনার আবেদন নম্বর সহ বিস্তারিত তথ্য দেওয়া হলো।
              </p>
            </div>

            {/* Request Summary Card */}
            <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-left space-y-3">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">আবেদন নম্বর</span>
                  <p className="text-base font-black text-red-600 dark:text-red-400">
                    {submittedRequest.requestNumber || submittedRequest.id}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-bold">
                  স্ট্যাটাস: {submittedRequest.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">রোগীর নাম</span>
                  <strong className="text-slate-900 dark:text-white">{submittedRequest.patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">রক্তের গ্রুপ</span>
                  <strong className="text-red-600 font-extrabold">{submittedRequest.bloodGroup} ({submittedRequest.bagsNeeded} ব্যাগ)</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">হাসপাতাল</span>
                  <strong className="text-slate-900 dark:text-white">{submittedRequest.hospitalName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">প্রয়োজনের তারিখ</span>
                  <strong className="text-slate-900 dark:text-white">{submittedRequest.requiredDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">জরুরী নম্বর</span>
                  <strong className="text-slate-900 dark:text-white">{submittedRequest.contactPhone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">যোগাযোগ ব্যক্তি</span>
                  <strong className="text-slate-900 dark:text-white">{submittedRequest.contactPerson}</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleCopyDetails}
                className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>{copied ? 'কপি হয়েছে!' : 'বিবরণ কপি করুন'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp-এ শেয়ার করুন</span>
              </button>

              <button
                onClick={() => {
                  setSubmittedRequest(null);
                  setPatientName('');
                  setHospitalName('');
                  setContactPhone('');
                  setContactPerson('');
                }}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md"
              >
                <span>+ নতুন আরেকটি আবেদন</span>
              </button>
            </div>

            {onNavigateRequests && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={onNavigateRequests}
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>সকল আবেদন তালিকায় ফিরে যান</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            
            {errorMsg && (
              <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded-2xl text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Patient & Blood Requirement */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
                <Droplet className="w-4 h-4 text-red-600" />
                <span>রোগী ও রক্ত সংক্রান্ত তথ্য</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Patient Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    রোগীর নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="যেমন: মোঃ আলিউজ্জামান (বয়স: ৪৫)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    রক্তের গ্রুপ *
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-black text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500 outline-hidden"
                  >
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Bags Needed */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    প্রয়োজনীয় রক্তের পরিমাণ (ব্যাগ) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={bagsNeeded}
                    onChange={(e) => setBagsNeeded(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    জরুরী মাত্রা (Priority) *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RequestPriority)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  >
                    <option value="CRITICAL">🚨 অতীব জরুরী (Critical Alert)</option>
                    <option value="URGENT">⚠️ জরুরী (Urgent)</option>
                    <option value="NORMAL">ℹ️ সাধারণ (Normal)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Hospital & Location */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
                <Building className="w-4 h-4 text-red-600" />
                <span>হাসপাতাল ও স্থানের ঠিকানা</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hospital Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    হাসপাতাল / ক্লিনিকের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="যেমন: পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স / রাজবাড়ী সদর হাসপাতাল"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* Required Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    রক্তদানের তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* Required Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    রক্তদানের সময় (ঐচ্ছিক)
                  </label>
                  <input
                    type="time"
                    value={requiredTime}
                    onChange={(e) => setRequiredTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* Division */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    বিভাগ *
                  </label>
                  <input
                    type="text"
                    required
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    জেলা *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* Upazila */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    উপজেলা *
                  </label>
                  <select
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  >
                    {RAJBARI_UPAZILAS.map((u) => (
                      <option key={u.id} value={u.nameBn}>{u.nameBn}</option>
                    ))}
                  </select>
                </div>

                {/* Union */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ইউনিয়ন (ঐচ্ছিক)
                  </label>
                  <select
                    value={union}
                    onChange={(e) => setUnion(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  >
                    <option value="">সকল ইউনিয়ন</option>
                    {PANGSHA_UNIONS.map((u) => (
                      <option key={u.id} value={u.nameBn}>{u.nameBn}</option>
                    ))}
                  </select>
                </div>

                {/* Exact Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    হাসপাতালের নির্দিষ্ট বেড/ওয়ার্ড বা ঠিকানা (Exact Address)
                  </label>
                  <input
                    type="text"
                    value={exactAddress}
                    onChange={(e) => setExactAddress(e.target.value)}
                    placeholder="যেমন: ৩য় তলা, ওয়ার্ড নং ৪, বেড নং ১২"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Medical */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
                <Phone className="w-4 h-4 text-red-600" />
                <span>যোগাযোগ ও অন্যান্য বিবরণ</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Person */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    যোগাযোগের ব্যক্তির নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="যেমন: মোঃ রাজিব (রোগীর ভাই)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    value={whatsAppNumber}
                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                    placeholder="01712345678"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* Doctor Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ডাক্তারের নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="যেমন: ডা: রফিকুল ইসলাম"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* Disease / Reason */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    রোগের নাম বা অপারেশনের কারণ
                  </label>
                  <textarea
                    rows={2}
                    value={diseaseOrReason}
                    onChange={(e) => setDiseaseOrReason(e.target.value)}
                    placeholder="যেমন: সিজারিয়ান সেকশন / কিডনি ডায়ালাইসিস / দুর্ঘটনা..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                {/* Additional Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    অতিরিক্ত কোনো নির্দেশনা বা তথ্য (Additional Notes)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="অন্য কোনো বিশেষ নোট থাকলে এখানে লিখুন..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Submit Controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>আপনার তথ্য সম্পূর্ণ নিরাপদ ও সুরক্ষিত থাকবে</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs shadow-lg transition-all shrink-0 disabled:opacity-50"
              >
                <Droplet className="w-4 h-4 fill-current" />
                <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'জরুরী আবেদন জমা দিন'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
