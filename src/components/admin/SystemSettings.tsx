import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  Settings,
  Building2,
  BellRing,
  Bot,
  MessageSquare,
  ShieldCheck,
  DatabaseBackup,
  Info,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Download,
  Upload,
  Globe,
  Clock,
  Key,
  Lock,
  PhoneCall,
  Server,
  Zap,
  Check
} from 'lucide-react';
import { SystemSettings as SystemSettingsType } from '../../types/index.js';

type ActiveSection =
  | 'general'
  | 'organization'
  | 'notification'
  | 'telegram'
  | 'whatsapp'
  | 'security'
  | 'backup'
  | 'info';

export const SystemSettings: React.FC = () => {
  const { token, user } = useAuth();

  const [activeSection, setActiveSection] = useState<ActiveSection>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Masking toggles for secrets
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [showWhatsappToken, setShowWhatsappToken] = useState(false);

  // Testing connection states
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const [testingWhatsapp, setTestingWhatsapp] = useState(false);
  const [whatsappTestResult, setWhatsappTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Backup & Restore states
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // Live Server Time
  const [serverTime, setServerTime] = useState<string>(new Date().toLocaleString('bn-BD'));

  // Form State initialized with defaults
  const [formData, setFormData] = useState<SystemSettingsType>({
    orgNameBn: 'পাংশা ব্লাড ডোনার্স এসোসিয়েশন',
    orgNameEn: 'Pangsha Blood Donors Association',
    orgLogoUrl: '/pbda-logo.png',
    mottoBn: 'রক্ত দিন, জীবন বাঁচান - মানব সেবায় আমরা সদা প্রস্তুত',
    mottoEn: 'Donate Blood, Save Lives - Ready to Serve Humanity',
    primaryPhone: '+8801712000000',
    emergencyHotline: '+8801812999888',
    email: 'info@pbdabangladesh.org',
    supportEmail: 'support@pbdabangladesh.org',
    addressBn: 'পাংশা মডেল থানা রোড, পাংশা পৌরসভা, রাজবাড়ী',
    addressEn: 'Pangsha Model Thana Road, Pangsha Pourashava, Rajbari',
    websiteUrl: 'https://pbdabangladesh.org',
    timezone: 'Asia/Dhaka',
    language: 'bn',

    defaultDistrict: 'Rajbari',
    defaultUpazila: 'Pangsha',
    emergencyContactName: 'ড. মো: তানভীর আহমেদ',
    bloodRequestExpirationHours: 48,
    eligibilityIntervalDays: 90,

    enableDashboardNotify: true,
    enableTelegramNotify: true,
    enableWhatsappNotify: true,
    criticalReminderIntervalMinutes: 30,
    maxRetryAttempts: 3,

    telegramBotToken: '',
    telegramChatId: '',

    whatsappAccessToken: '',
    whatsappPhoneNumberId: '',
    whatsappBusinessAccountId: '',
    whatsappApiVersion: 'v20.0',
    whatsappReminderIntervalMinutes: 30,

    sessionTimeoutMinutes: 1440,
    maxLoginAttempts: 5,
    passwordPolicy: 'MIN_8_CHARS',
    activityLogRetentionDays: 90,

    enableAutoBackup: true,
    backupSchedule: 'DAILY',
    backupRetentionDays: 30,
    lastBackupTime: '',
    nextScheduledBackup: '',

    appVersion: 'v2.4.0 (Enterprise Build)',
    environment: 'Cloud Run Container Production',
    enablePublicRequestPosting: true,
    helplinePhone: '+8801812999888',
    emergencyAnnouncement: ''
  });

  // Track initial state to detect changes
  const [initialData, setInitialData] = useState<SystemSettingsType | null>(null);

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setServerTime(new Date().toLocaleString('bn-BD', { timeZone: formData.timezone || 'Asia/Dhaka' }));
    }, 1000);
    return () => clearInterval(timer);
  }, [formData.timezone]);

  // Fetch Settings on Mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/settings', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({ ...prev, ...data }));
          setInitialData({ ...formData, ...data });
        }
      } catch (err) {
        console.error('Failed to load system settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  const handleChange = (key: keyof SystemSettingsType, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (res.ok) {
        setSaveSuccess(result.message || 'সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
        if (result.settings) {
          setFormData((prev) => ({ ...prev, ...result.settings }));
          setInitialData({ ...formData, ...result.settings });
        }
        setTimeout(() => setSaveSuccess(null), 5000);
      } else {
        setSaveError(result.error || 'সেটিংস সংরক্ষণে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setSaveError('সার্ভারে যোগাযোগ সমস্যা তৈরি হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  // Test Telegram Connection
  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTelegramTestResult(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          botToken: formData.telegramBotToken,
          chatId: formData.telegramChatId,
          customMessage: 'পাংশা ব্লাড ডোনার্স এসোসিয়েশন - সিস্টেম সেটিংস থেকে কানেকশন টেস্ট মেসেজ'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramTestResult({
          success: true,
          msg: data.message || 'টেলিগ্রাম বোট কানেকশন সফলভাবে বাস্তবায়িত হয়েছে!'
        });
      } else {
        setTelegramTestResult({
          success: false,
          msg: data.error || 'টেলিগ্রাম বোট কানেকশন ব্যর্থ হয়েছে।'
        });
      }
    } catch (err) {
      setTelegramTestResult({
        success: false,
        msg: 'টেলিগ্রাম টেস্ট সার্ভার ত্রুটি।'
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  // Test WhatsApp Connection
  const handleTestWhatsapp = async () => {
    setTestingWhatsapp(true);
    setWhatsappTestResult(null);
    try {
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientPhone: formData.primaryPhone || '8801712000000',
          message: 'পাংশা ব্লাড ডোনার্স এসোসিয়েশন - হোয়াটসঅ্যাপ ক্লাউড এপিআই টেস্ট মেসেজ'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWhatsappTestResult({
          success: true,
          msg: data.message || 'হোয়াটসঅ্যাপ মেসেজ সফলভাবে প্রসেস করা হয়েছে!'
        });
      } else {
        setWhatsappTestResult({
          success: false,
          msg: data.error || 'হোয়াটসঅ্যাপ এপিআই কানেকশন ত্রুটি।'
        });
      }
    } catch (err) {
      setWhatsappTestResult({
        success: false,
        msg: 'হোয়াটসঅ্যাপ টেস্টের সময় নেটওয়ার্ক ব্যর্থতা।'
      });
    } finally {
      setTestingWhatsapp(false);
    }
  };

  // Manual Backup Download
  const handleManualBackup = async () => {
    setBackingUp(true);
    setBackupMessage(null);
    try {
      const res = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackupMessage('ব্যাকআপ ফাইল তৈরি হয়েছে, ডাউনলোড শুরু হচ্ছে...');
        // Download JSON
        const blob = new Blob([JSON.stringify(data.backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename || `pbda-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (data.backupTimestamp) {
          setFormData((prev) => ({ ...prev, lastBackupTime: data.backupTimestamp }));
        }
      } else {
        setBackupMessage('ব্যাকআপ তৈরিতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error('Backup failed:', err);
      setBackupMessage('সার্ভারে ব্যাকআপ প্রসেস ব্যর্থ।');
    } finally {
      setBackingUp(false);
    }
  };

  // Restore Backup File
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/settings/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ backupData: jsonContent })
        });
        const data = await res.json();
        if (res.ok) {
          alert('ডাটাবেজ এবং সেটিংস সফলভাবে রিস্টোর করা হয়েছে!');
          window.location.reload();
        } else {
          alert(data.error || 'রিস্টোর করতে সমস্যা হয়েছে।');
        }
      } catch (err) {
        alert('অকার্যকর ব্যাকআপ ফাইল ফরম্যাট।');
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const navTabs: { id: ActiveSection; label: string; icon: any }[] = [
    { id: 'general', label: 'সাধারণ সেটিংস', icon: Settings },
    { id: 'organization', label: 'সাংগঠনিক তথ্য', icon: Building2 },
    { id: 'notification', label: 'নোটিফিকেশন সেটিং', icon: BellRing },
    { id: 'telegram', label: 'টেলিগ্রাম বোট', icon: Bot },
    { id: 'whatsapp', label: 'হোয়াটসঅ্যাপ এপিআই', icon: MessageSquare },
    { id: 'security', label: 'সিকিউরিটি ও এক্সেস', icon: ShieldCheck },
    { id: 'backup', label: 'ব্যাকআপ ও রিস্টোর', icon: DatabaseBackup },
    { id: 'info', label: 'সিস্টেম ইনফরমেশন', icon: Info }
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">সিস্টেম কনফিগারেশন লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-6 h-6 text-amber-300" />
            <h1 className="text-xl font-black">সিস্টেম কনফিগারেশন সেটিং (Super Admin)</h1>
          </div>
          <p className="text-xs text-red-100 max-w-2xl">
            সংগঠনের লোগো, টেলিগ্রাম বোট, হোয়াটসঅ্যাপ নোটিফিকেশন এপিআই, সিকিউরিটি ও ডাটাবেজ ব্যাকআপ ব্যবস্থাপনা করুন।
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 border border-white/20">
          <Server className="w-4 h-4 text-emerald-300" />
          <span>রোল: {user?.role || 'SUPER_ADMIN'}</span>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg">
            ✕
          </button>
        </div>
      )}

      {/* Save Error Alert */}
      {saveError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{saveError}</span>
          </div>
          <button onClick={() => setSaveError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg">
            ✕
          </button>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form Container */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. GENERAL SETTINGS */}
        {activeSection === 'general' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Building2 className="w-5 h-5 text-red-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">সাধারণ ব্র্যান্ডিং ও যোগাযোগ তথ্য</h2>
                <p className="text-xs text-slate-500">সংগঠনের নাম, লোগো, ঠিকানা এবং হেল্পলাইন নম্বর</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সংগঠনের নাম (বাংলা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.orgNameBn}
                  onChange={(e) => handleChange('orgNameBn', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Organization Name (English)
                </label>
                <input
                  type="text"
                  value={formData.orgNameEn}
                  onChange={(e) => handleChange('orgNameEn', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সংগঠনের লোগো ইউআরএল (Logo Image URL)
                </label>
                <input
                  type="text"
                  value={formData.orgLogoUrl || ''}
                  onChange={(e) => handleChange('orgLogoUrl', e.target.value)}
                  placeholder="/pbda-logo.png"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ওয়েবসাইট ইউআরএল (Website URL)
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl || ''}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  placeholder="https://pbdabangladesh.org"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  প্রাথমিক যোগাযোগ নম্বর (Primary Phone) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.primaryPhone}
                  onChange={(e) => handleChange('primaryPhone', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ২৪/৭ জরুরী হটলাইন নম্বর (Emergency Hotline)
                </label>
                <input
                  type="text"
                  value={formData.emergencyHotline}
                  onChange={(e) => handleChange('emergencyHotline', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সিস্টেম ইমেইল (Email Address)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সাপোর্ট ইমেইল (Support Email)
                </label>
                <input
                  type="email"
                  value={formData.supportEmail || ''}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সংগঠনের মটো / স্লোগান (বাংলা)
                </label>
                <input
                  type="text"
                  value={formData.mottoBn}
                  onChange={(e) => handleChange('mottoBn', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সংগঠনের অফিস ঠিকানা (বাংলা)
                </label>
                <input
                  type="text"
                  value={formData.addressBn}
                  onChange={(e) => handleChange('addressBn', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  টাইমজোন (Timezone)
                </label>
                <select
                  value={formData.timezone || 'Asia/Dhaka'}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6:00)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ডিফল্ট ভাষা (Language)
                </label>
                <select
                  value={formData.language || 'bn'}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORGANIZATION SETTINGS */}
        {activeSection === 'organization' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Globe className="w-5 h-5 text-red-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">সাংগঠনিক এলাকা ও রক্তদান নীতিমালা</h2>
                <p className="text-xs text-slate-500">ডিফল্ট জেলা, উপজেলা, জরুরী হটলাইন ও রক্তদানের সময়সীমা</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ডিফল্ট জেলা (Default District)
                </label>
                <input
                  type="text"
                  value={formData.defaultDistrict || 'Rajbari'}
                  onChange={(e) => handleChange('defaultDistrict', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ডিফল্ট উপজেলা (Default Upazila)
                </label>
                <input
                  type="text"
                  value={formData.defaultUpazila || 'Pangsha'}
                  onChange={(e) => handleChange('defaultUpazila', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  জরুরী যোগাযোগকারীর নাম (Emergency Contact)
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName || ''}
                  onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  জরুরী হটলাইন ফোন নম্বর (Emergency Hotline)
                </label>
                <input
                  type="text"
                  value={formData.emergencyHotline || ''}
                  onChange={(e) => handleChange('emergencyHotline', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  রক্তের আবেদনের মেয়াদ (Expiration Time in Hours)
                </label>
                <input
                  type="number"
                  min={12}
                  max={168}
                  value={formData.bloodRequestExpirationHours || 48}
                  onChange={(e) => handleChange('bloodRequestExpirationHours', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-500">ঘণ্টা পার হলে আবেদন স্বয়ংক্রিয়ভাবে এক্সপায়ার্ড চিহ্নিত হবে।</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  পুনরায় রক্তদানের বিরতি দিন (Eligibility Interval)
                </label>
                <input
                  type="number"
                  min={60}
                  max={120}
                  value={formData.eligibilityIntervalDays}
                  onChange={(e) => handleChange('eligibilityIntervalDays', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-500">সাধারণত ৯০ দিন (৩ মাস) পর রক্তদাতা পুনরায় প্রস্তুত হন।</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. NOTIFICATION SETTINGS */}
        {activeSection === 'notification' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <BellRing className="w-5 h-5 text-red-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">নোটিফিকেশন চ্যানেল ও অ্যালার্ট কনফিগারেশন</h2>
                <p className="text-xs text-slate-500">ইন-অ্যাপ ড্যাশবোর্ড, টেলিগ্রাম ও হোয়াটসঅ্যাপ নোটিফিকেশন প্রোভাইডার নিয়ন্ত্রণ করুন</p>
              </div>
            </div>

            {/* Notification Provider Section */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    নোটিফিকেশন প্রোভাইডার নির্বাচন (Notification Providers)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    সিস্টেমের সক্রিয় নোটিফিকেশন চ্যানেল ও হোয়াটসঅ্যাপ প্রোভাইডার নির্বাচন করুন
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Telegram Provider Card */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-blue-500" />
                      Telegram Provider
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-extrabold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Official Telegram Bot API (টেলিগ্রাম গ্রুপ ও চ্যানেল নোটিফিকেশন)
                  </p>
                </div>

                {/* WhatsApp Provider Card (Dual Provider Switch) */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      WhatsApp Provider Selection
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-extrabold uppercase">
                      {formData.activeWhatsappProvider === 'QR_SESSION' ? 'QR Session' : 'Cloud API'}
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50/50">
                      <input
                        type="radio"
                        name="activeWaProvider"
                        value="CLOUD_API"
                        checked={formData.activeWhatsappProvider !== 'QR_SESSION'}
                        onChange={() => handleChange('activeWhatsappProvider', 'CLOUD_API')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold">Provider 1: Official WhatsApp Cloud API (Meta)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50/50">
                      <input
                        type="radio"
                        name="activeWaProvider"
                        value="QR_SESSION"
                        checked={formData.activeWhatsappProvider === 'QR_SESSION'}
                        onChange={() => handleChange('activeWhatsappProvider', 'QR_SESSION')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold">Provider 2: WhatsApp QR Code Session (Web)</span>
                    </label>
                  </div>
                </div>

                {/* Email Provider (Future) */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 opacity-60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Email Provider (Future)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 text-[10px] font-bold">
                      DISABLED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    SMTP / SendGrid ইমেইল ইন্টিগ্রেশন (ভবিষ্যত আপডেট)
                  </p>
                </div>

                {/* SMS Provider (Future) */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 opacity-60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      SMS Provider (Future)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 text-[10px] font-bold">
                      DISABLED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Bulk SMS Gateway integration (ভবিষ্যত আপডেট)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">ইন-অ্যাপ ড্যাশবোর্ড নোটিফিকেশন (Enable Dashboard Notifications)</div>
                  <div className="text-[11px] text-slate-500">এডমিন ও ভলান্টিয়ারদের ড্যাশবোর্ডে লাইভ অ্যালার্ট দেখাবে</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableDashboardNotify ?? true}
                  onChange={(e) => handleChange('enableDashboardNotify', e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">টেলিগ্রাম গ্রুপ নোটিফিকেশন (Enable Telegram Notifications)</div>
                  <div className="text-[11px] text-slate-500">জরুরী রক্তের আবেদন স্বয়ংক্রিয়ভাবে টেলিগ্রাম গ্রুপে শেয়ার হবে</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableTelegramNotify}
                  onChange={(e) => handleChange('enableTelegramNotify', e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">হোয়াটসঅ্যাপ নোটিফিকেশন (Enable WhatsApp Notifications)</div>
                  <div className="text-[11px] text-slate-500">নিবন্ধিত এডমিন ও ভলান্টিয়ারদের ফোনে সরাসরি হোয়াটসঅ্যাপ বার্তা পাঠাবে</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableWhatsappNotify ?? true}
                  onChange={(e) => handleChange('enableWhatsappNotify', e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    জরুরী রিমাইন্ডার পাঠানোর ইন্টারভাল (Critical Reminder Interval)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={formData.criticalReminderIntervalMinutes || 30}
                      onChange={(e) => handleChange('criticalReminderIntervalMinutes', Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">মিনিট</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ব্যর্থ নোটিফিকেশনের সর্বোচ্চ চেষ্টা (Max Retry Attempts)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.maxRetryAttempts || 3}
                    onChange={(e) => handleChange('maxRetryAttempts', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TELEGRAM SETTINGS */}
        {activeSection === 'telegram' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Bot className="w-5 h-5 text-sky-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">টেলিগ্রাম বোট সেটিংস (Telegram Bot Integration)</h2>
                <p className="text-xs text-slate-500">বোট টোকেন, গ্রুপ চ্যাট আইডি ও লাইভ টেস্ট সুবিধা</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-sky-50 dark:bg-sky-950/30 rounded-2xl border border-sky-100 dark:border-sky-900">
                <span className="text-xs font-bold text-sky-900 dark:text-sky-300">টেলিগ্রাম বোট একটিভ রাখুন</span>
                <input
                  type="checkbox"
                  checked={formData.enableTelegramNotify}
                  onChange={(e) => handleChange('enableTelegramNotify', e.target.checked)}
                  className="w-5 h-5 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  টেলিগ্রাম বোট টোকেন (Telegram Bot Token)
                </label>
                <div className="relative">
                  <input
                    type={showTelegramToken ? 'text' : 'password'}
                    value={formData.telegramBotToken || ''}
                    onChange={(e) => handleChange('telegramBotToken', e.target.value)}
                    placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 pr-10 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTelegramToken(!showTelegramToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showTelegramToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  টেলিগ্রাম গ্রুপ চ্যাট আইডি (Group Chat ID)
                </label>
                <input
                  type="text"
                  value={formData.telegramChatId || ''}
                  onChange={(e) => handleChange('telegramChatId', e.target.value)}
                  placeholder="-1001234567890"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram || !formData.telegramBotToken || !formData.telegramChatId}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  {testingTelegram ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{testingTelegram ? 'কানেকশন টেস্ট হচ্ছে...' : 'টেলিগ্রাম গ্রুপে টেস্ট মেসেজ পাঠান'}</span>
                </button>

                <div className="text-xs font-bold flex items-center gap-2">
                  <span className="text-slate-500">কানেকশন স্ট্যাটাস:</span>
                  {formData.telegramBotToken && formData.telegramChatId ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-current" /> কনফিগার করা হয়েছে
                    </span>
                  ) : (
                    <span className="text-amber-500">অসম্পূর্ণ কনফিগারেশন</span>
                  )}
                </div>
              </div>

              {telegramTestResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    telegramTestResult.success
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                  }`}
                >
                  {telegramTestResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{telegramTestResult.msg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. WHATSAPP SETTINGS */}
        {activeSection === 'whatsapp' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">হোয়াটসঅ্যাপ ক্লাউড এপিআই সেটিংস (Meta Cloud API)</h2>
                <p className="text-xs text-slate-500">এডিএম/মেটা ডেভেলপার অ্যাকসেস টোকেন ও ফোন নম্বর আইডি</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">হোয়াটসঅ্যাপ সার্ভিস একটিভ রাখুন</span>
                <input
                  type="checkbox"
                  checked={formData.enableWhatsappNotify ?? true}
                  onChange={(e) => handleChange('enableWhatsappNotify', e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  অ্যাকসেস টোকেন (Meta Access Token)
                </label>
                <div className="relative">
                  <input
                    type={showWhatsappToken ? 'text' : 'password'}
                    value={formData.whatsappAccessToken || ''}
                    onChange={(e) => handleChange('whatsappAccessToken', e.target.value)}
                    placeholder="EAAG..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 pr-10 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWhatsappToken(!showWhatsappToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showWhatsappToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ফোন নম্বর আইডি (Phone Number ID)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappPhoneNumberId || ''}
                    onChange={(e) => handleChange('whatsappPhoneNumberId', e.target.value)}
                    placeholder="100654321098765"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বিজনেস একাউন্ট আইডি (WBA ID)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappBusinessAccountId || ''}
                    onChange={(e) => handleChange('whatsappBusinessAccountId', e.target.value)}
                    placeholder="100987654321012"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestWhatsapp}
                  disabled={testingWhatsapp || !formData.whatsappAccessToken || !formData.whatsappPhoneNumberId}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  {testingWhatsapp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{testingWhatsapp ? 'মেসেজ পাঠানো হচ্ছে...' : 'হোয়াটসঅ্যাপ টেস্ট মেসেজ পাঠান'}</span>
                </button>

                <div className="text-xs font-bold flex items-center gap-2">
                  <span className="text-slate-500">এপিআই ভার্সন:</span>
                  <span className="text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    {formData.whatsappApiVersion || 'v20.0'}
                  </span>
                </div>
              </div>

              {whatsappTestResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    whatsappTestResult.success
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                  }`}
                >
                  {whatsappTestResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{whatsappTestResult.msg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. SECURITY SETTINGS */}
        {activeSection === 'security' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">সিকিউরিটি ও সেশন এক্সেস পলিসি</h2>
                <p className="text-xs text-slate-500">সেশন টাইমআউট, লগইন সীমা ও পাসওয়ার্ড পলিসি</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সেশন মেয়াদ (Session Timeout in Minutes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={30}
                    max={10080}
                    value={formData.sessionTimeoutMinutes || 1440}
                    onChange={(e) => handleChange('sessionTimeoutMinutes', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-xs font-bold text-slate-500">মিনিট</span>
                </div>
                <span className="text-[10px] text-slate-500">ডিফল্ট ১৪৪০ মিনিট (২৪ ঘণ্টা)।</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সর্বোচ্চ ব্যর্থ লগইন চেষ্টা (Max Login Attempts)
                </label>
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={formData.maxLoginAttempts || 5}
                  onChange={(e) => handleChange('maxLoginAttempts', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  পাসওয়ার্ড এনফোর্সমেন্ট পলিসি (Password Policy)
                </label>
                <select
                  value={formData.passwordPolicy || 'MIN_8_CHARS'}
                  onChange={(e) => handleChange('passwordPolicy', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="MIN_6_CHARS">কমপক্ষে ৬ অক্ষর (Standard)</option>
                  <option value="MIN_8_CHARS">কমপক্ষে ৮ অক্ষর (Recommended)</option>
                  <option value="COMPLEX">কমপক্ষে ৮ অক্ষর + লেটার + নম্বর (Strong)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  অডিট লোগ সংরক্ষিত রাখার মেয়াদ (Activity Log Retention Days)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={30}
                    max={365}
                    value={formData.activityLogRetentionDays || 90}
                    onChange={(e) => handleChange('activityLogRetentionDays', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-xs font-bold text-slate-500">দিন</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. BACKUP SETTINGS */}
        {activeSection === 'backup' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <DatabaseBackup className="w-5 h-5 text-purple-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">ডাটাবেজ ব্যাকআপ ও সিস্টেম রিস্টোর</h2>
                <p className="text-xs text-slate-500">স্বয়ংক্রিয় ব্যাকআপ শিডিউল এবং ম্যানুয়াল ফাইল ব্যাকআপ</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300">স্বয়ংক্রিয় দৈনিক ব্যাকআপ চালু রাখুন</span>
                <input
                  type="checkbox"
                  checked={formData.enableAutoBackup ?? true}
                  onChange={(e) => handleChange('enableAutoBackup', e.target.checked)}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ব্যাকআপ শিডিউল (Backup Schedule)
                  </label>
                  <select
                    value={formData.backupSchedule || 'DAILY'}
                    onChange={(e) => handleChange('backupSchedule', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="DAILY">দৈনিক একবার (Daily at 00:00 UTC)</option>
                    <option value="WEEKLY">সাপ্তাহিক একবার (Weekly on Sunday)</option>
                    <option value="MONTHLY">মাসিক একবার (1st of Month)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ব্যাকআপ ডাটা সংরক্ষণের সময়কাল (Retention Period)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={7}
                      max={365}
                      value={formData.backupRetentionDays || 30}
                      onChange={(e) => handleChange('backupRetentionDays', Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">দিন</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>সর্বশেষ ব্যাকআপ রেকর্ড</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>সর্বশেষ সফল ব্যাকআপ: <strong className="text-slate-900 dark:text-white">{formData.lastBackupTime ? new Date(formData.lastBackupTime).toLocaleString('bn-BD') : 'এখনও রেকর্ড হয়নি'}</strong></div>
                  <div>পরবর্তী শিডিউল ব্যাকআপ: <strong className="text-slate-900 dark:text-white">{formData.nextScheduledBackup ? new Date(formData.nextScheduledBackup).toLocaleString('bn-BD') : 'দৈনিক রাত ১২:০০'}</strong></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleManualBackup}
                  disabled={backingUp}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs"
                >
                  {backingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{backingUp ? 'ব্যাকআপ হচ্ছে...' : 'এখনই ডাটাবেজ ব্যাকআপ নিন (JSON)'}</span>
                </button>

                <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 cursor-pointer">
                  {restoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-purple-600" />}
                  <span>{restoring ? 'রিস্টোর হচ্ছে...' : 'ব্যাকআপ ফাইল থেকে রিস্টোর করুন'}</span>
                  <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
                </label>
              </div>

              {backupMessage && <div className="text-xs font-bold text-purple-700 dark:text-purple-300">{backupMessage}</div>}
            </div>
          </div>
        )}

        {/* 8. SYSTEM INFORMATION */}
        {activeSection === 'info' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Info className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">সিস্টেম ইনফরমেশন ও হেলথ স্ট্যাটাস</h2>
                <p className="text-xs text-slate-500">অ্যাপ্লিকেশন ভার্সন, ডাটাবেজ ও সার্ভিস কানেক্টিভিটি পর্যবেক্ষণ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-500 mb-1">অ্যাপ্লিকেশন ভার্সন</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">{formData.appVersion || 'v2.4.0'}</div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-500 mb-1">ডাটাবেজ স্ট্যাটাস</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>HEALTHY (JSON Disk Synced)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-500 mb-1">সুনির্দিষ্ট স্টোরেজ কানেকশন</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Supabase / Local DB Storage</div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-500 mb-1">টেলিগ্রাম বট স্ট্যাটাস</div>
                <div className={`text-sm font-bold ${formData.telegramBotToken ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {formData.telegramBotToken ? 'সংযুক্ত (Connected)' : 'অসংযুক্ত (Not Configured)'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-500 mb-1">হোয়াটসঅ্যাপ এপিআই স্ট্যাটাস</div>
                <div className={`text-sm font-bold ${formData.whatsappAccessToken ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {formData.whatsappAccessToken ? 'সংযুক্ত (Connected)' : 'অসংযুক্ত (Not Configured)'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-500 mb-1">সার্ভার টাইম (Live Clock)</div>
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">{serverTime}</div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 sm:col-span-2 lg:col-span-3">
                <div className="text-[11px] font-bold text-slate-500 mb-1">এনভায়রনমেন্ট</div>
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">{formData.environment || 'Cloud Run Production Sandbox'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button Bar */}
        <div className="sticky bottom-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            পরিবর্তনগুলো নিরাপদভাবে ডাটাবেজে সংরক্ষণ করুন
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto ml-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-lg transition-all transform active:scale-98"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
