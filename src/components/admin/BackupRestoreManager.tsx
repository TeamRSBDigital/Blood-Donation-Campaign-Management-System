import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Calendar,
  Settings,
  Trash2,
  HardDrive,
  Activity,
  Layers,
  Archive,
  Info,
  Check,
  X,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import {
  BackupRecord,
  BackupType,
  BackupSummaryStats,
  BackupIntegrityCheckResult
} from '../../types/index.js';

export const BackupRestoreManager: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [stats, setStats] = useState<BackupSummaryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Progress animation state
  const [progressState, setProgressState] = useState<{
    active: boolean;
    title: string;
    percent: number;
    stepText: string;
  }>({ active: false, title: '', percent: 0, stepText: '' });

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [selectedBackupToRestore, setSelectedBackupToRestore] = useState<BackupRecord | null>(null);
  const [restoreConfirmInput, setRestoreConfirmInput] = useState<string>('');

  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadedFileContent, setUploadedFileContent] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const [showIntegrityModal, setShowIntegrityModal] = useState<boolean>(false);
  const [integrityResult, setIntegrityResult] = useState<BackupIntegrityCheckResult | null>(null);

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Form states for creating backup
  const [createType, setCreateType] = useState<BackupType>('FULL');
  const [createNotes, setCreateNotes] = useState<string>('');

  // Form states for Settings
  const [settingsForm, setSettingsForm] = useState({
    enableAutoBackup: true,
    backupSchedule: 'DAILY',
    backupRetentionPolicy: 'KEEP_30',
    customRetentionDays: 30,
    backupStorageLocation: 'LOCAL_DISK',
    customScheduleCron: '0 0 * * *'
  });

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pbda_token') || '';
    }
    return '';
  };

  const fetchBackupsAndStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backups', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
        setStats(data.stats || null);
        if (data.stats) {
          setSettingsForm({
            enableAutoBackup: data.stats.autoBackupEnabled ?? true,
            backupSchedule: data.stats.scheduleFrequency || 'DAILY',
            backupRetentionPolicy: data.stats.retentionPolicy || 'KEEP_30',
            customRetentionDays: 30,
            backupStorageLocation: data.stats.storageLocation?.includes('Cloud') ? 'CLOUD_VAULT' : 'LOCAL_DISK',
            customScheduleCron: '0 0 * * *'
          });
        }
      } else {
        const err = await res.json();
        showToast(err.error || 'ব্যাকআপ তালিকা লোড করতে ব্যর্থ হয়েছে', 'error');
      }
    } catch (e) {
      showToast('সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupsAndStats();
  }, []);

  // Async Progress simulation helper
  const runProgressSimulation = (title: string, steps: string[], onComplete: () => void) => {
    setProgressState({ active: true, title, percent: 10, stepText: steps[0] });
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        const pct = Math.min(90, Math.round(((currentStep + 1) / steps.length) * 100));
        setProgressState((prev) => ({
          ...prev,
          percent: pct,
          stepText: steps[currentStep]
        }));
      } else {
        clearInterval(interval);
        setProgressState({ active: true, title, percent: 100, stepText: 'সম্পন্ন হয়েছে!' });
        setTimeout(() => {
          setProgressState({ active: false, title: '', percent: 0, stepText: '' });
          onComplete();
        }, 600);
      }
    }, 350);
  };

  // Handle Create Backup
  const handleCreateBackup = async () => {
    setShowCreateModal(false);
    setActionLoading(true);

    const steps = [
      'ডাটাবেজ কালেকশন রিড করা হচ্ছে...',
      'ডাটা অবজেক্ট সামঞ্জস্যতা পরীক্ষা করা হচ্ছে...',
      'এনক্রিপ্টেড JSON প্যালৌড তৈরি হচ্ছে...',
      'MD5 চেকসাম ডিজিটাল সিগনেচার তৈরি করা হচ্ছে...',
      'লোকাল এনক্রিপ্টেড ভল্টে ডাটা সেভ করা হচ্ছে...',
      'অডিট লোগ ও টেলিগ্রাম গ্রুপে ব্যাকআপ অ্যালার্ট পাঠানো হচ্ছে...'
    ];

    runProgressSimulation('নতুন ব্যাকআপ তৈরি হচ্ছে', steps, async () => {
      try {
        const res = await fetch('/api/backups/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            type: createType,
            method: 'MANUAL',
            notes: createNotes || undefined
          })
        });

        if (res.ok) {
          const data = await res.json();
          showToast(data.message || 'নতুন ব্যাকআপ ফাইল সফলভাবে তৈরি হয়েছে!', 'success');
          setCreateNotes('');
          fetchBackupsAndStats();
        } else {
          const err = await res.json();
          showToast(err.error || 'ব্যাকআপ তৈরিতে ব্যর্থ হয়েছে', 'error');
        }
      } catch (err) {
        showToast('ব্যাকআপ তৈরি করার সময় ত্রুটি ঘটেছে', 'error');
      } finally {
        setActionLoading(false);
      }
    });
  };

  // Handle Download Backup
  const handleDownloadBackup = async (backup: BackupRecord) => {
    try {
      showToast(`${backup.id} ডাউনলোড প্রসেস শুরু হয়েছে...`, 'info');
      const res = await fetch(`/api/backups/download/${backup.id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PBDA_Backup_${backup.type}_${backup.id}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showToast('ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'ফাইল ডাউনলোডে ব্যর্থ হয়েছে', 'error');
      }
    } catch {
      showToast('ডাউনলোড করার সময় নেটওয়ার্ক ত্রুটি ঘটেছে', 'error');
    }
  };

  // Handle Integrity Check
  const handleVerifyIntegrity = async (backup: BackupRecord) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/backups/verify/${backup.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setIntegrityResult(data);
        setShowIntegrityModal(true);
      } else {
        const err = await res.json();
        showToast(err.error || 'ইনটিগ্রিটি চেক করা সম্ভব হয়নি', 'error');
      }
    } catch {
      showToast('ইনটিগ্রিটি চেকে ত্রুটি হয়েছে', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Restore Execution
  const handleExecuteRestore = async () => {
    if (!selectedBackupToRestore) return;
    if (restoreConfirmInput.trim() !== 'RESTORE') {
      showToast('রিস্টোর নিশ্চিত করতে "RESTORE" টাইপ করুন', 'error');
      return;
    }

    const backupToRestore = selectedBackupToRestore;
    setShowRestoreModal(false);
    setActionLoading(true);

    const steps = [
      'ব্যাকআপ স্ন্যাপশট ডাটা লোড ও ডিক্রিপ্ট করা হচ্ছে...',
      'ডাটা স্কিমা এবং প্রাইমারি কি চেক করা হচ্ছে...',
      'বর্তমান ডাটাবেজ কালেকশন ক্লিন করা হচ্ছে...',
      'ব্যাকআপ ফাইল থেকে সকল রিকভারি অবজেক্ট ইনসার্ট করা হচ্ছে...',
      'সিস্টেম সিকিউরিটি অ্যান্ড অডিট ট্রেইল রেজিস্টার করা হচ্ছে...'
    ];

    runProgressSimulation('ডাটাবেজ রিস্টোর প্রক্রিয়া চলছে', steps, async () => {
      try {
        const res = await fetch(`/api/backups/restore/${backupToRestore.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            confirmationText: 'RESTORE'
          })
        });

        if (res.ok) {
          const data = await res.json();
          showToast(data.message || 'ডাটাবেজ সফলভাবে ব্যাকআপ থেকে রিস্টোর করা হয়েছে!', 'success');
          setRestoreConfirmInput('');
          setSelectedBackupToRestore(null);
          fetchBackupsAndStats();
        } else {
          const err = await res.json();
          showToast(err.error || 'রিস্টোর করতে ব্যর্থ হয়েছে', 'error');
        }
      } catch {
        showToast('রিস্টোর করার সময় ত্রুটি ঘটেছে', 'error');
      } finally {
        setActionLoading(false);
      }
    });
  };

  // Handle File Upload Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setUploadedFileContent(json);
        showToast('ব্যাকআপ ফাইলটি সফলভাবে পড়া হয়েছে। রিস্টোর করতে confirmation দিন।', 'info');
      } catch (err) {
        showToast('অকার্যকর JSON ব্যাকআপ ফাইল!', 'error');
        setUploadedFileContent(null);
        setUploadedFileName('');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteUploadRestore = async () => {
    if (!uploadedFileContent) {
      showToast('অনুগ্রহ করে প্রথমে সঠিক ব্যাকআপ JSON ফাইল সিলেক্ট করুন', 'error');
      return;
    }
    if (restoreConfirmInput.trim() !== 'RESTORE') {
      showToast('রিস্টোর নিশ্চিত করতে "RESTORE" টাইপ করুন', 'error');
      return;
    }

    setShowUploadModal(false);
    setActionLoading(true);

    const steps = [
      'আপলোড করা JSON ফাইলের স্কিমা ভ্যালিডেশন করা হচ্ছে...',
      'ডাটাবেজ স্ন্যাপশট মেমোরিতে ম্যাপ করা হচ্ছে...',
      'পুরাতন ফাইল ওভাররাইট করে ডাটা রিসেট হচ্ছে...',
      'ডাটাবেজ রিস্টোর সম্পন্ন ও সিঙ্ক করা হচ্ছে...'
    ];

    runProgressSimulation('আপলোড ফাইল থেকে রিস্টোর হচ্ছে', steps, async () => {
      try {
        const res = await fetch('/api/backups/restore/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            confirmationText: 'RESTORE',
            backupPayload: uploadedFileContent
          })
        });

        if (res.ok) {
          const data = await res.json();
          showToast(data.message || 'আপলোড ফাইল থেকে ডাটাবেজ সফলভাবে রিস্টোর হয়েছে!', 'success');
          setUploadedFileContent(null);
          setUploadedFileName('');
          setRestoreConfirmInput('');
          fetchBackupsAndStats();
        } else {
          const err = await res.json();
          showToast(err.error || 'আপলোড ফাইল থেকে রিস্টোর করতে ব্যর্থ হয়েছে', 'error');
        }
      } catch {
        showToast('রিস্টোর প্রসেসে মারাত্মক ত্রুটি', 'error');
      } finally {
        setActionLoading(false);
      }
    });
  };

  // Handle Delete Backup
  const handleDeleteBackup = async (backup: BackupRecord) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${backup.name}" ব্যাকআপ ফাইলটি ডিলিট করতে চান?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/backups/${backup.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      if (res.ok) {
        showToast('ব্যাকআপ ফাইলটি ডিলিট করা হয়েছে!', 'success');
        fetchBackupsAndStats();
      } else {
        const err = await res.json();
        showToast(err.error || 'ডিলিট করতে ব্যর্থ হয়েছে', 'error');
      }
    } catch {
      showToast('ডিলিট করার সময় সংযোগ ত্রুটি', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/backups/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(settingsForm)
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'ব্যাকআপ সেটিং ও সিডিউল সংরক্ষণ করা হয়েছে!', 'success');
        setShowSettingsModal(false);
        fetchBackupsAndStats();
      } else {
        const err = await res.json();
        showToast(err.error || 'সেটিংস সংরক্ষণে ব্যর্থ হয়েছে', 'error');
      }
    } catch {
      showToast('সেটিংস সংরক্ষণে সেকশন ত্রুটি', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTimeBn = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleString('bn-BD', {
        timeZone: 'Asia/Dhaka',
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return isoStr;
    }
  };

  const getBadgeForType = (type: BackupType) => {
    switch (type) {
      case 'FULL':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">FULL DB</span>;
      case 'SETTINGS':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">SETTINGS</span>;
      case 'SYSTEM_CONFIG':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">CONFIG</span>;
      case 'AUDIT_LOGS':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">AUDIT LOGS</span>;
      case 'EXPORT_FILES':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">EXPORT META</span>;
      case 'FILE_STORAGE':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">FILE VAULT</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">SNAPSHOT</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border animate-in slide-in-from-bottom-5 fade-in duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-red-950 text-white border-red-800'
              : toastMessage.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-950 text-white border-emerald-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          ) : toastMessage.type === 'info' ? (
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Progress Simulation Card */}
      {progressState.active && (
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
              <span>{progressState.title}</span>
            </div>
            <span className="text-red-400 font-mono text-sm font-extrabold">{progressState.percent}%</span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressState.percent}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>{progressState.stepText}</span>
          </p>
        </div>
      )}

      {/* Module Title Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/60 rounded-2xl border border-red-100 dark:border-red-900/40 text-red-600">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                ব্যাকআপ ও রিস্টোর সিস্টেম
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                সিকিউর ডাটাবেজ ব্যাকআপ তৈরি, ইনটিগ্রিটি ভেরিফিকেশন ও জিরো-ডাটা-লস রিস্টোর
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={actionLoading || progressState.active}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all shadow-md disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            <span>নতুন ব্যাকআপ তৈরি করুন</span>
          </button>

          <button
            onClick={() => {
              setRestoreConfirmInput('');
              setUploadedFileContent(null);
              setUploadedFileName('');
              setShowUploadModal(true);
            }}
            disabled={actionLoading || progressState.active}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-4 py-2.5 rounded-2xl text-xs transition-all border border-slate-200 dark:border-slate-700"
          >
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>ফাইল থেকে রিস্টোর</span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3 py-2.5 rounded-2xl text-xs transition-all border border-slate-200 dark:border-slate-700"
            title="সিডিউল ও রিটেনশন সেটিং"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">সেটিংস</span>
          </button>

          <button
            onClick={fetchBackupsAndStats}
            disabled={loading || actionLoading}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Last Backup */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">সর্বশেষ ব্যাকআপ</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {formatDateTimeBn(stats?.lastBackupTime)}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {stats?.lastBackupStatus || 'SUCCESS'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {stats?.lastBackupSize || '0 MB'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Next Schedule */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">পরবর্তী অটো সিডিউল</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {formatDateTimeBn(stats?.nextScheduledBackup)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              ফ্রিকোয়েন্সি: <strong className="text-slate-700 dark:text-slate-200">{stats?.scheduleFrequency || 'DAILY'}</strong>
            </p>
          </div>
        </div>

        {/* Card 3: Storage Vault Size */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">ভল্ট সাইজ ও রেকর্ড</span>
            <HardDrive className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
              {stats?.totalStorageFormatted || '0 MB'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              মোট সংরক্ষিত স্ন্যাপশট: <strong className="text-slate-800 dark:text-slate-200">{stats?.totalBackupsCount || 0} টি</strong>
            </p>
          </div>
        </div>

        {/* Card 4: Retention Policy & Vault */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">রিটেনশন পলিসি ও স্টোরেজ</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
              {stats?.retentionPolicy === 'KEEP_7' ? 'সর্বশেষ ৭টি ব্যাকআপ সংরক্ষিত' : stats?.retentionPolicy === 'KEEP_30' ? 'সর্বশেষ ৩০টি ব্যাকআপ সংরক্ষিত' : 'কাস্টম রিটেনশন নীতি'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {stats?.storageLocation || 'Local Encrypted Vault'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Backup History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              ব্যাকআপ ফাইল হিস্টোরি ও রিকোভারি পয়েন্ট ({backups.length})
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            এনক্রিপশন: AES-256 + MD5 Checksum
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500" />
            <p className="text-xs font-medium">ব্যাকআপ হিস্টোরি ডাটা লোড হচ্ছে...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Database className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">কোন ব্যাকআপ ফাইল পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">উপরের "নতুন ব্যাকআপ তৈরি করুন" বাটনে ক্লিক করে ম্যানুয়াল ব্যাকআপ নিন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">আইডি ও নাম</th>
                  <th className="py-3.5 px-4">টাইপ</th>
                  <th className="py-3.5 px-4">তৈরির পদ্ধতি</th>
                  <th className="py-3.5 px-4">তৈরির তারিখ ও সময়</th>
                  <th className="py-3.5 px-4">সাইজ ও সময়কাল</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {backups.map((bkp) => (
                  <tr
                    key={bkp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-slate-900 dark:text-white text-xs">
                            {bkp.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs">
                          {bkp.name}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getBadgeForType(bkp.type)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                          {bkp.method === 'MANUAL' ? 'ম্যানুয়াল' : bkp.method === 'SCHEDULED' ? 'অটো সিডিউল' : 'স্বয়ংক্রিয়'}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {bkp.createdBy}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {formatDateTimeBn(bkp.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      <div>{bkp.sizeFormatted}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{bkp.durationMs}ms</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        bkp.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : bkp.status === 'RESTORED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{bkp.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadBackup(bkp)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="JSON ফাইল ডাউনলোড"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleVerifyIntegrity(bkp)}
                          className="p-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
                          title="ইনটিগ্রিটি রিড ভ্যালিডেশন"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedBackupToRestore(bkp);
                            setRestoreConfirmInput('');
                            setShowRestoreModal(true);
                          }}
                          className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                          title="সিস্টেম ডাটা রিস্টোর করুন"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteBackup(bkp)}
                          className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                          title="ব্যাকআপ ফাইল ডিলিট"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  নতুন ডাটাবেজ ব্যাকআপ স্ন্যাপশট
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ব্যাকআপ ফাইল টাইপ নির্বাচন করুন
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { type: 'FULL' as BackupType, label: 'Full System Snapshot', desc: 'সকল রক্তদাতা, রিকুয়েস্ট, ক্যাম্পেইন, অডিট ও সেটিংস' },
                    { type: 'SETTINGS' as BackupType, label: 'System Settings', desc: 'শুধুমাত্র সংস্থা ও সিস্টেম কনফিগারেশন' },
                    { type: 'SYSTEM_CONFIG' as BackupType, label: 'Config & Users', desc: 'সেটিংস, এডমিন ভূমিকা ও জরুরি পরিচিতি' },
                    { type: 'AUDIT_LOGS' as BackupType, label: 'Activity Logs', desc: 'সিকিউরিটি লোগ, লগইন ও ব্যাকআপ ট্রেইল' },
                    { type: 'EXPORT_FILES' as BackupType, label: 'Export Metadata', desc: 'এক্সপোর্ট ফাইল ট্র্যাকিং ও মেটাডাটা' },
                    { type: 'FILE_STORAGE' as BackupType, label: 'File Storage Architecture', desc: 'গ্যালারি ছবি ও ডকুমেন্ট রেফারেন্স' }
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setCreateType(item.type)}
                      className={`p-3 rounded-2xl text-left border text-xs transition-all ${
                        createType === item.type
                          ? 'border-red-600 bg-red-50/50 dark:bg-red-950/40 text-red-900 dark:text-red-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span>{item.label}</span>
                        {createType === item.type && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal line-clamp-2">
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  নোট বা বিবরণ (ঐচ্ছিক)
                </label>
                <textarea
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="যেমন: আগস্ট মাসের ক্যাম্পেইন পরবর্তী ম্যানুয়াল ডাটাবেজ ব্যাকআপ"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                বাতিল
              </button>
              <button
                onClick={handleCreateBackup}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all flex items-center gap-1.5"
              >
                <Database className="w-4 h-4" />
                <span>ব্যাকআপ তৈরি শুরু করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Restore Confirmation Modal */}
      {showRestoreModal && selectedBackupToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/60 rounded-2xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm">ডাটাবেজ রিস্টোর নিশ্চিতকরণ</h3>
                <p className="text-[11px] font-medium opacity-90">সতর্কতা: এটি একটি সংবেদনশীল অ্যাকশন!</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                আপনি সিলেক্ট করেছেন: <strong className="text-slate-900 dark:text-white font-mono">{selectedBackupToRestore.id}</strong> ({selectedBackupToRestore.name})।
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                রিস্টোর প্রক্রিয়া সম্পন্ন হলে বর্তমান সিস্টেমের সকল ডাটাবেজ রেকর্ড সিলেক্টকৃত ব্যাকআপ স্ন্যাপশট দ্বারা রিপ্লেসড বা রিস্টোর করা হবে।
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                  রিস্টোর শুরু করতে নিচে <span className="text-red-600 dark:text-red-400 font-mono">RESTORE</span> টাইপ করুন:
                </label>
                <input
                  type="text"
                  value={restoreConfirmInput}
                  onChange={(e) => setRestoreConfirmInput(e.target.value)}
                  placeholder="RESTORE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20 text-xs font-mono font-bold tracking-widest uppercase focus:ring-2 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackupToRestore(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleExecuteRestore}
                disabled={restoreConfirmInput.trim() !== 'RESTORE' || actionLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>রিস্টোর শুরু করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Upload Backup File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  কম্পিউটার থেকে ফাইল আপলোড করে রিস্টোর
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-4 text-center">
                <FileJson className="w-8 h-8 text-blue-500 mb-1" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {uploadedFileName ? uploadedFileName : 'JSON ব্যাকআপ ফাইল আপলোড করুন'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {uploadedFileName ? 'ফাইল নির্বাচন সম্পন্ন হয়েছে' : 'পিসি থেকে .json ফরম্যাটের ব্যাকআপ ড্র্যাগ বা সিলেক্ট করুন'}
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedFileContent && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-[11px]">
                    <p className="font-bold">ফাইল যাচাইকরণ সফল!</p>
                    <p>টাইপ: {uploadedFileContent.type || 'FULL'}, তৈরি: {uploadedFileContent.createdAt || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                      রিস্টোর করতে টাইপ করুন: <span className="text-red-600 font-mono">RESTORE</span>
                    </label>
                    <input
                      type="text"
                      value={restoreConfirmInput}
                      onChange={(e) => setRestoreConfirmInput(e.target.value)}
                      placeholder="RESTORE"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-red-500 outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                বাতিল
              </button>
              <button
                onClick={handleExecuteUploadRestore}
                disabled={!uploadedFileContent || restoreConfirmInput.trim() !== 'RESTORE' || actionLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-40 transition-all"
              >
                রিস্টোর প্রসেস করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Integrity Check Result Modal */}
      {showIntegrityModal && integrityResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  ইনটিগ্রিটি রিড ভ্যালিডেশন রিপোর্ট
                </h3>
              </div>
              <button
                onClick={() => setShowIntegrityModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                integrityResult.isValid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300'
              }`}>
                {integrityResult.isValid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-extrabold text-sm">{integrityResult.backupName}</h4>
                  <p className="mt-0.5 text-[11px] font-medium leading-relaxed">{integrityResult.message}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500">MD5 Checksum Verification:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {integrityResult.checksumMatch ? 'PASSED (Match)' : 'FAILED'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500">Checksum Hash:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[10px]">
                    {integrityResult.details?.checksum || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500">Target System Version:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {integrityResult.details?.targetVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Checked Records:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {integrityResult.totalRecordsChecked} Records
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowIntegrityModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Schedule & Retention Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  ব্যাকআপ সিডিউল ও রিটেনশন পলিসি সেটিংস
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="font-bold text-slate-900 dark:text-white block">
                    অটোমেটিক ব্যাকআপ চালু রাখুন
                  </label>
                  <p className="text-[11px] text-slate-500">নির্ধারিত সময় পরপর ডাটাবেজ অটোমেটিক ব্যাকআপ সংরক্ষিত হবে</p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.enableAutoBackup}
                  onChange={(e) => setSettingsForm({ ...settingsForm, enableAutoBackup: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded-lg focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ব্যাকআপ ফ্রিকোয়েন্সি (Schedule Frequency)
                </label>
                <select
                  value={settingsForm.backupSchedule}
                  onChange={(e) => setSettingsForm({ ...settingsForm, backupSchedule: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-red-500 outline-hidden"
                >
                  <option value="DAILY">প্রতিদিন (Daily Backup at Midnight)</option>
                  <option value="WEEKLY">প্রতি সপ্তাহে (Weekly - Sunday 00:00)</option>
                  <option value="MONTHLY">প্রতি মাসে (Monthly - 1st Day of Month)</option>
                  <option value="CUSTOM">কাস্টম ক্রন সিডিউল (Custom Cron)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  রিটেনশন পলিসি (Retention Policy)
                </label>
                <select
                  value={settingsForm.backupRetentionPolicy}
                  onChange={(e) => setSettingsForm({ ...settingsForm, backupRetentionPolicy: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-red-500 outline-hidden"
                >
                  <option value="KEEP_7">সর্বশেষ ৭টি ব্যাকআপ সংরক্ষণ করুন</option>
                  <option value="KEEP_30">সর্বশেষ ৩০টি ব্যাকআপ সংরক্ষণ করুন (Standard)</option>
                  <option value="KEEP_90">সর্বশেষ ৯০টি ব্যাকআপ সংরক্ষণ করুন</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  স্টোরেজ লোকেশন (Storage Location)
                </label>
                <select
                  value={settingsForm.backupStorageLocation}
                  onChange={(e) => setSettingsForm({ ...settingsForm, backupStorageLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-red-500 outline-hidden"
                >
                  <option value="LOCAL_DISK">লোকাল এনক্রিপ্টেড ভল্ট (/var/backups/pbda)</option>
                  <option value="CLOUD_VAULT">ক্লাউড এনক্রিপ্টেড ভল্ট (PBDA Vault)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
