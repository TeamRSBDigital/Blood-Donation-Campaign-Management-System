import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  WhatsappDeliveryStats,
  WhatsappNotificationLog,
  WhatsappRecipient
} from '../../types/index.js';
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldAlert,
  Power,
  Activity,
  Clock,
  RotateCw,
  Search,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  Phone,
  Send,
  Sliders,
  Bell
} from 'lucide-react';

export const WhatsappNotificationSettings: React.FC = () => {
  const { user, token } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // API Config State
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [apiVersion, setApiVersion] = useState('v20.0');
  const [enableWhatsappNotify, setEnableWhatsappNotify] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(30);
  const [showToken, setShowToken] = useState(false);

  // Stats, Logs & Recipients State
  const [stats, setStats] = useState<WhatsappDeliveryStats | null>(null);
  const [logs, setLogs] = useState<WhatsappNotificationLog[]>([]);
  const [recipients, setRecipients] = useState<WhatsappRecipient[]>([]);

  // Recipient Modal / Form State
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [newRcptName, setNewRcptName] = useState('');
  const [newRcptPhone, setNewRcptPhone] = useState('');
  const [newRcptRole, setNewRcptRole] = useState('ADMIN');

  // Logs Filter & Search State
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Test Message Sandbox State
  const [testRecipientPhone, setTestRecipientPhone] = useState('');
  const [testMsg, setTestMsg] = useState('পাংশা ব্লাড ডোনার্স এসোসিয়েশন - অফিশিয়াল হোয়াটসঅ্যাপ নোটিফিকেশন সার্ভিস কানেকশন পরীক্ষা');

  // UI Statuses
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isSuperAdmin) {
      loadWhatsappData();
    }
  }, [isSuperAdmin, token]);

  const loadWhatsappData = async () => {
    setLoading(true);
    try {
      const [settingsRes, logsRes, recipientsRes] = await Promise.all([
        fetch('/api/whatsapp/settings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/whatsapp/logs', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/whatsapp/recipients', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        const settings = sData.settings || {};
        setAccessToken(settings.whatsappAccessToken || '');
        setPhoneNumberId(settings.whatsappPhoneNumberId || '');
        setBusinessAccountId(settings.whatsappBusinessAccountId || '');
        setApiVersion(settings.whatsappApiVersion || 'v20.0');
        setEnableWhatsappNotify(settings.enableWhatsappNotify ?? true);
        setReminderInterval(settings.whatsappReminderIntervalMinutes || 30);
        if (sData.stats) setStats(sData.stats);
      }

      if (logsRes.ok) {
        const lData = await logsRes.json();
        if (lData.logs) setLogs(lData.logs);
        if (lData.stats) setStats(lData.stats);
      }

      if (recipientsRes.ok) {
        const rData = await recipientsRes.json();
        setRecipients(rData);
        if (rData.length > 0 && !testRecipientPhone) {
          setTestRecipientPhone(rData[0].phone);
        }
      }
    } catch (err) {
      console.error('Failed to load WhatsApp notification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlertInfo(null);

    try {
      const res = await fetch('/api/whatsapp/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          whatsappAccessToken: accessToken,
          whatsappPhoneNumberId: phoneNumberId,
          whatsappBusinessAccountId: businessAccountId,
          whatsappApiVersion: apiVersion,
          enableWhatsappNotify,
          whatsappReminderIntervalMinutes: Number(reminderInterval)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAlertInfo({ type: 'success', message: 'হোয়াটসঅ্যাপ ক্লাউড এপিআই সেটিং সফলভাবে আপডেট করা হয়েছে!' });
        if (data.stats) setStats(data.stats);
        loadWhatsappData();
      } else {
        setAlertInfo({ type: 'error', message: data.error || 'সেটিং আপডেট করতে ব্যর্থ হয়েছে' });
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRcptName || !newRcptPhone) return;

    try {
      const res = await fetch('/api/whatsapp/recipients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newRcptName,
          phone: newRcptPhone,
          role: newRcptRole,
          enabled: true
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAlertInfo({ type: 'success', message: 'নতুন হোয়াটসঅ্যাপ প্রাপক সফলভাবে যুক্ত হয়েছে!' });
        setNewRcptName('');
        setNewRcptPhone('');
        setShowAddRecipient(false);
        loadWhatsappData();
      } else {
        setAlertInfo({ type: 'error', message: data.error || 'প্রাপক যুক্ত করতে ব্যর্থ হয়েছে' });
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'সার্ভারের সাথে সংযোগ ত্রুটি' });
    }
  };

  const handleToggleRecipient = async (recipient: WhatsappRecipient) => {
    try {
      const res = await fetch(`/api/whatsapp/recipients/${recipient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !recipient.enabled })
      });

      if (res.ok) {
        loadWhatsappData();
      }
    } catch (err) {
      console.error('Failed to toggle recipient:', err);
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই প্রাপকের নম্বরটি মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`/api/whatsapp/recipients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setAlertInfo({ type: 'success', message: 'হোয়াটসঅ্যাপ প্রাপক মুছে ফেলা হয়েছে।' });
        loadWhatsappData();
      }
    } catch (err) {
      console.error('Failed to delete recipient:', err);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientPhone) {
      setAlertInfo({ type: 'error', message: 'টেস্ট মেসেজ পাঠানোর জন্য ফোন নম্বর প্রদান করুন।' });
      return;
    }

    setTesting(true);
    setAlertInfo(null);

    try {
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          accessToken,
          phoneNumberId,
          apiVersion,
          recipientPhone: testRecipientPhone,
          customMsg: testMsg
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAlertInfo({ type: 'success', message: data.message || 'হোয়াটসঅ্যাপ টেস্ট বার্তা সফলভাবে পাঠানো হয়েছে!' });
        loadWhatsappData();
      } else {
        setAlertInfo({ type: 'error', message: data.error || 'হোয়াটসঅ্যাপ বার্তা পাঠাতে ব্যর্থ হয়েছে' });
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'টেস্ট কানেকশন চলাকালীন সমস্যা হয়েছে' });
    } finally {
      setTesting(false);
    }
  };

  const handleRetryNotification = async (id: string) => {
    setRetryingId(id);
    try {
      const res = await fetch(`/api/whatsapp/logs/${id}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAlertInfo({ type: 'success', message: 'হোয়াটসঅ্যাপ নোটিফিকেশন পুনরায় সফলভাবে বিতরণ করা হয়েছে!' });
        loadWhatsappData();
      } else {
        setAlertInfo({ type: 'error', message: data.error || 'পুনরায় চেষ্টা করতে ব্যর্থ হয়েছে' });
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'পুনরায় বার্তা পাঠানো ব্যর্থ হয়েছে' });
    } finally {
      setRetryingId(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto my-12 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
        <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">প্রবেশাধিকার সংরক্ষিত</h2>
        <p className="text-red-700">
          হোয়াটসঅ্যাপ ক্লাউড এপিআই নোটিফিকেশন কনফিগারেশন এবং রেসিপিয়েন্ট ম্যানেজমেন্ট শুধুমাত্র **সুপার এডমিন** অ্যাকাউন্ট থেকে নিয়ন্ত্রণযোগ্য।
        </p>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      log.recipientPhone.includes(searchQuery) ||
      (log.recipientName && log.recipientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.relatedRecordId && log.relatedRecordId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-emerald-600/50 backdrop-blur-md rounded-2xl border border-emerald-400/30">
              <MessageSquare className="w-7 h-7 text-emerald-200" />
            </span>
            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-100 text-xs font-semibold rounded-full border border-emerald-400/40 uppercase tracking-wide">
              Official Meta Cloud API
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">হোয়াটসঅ্যাপ নোটিফিকেশন সিস্টেম</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            মেটা (Meta) অফিশিয়াল হোয়াটসঅ্যাপ ক্লাউড এপিআই-এর মাধ্যমে জরুরি রক্তের আবেদন, স্ট্যাটাস পরিবর্তন এবং অটো-রিমাইন্ডার এডমিন ও ভলান্টিয়ারদের হোয়াটসঅ্যাপে বিতরণ করুন।
          </p>
        </div>

        <button
          onClick={loadWhatsappData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all border border-white/20 text-sm font-medium shadow-sm active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          ডাটা রিফ্রেশ
        </button>
      </div>

      {/* Alert Messages */}
      {alertInfo && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm animate-fadeIn ${
          alertInfo.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {alertInfo.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{alertInfo.message}</p>
        </div>
      )}

      {/* Real-time Delivery Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>মোট প্রেরিত</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats?.totalSent ?? 0}</p>
          <span className="text-[11px] text-slate-400">সর্বমোট মেসেজ</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium mb-1">
            <span>সফল ডেলিভারি</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats?.totalSuccess ?? 0}</p>
          <span className="text-[11px] text-emerald-600/80">সফলভাবে প্রাপ্ত</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 text-xs font-medium mb-1">
            <span>ব্যর্থ ডেলিভারি</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700">{stats?.totalFailed ?? 0}</p>
          <span className="text-[11px] text-rose-600/80">ত্রুটিযুক্ত বার্তা</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 text-xs font-medium mb-1">
            <span>পেন্ডিং/প্রসেসিং</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats?.totalPending ?? 0}</p>
          <span className="text-[11px] text-amber-600/80">কুইতে অপেক্ষমান</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-sm">
          <div className="flex items-center justify-between text-teal-600 text-xs font-medium mb-1">
            <span>সক্রিয় প্রাপক</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-700">{stats?.activeRecipientsCount ?? 0}</p>
          <span className="text-[11px] text-teal-600/80">নিবন্ধিত নম্বর</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>এপিআই অবস্থা</span>
            <Power className={`w-4 h-4 ${stats?.isConfigured && stats?.isEnabled ? 'text-emerald-500' : 'text-slate-400'}`} />
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
              stats?.isConfigured && stats?.isEnabled
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {stats?.isConfigured && stats?.isEnabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় / অসম্পূর্ণ'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Credentials & Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">এপিআই কনফিগারেশন</h2>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableWhatsappNotify}
                  onChange={(e) => setEnableWhatsappNotify(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  WhatsApp Access Token (Permanent/System Token)
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="EAAG..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="e.g. 109823456789012"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  WhatsApp Business Account ID (WBA ID)
                </label>
                <input
                  type="text"
                  value={businessAccountId}
                  onChange={(e) => setBusinessAccountId(e.target.value)}
                  placeholder="e.g. 104928374650192"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Graph API Version
                </label>
                <input
                  type="text"
                  value={apiVersion}
                  onChange={(e) => setApiVersion(e.target.value)}
                  placeholder="v20.0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ক্রিটিক্যাল রিমাইন্ডার ইন্টারভাল (মিনিট)
                </label>
                <select
                  value={reminderInterval}
                  onChange={(e) => setReminderInterval(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value={15}>প্রতি ১৫ মিনিট পর পর</option>
                  <option value={30}>প্রতি ৩০ মিনিট পর পর</option>
                  <option value={60}>প্রতি ১ ঘণ্টা পর পর</option>
                  <option value={120}>প্রতি ২ ঘণ্টা পর পর</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  পেন্ডিং থাকা ইমার্জেন্সি/ক্রিটিক্যাল রক্তের আবেদনের জন্য অটো-রিমাইন্ডার পাঠানোর সময়সীমা।
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                কনফিগারেশন সেভ করুন
              </button>
            </form>
          </div>

          {/* Test Sandbox */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
              <Send className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">টেস্ট কানেকশন স্যান্ডবক্স</h2>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  প্রাপকের হোয়াটসঅ্যাপ নম্বর
                </label>

                {recipients.length > 0 && (
                  <select
                    value={testRecipientPhone}
                    onChange={(e) => setTestRecipientPhone(e.target.value)}
                    className="w-full mb-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">নিবন্ধিত প্রাপক সিলেক্ট করুন...</option>
                    {recipients.map(r => (
                      <option key={r.id} value={r.phone}>{r.name} ({r.phone})</option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  value={testRecipientPhone}
                  onChange={(e) => setTestRecipientPhone(e.target.value)}
                  placeholder="8801712345678"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  টেস্ট বার্তা বিস্তারিত
                </label>
                <textarea
                  rows={3}
                  value={testMsg}
                  onChange={(e) => setTestMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={testing}
                className="w-full px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                লাইভ হোয়াটসঅ্যাপ টেস্ট পাঠান
              </button>
            </form>
          </div>
        </div>

        {/* Recipients Management & Delivery Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipient Numbers Management */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  হোয়াটসঅ্যাপ প্রাপক নম্বরসমূহ ({recipients.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  যাদের নিকট সিস্টেম নোটিফিকেশনসমূহ (জরুরি রক্ত, আবেদন স্ট্যাটাস পরিবর্তন) পাঠানো হবে।
                </p>
              </div>

              <button
                onClick={() => setShowAddRecipient(!showAddRecipient)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                নতুন প্রাপক যুক্ত করুন
              </button>
            </div>

            {/* Add Recipient Form */}
            {showAddRecipient && (
              <form onSubmit={handleAddRecipient} className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 mb-6 space-y-4 animate-fadeIn">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">নতুন প্রাপক রেজিস্ট্রেশন</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">প্রাপকের নাম</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. এডমিন তানভীর"
                      value={newRcptName}
                      onChange={(e) => setNewRcptName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">হোয়াটসঅ্যাপ নম্বর</label>
                    <input
                      type="text"
                      required
                      placeholder="01712345678"
                      value={newRcptPhone}
                      onChange={(e) => setNewRcptPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">সিস্টেম রোল</label>
                    <select
                      value={newRcptRole}
                      onChange={(e) => setNewRcptRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="SUPER_ADMIN">সুপার এডমিন</option>
                      <option value="ADMIN">এডমিন</option>
                      <option value="VOLUNTEER">ভলান্টিয়ার</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRecipient(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    সেভ করুন
                  </button>
                </div>
              </form>
            )}

            {/* Recipient Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">প্রাপকের নাম</th>
                    <th className="py-3 px-4">হোয়াটসঅ্যাপ নম্বর</th>
                    <th className="py-3 px-4">রোল</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recipients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        কোন হোয়াটসঅ্যাপ প্রাপক নম্বর যুক্ত করা হয়নি।
                      </td>
                    </tr>
                  ) : (
                    recipients.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800">{r.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{r.phone}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                            r.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {r.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleRecipient(r)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                              r.enabled
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {r.enabled ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            {r.enabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteRecipient(r.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery Activity Logs Viewer */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  হোয়াটসঅ্যাপ নোটিফিকেশন লগ ও ডেলিভারি রিপোর্ট
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  মেটা ক্লাউড এপিআই ডেলিভারি হিস্ট্রি, স্ট্যাটাস এবং রিয়াটেম্পট লগ।
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="খুঁজুন (নম্বর/মেসেজ)..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="ALL">সকল স্ট্যাটাস</option>
                  <option value="SUCCESS">সফল (Success)</option>
                  <option value="FAILED">ব্যর্থ (Failed)</option>
                  <option value="PENDING">পেন্ডিং (Pending)</option>
                  <option value="RETRYING">পুনরায় চেষ্টা</option>
                </select>
              </div>
            </div>

            {/* Logs List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">টাইপ / ইভেন্ট</th>
                    <th className="py-3 px-4">প্রাপকের নম্বর</th>
                    <th className="py-3 px-4">বার্তা বিবরণ</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4">সময়সূচী</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        কোন নোটিফিকেশন লগ পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block text-xs">{l.title}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{l.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-700 block font-semibold">{l.recipientPhone}</span>
                          {l.recipientName && <span className="text-[10px] text-slate-500">{l.recipientName}</span>}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="line-clamp-2 text-slate-600 text-[11px] whitespace-pre-line">{l.message}</p>
                          {l.failureReason && (
                            <span className="text-[10px] text-rose-600 font-medium block mt-1">
                              ত্রুটি: {l.failureReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            l.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                            l.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {l.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                            {l.status === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500">
                          {new Date(l.createdAt).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka', dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {l.status === 'FAILED' && (
                            <button
                              onClick={() => handleRetryNotification(l.id)}
                              disabled={retryingId === l.id}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold border border-rose-200 transition-colors inline-flex items-center gap-1"
                            >
                              <RotateCw className={`w-3 h-3 ${retryingId === l.id ? 'animate-spin' : ''}`} />
                              পুনরায় পাঠান
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
