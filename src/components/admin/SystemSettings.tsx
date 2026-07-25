import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { token } = useAuth();

  const [orgNameBn, setOrgNameBn] = useState('');
  const [helplinePhone, setHelplinePhone] = useState('');
  const [emergencyAnnouncement, setEmergencyAnnouncement] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setOrgNameBn(data.orgNameBn || '');
          setHelplinePhone(data.helplinePhone || '');
          setEmergencyAnnouncement(data.emergencyAnnouncement || '');
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orgNameBn,
          helplinePhone,
          emergencyAnnouncement
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save settings failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-red-600" />
          <span>সিস্টেম কনফিগারেশন সেটিং</span>
        </h2>
        <p className="text-xs text-slate-500">পাংশা ব্লাড ডোনার্স এসোসিয়েশনের নাম, হটলাইন ও জরুরী নোটিশ পরিবর্তন</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 max-w-xl">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>কনফিগারেশন সফলভাবে আপডেট হয়েছে!</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">সংগঠনের নাম (বাংলা)</label>
          <input
            type="text"
            value={orgNameBn}
            onChange={(e) => setOrgNameBn(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">২৪/৭ হটলাইন মোবাইল নাম্বার</label>
          <input
            type="text"
            value={helplinePhone}
            onChange={(e) => setHelplinePhone(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">শীর্ষ জরুরী নোটিশ বার (Header Announcement)</label>
          <textarea
            rows={3}
            value={emergencyAnnouncement}
            onChange={(e) => setEmergencyAnnouncement(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border p-2.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিং সংরক্ষণ করুন'}</span>
        </button>
      </form>
    </div>
  );
};
