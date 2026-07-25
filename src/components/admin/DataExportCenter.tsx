import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  exportService,
  ExportModule,
  ExportFormat,
  ExportScope,
  ExportResponseData
} from '../../services/exportService.js';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Calendar,
  Filter,
  Users,
  Droplet,
  HeartHandshake,
  BarChart3,
  ListOrdered,
  Loader2,
  X,
  Info,
  Clock,
  Globe
} from 'lucide-react';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const UPAZILAS = ['ALL', 'পাংশা', 'কালুখালী', 'বালিয়াকান্দি', 'রাজবাড়ী সদর', 'গোয়ালন্দ'];
const DISTRICTS = ['ALL', 'রাজবাড়ী', 'কুষ্টিয়া', 'ফরিদপুর'];

interface ModuleCardConfig {
  id: ExportModule;
  titleBn: string;
  titleEn: string;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
  defaultFormat: ExportFormat;
}

const EXPORT_MODULES: ModuleCardConfig[] = [
  {
    id: 'donors',
    titleBn: 'রক্তদাতা ডাটাবেজ',
    titleEn: 'Donors Database',
    description: 'নিবন্ধিত সকল রক্তদাতার তথ্য, যোগাযোগের নম্বর ও বর্তমান রক্তদানের স্ট্যাটাস।',
    icon: Users,
    badgeColor: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900',
    defaultFormat: 'xlsx',
  },
  {
    id: 'requests',
    titleBn: 'রক্তের চাহিদা আবেদন',
    titleEn: 'Blood Requests',
    description: 'রোগীদের রক্তের আবেদন, প্রয়োজনীয়তা, হাসপাতাল ও রিকুয়েস্টের বর্তমান অবস্থা।',
    icon: Droplet,
    badgeColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900',
    defaultFormat: 'csv',
  },
  {
    id: 'donations',
    titleBn: 'রক্তদানের ইতিহাস',
    titleEn: 'Donation History',
    description: 'সম্পন্ন হওয়া সকল রক্তদানের রেকর্ড, রক্তদাতার আইডি এবং হাসপাতাল তথ্য।',
    icon: HeartHandshake,
    badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    defaultFormat: 'xlsx',
  },
  {
    id: 'reports',
    titleBn: 'সিস্টেম রিপোর্ট ও পরিসংখ্যান',
    titleEn: 'Reports & Analytics',
    description: 'সামগ্রিক রক্তদান পরিসংখ্যান, রক্তের গ্রুপভিত্তিক বণ্টন ও অবস্থান রিপোর্ট।',
    icon: BarChart3,
    badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    defaultFormat: 'pdf',
  },
  {
    id: 'logs',
    titleBn: 'অডিট ও এক্টিভিটি লোগ',
    titleEn: 'Activity & Audit Logs',
    description: 'সিস্টেম ব্যবহারের সময়ক্রমিক লোগ, এডমিন ও ভলান্টিয়ারদের সকল অ্যাকশনের বিবরণ।',
    icon: ShieldAlert,
    badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    defaultFormat: 'xlsx',
  },
  {
    id: 'users',
    titleBn: 'এডমিন ও ভলান্টিয়ার তালিকা',
    titleEn: 'Admin & Volunteer Users',
    description: 'সিস্টেম এডমিন ও ভলান্টিয়ার অ্যাকাউন্টের ভূমিকা, ইমেইল ও যোগাযোগের তথ্য। (পাসওয়ার্ড সুরক্ষিত)',
    icon: Shield,
    badgeColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    defaultFormat: 'xlsx',
  },
];

