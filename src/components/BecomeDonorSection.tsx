import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { PANGSHA_UNIONS } from '../constants/locations.js';
import { BloodGroup } from '../types/index.js';
import { Heart, CheckCircle2, AlertCircle, Shield, UserCheck, Send } from 'lucide-react';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BecomeDonorSection: React.FC = () => {
  const { t, language } = useLanguage();

  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [age, setAge] = useState(22);
  const [union, setUnion] = useState('পাংশা পৌরসভা');
  const [village, setVillage] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !village) {
      setErrorMsg('অনুগ্রহ করে নাম, মোবাইল নাম্বার এবং গ্রামের নাম প্রদান করুন।');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bloodGroup,
          phone,
          gender,
          age,
          district: 'Rajbari',
          upazila: 'পাংশা',
          union,
          village,
          lastDonationDate: lastDonationDate || undefined,
          isVerified: false // Needs admin review
        })
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'আবেদন জমা নেওয়া সম্ভব হয়নি।');
      }
    } catch (err) {
      setErrorMsg('সার্ভারে যোগাযোগ করা যাচ্ছে না।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5 text-red-600" />
            <span>পাংশা স্বেচ্ছাসেবী রক্তদাতা নিবন্ধন</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.becomeDonor}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            আপনার এক ব্যাগ রক্তে বেঁচে যেতে পারে পাংশার কোনো মুমূর্ষু মানুষের প্রাণ। আজই আমাদের রক্তদাতা পরিবারে যুক্ত হোন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Eligibility Guidelines Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-red-600 to-rose-800 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-rose-400/40 pb-4">
              <span className="p-3 bg-white/20 rounded-2xl">
                <Heart className="w-6 h-6 fill-current text-white" />
              </span>
              <div>
                <h3 className="text-lg font-bold">{t.eligibilityCriteria}</h3>
                <p className="text-xs text-rose-100">রক্তদানের পূর্বে জেনে রাখুন</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm leading-relaxed">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <span><strong>{t.ageRequirement}</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <span><strong>{t.weightRequirement}</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <span><strong>{t.intervalRequirement}</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <span><strong>{t.healthRequirement}</strong></span>
              </li>
            </ul>

            <div className="pt-4 border-t border-rose-400/40 text-xs text-rose-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-300 shrink-0" />
              <span>আপনার ব্যক্তিগত সকল তথ্য পাংশা ব্লাড ডোনার্স এসোসিয়েশনের মাধ্যমে সম্পূর্ণ নিরাপদ ও গোপন থাকবে।</span>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">ধন্যবাদ! আপনার নিবন্ধন আবেদন সফল হয়েছে।</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  আমাদের ভলান্টিয়ার টিম আপনার দেওয়া তথ্যসমূহ যাচাই করে পাংশা ব্লাড ডোনার ডিরেক্টরি ডাটাবেজে অন্তর্ভুক্ত করবে।
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs"
                >
                  অন্য নতুন নিবন্ধন করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  {t.applyToRegister}
                </h3>

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      আপনার নাম (বাংলায়) *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: মোঃ হাফিজুর রহমান"
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
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-red-600 focus:ring-2 focus:ring-red-500 outline-hidden"
                    >
                      {BLOOD_GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      মোবাইল নাম্বার *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017........"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      লিঙ্গ
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                    >
                      <option value="MALE">পুরুষ</option>
                      <option value="FEMALE">মহিলা</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      বয়স (বছর)
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="65"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                    />
                  </div>

                  {/* Union */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ইউনিয়ন (পাংশা) *
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Village */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      গ্রামের নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="যেমন: কুঠিপাড়া"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                    />
                  </div>

                  {/* Last Donation Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      সর্বশেষ রক্তদানের তারিখ (যদি থাকে)
                    </label>
                    <input
                      type="date"
                      value={lastDonationDate}
                      onChange={(e) => setLastDonationDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'আবেদন জমা হচ্ছে...' : t.submitApplication}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
