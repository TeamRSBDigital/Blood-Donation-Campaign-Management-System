import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Zap,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Settings,
  ShieldCheck,
  Calendar,
  BarChart3,
  Terminal,
  ChevronRight,
  Info,
  Send,
  Database,
  History,
  Lock,
  Mail,
  MessageSquare,
  Bell
} from 'lucide-react';
import {
  AutomationJob,
  JobExecutionLog,
  AutomationDashboardStats,
  JobType,
  JobScheduleFrequency,
  JobStatus
} from '../../types/index.js';

export const AutomationManager: React.FC = () => {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [logs, setLogs] = useState<JobExecutionLog[]>([]);
  const [stats, setStats] = useState<AutomationDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'jobs' | 'logs' | 'analytics' | 'future'>('jobs');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<AutomationJob | null>(null);
  const [selectedLog, setSelectedLog] = useState<JobExecutionLog | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    type: JobType;
    description: string;
    frequency: JobScheduleFrequency;
    cronExpression: string;
    maxRetries: number;
    exponentialBackoff: boolean;
    configIntervalMinutes: number;
    configRetentionDays: number;
  }>({
    name: '',
    type: 'QUEUE_PROCESSING',
    description: '',
    frequency: 'HOURLY',
    cronExpression: '0 * * * *',
    maxRetries: 3,
    exponentialBackoff: true,
    configIntervalMinutes: 15,
    configRetentionDays: 90
  });

  // Message / Toast State
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

  const fetchData = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    else setLoading(true);

    try {
      const [jobsRes, logsRes] = await Promise.all([
        fetch('/api/automation/jobs', { headers: getAuthHeader() }),
        fetch('/api/automation/logs', { headers: getAuthHeader() })
      ]);

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs || []);
        if (data.stats) setStats(data.stats);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch automation data:', err);
      showToast('অটোমেশন তথ্য লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 15 seconds
    const interval = setInterval(() => {
      fetchData(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRunNow = async (job: AutomationJob) => {
    setActionLoading(`run-${job.id}`);
    try {
      const res = await fetch(`/api/automation/jobs/${job.id}/run`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`'${job.name}' জবটি সফলভাবে সম্পন্ন হয়েছে [সময়কাল: ${data.durationMs}ms]`, 'success');
      } else {
        showToast(`জব এক্সিকিউশন ব্যর্থ: ${data.details || data.error}`, 'error');
      }
      fetchData(true);
    } catch (err) {
      showToast('জব চালু করতে নেটওয়ার্ক সমস্যা হয়েছে', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePause = async (job: AutomationJob) => {
    const isPaused = job.status === 'PAUSED';
    const endpoint = isPaused ? `/api/automation/jobs/${job.id}/resume` : `/api/automation/jobs/${job.id}/pause`;
    setActionLoading(`toggle-${job.id}`);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) {
        showToast(isPaused ? `'${job.name}' সক্রিয় করা হয়েছে` : `'${job.name}' সাময়িক স্থগিত করা হয়েছে`, 'info');
        fetchData(true);
      } else {
        showToast('স্ট্যাটাস আপডেট করা সম্ভব হয়নি', 'error');
      }
    } catch (err) {
      showToast('নেটওয়ার্ক ত্রুটি', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (job: AutomationJob) => {
    setActionLoading(`dup-${job.id}`);
    try {
      const res = await fetch(`/api/automation/jobs/${job.id}/duplicate`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) {
        showToast(`'${job.name}' জবটির অনুলিপি সফলভাবে তৈরি হয়েছে`, 'success');
        fetchData(true);
      } else {
        showToast('জব ডুপ্লিকেট করা সম্ভব হয়নি', 'error');
      }
    } catch (err) {
      showToast('নেটওয়ার্ক ত্রুটি', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (job: AutomationJob) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে '${job.name}' জবটি রিমুভ করতে চান?`)) return;
    setActionLoading(`del-${job.id}`);
    try {
      const res = await fetch(`/api/automation/jobs/${job.id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        showToast(`'${job.name}' জবটি ডিলিট করা হয়েছে`, 'info');
        fetchData(true);
      } else {
        showToast('জব ডিলিট করা যায়নি', 'error');
      }
    } catch (err) {
      showToast('নেটওয়ার্ক ত্রুটি', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setFormData({
      name: '',
      type: 'QUEUE_PROCESSING',
      description: '',
      frequency: 'HOURLY',
      cronExpression: '0 * * * *',
      maxRetries: 3,
      exponentialBackoff: true,
      configIntervalMinutes: 15,
      configRetentionDays: 90
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: AutomationJob) => {
    setEditingJob(job);
    setFormData({
      name: job.name,
      type: job.type,
      description: job.description,
      frequency: job.frequency,
      cronExpression: job.cronExpression || '0 * * * *',
      maxRetries: job.maxRetries || 3,
      exponentialBackoff: job.exponentialBackoff ?? true,
      configIntervalMinutes: job.config?.intervalMinutes || 15,
      configRetentionDays: job.config?.retentionDays || 90
    });
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('জবের একটি নাম প্রদান করুন', 'error');
      return;
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      description: formData.description,
      frequency: formData.frequency,
      cronExpression: formData.frequency === 'CUSTOM_CRON' ? formData.cronExpression : undefined,
      maxRetries: Number(formData.maxRetries),
      exponentialBackoff: formData.exponentialBackoff,
      config: {
        intervalMinutes: formData.configIntervalMinutes,
        retentionDays: formData.configRetentionDays
      }
    };

    try {
      const isEdit = !!editingJob;
      const url = isEdit ? `/api/automation/jobs/${editingJob.id}` : '/api/automation/jobs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(isEdit ? 'জব কনফিগারেশন আপডেট করা হয়েছে' : 'নতুন জব সফলভাবে তৈরি করা হয়েছে', 'success');
        setIsModalOpen(false);
        fetchData(true);
      } else {
        showToast('জব সংরক্ষণে সমস্যা হয়েছে', 'error');
      }
    } catch (err) {
      showToast('নেটওয়ার্ক ত্রুটি', 'error');
    }
  };

  // Filtered Jobs
  const filteredJobs = jobs.filter(j => {
    const matchesQuery = j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         j.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         j.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || j.type === typeFilter;
    return matchesQuery && matchesStatus && matchesType;
  });

  // Filtered Logs
  const filteredLogs = logs.filter(l => {
    return l.jobName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.jobType.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (l.details && l.details.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <RefreshCw className="w-3 h-3 animate-spin" />
            চলমান (Running)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            সম্পন্ন (Completed)
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            ব্যর্থ (Failed)
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Pause className="w-3 h-3" />
            স্থগিত (Paused)
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <XCircle className="w-3 h-3" />
            নিষ্ক্রিয় (Disabled)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Clock className="w-3 h-3" />
            অপেক্ষমাণ (Pending)
          </span>
        );
    }
  };

  const getFrequencyLabel = (freq: JobScheduleFrequency, cron?: string) => {
    switch (freq) {
      case 'EVERY_MINUTE': return 'প্রতি ১ মিনিট পর পর';
      case 'EVERY_5_MINS': return 'প্রতি ৫ মিনিট পর পর';
      case 'EVERY_15_MINS': return 'প্রতি ১৫ মিনিট পর পর';
      case 'HOURLY': return 'প্রতি ঘন্টায় ১ বার';
      case 'DAILY': return 'প্রতিদিন ১ বার';
      case 'WEEKLY': return 'সাপ্তাহিক (প্রতি ৭ দিনে ১ বার)';
      case 'MONTHLY': return 'মাসিক (প্রতি ৩০ দিনে ১ বার)';
      case 'CUSTOM_CRON': return `ক্রন এক্সপ্রেশন: ${cron || '* * * * *'}`;
      default: return freq;
    }
  };

  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return 'এখনো চালুর রেকর্ড নেই';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('bn-BD', {
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
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}
        >
          <Info className="w-4 h-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
              <Cpu className="w-3.5 h-3.5" />
              <span>সুপার এডমিন কনট্রোল সেন্টার</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              অটোমেশন ও ব্যাকগ্রাউন্ড সিডিউলার ইঞ্জিন
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              স্বয়ংক্রিয় কাজের সিডিউলিং, ব্যাকগ্রাউন্ড কিউ প্রসেসিং, ক্রিটিক্যাল রিমাইন্ডার, অটোমেটিক ব্যাকআপ ও ক্র্যাশ রিট্রাই পলিসি ম্যানেজমেন্ট।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-2xl border border-slate-700 transition-all flex items-center gap-2 text-xs font-bold"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-red-400' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl shadow-lg shadow-red-600/30 transition-all font-bold text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সিডিউলড জব</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Analytics Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">মোট জবস</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats?.totalJobs || jobs.length}
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">সিস্টেম নিবন্ধিত</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">চলমান জবস</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
            {stats?.runningJobs || 0}
          </div>
          <span className="text-[10px] font-semibold text-blue-500">ব্যাকগ্রাউন্ডে সক্রিয়</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">সম্পন্ন এক্সিকিউশন</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats?.completedJobs || 0}
          </div>
          <span className="text-[10px] font-semibold text-emerald-500">সফল ব্যাকগ্রাউন্ড রান</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">ব্যর্থ জবস</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {stats?.failedJobs || 0}
          </div>
          <span className="text-[10px] font-semibold text-rose-500">ক্র্যাশ বা ত্রুটিযুক্ত</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">সাকসেস রেট</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats?.successRatePercent || 100}%
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">গড় রান টাইম: {stats?.averageExecutionTimeMs || 0}ms</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">পরবর্তী এক্সিকিউশন</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate" title={formatDateTime(stats?.nextExecution)}>
            {stats?.nextExecution ? new Date(stats.nextExecution).toLocaleTimeString('bn-BD', { timeStyle: 'short' }) : 'অপেক্ষমাণ'}
          </div>
          <span className="text-[10px] font-semibold text-indigo-500">অটোমেটিক সিডিউলিং</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>জব সার্ভিসেস ও সিডিউলার ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>এক্সিকিউশন লোগ ও হিস্টোরি ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>সিস্টেম এনালাইটিক্স</span>
          </button>

          <button
            onClick={() => setActiveTab('future')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'future'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>ভবিষ্যৎ চ্যানেল (Email/SMS/Push)</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      {(activeTab === 'jobs' || activeTab === 'logs') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="জব বা লোগ টাইটেল দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {activeTab === 'jobs' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="PENDING">অপেক্ষমাণ (Pending)</option>
                <option value="RUNNING">চলমান (Running)</option>
                <option value="COMPLETED">সম্পন্ন (Completed)</option>
                <option value="FAILED">ব্যর্থ (Failed)</option>
                <option value="PAUSED">স্থগিত (Paused)</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">সকল জব টাইপ</option>
                <option value="CRITICAL_REMINDER">Critical Blood Reminder</option>
                <option value="AUTO_BACKUP">Database Backup</option>
                <option value="QUEUE_PROCESSING">Notification Queue</option>
                <option value="TELEGRAM_RETRY">Telegram Retry Engine</option>
                <option value="REQUEST_EXPIRATION">Blood Request Expiration</option>
                <option value="INACTIVE_DONOR_REMINDER">Inactive Donor Reminder</option>
                <option value="LOG_CLEANUP">Log Cleanup</option>
                <option value="SESSION_CLEANUP">Session Cleanup</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: JOBS MANAGEMENT */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <Cpu className="w-12 h-12 mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">কোনো অটোমেশন জব পাওয়া যায়নি</h3>
              <p className="text-xs">আপনার ফিল্টার বা সার্চ ক্রাইটেরিয়া পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(job.status)}
                        {job.isBuiltIn && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            বিল্ট-ইন জেনুইন
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                        {job.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDuplicate(job)}
                        disabled={actionLoading === `dup-${job.id}`}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="অনুলিপি তৈরি (Duplicate)"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(job)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="সম্পাদনা (Edit)"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>

                      {!job.isBuiltIn && (
                        <button
                          onClick={() => handleDelete(job)}
                          disabled={actionLoading === `del-${job.id}`}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="ডিলিট (Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-500" /> ফ্রিকোয়েন্সি:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{getFrequencyLabel(job.frequency, job.cronExpression)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-500" /> পরবর্তী রান:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatDateTime(job.nextRun)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold flex items-center gap-1">
                        <History className="w-3 h-3 text-emerald-500" /> সর্বশেষ রান:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatDateTime(job.lastRun)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-amber-500" /> রিট্রাই লিমিট:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {job.retryCount || 0} / {job.maxRetries} (Exponential Backoff)
                      </span>
                    </div>
                  </div>

                  {job.lastError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-[11px] text-rose-600 dark:text-rose-400 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">সর্বশেষ ত্রুটি: {job.lastError}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleRunNow(job)}
                    disabled={actionLoading === `run-${job.id}` || job.status === 'RUNNING'}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {actionLoading === `run-${job.id}` ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>এখনই রান করুন (Run Now)</span>
                  </button>

                  <button
                    onClick={() => handleTogglePause(job)}
                    disabled={actionLoading === `toggle-${job.id}`}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      job.status === 'PAUSED'
                        ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/30'
                    }`}
                  >
                    {job.status === 'PAUSED' ? 'রিসিউম' : 'পজ'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: EXECUTION LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-4">জব নাম ও টাইপ</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4">শুরুর সময়</th>
                  <th className="py-3.5 px-4">সময়কাল (Duration)</th>
                  <th className="py-3.5 px-4">বিস্তারিত আউটপুট ও এরর</th>
                  <th className="py-3.5 px-4 text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      কোনো এক্সিকিউশন লোগ রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{log.jobName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{log.jobType}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {log.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> সফল
                          </span>
                        ) : log.status === 'RETRYING' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <RotateCcw className="w-3 h-3 animate-spin" /> রিট্রাই চেঞ্জ #{log.retryAttempt}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="w-3 h-3" /> ফেল্ড
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {formatDateTime(log.startedAt)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {log.durationMs}ms
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {log.error ? (
                          <span className="text-rose-500 font-medium">ত্রুটি: {log.error}</span>
                        ) : (
                          <span>{log.details || 'সফলভাবে প্রসেস সম্পন্ন'}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                        >
                          ডিটেইলস
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & MONITORING */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>কনকারেন্সি ও আইসোলেশন সেফটি</span>
                </h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                  সক্রিয় (Active Guard)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ব্যাকগ্রাউন্ড মেমোরি ফ্ল্যাগ ও থ্রেড সেফটি গার্ড সক্রিয় রয়েছে। একই সময় কোনো ডুপ্লিকেট জব দ্বৈতভাবে এক্সিকিউট হওয়া সম্পূর্ণ প্রতিরোধ করা হয়।
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">কনকারেন্সি কন্ট্রোল:</span>
                  <span className="font-bold text-emerald-600">Mutex Locks & Thread Isolation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">রিট্রাই পলিসি:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Exponential Backoff Strategy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ম্যাক্স রিট্রাই থ্রেশহোল্ড:</span>
                  <span className="font-bold text-slate-900 dark:text-white">কনফিগারেবল (৩ - ৫ বার)</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-500" />
                  <span>পারফরম্যান্স ও রিসোর্স ব্যবহার</span>
                </h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600">
                  অপটিমাইজড
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                এসিঙ্ক্রোনাস নন-ব্লকিং প্রসেসরের মাধ্যমে সিডিউলড ব্যাকগ্রাউন্ড জবসমূহ সম্পন্ন হওয়ায় ব্যবহারকারীদের ব্রাউজিং ও এপিআই রিকোয়েস্টে কোনো লেগ ঘটে না।
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">গড় এক্সিকিউশন টাইম:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stats?.averageExecutionTimeMs || 340} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">সাকসেস রেট:</span>
                  <span className="font-bold text-emerald-600">{stats?.successRatePercent || 98.5}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ব্যাকগ্রাউন্ড টাইমার টিকেল:</span>
                  <span className="font-bold text-indigo-600">প্রতি ৩০ সেকেন্ডে সিঙ্ক</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FUTURE CHANNELS */}
      {activeTab === 'future' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs relative overflow-hidden">
            <div className="p-3 bg-blue-500/10 text-blue-500 w-fit rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">ইমেইল নোটিফিকেশন ইঞ্জিন (Email Channel)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              SMTP / SendGrid ইন্টিগ্রেশন যার মাধ্যমে রক্তদানের আহবান ও মাসিক রিপোর্ট ইমেইলে প্রেরিত হবে।
            </p>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600">
              পরবর্তী রিলিজ ভার্সনে প্রস্তুত
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs relative overflow-hidden">
            <div className="p-3 bg-amber-500/10 text-amber-500 w-fit rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">এসএমএস গেটওয়ে (SMS Notifications)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              বাংলাদেশের লোকাল বাল্ক এসএমএস গেটওয়ের মাধ্যমে অফলাইন রক্তদাতাদের কাছে জরুরী মেসেজ পৌঁছাবে।
            </p>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
              ভবিষ্যৎ মডিউল হিসেবে সংরক্ষিত
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs relative overflow-hidden">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 w-fit rounded-2xl">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">ওয়েব পুশ নোটিফিকেশন (Push Channel)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              PWA Web Push সার্ভিস ব্যবহার করে ইউজার ও ডোনার ব্রাউজারে ইনস্ট্যান্ট রক্তদানের পুশ অ্যালার্ট পাঠানো যাবে।
            </p>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
              ভবিষ্যৎ মডিউল হিসেবে সংরক্ষিত
            </span>
          </div>
        </div>
      )}

      {/* CREATE / EDIT JOB MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingJob ? 'সিডিউলড জব সম্পাদনা করুন' : 'নতুন সিডিউলড ব্যাকগ্রাউন্ড জব তৈরি'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  জব টাইটেল / নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ডেইলি অটোমেটিক ব্যাকআপ বা কিউ প্রসেসর"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    জব টাইপ (Job Type)
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as JobType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  >
                    <option value="CRITICAL_REMINDER">Critical Blood Reminder</option>
                    <option value="AUTO_BACKUP">Automatic Backup</option>
                    <option value="QUEUE_PROCESSING">Queue Processor</option>
                    <option value="TELEGRAM_RETRY">Telegram Retry</option>
                    <option value="REQUEST_EXPIRATION">Request Expiration</option>
                    <option value="INACTIVE_DONOR_REMINDER">Inactive Donor Reminder</option>
                    <option value="LOG_CLEANUP">Log Cleanup</option>
                    <option value="SESSION_CLEANUP">Session Cleanup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সিডিউল ফ্রিকোয়েন্সি
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as JobScheduleFrequency })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  >
                    <option value="EVERY_MINUTE">প্রতি ১ মিনিটে (Every Minute)</option>
                    <option value="EVERY_5_MINS">প্রতি ৫ মিনিটে (Every 5 Mins)</option>
                    <option value="EVERY_15_MINS">প্রতি ১৫ মিনিটে (Every 15 Mins)</option>
                    <option value="HOURLY">প্রতি ঘন্টায় (Hourly)</option>
                    <option value="DAILY">প্রতিদিন (Daily)</option>
                    <option value="WEEKLY">সাপ্তাহিক (Weekly)</option>
                    <option value="MONTHLY">মাসিক (Monthly)</option>
                    <option value="CUSTOM_CRON">কাস্টম ক্রন (Custom Cron Expression)</option>
                  </select>
                </div>
              </div>

              {formData.frequency === 'CUSTOM_CRON' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    কাস্টম ক্রন এক্সপ্রেশন (Cron Expression)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: 0 0 * * *"
                    value={formData.cronExpression}
                    onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                    className="w-full font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    স্ট্যান্ডার্ড ৫-অংশের ক্রন এক্সপ্রেশন (যেমন: `*/15 * * * *` = প্রতি ১৫ মিনিট)।
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিবরণ (Description)
                </label>
                <textarea
                  rows={2}
                  placeholder="জবটি কি কাজ সম্পন্ন করে সংক্ষেপে লিখুন..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সর্বোচ্চ রিট্রাই সংখ্যা (Max Retries)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.maxRetries}
                    onChange={(e) => setFormData({ ...formData, maxRetries: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="exponentialBackoff"
                    checked={formData.exponentialBackoff}
                    onChange={(e) => setFormData({ ...formData, exponentialBackoff: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded-xs border-slate-300 focus:ring-red-500"
                  />
                  <label htmlFor="exponentialBackoff" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Exponential Backoff প্রয়োগ করুন
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20"
                >
                  {editingJob ? 'হালনাগাদ সংরক্ষণ' : 'জব সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG DETAILS MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-red-500" />
                <span>এক্সিকিউশন লোগ ডিটেইলস</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">জব নাম:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedLog.jobName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">জব টাইপ:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedLog.jobType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">স্ট্যাটাস:</span>
                <span className="font-bold">{selectedLog.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">শুরুর সময়:</span>
                <span>{formatDateTime(selectedLog.startedAt)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">স্থায়িত্ব:</span>
                <span className="font-mono font-bold text-emerald-600">{selectedLog.durationMs} ms</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block font-semibold">আউটপুট লোগ ও বিবরণ:</span>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] leading-relaxed break-words max-h-40 overflow-y-auto">
                  {selectedLog.details || 'কোনো বিশদ বিবরণ নেই'}
                </div>
              </div>
              {selectedLog.error && (
                <div className="space-y-1">
                  <span className="text-rose-500 block font-semibold">এরর ট্রাইস (Error Message):</span>
                  <div className="bg-rose-950/40 border border-rose-900/50 text-rose-300 p-3 rounded-xl font-mono text-[11px] leading-relaxed break-words">
                    {selectedLog.error}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