export const DataExportCenter: React.FC = () => {
  const { user } = useAuth();

  // Selected Module & Options
  const [selectedModule, setSelectedModule] = useState<ExportModule>('donors');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('xlsx');
  const [selectedScope, setSelectedScope] = useState<ExportScope>('filtered');

  // Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bloodGroup, setBloodGroup] = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [upazila, setUpazila] = useState('ALL');
  const [availability, setAvailability] = useState('ALL');
  const [requestStatus, setRequestStatus] = useState('ALL');
  const [userRole, setUserRole] = useState('ALL');

  // Execution States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressMsg, setExportProgressMsg] = useState('');
  const [lastExportResult, setLastExportResult] = useState<ExportResponseData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check RBAC Permission
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-red-200 dark:border-red-900/50 shadow-xl text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          প্রবেশাধিকার সংরক্ষিত (Access Denied)
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          ডাটা এক্সপোর্ট মডিউলটি অত্যন্ত সংবেদনশীল। নিরাপত্তা নীতি অনুযায়ী শুধুমাত্র <span className="font-bold text-red-600 dark:text-red-400">সুপার এডমিন (Super Admin)</span> একাউন্ট দিয়ে লগইন করে সকল ডাটা এক্সপোর্ট করা সম্ভব।
        </p>
        <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900 text-[11px] font-semibold text-red-700 dark:text-red-300">
          আপনার বর্তমান রোল: <span className="font-black underline">{user?.role || 'VISITOR'}</span> (এক্সপোর্ট সুবিধা অবরুদ্ধ)
        </div>
      </div>
    );
  }

  // Handle Initiating Export (opens Confirmation Modal)
  const handleInitiateExport = (moduleConfig?: ModuleCardConfig) => {
    if (moduleConfig) {
      setSelectedModule(moduleConfig.id);
      setSelectedFormat(moduleConfig.defaultFormat);
    }
    setErrorMessage(null);
    setIsConfirmModalOpen(true);
  };

  // Perform Server Export
  const handleExecuteExport = async () => {
    setIsConfirmModalOpen(false);
    setIsExporting(true);
    setExportProgressMsg('সার্ভার এনভায়রনমেন্টে অনুরোধ প্রসেস ও নিরাপত্তা যাচাই হচ্ছে...');
    setErrorMessage(null);

    try {
      await new Promise(res => setTimeout(res, 600)); // Smooth progress UX
      setExportProgressMsg('ডাটাবেজ থেকে ডাটা ফিল্টার ও সংবেদনশীল ফিল্ড ফিল্টারিং চলছে...');

      const result = await exportService.fetchExportData({
        module: selectedModule,
        format: selectedFormat,
        scope: selectedScope,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        bloodGroup: bloodGroup !== 'ALL' ? bloodGroup : undefined,
        district: district !== 'ALL' ? district : undefined,
        upazila: upazila !== 'ALL' ? upazila : undefined,
        availability: availability !== 'ALL' ? availability : undefined,
        requestStatus: requestStatus !== 'ALL' ? requestStatus : undefined,
        userRole: userRole !== 'ALL' ? userRole : undefined
      });

      setExportProgressMsg('ফাইলের ফরম্যাট রূপান্তর ও লোকাল ডাউনলোডের প্রস্তুতি নিচ্ছে...');
      await new Promise(res => setTimeout(res, 400));

      exportService.downloadFile(result);

      setLastExportResult(result);
    } catch (err: any) {
      console.error('Export Error:', err);
      setErrorMessage(err.message || 'ডাটা এক্সপোর্ট করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsExporting(false);
      setExportProgressMsg('');
    }
  };

  const currentModuleConfig = EXPORT_MODULES.find(m => m.id === selectedModule) || EXPORT_MODULES[0];

  return (
    <div className="space-y-6">
      {/* Page Title & Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-red-400" />
              সুপার এডমিন এক্সক্লুসিভ
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
              /dashboard/export
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Download className="w-7 h-7 text-red-500 shrink-0" />
            ডাটা এক্সপোর্ট সেন্টার (Data Export Module)
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            পাংশা ব্লাড ডোনার্স এসোসিয়েশনের কেন্দ্রীয় ডাটাবেজ থেকে সকল রক্তদাতা, রক্তের আবেদন, ইতিহাস, অডিট লোগ ও এডমিন তালিকা Excel (.xlsx), CSV (.csv) এবং PDF (.pdf) ফরম্যাটে নিরাপদভাবে এক্সপোর্ট করুন।
          </p>
        </div>

        <div className="absolute right-4 bottom-0 opacity-10 pointer-events-none hidden md:block">
          <Download className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Progress Overlay Indicator */}
      {isExporting && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-3xl p-6 shadow-xl flex items-center gap-4 animate-pulse">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-amber-900 dark:text-amber-200">
              ডাটা এক্সপোর্ট প্রক্রিয়াধীন রয়েছে...
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {exportProgressMsg}
            </p>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {lastExportResult && !isExporting && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-3xl p-5 shadow-md flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm">
                এক্সপোর্ট সম্পন্ন হয়েছে! ({lastExportResult.filename})
              </p>
              <div className="text-emerald-800 dark:text-emerald-300 space-y-0.5">
                <p>• মোট ডাউনলোডকৃত রেকর্ডস: <span className="font-bold">{lastExportResult.recordCount} টি</span></p>
                <p>• প্রয়োগকৃত ফিল্টার: <span className="font-semibold">{lastExportResult.filterSummary}</span></p>
                <p>• এক্সপোর্টকারী অডিট লগ: <span className="font-semibold">{lastExportResult.auditMeta.userName} ({lastExportResult.auditMeta.role}) | IP: {lastExportResult.auditMeta.ipAddress}</span></p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setLastExportResult(null)}
            className="p-1 rounded-lg hover:bg-emerald-200/50 text-emerald-700 dark:text-emerald-300"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-3xl p-5 shadow-md flex items-center justify-between gap-3 text-xs text-red-700 dark:text-red-300 font-bold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded-lg hover:bg-red-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Module Selection Cards Grid */}
      <section aria-label="এক্সপোর্ট মডিউল নির্বাচন" className="space-y-3">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-red-600" />
          ১. এক্সপোর্ট ডাটা মডিউল নির্বাচন করুন
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPORT_MODULES.map((mod) => {
            const Icon = mod.icon;
            const isSelected = selectedModule === mod.id;

            return (
              <div
                key={mod.id}
                onClick={() => {
                  setSelectedModule(mod.id);
                  setSelectedFormat(mod.defaultFormat);
                }}
                className={`cursor-pointer rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 relative ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-red-500 shadow-xl ring-2 ring-red-500/20'
                    : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-red-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-3 rounded-2xl border ${mod.badgeColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {isSelected && (
                      <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3" /> নির্বাচিত
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {mod.titleBn}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400">
                      {mod.titleEn}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-500">
                    ডিফল্ট: .{mod.defaultFormat.toUpperCase()}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInitiateExport(mod);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    aria-label={`${mod.titleBn} এক্সপোর্ট করুন`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>এক্সপোর্ট</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Configurations & Filters Section */}
      <section aria-label="ফিল্টার ও এক্সপোর্ট কনফিগারেশন" className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-red-600" />
              ২. এক্সপোর্ট ফিল্টার ও ফাইল ফরম্যাট
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              নির্দিষ্ট তারিখ সীমা, রক্তের গ্রুপ বা ভৌগোলিক ফিল্টার প্রয়োগ করে ডাটা সাজিয়ে নিন।
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>সক্রিয় মডিউল: {currentModuleConfig.titleBn}</span>
          </div>
        </div>

        {/* Scope and File Format Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scope Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              এক্সপোর্ট স্কোপ (Export Scope)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedScope('filtered')}
                className={`py-2.5 px-4 rounded-2xl text-xs font-extrabold border transition-all flex items-center justify-center gap-2 ${
                  selectedScope === 'filtered'
                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>ফিল্টারকৃত ডাটা</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScope('all')}
                className={`py-2.5 px-4 rounded-2xl text-xs font-extrabold border transition-all flex items-center justify-center gap-2 ${
                  selectedScope === 'all'
                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>সকল ডাটাবেজ রেকর্ড</span>
              </button>
            </div>
          </div>

          {/* File Format Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              ফাইল ফরম্যাট (File Format)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormat('xlsx')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                  selectedFormat === 'xlsx'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('csv')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                  selectedFormat === 'csv'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>CSV (.csv)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('pdf')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                  selectedFormat === 'pdf'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>PDF (.pdf)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Filters Form */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-red-600" />
            <span>ফিল্টার অপশনসমূহ (Filter Options)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Start Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                শুরু তারিখ (Start Date)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                শেষ তারিখ (End Date)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            {/* Blood Group Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                রক্তের গ্রুপ (Blood Group)
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              >
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg === 'ALL' ? 'সকল গ্রুপ (ALL)' : bg}</option>
                ))}
              </select>
            </div>

            {/* Upazila Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                উপজেলা (Upazila)
              </label>
              <select
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              >
                {UPAZILAS.map(u => (
                  <option key={u} value={u}>{u === 'ALL' ? 'সকল উপজেলা' : u}</option>
                ))}
              </select>
            </div>

            {/* Availability Status Filter (if donors selected) */}
            {selectedModule === 'donors' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  রক্তদানের প্রস্তুতি (Availability)
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                >
                  <option value="ALL">সকল স্ট্যাটাস</option>
                  <option value="AVAILABLE">রক্তদানে প্রস্তুত (AVAILABLE)</option>
                  <option value="RESTRICTED">সীমিত সময় (RESTRICTED)</option>
                  <option value="UNAVAILABLE">অনুপস্থিত (UNAVAILABLE)</option>
                </select>
              </div>
            )}

            {/* Request Status Filter (if requests selected) */}
            {selectedModule === 'requests' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  আবেদন স্ট্যাটাস (Request Status)
                </label>
                <select
                  value={requestStatus}
                  onChange={(e) => setRequestStatus(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                >
                  <option value="ALL">সকল স্ট্যাটাস</option>
                  <option value="PENDING">অপেক্ষমাণ (PENDING)</option>
                  <option value="SEARCHING">রক্তদাতা খোঁজা হচ্ছে (SEARCHING)</option>
                  <option value="MATCHED">রক্তদাতা নির্ধারিত (MATCHED)</option>
                  <option value="COMPLETED">সম্পন্ন (COMPLETED)</option>
                  <option value="CANCELLED">বাতিলকৃত (CANCELLED)</option>
                </select>
              </div>
            )}

            {/* User Role Filter (if users selected) */}
            {selectedModule === 'users' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  ব্যবহারকারীর রোল (User Role)
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                >
                  <option value="ALL">সকল রোল</option>
                  <option value="SUPER_ADMIN">সুপার এডমিন (SUPER_ADMIN)</option>
                  <option value="ADMIN">এডমিন (ADMIN)</option>
                  <option value="VOLUNTEER">ভলান্টিয়ার (VOLUNTEER)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Generate Export Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => handleInitiateExport()}
            disabled={isExporting}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm flex items-center gap-2 shadow-lg transition-all scale-100 hover:scale-102 disabled:opacity-50 cursor-pointer"
            aria-label="ডাটা এক্সপোর্ট কনফার্মেশান শুরু করুন"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>প্রসেসিং হচ্ছে...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>{currentModuleConfig.titleBn} এক্সপোর্ট করুন (.{selectedFormat.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Security Audit Log Preview Section */}
      <section aria-label="নিরাপত্তা ও অডিট তথ্য" className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span>নিরাপত্তা ও অডিট নীতি বিবরণী (Export Security & Audit Compliance)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-extrabold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-red-600" /> পাসওয়ার্ড ও টোকেন সুরক্ষা
            </span>
            <p className="text-[11px] leading-relaxed">
              যেকোনো এক্সপোর্টে ব্যবহারকারীর পাসওয়ার্ড হ্যাশ, অথেনটিকেশন টোকেন বা অভ্যন্তরীণ নিরাপত্তা ফিল্ড স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়।
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-extrabold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> স্বয়ংক্রিয় অডিট লগিং
            </span>
            <p className="text-[11px] leading-relaxed">
              প্রতিটি এক্সপোর্ট অপারেশনে এক্সপোর্টকারীর নাম, সময়, আইপি এড্রেস, ব্যবহৃত ফিল্টার এবং ফাইল ফরম্যাট সার্ভার অডিট লগে স্থায়ীভাবে সংরক্ষিত হয়।
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-extrabold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" /> আইনি ও দাপ্তরিক গোপনীয়তা
            </span>
            <p className="text-[11px] leading-relaxed">
              এক্সপোর্টকৃত ডাটা শুধুমাত্র পাংশা ব্লাড ডোনার্স এসোসিয়েশনের অফিশিয়াল কাজের ক্ষেত্রে ব্যবহার্য। অননুমোদিত ব্যক্তির সাথে শেয়ার করা নিষিদ্ধ।
            </p>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  সংবেদনশীল ডাটা এক্সপোর্ট নিশ্চিতকরণ
                </h3>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl font-bold text-amber-800 dark:text-amber-200">
                "আপনি সংবেদনশীল তথ্য এক্সপোর্ট করছেন। আপনি কি নিশ্চিত যে এগিয়ে যেতে চান?"
              </div>

              <div className="space-y-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p>• <span className="font-bold">এক্সপোর্ট মডিউল:</span> {currentModuleConfig.titleBn}</p>
                <p>• <span className="font-bold">ফাইল ফরম্যাট:</span> .{selectedFormat.toUpperCase()}</p>
                <p>• <span className="font-bold">এক্সপোর্ট স্কোপ:</span> {selectedScope === 'all' ? 'সকল ডাটাবেজ রেকর্ড' : 'ফিল্টারকৃত ডাটা'}</p>
                <p>• <span className="font-bold">ফাইল নাম ফরম্যাট:</span> {`${selectedModule}-${new Date().toISOString().split('T')[0]}.${selectedFormat}`}</p>
                <p>• <span className="font-bold">অ্যাকশনকারী:</span> {user?.name} ({user?.role})</p>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                অনুমোদন দিলে সার্ভার উক্ত ডাটার নিরাপত্তা চেক সম্পন্ন করবে এবং ব্যবহারকারীর অডিট লগে এন্ট্রি যোগ করবে।
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                onClick={handleExecuteExport}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>হ্যাঁ, এক্সপোর্ট নিশ্চিত করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
