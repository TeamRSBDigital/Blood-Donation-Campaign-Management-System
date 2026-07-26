import React, { useState, useEffect, useMemo } from 'react';
import { AuditLog, UserRole } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  ShieldAlert,
  Clock,
  User,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Laptop,
  Globe,
  Calendar,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Copy,
  Check,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldCheck,
  Database
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AuditLogViewer: React.FC = () => {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Selected Log Drawer / Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'diff' | 'json'>('overview');
  const [copiedJson, setCopiedJson] = useState(false);

  // Clear Logs Modal
  const [showClearModal, setShowClearModal] = useState(false);
  const [preserveSecurityLogs, setPreserveSecurityLogs] = useState(true);
  const [clearConfirmationText, setClearConfirmationText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  // Export Modal & Status
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('xlsx');

  // Retention Settings Modal
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [retentionDays, setRetentionDays] = useState<number>(90);
  const [savingRetention, setSavingRetention] = useState(false);

  // Toast Feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToastMsg = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setLogs(Array.isArray(data) ? data : []);
        }
      } else if (res.status === 403) {
        showToastMsg('আপনার অডিট লগের তথ্য দেখার অনুমতি নেই।', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  // Load retention setting from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.activityLogRetentionDays !== undefined) {
            setRetentionDays(data.activityLogRetentionDays);
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Filter Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          (log.action && log.action.toLowerCase().includes(q)) ||
          (log.details && log.details.toLowerCase().includes(q)) ||
          (log.actorName && log.actorName.toLowerCase().includes(q)) ||
          (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
          (log.ipAddress && log.ipAddress.toLowerCase().includes(q)) ||
          (log.module && log.module.toLowerCase().includes(q)) ||
          (log.targetRecordId && log.targetRecordId.toLowerCase().includes(q)) ||
          (log.id && log.id.toLowerCase().includes(q));

        if (!matchSearch) return false;
      }

      // Role Filter
      if (selectedRole !== 'ALL' && log.actorRole !== selectedRole) {
        return false;
      }

      // Module Filter
      if (selectedModule !== 'ALL' && log.module !== selectedModule) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== 'ALL') {
        const status = log.status || 'SUCCESS';
        if (status !== selectedStatus) return false;
      }

      // Date Range Filter
      if (dateRange !== 'ALL') {
        const logDate = new Date(log.timestamp);
        const now = new Date();

        if (dateRange === 'TODAY') {
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (logDate < startOfDay) return false;
        } else if (dateRange === 'YESTERDAY') {
          const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (logDate < startOfYesterday || logDate >= endOfYesterday) return false;
        } else if (dateRange === 'LAST_7_DAYS') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (logDate < sevenDaysAgo) return false;
        } else if (dateRange === 'LAST_30_DAYS') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (logDate < thirtyDaysAgo) return false;
        } else if (dateRange === 'CUSTOM') {
          if (customStartDate && logDate < new Date(customStartDate)) return false;
          if (customEndDate && logDate > new Date(customEndDate + 'T23:59:59')) return false;
        }
      }

      return true;
    });
  }, [logs, searchQuery, selectedRole, selectedModule, selectedStatus, dateRange, customStartDate, customEndDate]);

  // Dashboard Summary Metrics
  const stats = useMemo(() => {
    const total = logs.length;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayCount = logs.filter((l) => new Date(l.timestamp) >= todayStart).length;

    const securityCount = logs.filter(
      (l) => l.module === 'SECURITY' || l.status === 'FAILED' || l.status === 'WARNING' || (l.action && l.action.includes('SECURITY'))
    ).length;

    const todayActors = new Set(
      logs.filter((l) => new Date(l.timestamp) >= todayStart && l.actorName).map((l) => l.actorName)
    ).size;

    return { total, todayCount, securityCount, todayActors };
  }, [logs]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRole('ALL');
    setSelectedModule('ALL');
    setSelectedStatus('ALL');
    setDateRange('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setCurrentPage(1);
  };

  // Clear Logs Handler
  const handleClearAuditLogs = async () => {
    if (clearConfirmationText.trim() !== 'CLEAR LOGS') {
      showToastMsg('নিশ্চিতকরণের জন্য "CLEAR LOGS" সঠিকভাবে টাইপ করুন।', 'error');
      return;
    }

    setIsClearing(true);
    try {
      const res = await fetch('/api/audit-logs/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ preserveSecurityLogs })
      });

      if (res.ok) {
        const data = await res.json();
        showToastMsg(data.message || 'অডিট লগ সফলভাবে ক্লিয়ার করা হয়েছে।', 'success');
        setShowClearModal(false);
        setClearConfirmationText('');
        fetchLogs();
      } else {
        const errData = await res.json();
        showToastMsg(errData.error || 'অডিট লগ ক্লিয়ার করতে ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToastMsg('সার্ভারের সাথে যোগাযোগ করা সম্ভব হয়নি।', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  // Export Handler
  const handleExportLogs = () => {
    if (filteredLogs.length === 0) {
      showToastMsg('এক্সপোর্ট করার জন্য কোনো ডাটা নেই।', 'error');
      return;
    }

    const exportData = filteredLogs.map((log) => ({
      'Log ID': log.id,
      'Date & Time': new Date(log.timestamp).toLocaleString(),
      'Actor Name': log.actorName,
      'Actor Role': log.actorRole,
      'Actor Email': log.actorEmail || '',
      'Action Code': log.action,
      'Module': log.module || 'SYSTEM',
      'Description': log.details,
      'Status': log.status || 'SUCCESS',
      'IP Address': log.ipAddress || '',
      'Browser': log.browser || '',
      'OS': log.os || '',
      'Device': log.deviceType || '',
      'Target Record ID': log.targetRecordId || '',
      'Request URL': log.requestUrl || ''
    }));

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `PBDA_Audit_Logs_${dateStr}`;

    if (exportFormat === 'csv' || exportFormat === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs');

      if (exportFormat === 'xlsx') {
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      } else {
        XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
      }
      showToastMsg(`সফলভাবে ${exportData.length} টি রেকর্ড এক্সপোর্ট করা হয়েছে।`, 'success');
    } else if (exportFormat === 'pdf') {
      // Print view for PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>PBDA - Audit Logs Report</title>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1e293b; }
                h2 { color: #dc2626; border-bottom: 2px solid #ef4444; padding-bottom: 8px; }
                .meta { font-size: 12px; color: #64748b; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
                th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
                th { background-color: #f1f5f9; font-weight: bold; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .badge { padding: 2px 6px; borderRadius: 4px; font-weight: bold; font-size: 10px; }
                .success { background: #dcfce7; color: #15803d; }
                .failed { background: #fee2e2; color: #b91c1c; }
              </style>
            </head>
            <body>
              <h2>পাংশা ব্লাড ডোনার্স এসোসিয়েশন - সিকিউরিটি অডিট রিপোর্ট</h2>
              <div class="meta">
                প্রিন্ট সময়: ${new Date().toLocaleString()} | মোট রেকর্ড: ${exportData.length} | প্রস্তুতকারক: ${user?.name || 'Super Admin'}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>তারিখ ও সময়</th>
                    <th>অ্যাক্টর</th>
                    <th>ভূমিকা</th>
                    <th>মডিউল</th>
                    <th>অ্যাকশন</th>
                    <th>বিবরণ</th>
                    <th>আইপি</th>
                    <th>স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredLogs
                    .map(
                      (l) => `
                    <tr>
                      <td>${new Date(l.timestamp).toLocaleString()}</td>
                      <td><b>${l.actorName}</b></td>
                      <td>${l.actorRole}</td>
                      <td>${l.module || 'SYSTEM'}</td>
                      <td><b>${l.action}</b></td>
                      <td>${l.details}</td>
                      <td>${l.ipAddress || '-'}</td>
                      <td><span class="badge ${l.status === 'FAILED' ? 'failed' : 'success'}">${l.status || 'SUCCESS'}</span></td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
              <script>
                window.onload = function() { window.print(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      showToastMsg('প্রিন্ট প্রিভিউ প্রস্তুত করা হয়েছে।', 'success');
    }

    setShowExportModal(false);
  };

  // Save Retention Setting
  const handleSaveRetention = async () => {
    setSavingRetention(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ activityLogRetentionDays: retentionDays })
      });

      if (res.ok) {
        showToastMsg(`অডিট লগ সংরক্ষণ মেয়াদ ${retentionDays} দিনে নির্ধারণ করা হয়েছে।`, 'success');
        setShowRetentionModal(false);
      } else {
        showToastMsg('সেটিংস আপডেট করতে ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToastMsg('সার্ভার কানেকশনে সমস্যা হয়েছে।', 'error');
    } finally {
      setSavingRetention(false);
    }
  };

  // Helper function for role badge color
  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'VOLUNTEER':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'GUEST':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // Helper function for status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>সফল</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
            <span>ব্যর্থ</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>সতর্কতা</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            <span>সফল</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <ShieldAlert className="w-4 h-4 text-red-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Title Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                এক্টিভিটি লোগ ও অডিট ট্রেইল (Activity Logs & Audit Trail)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                সিস্টেমের সকল গুরুত্বপূর্ণ একশন, নিরাপত্তা ইভেন্ট ও ইউজার কার্যক্রমের অপরিবর্তনযোগ্য লোগ রেকর্ড
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchLogs}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-red-500' : ''}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>লগ এক্সপোর্ট</span>
          </button>

          <button
            onClick={() => setShowRetentionModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Database className="w-4 h-4 text-amber-500" />
            <span>লগ পলিসি ({retentionDays} দিন)</span>
          </button>

          {user?.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => setShowClearModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-2 transition-colors border border-red-200 dark:border-red-900/50"
            >
              <Trash2 className="w-4 h-4" />
              <span>লগ ক্লিয়ার</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Log Entries */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট অডিট রেকর্ড</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total.toLocaleString()}</h3>
          </div>
        </div>

        {/* Today's Activities */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">আজকের কার্যক্রম</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.todayCount.toLocaleString()}</h3>
          </div>
        </div>

        {/* Security & Failed Events */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">সিকিউরিটি ও অ্যালার্ট</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{stats.securityCount.toLocaleString()}</h3>
          </div>
        </div>

        {/* Active Users Today */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">আজকের সক্রিয় ব্যবহারকারী</p>
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{stats.todayActors} জন</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
            <SlidersHorizontal className="w-4 h-4 text-red-600" />
            <span>সার্চ ও ফিল্টারিং প্যানেল</span>
            <span className="text-[11px] font-normal text-slate-400">({filteredLogs.length} টি ফলাফল পাওয়া গেছে)</span>
          </div>

          {(searchQuery || selectedRole !== 'ALL' || selectedModule !== 'ALL' || selectedStatus !== 'ALL' || dateRange !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>ফিল্টার রিসেট করুন</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Live Search */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="সার্চ (অ্যাকশন, ইউজার, ইমেইল, আইপি, বিবরন)..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">সকল মডিউল (Modules)</option>
              <option value="AUTH">অথেনটিকেশন (AUTH)</option>
              <option value="DONORS">রক্তদাতা (DONORS)</option>
              <option value="BLOOD_REQUESTS">রক্তের চাহিদা (BLOOD_REQUESTS)</option>
              <option value="USERS">ইউজার ও রোল (USERS)</option>
              <option value="SETTINGS">সেটিংস (SETTINGS)</option>
              <option value="TELEGRAM">টেলিগ্রাম (TELEGRAM)</option>
              <option value="WHATSAPP">হোয়াটসঅ্যাপ (WHATSAPP)</option>
              <option value="EXPORT">এক্সপোর্ট (EXPORT)</option>
              <option value="BACKUP">ব্যাকআপ (BACKUP)</option>
              <option value="SECURITY">সিকিউরিটি (SECURITY)</option>
              <option value="SYSTEM">সিস্টেম (SYSTEM)</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">সকল ভূমিকা (Roles)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="VOLUNTEER">VOLUNTEER</option>
              <option value="SYSTEM">SYSTEM</option>
              <option value="GUEST">GUEST</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">সকল স্ট্যাটাস (Status)</option>
              <option value="SUCCESS">সফল (SUCCESS)</option>
              <option value="FAILED">ব্যর্থ (FAILED)</option>
              <option value="WARNING">সতর্কতা (WARNING)</option>
            </select>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>সময়সীমা:</span>
          </span>

          {[
            { id: 'ALL', label: 'সকল সময়' },
            { id: 'TODAY', label: 'আজকে' },
            { id: 'YESTERDAY', label: 'গতকাল' },
            { id: 'LAST_7_DAYS', label: 'গত ৭ দিন' },
            { id: 'LAST_30_DAYS', label: 'গত ৩০ দিন' },
            { id: 'CUSTOM', label: 'কাস্টম রেঞ্জ' }
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setDateRange(d.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                dateRange === d.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {d.label}
            </button>
          ))}

          {dateRange === 'CUSTOM' && (
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white"
              />
              <span className="text-slate-400">থেকে</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">তারিখ ও সময়</th>
                <th className="p-4">ব্যবহারকারী / অ্যাক্টর</th>
                <th className="p-4">অ্যাকশন ও মডিউল</th>
                <th className="p-4">বিবরণ</th>
                <th className="p-4">আইপি ও নেটওয়ার্ক</th>
                <th className="p-4">স্ট্যাটাস</th>
                <th className="p-4 text-right">ভিউ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-500 mb-2" />
                    <span>অডিট লগ লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-600 dark:text-slate-300">কোনো অডিট রেকর্ড পাওয়া যায়নি।</p>
                    <p className="text-xs text-slate-400 mt-1">প্রদত্ত ফিল্টার অনুযায়ী কোনো লোগ ডাটাবেজে সংরক্ষিত নেই।</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedLog(log);
                      setDetailTab('overview');
                    }}
                  >
                    {/* Timestamp */}
                    <td className="p-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {new Date(log.timestamp).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700">
                          {log.actorName ? log.actorName.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{log.actorName || 'System'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold border ${getRoleBadgeClass(
                                log.actorRole
                              )}`}
                            >
                              {log.actorRole || 'SYSTEM'}
                            </span>
                            {log.actorEmail && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{log.actorEmail}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action & Module */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-extrabold text-red-600 dark:text-red-400 text-xs tracking-tight">
                        {log.action}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {log.module || 'SYSTEM'}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="p-4 max-w-xs">
                      <div className="text-slate-800 dark:text-slate-200 font-medium line-clamp-2 leading-snug">
                        {log.details}
                      </div>
                      {log.targetRecordId && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: <span className="text-red-500 font-bold">{log.targetRecordId}</span>
                        </div>
                      )}
                    </td>

                    {/* IP & Device */}
                    <td className="p-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      <div>{log.ipAddress || '127.0.0.1'}</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {log.os || 'Windows'} / {log.browser || 'Chrome'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>

                    {/* Actions */}
                    <td className="p-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                          setDetailTab('overview');
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-red-600 group-hover:text-white transition-all shadow-xs"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>প্রতি পেজে সারির সংখ্যা:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2 font-medium">
              দেখাচ্ছে {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} (সর্বমোট {filteredLogs.length} টি)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-slate-800 dark:text-slate-200">
              পেজ {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Viewer Side Drawer / Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-red-600 dark:text-red-400 font-mono">
                    {selectedLog.id}
                  </span>
                  {getStatusBadge(selectedLog.status)}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedLog.action}
                </h3>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-2xl bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-300 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-2">
              {[
                { id: 'overview', label: 'সাধারণ বিবরণ', icon: Info },
                { id: 'diff', label: 'পরিবর্তন ড্রিফ (Diff)', icon: ArrowUpDown },
                { id: 'json', label: 'র জেসন (Raw JSON)', icon: Laptop }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                      detailTab === tab.id
                        ? 'border-red-600 text-red-600 dark:text-red-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Body Tab Contents */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
              {detailTab === 'overview' && (
                <div className="space-y-6">
                  {/* Full Description Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">অডিট অ্যাক্টিভিটি বিবরণ</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{selectedLog.details}</p>
                  </div>

                  {/* Actor Information Grid */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-red-500" />
                      <span>অ্যাক্টর ও ব্যবহারকারীর বিবরণ</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">নাম:</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{selectedLog.actorName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">ভূমিকা (Role):</span>
                        <span className={`inline-block px-2 py-0.2 rounded-md text-[10px] font-bold border ${getRoleBadgeClass(selectedLog.actorRole)}`}>
                          {selectedLog.actorRole}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">ইমেইল এড্রেস:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{selectedLog.actorEmail || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">মডিউল (Module):</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.module || 'SYSTEM'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Target Record Metadata */}
                  {selectedLog.targetRecordId && (
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-500" />
                        <span>প্রভাবিত রেকর্ড বিবরণ (Target Record)</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">রেকর্ড আইডি:</span>
                          <span className="font-mono font-bold text-red-600 dark:text-red-400">{selectedLog.targetRecordId}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">রেকর্ড টাইপ:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.targetRecordType || 'Record'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Technical & Network Metadata */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-amber-500" />
                      <span>নেটওয়ার্ক, ব্রাউজার ও সিস্টেম মেটাডাটা</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold font-sans">আইপি এড্রেস (IP):</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedLog.ipAddress || '127.0.0.1'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold font-sans">ডিভাইস টাইপ:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedLog.deviceType || 'DESKTOP'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold font-sans">অপারেটিং সিস্টেম:</span>
                        <span className="text-slate-800 dark:text-slate-200">{selectedLog.os || 'Windows 11'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold font-sans">ব্রাউজার সংকলন:</span>
                        <span className="text-slate-800 dark:text-slate-200">{selectedLog.browser || 'Chrome'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 block font-bold font-sans">এপিআই রিকোয়েস্ট ইউআরএল:</span>
                        <span className="text-red-600 dark:text-red-400 break-all">{selectedLog.requestUrl || '/api/audit-logs'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'diff' && (
                <div className="space-y-4">
                  {!selectedLog.oldValue && !selectedLog.newValue ? (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                      <ArrowUpDown className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-600 dark:text-slate-300">কোনো পূর্ববর্তী বা পরবর্তী স্টেট ডাটা সংরক্ষিত নেই।</p>
                      <p className="text-[11px] text-slate-400 mt-1">এই অ্যাকশনের জন্য স্টেট পরিবর্তনের ডিফল্ট অবজেক্ট রেকর্ড করা হয়নি।</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Old Value */}
                      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4">
                        <h5 className="font-extrabold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5 text-xs">
                          <XCircle className="w-4 h-4" />
                          <span>পূর্ববর্তী স্টেট (Old Value)</span>
                        </h5>
                        <pre className="font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                          {typeof selectedLog.oldValue === 'object'
                            ? JSON.stringify(selectedLog.oldValue, null, 2)
                            : String(selectedLog.oldValue || 'N/A')}
                        </pre>
                      </div>

                      {/* New Value */}
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4">
                        <h5 className="font-extrabold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>নতুন স্টেট (New Value)</span>
                        </h5>
                        <pre className="font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                          {typeof selectedLog.newValue === 'object'
                            ? JSON.stringify(selectedLog.newValue, null, 2)
                            : String(selectedLog.newValue || 'N/A')}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'json' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-400 text-[11px]">সম্পূর্ণ অডিট লগ JSON অবজেক্ট</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                        setCopiedJson(true);
                        setTimeout(() => setCopiedJson(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedJson ? 'কপি হয়েছে!' : 'কপি JSON'}</span>
                    </button>
                  </div>

                  <pre className="font-mono text-[11px] text-slate-900 dark:text-emerald-400 bg-slate-900 dark:bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto leading-relaxed shadow-inner">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">অডিট লগ এক্সপোর্ট সেন্টার</h3>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              বর্তমান ফিল্টার করা <b>{filteredLogs.length}</b> টি অডিট রেকর্ড এক্সপোর্ট করা হবে। আপনার কাঙ্ক্ষিত ফরম্যাট নির্বাচন করুন:
            </p>

            <div className="space-y-2">
              {[
                { id: 'xlsx', label: 'Excel స్ప్రెడ్‌షీట్ (.xlsx)', icon: FileSpreadsheet, desc: 'সম্পূর্ণ ফরম্যাটেড স্প্রেডশীট ফাইল' },
                { id: 'csv', label: 'CSV ফাইল (.csv)', icon: FileText, desc: 'স্ট্যান্ডার্ড কমা সেপারেটেড ফাইল' },
                { id: 'pdf', label: 'প্রিন্ট ও PDF রিপোর্ট', icon: Printer, desc: 'প্রিন্ট ফ্রেন্ডলি PDF বা আর্কিভ রিপোর্ট' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setExportFormat(item.id as any)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      exportFormat === item.id
                        ? 'border-red-600 bg-red-50/50 dark:bg-red-950/40 text-slate-900 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 ${exportFormat === item.id ? 'text-red-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-extrabold text-xs block">{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                বাতিল
              </button>

              <button
                onClick={handleExportLogs}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>ডাউনলোড শুরু করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retention Policy Modal */}
      {showRetentionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">অডিট লগ সংরক্ষণ মেয়াদ সেটিংস</h3>
              </div>
              <button onClick={() => setShowRetentionModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              কতদিন পর্যন্ত অডিট লগ ডাটাবেজে সংরক্ষিত থাকবে তা নির্বাচন করুন। মেয়াদের বাইরের লগ স্বয়ংক্রিয়ভাবে সিস্টেম ব্যাকগ্রাউন্ড দ্বারা ক্লিনআপ হবে।
            </p>

            <div className="space-y-2">
              {[
                { days: 30, label: '৩০ দিন (১ মাস)' },
                { days: 90, label: '৯০ দিন (৩ মাস - সুপারিশকৃত)' },
                { days: 180, label: '১৮০ দিন (৬ মাস)' },
                { days: 365, label: '৩৬৫ দিন (১ বছর)' },
                { days: 0, label: 'কখনোই মুছবেন না (Never Delete)' }
              ].map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => setRetentionDays(opt.days)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                    retentionDays === opt.days
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {retentionDays === opt.days && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRetentionModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                বাতিল
              </button>

              <button
                onClick={handleSaveRetention}
                disabled={savingRetention}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingRetention ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>সেটিংস সেভ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Audit Logs Modal (Super Admin Only) */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-red-200 dark:border-red-900 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">অডিট লগ ক্লিয়ার সতর্কতা</h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-bold">এই পদক্ষেপটি অপরিবর্তনযোগ্য (Irreversible Action)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              আপনি কি নিশ্চিত যে আপনি সিস্টেমে রক্ষিত <b>{logs.length}</b> টি অডিট লগ ক্লিয়ার করতে চান? এই একশন নেওয়ার সাথে সাথে সকল পুরানো হিস্ট্রি মুছে যাবে।
            </p>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveSecurityLogs}
                  onChange={(e) => setPreserveSecurityLogs(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded-md focus:ring-red-500"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  সিকিউরিটি ও ফেল্ড লগ প্রিজার্ভ করুন (সুপারিশকৃত)
                </span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                লগিন ব্যর্থতা বা নিরাপত্তা অ্যালার্ট লগগুলো ডাটাবেজে থেকে যাবে।
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                নিশ্চিতকরণের জন্য টাইপ করুন: <span className="font-mono text-red-600 font-extrabold">CLEAR LOGS</span>
              </label>
              <input
                type="text"
                value={clearConfirmationText}
                onChange={(e) => setClearConfirmationText(e.target.value)}
                placeholder="CLEAR LOGS টাইপ করুন..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowClearModal(false);
                  setClearConfirmationText('');
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                বাতিল
              </button>

              <button
                onClick={handleClearAuditLogs}
                disabled={clearConfirmationText.trim() !== 'CLEAR LOGS' || isClearing}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center gap-1.5 disabled:opacity-40"
              >
                {isClearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>লগসমূহ স্থায়ীভাবে ক্লিয়ার করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
