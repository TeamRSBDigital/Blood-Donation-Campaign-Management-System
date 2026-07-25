import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { TelegramDeliveryStats, TelegramNotificationLog } from '../../types/index.js';
import {
  Send,
  Bot,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldAlert,
  Power,
  Activity,
  MessageSquare,
  Clock,
  RotateCw,
  Database,
  Search,
  ExternalLink
} from 'lucide-react';

export const TelegramNotificationSettings: React.FC = () => {
  const { user, token } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enableTelegramNotify, setEnableTelegramNotify] = useState(true);
  const [showToken, setShowToken] = useState(false);

  const [stats, setStats] = useState<TelegramDeliveryStats | null>(null);
  const [logs, setLogs] = useState<TelegramNotificationLog[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const [testMsg, setTestMsg] = useState('পাংশা ব্লাড ডোনার্স এসোসিয়েশন - টেলিগ্রাম গ্রুপ সিস্টেম নোটিফিকেশন কানেকশন পরীক্ষা');
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isSuperAdmin) {
      loadTelegramData();
    }
  }, [isSuperAdmin, token]);

  const loadTelegramData = async () => {
    setLoading(true);
    try {
      const [settingsRes, logsRes] = await Promise.all([
        fetch('/api/telegram/settings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/telegram/logs', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setBotToken(sData.telegramBotToken || '');
        setChatId(sData.telegramChatId || '');
        setEnableTelegramNotify(sData.enableTelegramNotify ?? true);
        if (sData.stats) setStats(sData.stats);
      }

      if (logsRes.ok) {
        const lData = await logsRes.json();
        if (lData.logs) setLogs(lData.logs);
        if (lData.stats) setStats(lData.stats);
      }
    } catch (err) {
      console.error('Failed to load telegram settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlertInfo(null);

    try {
      const res = await fetch('/api/telegram/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          telegramBotToken: botToken,
          telegramChatId: chatId,
          enableTelegramNotify
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAlertInfo({ type: 'success', message: 'টেলিগ্রাম সেটিং সফলভাবে আপডেট করা হয়েছে!' });
        if (data.stats) setStats(data.stats);
        loadTelegramData();
      } else {
        setAlertInfo({ type: 'error', message: data.error || 'সেটিং আপডেট করতে ব্যর্থ হয়েছে' });
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setAlertInfo(null);

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ customMessage: testMsg })
      });

      const data = await res.json();
      if (res.ok) {
        setAlertInfo({ type: 'success', message: data.message || 'টেস্ট বার্তা গ্রুপে পাঠানো হয়েছে!' });
        loadTelegramData();
      } else {
        setAlertInfo({ type: 'error', message: data.error || 'টেস্ট বার্তা পাঠাতে ব্যর্থ হয়েছে' });
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'টেস্ট কানেকশন চলাকালীন ত্রুটি ঘটেছে' });
    } finally {
      setTesting(false);
    }
  };

  const handleRetryNotification = async (id: string) => {
    setRetryingId(id);
    try {
      const res = await fetch(`/api/telegram/logs/${id}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAlertInfo({ type: 'success', message: 'নোটিফিকেশন পুনরায় সফলভাবে বিতরণ করা হয়েছে!' });
        loadTelegramData();
      } else {
        setAlertInfo({ type: 'error', message: data.error || 'পুনরায় চেষ্টা করতে সমস্যা হয়েছে' });
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'সার্ভার রেসপন্স দেয়নি' });
    } finally {
      setRetryingId(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-3xl p-8 text-center space-y-4 max-w-2xl mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h3 className="text-lg font-bold text-red-900 dark:text-red-200">প্রবেশাধিকার সংরক্ষিত (Access Denied)</h3>
        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
          টেলিগ্রাম বোট ও অটো-নোটিফিকেশন গ্রুপ সেটিংস পরিবর্তন কেবল <strong>সুপার এডমিন (Super Admin)</strong> এর জন্য সীমাবদ্ধ। সাধারণ এডমিন বা ভলান্টিয়াররা এটি পরিবর্তন করতে পারবেন না।
        </p>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;
    const matchesQuery = searchQuery === '' ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.triggeredBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              টেলিগ্রাম প্রাইভেট গ্রুপ অটো-নোটিফিকেশন সিস্টেম
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            রক্তের আবেদন, নতুন রক্তদাতা, প্রোফাইল পরিবর্তন ও এডমিন অ্যাক্টিভিটির লাইভ আপডেট
          </p>
        </div>

        <button
          onClick={loadTelegramData}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>রিফ্রেশ ডাটা</span>
        </button>
      </div>

      {/* Connection & Delivery Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl ${stats?.isConfigured && stats?.isEnabled ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600'}`}>
            <Power className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">সিস্টেম স্ট্যাটাস</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {!stats?.isEnabled
                ? 'নিষ্ক্রিয় (Disabled)'
                : stats?.isConfigured
                ? 'সক্রিয় ও প্রস্তুত (Active)'
                : 'অসম্পূর্ণ কনফিগ'}
            </p>
          </div>
        </div>

        {/* Total Sent */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট নোটিফিকেশন</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {stats?.totalSent || 0} টি পাঠানো হয়েছে
            </p>
          </div>
        </div>

        {/* Total Success */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">সফল বিতরণ</p>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {stats?.totalSuccess || 0} টি ডেলিভার্ড
            </p>
          </div>
        </div>

        {/* Total Failed */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ব্যর্থ / পেন্ডিং</p>
            <p className="text-sm font-black text-rose-600 dark:text-rose-400">
              {(stats?.totalFailed || 0) + (stats?.totalPending || 0)} টি
            </p>
          </div>
        </div>
      </div>

      {/* Global Alert Notification Banner */}
      {alertInfo && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 shadow-sm ${
            alertInfo.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
          }`}
        >
          {alertInfo.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1">
            <p>{alertInfo.message}</p>
          </div>
        </div>
      )}

      {/* Config Form & Test Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telegram Configuration Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <Bot className="w-4.5 h-4.5 text-blue-600" />
              <span>বোট টোকেন ও গ্রুপ চ্যাট আইডি সেটিংস</span>
            </h3>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableTelegramNotify}
                onChange={(e) => setEnableTelegramNotify(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {enableTelegramNotify ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
            </label>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                টেলিগ্রাম বোট টোকেন (Telegram Bot Token)
              </label>

              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRstUVwxyZ"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 pr-10 text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Telegram @BotFather থেকে বোট তৈরি করে প্রাপ্ত ইউনিক API টোকেন প্রবেশ করান।
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                প্রাইভেট গ্রুপ চ্যাট আইডি (Group Chat ID)
              </label>

              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g. -1001234567890"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                বোটকে অবশ্যই আপনার প্রাইভেট গ্রুপে Administrator হিসেবে অ্যাড করতে হবে। গ্রুপের আইডি সাধারণ -100 দিয়ে শুরু হয়।
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'কনফিগারেশন সংরক্ষণ করুন'}</span>
            </button>
          </form>
        </div>

        {/* Telegram Test Connection & Trigger Sandbox */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm border-b border-slate-200 dark:border-slate-800 pb-4">
              <Send className="w-4.5 h-4.5 text-emerald-600" />
              <span>লাইভ কানেকশন ও ব্রডকাস্ট টেস্ট</span>
            </h3>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  টেস্ট বার্তা (Test Broadcast Message)
                </label>

                <textarea
                  rows={3}
                  value={testMsg}
                  onChange={(e) => setTestMsg(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={testing || !botToken || !chatId}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:dark:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{testing ? 'টেস্ট বার্তা রেডি হচ্ছে...' : 'টেলিগ্রাম কানেকশন টেস্ট পাঠান'}</span>
              </button>
            </form>
          </div>

          {/* Quick Setup Instructions */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-500 space-y-1.5">
            <p className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>সহজ কনফিগারেশন নির্দেশিকা:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>টেলিগ্রামে <strong>@BotFather</strong> এ গিয়ে নতুন বোট বানিয়ে API Token নিন।</li>
              <li>আপনার প্রাইভেট টেলিগ্রাম গ্রুপ খুলে বোটটিকে অ্যাড করুন এবং <strong>Admin Permission</strong> দিন।</li>
              <li>গ্রুপের চ্যাট আইডি নিয়ে উপরে বসিয়ে দিয়ে 'সংরক্ষণ করুন' চাপুন।</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Telegram Delivery History & Queue Activity Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <Database className="w-4.5 h-4.5 text-blue-600" />
              <span>টেলিগ্রাম নোটিফিকেশন হিস্ট্রি ও ডেলিভারি লগ ({filteredLogs.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400">প্রতিটি নোটিফিকেশন টাইপ, সময়, স্ট্যাটাস ও রিট্রাই রেকর্ড</p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">সকল স্ট্যাটাস (All)</option>
              <option value="SUCCESS">সফল (SUCCESS)</option>
              <option value="FAILED">ব্যর্থ (FAILED)</option>
              <option value="PENDING">পেন্ডিং (PENDING)</option>
              <option value="RETRYING">রিট্রাইং (RETRYING)</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-bold text-xs">কোনো নোটিফিকেশন লগ পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">সময়</th>
                  <th className="py-3 px-3">ইভেন্ট টাইপ</th>
                  <th className="py-3 px-3">প্রেরক / ট্রিগার</th>
                  <th className="py-3 px-3">বার্তা বিবরণ</th>
                  <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('bn-BD', {
                        timeZone: 'Asia/Dhaka',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] border border-blue-200 dark:border-blue-900">
                        {log.type}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {log.triggeredBy}
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <p className="font-extrabold text-slate-900 dark:text-white truncate">{log.title}</p>
                      {log.failureReason && (
                        <p className="text-[10px] text-rose-500 font-medium truncate mt-0.5">
                          ত্রুটি: {log.failureReason}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {log.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ডেলিভার্ড
                        </span>
                      )}
                      {log.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          ব্যর্থ ({log.retryCount} retries)
                        </span>
                      )}
                      {(log.status === 'PENDING' || log.status === 'RETRYING') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                          <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                          প্রসেসিং
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {log.status === 'FAILED' ? (
                        <button
                          onClick={() => handleRetryNotification(log.id)}
                          disabled={retryingId === log.id}
                          className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <RotateCw className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                          <span>পুনরায় চেষ্টা</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[10px]">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
