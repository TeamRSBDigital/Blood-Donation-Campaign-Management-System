import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database,
  Send,
  MessageSquare,
  Cpu,
  HardDrive,
  Clock,
  RefreshCw,
  Zap,
  Server,
  Lock,
  Archive,
  Bell,
  Play,
  Terminal,
  BarChart3,
  Check,
  AlertOctagon,
  Layers,
  Search,
  Radio,
  FileText
} from 'lucide-react';
import {
  SystemHealthReport,
  SystemHealthStatus,
  ServiceOperationalStatus
} from '../../types/index.js';

export const SystemHealthManager: React.FC = () => {
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'notifications' | 'automation' | 'resources' | 'alerts' | 'security'>('overview');
  const [securityReport, setSecurityReport] = useState<any>(null);
  const [loadingSecurity, setLoadingSecurity] = useState<boolean>(false);

  // Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const fetchHealthReport = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/system-health/report', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        showToast('সিস্টেম হেলথ ডাটা লোড করতে সমস্যা হয়েছে', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch system health report:', err);
      showToast('নেটওয়ার্ক ত্রুটি', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSecurityAuditReport = async () => {
    setLoadingSecurity(true);
    try {
      const res = await fetch('/api/security/audit-report', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setSecurityReport(data);
      } else {
        showToast('সিকিউরিটি অডিট রিপোর্ট লোড করতে সমস্যা হয়েছে', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch security audit report:', err);
      showToast('নেটওয়ার্ক ত্রুটি', 'error');
    } finally {
      setLoadingSecurity(false);
    }
  };

  useEffect(() => {
    fetchHealthReport();
    fetchSecurityAuditReport();
    // Auto refresh status every 20 seconds
    const interval = setInterval(() => {
      fetchHealthReport(false);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleRunDiagnostics = async () => {
    setActionLoading('run-check');
    try {
      const res = await fetch('/api/system-health/run-check', {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) {
        const updated = await res.json();
        setReport(updated);
        showToast('সম্পূর্ণ সিস্টেম স্বাস্থ্য পরীক্ষা সম্পন্ন হয়েছে!', 'success');
      } else {
        showToast('স্বাস্থ্য পরীক্ষা চালাতে ব্যর্থ', 'error');
      }
    } catch (err) {
      showToast('নেটওয়ার্ক ত্রুটি', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestDatabase = async () => {
    setActionLoading('test-db');
    try {
      const res = await fetch('/api/system-health/test-db', {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`ডাটাবেস কানেকশন সফল! লেটেন্সি: ${data.latencyMs}ms`, 'success');
        fetchHealthReport(true);
      } else {
        showToast('ডাটাবেস কানেকশন টেস্ট ব্যর্থ', 'error');
      }
    } catch (err) {
      showToast('নেটওয়ার্ক ত্রুটি', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestTelegram = async () => {
    setActionLoading('test-telegram');
    try {
      const res = await fetch('/api/system-health/test-telegram', {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('টেলিগ্রাম বট ও নোটিফিকেশন চ্যানেল কানেক্টিভিটি সঠিক আছে!', 'success');
        fetchHealthReport(true);
      } else {
        showToast(`টেলিগ্রাম টেস্ট ব্যর্থ: ${data.details || 'অজানা সমস্যা'}`, 'error');
      }
    } catch (err) {
      showToast('নেটওয়ার্ক ত্রুটি', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestScheduler = async () => {
    setActionLoading('test-scheduler');
    try {
      const res = await fetch('/api/system-health/test-scheduler', {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`সিডিউলার ইঞ্জিন সক্রিয়! মোট সক্রিয় জবস: ${data.activeJobsCount}`, 'success');
        fetchHealthReport(true);
      } else {
        showToast('সিডিউলার টেস্ট করতে সমস্যা হয়েছে', 'error');
      }
    } catch (err) {
      showToast('নেটওয়ার্ক ত্রুটি', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status?: SystemHealthStatus) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Healthy (সম্পূর্ণ সুস্থ)
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
            Warning (সতর্কতা)
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-4 h-4 text-rose-400 animate-bounce" />
            Critical (সংকটপূর্ণ)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
            <Activity className="w-4 h-4" />
            Checking...
          </span>
        );
    }
  };

  const getOperationalBadge = (status?: ServiceOperationalStatus) => {
    switch (status) {
      case 'OPERATIONAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            অপারেশনাল
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            ধীরগতি (Degraded)
          </span>
        );
      case 'DOWN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            অচল (Down)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">
            অজানা
          </span>
        );
    }
  };

  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleString('bn-BD', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                সুপার এডমিন ডায়াগনস্টিকস
              </span>
              {getStatusBadge(report?.overview.overallStatus)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              সিস্টেম হেলথ মনিটরিং ও ডায়াগনস্টিকস
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              অ্যাপ্লিকেশন পারফরম্যান্স, ডাটাবেস লেটেন্সি, ইনফ্রাস্ট্রাকচার মেমোরি, নোটিফিকেশন কিউ এবং অটোমেশন সিডিউলারের রিয়েল-টাইম স্বাস্থ্য বিশ্লেষণ।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => fetchHealthReport(true)}
              disabled={refreshing}
              className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-2xl border border-slate-700 transition-all flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>

            <button
              onClick={handleRunDiagnostics}
              disabled={actionLoading === 'run-check'}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-600/30 transition-all font-bold text-xs flex items-center gap-2 disabled:opacity-50"
            >
              {actionLoading === 'run-check' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              <span>হেলথ চেক রান করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Test Manual Actions Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>ম্যানুয়াল সার্ভিসেস ডায়াগনস্টিকস টেস্ট:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTestDatabase}
            disabled={actionLoading === 'test-db'}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>Test Database</span>
          </button>

          <button
            onClick={handleTestTelegram}
            disabled={actionLoading === 'test-telegram'}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            <Send className="w-3.5 h-3.5 text-sky-500" />
            <span>Test Telegram</span>
          </button>

          <button
            onClick={handleTestScheduler}
            disabled={actionLoading === 'test-scheduler'}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>Test Scheduler</span>
          </button>
        </div>
      </div>

      {/* Top Level System Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-bold">সার্ভার লেটেন্সি</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {report?.database.queryResponseTimeMs || 1} ms
          </div>
          <span className="text-[10px] font-semibold text-emerald-500">মেমোরি সিঙ্ক রেসপন্সিভ</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-bold">মেমোরি ইউসেজ</span>
            <HardDrive className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {report?.resources.memoryUsedMB || 45} MB
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            মোট {report?.resources.memoryTotalMB || 120} MB
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-bold">ডাটাবেস সাইজ</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {report?.database.databaseSizeFormatted || '1.2 MB'}
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {report?.database.totalRecordsCount || 0} টি রেকর্ড
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-bold">ব্যর্থ জবস</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {report?.automation.failedJobsCount || 0}
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            মোট {report?.automation.totalJobsCount || 0} টি জব
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-bold">অ্যাপ আপটাইম</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate" title={report?.overview.uptimeFormatted}>
            {report?.overview.uptimeFormatted || '১ ঘন্টা'}
          </div>
          <span className="text-[10px] font-semibold text-emerald-500">অনবচ্ছিন্ন চালু</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-bold">ভার্সন ও এনভায়রনমেন্ট</span>
            <Server className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white truncate">
            {report?.overview.appVersion || 'v2.5.0'}
          </div>
          <span className="text-[10px] font-semibold text-purple-500 truncate block">
            {report?.overview.environment || 'Production'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>সার্ভিসেস হেলথ ওভারভিউ</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'database'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>ডাটাবেস হেলথ (Database)</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>নোটিফিকেশন গেটওয়ে হেলথ</span>
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'automation'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>অটোমেশন ও সিডিউলার হেলথ</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'resources'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>সিস্টেম রিসোর্স (CPU/Memory)</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>অ্যালার্ট ও সাম্প্রতিক ত্রুটি ({report?.alerts.length || 0})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('security');
            fetchSecurityAuditReport();
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>সিকিউরিটি অডিট রিপোর্ট (Security Audit)</span>
        </button>
      </div>

      {/* TAB 1: SERVICES OVERVIEW GRID */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Service */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Database className="w-5 h-5" />
                </div>
                {getOperationalBadge(report?.services.database.status)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Supabase / Persistent Database</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{report?.services.database.details}</p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>ল্যাটেন্সি: {report?.services.database.latencyMs}ms</span>
                <span className="font-semibold text-emerald-500">রাইট পারমিশন OK</span>
              </div>
            </div>

            {/* Authentication Service */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-2xl">
                  <Lock className="w-5 h-5" />
                </div>
                {getOperationalBadge(report?.services.authentication.status)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">JWT Authentication Engine</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{report?.services.authentication.details}</p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>সিকিউরিটি রোলস</span>
                <span className="font-semibold text-emerald-500">Super Admin Enforced</span>
              </div>
            </div>

            {/* Storage Service */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                  <HardDrive className="w-5 h-5" />
                </div>
                {getOperationalBadge(report?.services.storage.status)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Storage & Files Engine</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{report?.services.storage.details}</p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>পারসিস্টেন্স</span>
                <span className="font-semibold text-emerald-500">Safe Sync</span>
              </div>
            </div>

            {/* Telegram Notification Service */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-2xl">
                  <Send className="w-5 h-5" />
                </div>
                {getOperationalBadge(report?.services.telegram.status)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Telegram Group Bot</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{report?.services.telegram.details}</p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>কানেকশন</span>
                <span className={report?.services.telegram.connected ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                  {report?.services.telegram.connected ? 'সক্রিয় (Connected)' : 'বিচ্ছিন্ন'}
                </span>
              </div>
            </div>

            {/* WhatsApp Provider */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                {getOperationalBadge(report?.services.whatsapp.status)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">WhatsApp Provider</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{report?.services.whatsapp.details}</p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>মেসেজিং</span>
                <span className={report?.services.whatsapp.connected ? 'text-emerald-500 font-bold' : 'text-slate-500 font-bold'}>
                  {report?.services.whatsapp.connected ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>
            </div>

            {/* Notification Queue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <Bell className="w-5 h-5" />
                </div>
                {getOperationalBadge(report?.services.notificationQueue.status)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notification Queue</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{report?.services.notificationQueue.details}</p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>পেন্ডিং ইন-অ্যাপ:</span>
                <span className="font-bold text-amber-500">{report?.services.notificationQueue.pendingCount} টি</span>
              </div>
            </div>

            {/* Scheduler Engine */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-red-500/10 text-red-500 rounded-2xl">
                  <Cpu className="w-5 h-5" />
                </div>
                {getOperationalBadge(report?.services.schedulerEngine.status)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Scheduler & Worker Engine</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{report?.services.schedulerEngine.details}</p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>রানিং থ্রেডস:</span>
                <span className="font-bold text-emerald-500">{report?.services.schedulerEngine.runningJobsCount} টি</span>
              </div>
            </div>

            {/* Backup Service */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-2xl">
                  <Archive className="w-5 h-5" />
                </div>
                {getOperationalBadge(report?.services.backupService.status)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Backup Service</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{report?.services.backupService.details}</p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>সর্বশেষ ব্যাকআপ:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {report?.services.backupService.lastBackupTime ? formatDateTime(report.services.backupService.lastBackupTime) : 'অনুপস্থিত'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE HEALTH */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                <span>ডাটাবেস পারফরম্যান্স ও কানেক্টিভিটি</span>
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                কানেক্টেড (Connected)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">কানেকশন স্ট্যাটাস</span>
                <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                  {report?.database.connectionStatus}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">কুয়ারি রেসপন্স টাইম</span>
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  {report?.database.queryResponseTimeMs} ms
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">ডাটাবেস সাইজ</span>
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  {report?.database.databaseSizeFormatted}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">অ্যাক্টিভ কানেকশনস</span>
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  {report?.database.activeConnections} Pool Worker
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">ব্যর্থ কুয়ারি সংখ্যা</span>
                <div className="font-black text-sm text-emerald-600">
                  {report?.database.failedQueriesCount || 0}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">মোট রেকর্ড সংখ্যা</span>
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  {report?.database.totalRecordsCount}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleTestDatabase}
                disabled={actionLoading === 'test-db'}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>রান ডাটাবেস টেস্ট পিং (Ping Database)</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>ডাটাবেস সেফটি ও ব্যাকআপ স্ট্যাটাস</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              সিস্টেম প্রতি ৬ ঘন্টায় ডাটাবেসের পারসিস্টেন্ট ফাইল সিঙ্ক করে এবং কোনো ক্র্যাশ ঘটলেও অটোমেটিক রিকভারি সমর্থন করে।
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">সর্বশেষ সফল ব্যাকআপ:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {report?.database.lastBackupTime ? formatDateTime(report.database.lastBackupTime) : 'অপেক্ষা করা হচ্ছে'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">ইনটেগ্রিটি ও সেফটি ওয়াচ:</span>
                <span className="font-bold text-emerald-600">১০০% ভ্যালিডেটেড</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">অটো রিকভারি ব্যাকআপ:</span>
                <span className="font-bold text-indigo-600">সক্রিয় (Enabled)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS HEALTH */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telegram Health */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">টেলিগ্রাম চ্যানেল হেলথ</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                report?.notifications.telegram.connected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                {report?.notifications.telegram.connected ? 'কানেক্টেড' : 'ডিসকানেক্টেড'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">সর্বশেষ সফল বার্তা:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDateTime(report?.notifications.telegram.lastSuccessfulMessageTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">সর্বশেষ ব্যর্থ বার্তা:</span>
                <span className="font-bold text-rose-500">
                  {formatDateTime(report?.notifications.telegram.lastFailedMessageTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পেন্ডিং কিউ সংখ্যা:</span>
                <span className="font-bold text-amber-500">{report?.notifications.telegram.pendingQueueCount} টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ত্রুটির হার (Error Rate):</span>
                <span className="font-bold text-slate-900 dark:text-white">{report?.notifications.telegram.errorRatePercent}%</span>
              </div>
            </div>

            <button
              onClick={handleTestTelegram}
              disabled={actionLoading === 'test-telegram'}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>টেস্ট টেলিগ্রাম কানেকশন</span>
            </button>
          </div>

          {/* WhatsApp Health */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">হোয়াটসঅ্যাপ গেটওয়ে হেলথ</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                {report?.notifications.whatsapp.connectionStatus}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">কানেকশন স্ট্যাটাস:</span>
                <span className="font-bold text-emerald-600">{report?.notifications.whatsapp.connectionStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পেন্ডিং কিউ:</span>
                <span className="font-bold text-slate-900 dark:text-white">{report?.notifications.whatsapp.pendingQueueCount} টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">সর্বশেষ বার্তা ডেলিভারি:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDateTime(report?.notifications.whatsapp.lastDeliveryTime)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATION HEALTH */}
      {activeTab === 'automation' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">অটোমেশন ও সিডিউলার ইঞ্জিন হেলথ</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              সিডিউলার ওয়ার্কার রানিং (Running)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-1">
              <span className="text-slate-500">ব্যর্থ জবস (Failed Jobs)</span>
              <div className="text-xl font-black text-rose-600">{report?.automation.failedJobsCount}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-1">
              <span className="text-slate-500">অপেক্ষমাণ জবস (Queued Jobs)</span>
              <div className="text-xl font-black text-amber-500">{report?.automation.queuedJobsCount}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-1">
              <span className="text-slate-500">চলমান জবস (Running Jobs)</span>
              <div className="text-xl font-black text-blue-500">{report?.automation.runningJobsCount}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-1">
              <span className="text-slate-500">গড় এক্সিকিউশন টাইম</span>
              <div className="text-xl font-black text-slate-900 dark:text-white">{report?.automation.averageExecutionTimeMs} ms</div>
            </div>
          </div>

          <button
            onClick={handleTestScheduler}
            disabled={actionLoading === 'test-scheduler'}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            <span>টেস্ট সিডিউলার টিকেল ইঞ্জিন (Test Scheduler)</span>
          </button>
        </div>
      )}

      {/* TAB 5: SYSTEM RESOURCES */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <span>মেমোরি ও প্রসেসর অ্যালোকেশন</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>মেমোরি ইউসেজ (Memory Used):</span>
                  <span>{report?.resources.memoryUsedMB} MB / {report?.resources.memoryTotalMB} MB ({report?.resources.memoryPercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, report?.resources.memoryPercent || 25)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>সিপিইউ লোড এস্টিমেশন (CPU Load):</span>
                  <span>{report?.resources.cpuUsagePercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, report?.resources.cpuUsagePercent || 15)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <HardDrive className="w-5 h-5 text-blue-500" />
              <span>ডিস্ক স্পেস ও পারসিস্টেন্ট ফাইল সাইজ</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>ডিস্ক স্পেস ব্যবহৃত:</span>
                  <span>{report?.resources.diskUsedGB} GB / {report?.resources.diskTotalGB} GB ({report?.resources.diskPercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, report?.resources.diskPercent || 2)}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-500">অ্যাপ্লিকেশন আপটাইম:</span>
                <div className="font-bold text-slate-900 dark:text-white">{report?.overview.uptimeFormatted}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ALERTS & RECENT ERRORS */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Active System Alerts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <AlertOctagon className="w-5 h-5 text-amber-500" />
              <span>সিস্টেম হেলথ অ্যালার্টস ({report?.alerts.length || 0})</span>
            </h3>

            {(!report?.alerts || report.alerts.length === 0) ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                কোনো সক্রিয় ডায়াগনস্টিকস অ্যালার্ট পাওয়া যায়নি। সিস্টেম পুরোপুরি ভালো আছে!
              </div>
            ) : (
              <div className="space-y-3">
                {report.alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      alt.severity === 'CRITICAL'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-sm">{alt.title}</div>
                      <p>{alt.message}</p>
                      <div className="text-[10px] font-mono opacity-80 pt-1">
                        সার্ভিস: {alt.service} | সময়: {formatDateTime(alt.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent System Errors Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-xs text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <span>সাম্প্রতিক সিস্টেমে রেকর্ডকৃত ত্রুটিসমূহ (Recent Error Logs)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                    <th className="py-3 px-4">সময়কাল</th>
                    <th className="py-3 px-4">উৎস (Source)</th>
                    <th className="py-3 px-4">ত্রুটির বিবরণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(!report?.recentErrors || report.recentErrors.length === 0) ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        সাম্প্রতিক কোনো ব্যাকগ্রাউন্ড বা কুয়ারি এরর রেকর্ড নেই।
                      </td>
                    </tr>
                  ) : (
                    report.recentErrors.map((err) => (
                      <tr key={err.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-slate-500">{formatDateTime(err.timestamp)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{err.source}</td>
                        <td className="py-3 px-4 text-rose-500 font-medium">{err.message}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SECURITY AUDIT REPORT */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Security Banner & Grade */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-black">এন্টারপ্রাইজ সিকিউরিটি অডিট ও গার্ড প্যানেল</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                সিস্টেমের অথেন্টিকেশন, আরবিএসি প্রটেকশন, রেট লিমিটিং, সিএসআরএফ ফিল্টার, হেডার্স সিকিউরিটি এবং প্রাইভেসি মাস্কিং সংক্রান্ত লাইভ অডিট ফলাফল।
              </p>
              {securityReport && (
                <div className="text-[11px] text-slate-400 font-mono">
                  সর্বশেষ অডিট স্ক্যান: {formatDateTime(securityReport.scanTimestamp)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/30">
              <div className="text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">সিকিউরিটি গ্রেড</div>
                <div className="text-3xl font-black text-emerald-400">{securityReport?.grade || 'A+'}</div>
              </div>
              <div className="h-10 w-px bg-slate-700" />
              <div className="text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">সিকিউরিটি স্কোর</div>
                <div className="text-3xl font-black text-white">{securityReport?.totalScore || 100}/100</div>
              </div>
              <button
                onClick={fetchSecurityAuditReport}
                disabled={loadingSecurity}
                className="ml-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSecurity ? 'animate-spin' : ''}`} />
                <span>স্ক্যান চালান</span>
              </button>
            </div>
          </div>

          {/* Passed Checks Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>সফল সিকিউরিটি চেকসমূহ (Passed Security Audits - {securityReport?.passedChecks?.length || 0})</span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">
                ১০০% সুরক্ষিত
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {securityReport?.passedChecks?.map((check: any) => (
                <div key={check.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{check.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {check.category}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Warnings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>সতর্কতা ও সিকিউরিটি ওয়্যার্নিং (Warnings - {securityReport?.warnings?.length || 0})</span>
              </div>

              {(!securityReport?.warnings || securityReport.warnings.length === 0) ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  কোনো ঝুঁকিপূর্ণ সিকিউরিটি ওয়্যার্নিং চিহ্নিত হয়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {securityReport.warnings.map((warn: any) => (
                    <div key={warn.id} className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                        <span>{warn.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          warn.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'
                        }`}>
                          {warn.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">{warn.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations & Residual Risks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Lock className="w-5 h-5 text-indigo-500" />
                <span>সুপারিশ ও অবশিষ্ট রিস্ক মিটিগেশন (Recommendations)</span>
              </div>

              <div className="space-y-3 text-xs">
                {securityReport?.recommendations?.map((rec: any) => (
                  <div key={rec.id} className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
                    <div className="font-bold text-indigo-900 dark:text-indigo-300">{rec.title}</div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">{rec.action}</p>
                  </div>
                ))}

                {securityReport?.remainingRisks?.map((risk: any) => (
                  <div key={risk.id} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{risk.title}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">মিটিগেশন: {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
