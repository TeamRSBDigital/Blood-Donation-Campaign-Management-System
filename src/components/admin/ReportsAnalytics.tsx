import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { FullAnalyticsData, BloodGroup } from '../../types/index.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import Papa from 'papaparse';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Droplet,
  MapPin,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  UserCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Activity,
  History
} from 'lucide-react';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COLORS = ['#dc2626', '#ea580c', '#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777', '#475569'];

export const ReportsAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<FullAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedUpazila, setSelectedUpazila] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [selectedRequestStatus, setSelectedRequestStatus] = useState('ALL');

  // Tables State (Location Table Sorting & Pagination)
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSortField, setLocationSortField] = useState<'union' | 'upazila' | 'donorCount' | 'availableCount'>('donorCount');
  const [locationSortOrder, setLocationSortOrder] = useState<'asc' | 'desc'>('desc');
  const [locationPage, setLocationPage] = useState(1);
  const locationPageSize = 5;

  // Active Recent Activity Tab
  const [activityTab, setActivityTab] = useState<'donors' | 'requests' | 'donations' | 'logs'>('donors');

  // Access check
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedBloodGroup !== 'ALL') params.append('bloodGroup', selectedBloodGroup);
      if (selectedDistrict !== 'ALL') params.append('district', selectedDistrict);
      if (selectedUpazila !== 'ALL') params.append('upazila', selectedUpazila);
      if (selectedAvailability !== 'ALL') params.append('availability', selectedAvailability);
      if (selectedRequestStatus !== 'ALL') params.append('requestStatus', selectedRequestStatus);

      const response = await fetch(`/api/reports/analytics?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('এই রিপোর্ট ও এনালিটিক্স সুবিধা কেবল অনুমোদিত এডমিনদের জন্য সীমাবদ্ধ।');
        }
        throw new Error('এনালিটিক্স ডেটা লোড করতে ব্যর্থ হয়েছে।');
      }

      const result: FullAnalyticsData = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics();
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedBloodGroup('ALL');
    setSelectedDistrict('ALL');
    setSelectedUpazila('ALL');
    setSelectedAvailability('ALL');
    setSelectedRequestStatus('ALL');
    setTimeout(() => fetchAnalytics(), 0);
  };

  // CSV / Excel Export Preparation Logic
  const exportToCSV = (type: 'blood_group' | 'location' | 'requests' | 'donations') => {
    if (!data) return;

    let exportData: any[] = [];
    let filename = `PBDA_Report_${type}_${new Date().toISOString().split('T')[0]}`;

    if (type === 'blood_group') {
      exportData = data.bloodGroupReport.map(b => ({
        'রক্তের গ্রুপ (Blood Group)': b.bloodGroup,
        'মোট রক্তদাতা (Total Donors)': b.totalDonors,
        'প্রস্তুত (Available)': b.available,
        'অনুপস্থিত/সীমিত (Unavailable)': b.unavailable,
        'শতকরা হার (Percentage)': `${b.percentage}%`
      }));
    } else if (type === 'location') {
      exportData = data.locationReport.map(l => ({
        'বিভাগ (Division)': l.division,
        'জেলা (District)': l.district,
        'উপজেলা (Upazila)': l.upazila,
        'ইউনিয়ন (Union)': l.union,
        'মোট রক্তদাতা (Donor Count)': l.donorCount,
        'প্রস্তুত রক্তদাতা (Available Count)': l.availableCount
      }));
    } else if (type === 'requests') {
      exportData = data.requestReport.map(r => ({
        'স্ট্যাটাস (Status)': r.label,
        'আবেদনের সংখ্যা (Count)': r.count,
        'শতকরা হার (Percentage)': `${r.percentage}%`
      }));
    } else if (type === 'donations') {
      exportData = [
        { 'সময়কাল': 'আজকের মোট রক্তদান', 'সংখ্যা': data.donationReport.todayDonations },
        { 'সময়কাল': 'এই সপ্তাহের মোট রক্তদান', 'সংখ্যা': data.donationReport.weekDonations },
        { 'সময়কাল': 'এই মাসের মোট রক্তদান', 'সংখ্যা': data.donationReport.monthDonations },
        { 'সময়কাল': 'এই বছরের মোট রক্তদান', 'সংখ্যা': data.donationReport.yearDonations }
      ];
    }

    const csvStr = Papa.unparse(exportData);
    // Add UTF-8 BOM for perfect Bengali rendering in MS Excel
    const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Location Report Table Sorting & Search Filter
  const filteredLocations = useMemo(() => {
    if (!data?.locationReport) return [];
    let list = [...data.locationReport];
    if (locationSearch.trim()) {
      const q = locationSearch.toLowerCase().trim();
      list = list.filter(l =>
        l.union.toLowerCase().includes(q) ||
        l.upazila.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA = a[locationSortField];
      let valB = b[locationSortField];
      if (typeof valA === 'string') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }
      if (valA < valB) return locationSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return locationSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [data?.locationReport, locationSearch, locationSortField, locationSortOrder]);

  const paginatedLocations = useMemo(() => {
    const start = (locationPage - 1) * locationPageSize;
    return filteredLocations.slice(start, start + locationPageSize);
  }, [filteredLocations, locationPage]);

  const totalLocationPages = Math.ceil(filteredLocations.length / locationPageSize) || 1;

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-red-200 dark:border-red-900/50 shadow-md text-center max-w-2xl mx-auto my-8">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">অ্যাক্সেস সংরক্ষিত</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          রিপোর্ট ও এনালিটিক্স ড্যাশবোর্ডে প্রবেশের অধিকার কেবল নিবন্ধিত সিস্টেম এডমিন ও সুপার এডমিনদের রয়েছে।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-100 dark:bg-red-950/80 rounded-2xl text-red-600 dark:text-red-400">
              <BarChart3 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                রিপোর্ট ও এনালিটিক্স ড্যাশবোর্ড
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                পাংশা ব্লাড ডোনার্স এসোসিয়েশনের বিস্তারিত স্বাস্থ্য ও ডোনার ডাটাবেজ পরিসংখ্যান
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons for Export Architecture (SUPER_ADMIN ONLY) */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToCSV('blood_group')}
              className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-bold px-3.5 py-2 rounded-xl text-xs border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs"
              title="CSV এক্সপোর্ট করুন"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>CSV ডাটা</span>
            </button>

            <button
              onClick={() => exportToCSV('location')}
              className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-bold px-3.5 py-2 rounded-xl text-xs border border-blue-200 dark:border-blue-800 transition-colors shadow-2xs"
              title="Excel ফরম্যাট এক্সপোর্ট করুন"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Excel ডাটা</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট/PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Section Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleApplyFilter} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Filter className="w-4 h-4 text-red-600" />
              <span>ফিল্টারিং ও সার্চ ফিল্টারস</span>
            </h2>
            <button
              type="button"
              onClick={handleResetFilter}
              className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-semibold">
            {/* Start Date */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">শুরুর তারিখ</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">শেষের তারিখ</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">রক্তের গ্রুপ</label>
              <select
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">সকল রক্তের গ্রুপ</option>
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Upazila */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">উপজেলা</label>
              <select
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">সকল উপজেলা</option>
                <option value="Pangsha">পাংশা (Pangsha)</option>
                <option value="Kalukhali">কালুখালী (Kalukhali)</option>
                <option value="Baliakandi">বালিয়াকান্দি (Baliakandi)</option>
                <option value="Rajbari Sadar">রাজবাড়ী সদর</option>
                <option value="Goalandha">গোয়ালন্দ</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">রক্তদাতার অবস্থা</label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">সকল অবস্থা</option>
                <option value="AVAILABLE">প্রস্তুত (Available)</option>
                <option value="RESTRICTED">সাময়িক সীমিত (Restricted)</option>
                <option value="UNAVAILABLE">অনুপস্থিত (Unavailable)</option>
              </select>
            </div>

            {/* Request Status */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">চাহিদার স্ট্যাটাস</label>
              <select
                value={selectedRequestStatus}
                onChange={(e) => setSelectedRequestStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="PENDING">অপেক্ষমাণ (Pending)</option>
                <option value="SEARCHING">সন্ধান চলছে (Searching)</option>
                <option value="MATCHED">ম্যাচড (Matched)</option>
                <option value="COMPLETED">সম্পন্ন (Completed)</option>
                <option value="CANCELLED">বাতিলকৃত (Cancelled)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-2xs"
            >
              ফিল্টার প্রয়োগ করুন
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            এনালিটিক্স ডেটা প্রস্তুত ও প্রসেসিং করা হচ্ছে...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/60 rounded-3xl p-6 text-center border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
          <span>{error}</span>
        </div>
      ) : data ? (
        <>
          {/* Overview Cards (8 Key System Metrics) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Donors */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">মোট নিবন্ধিত রক্তদাতা</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{data.overview.totalDonors} জন</p>
              </div>
              <span className="p-3 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl">
                <Users className="w-6 h-6" />
              </span>
            </div>

            {/* Available Donors */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">প্রস্তুত রক্তদাতা (Available)</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{data.overview.availableDonors} জন</p>
              </div>
              <span className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
                <UserCheck className="w-6 h-6" />
              </span>
            </div>

            {/* Unavailable Donors */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">অনুপস্থিত / সীমিত রক্তদাতা</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{data.overview.unavailableDonors} জন</p>
              </div>
              <span className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-2xl">
                <Clock className="w-6 h-6" />
              </span>
            </div>

            {/* Total Volunteers */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">মোট ভলান্টিয়ার ও এডমিন</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{data.overview.totalVolunteers} জন</p>
              </div>
              <span className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-2xl">
                <Users className="w-6 h-6" />
              </span>
            </div>

            {/* Total Requests */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">মোট রক্তের আবেদন</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{data.overview.totalRequests} টি</p>
              </div>
              <span className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-2xl">
                <Droplet className="w-6 h-6" />
              </span>
            </div>

            {/* Completed Requests */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">সম্পন্ন আবেদন (Completed)</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{data.overview.completedRequests} টি</p>
              </div>
              <span className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </span>
            </div>

            {/* Pending Requests */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">অপেক্ষমাণ আবেদন (Pending)</p>
                <p className="text-2xl font-black text-rose-600 mt-1">{data.overview.pendingRequests} টি</p>
              </div>
              <span className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </span>
            </div>

            {/* Cancelled Requests */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">বাতিলকৃত আবেদন (Cancelled)</p>
                <p className="text-2xl font-black text-slate-500 mt-1">{data.overview.cancelledRequests} টি</p>
              </div>
              <span className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl">
                <XCircle className="w-6 h-6" />
              </span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blood Group Distribution Bar Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-red-600" />
                <span>রক্তের গ্রুপভিত্তিক বণ্টন ও প্রাপ্যতা (Blood Group Distribution)</span>
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.bloodGroupDistribution}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="group" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#ffffff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="available" name="প্রস্তুত (Available)" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="unavailable" name="অনুপস্থিত (Unavailable)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donation & Request Trends */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>মাসিক রক্তদান ও রক্ত আবেদনের ট্রেন্ড (Donation & Request Trend)</span>
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts.donationTrend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="period" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#ffffff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="count" name="রক্তদান (Donations)" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Registration Trend */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>নতুন রক্তদাতা নিবন্ধন ট্রেন্ড (Monthly Registration Trend)</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.charts.monthlyRegistrationTrend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#ffffff', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="count" name="নতুন নিবন্ধন" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Location Distribution */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span>ইউনিয়নভিত্তিক রক্তদাতা বন্টন (Location Distribution)</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={data.charts.locationDistribution.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" stroke="#888888" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#888888" fontSize={11} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#ffffff', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" name="রক্তদাতা" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Blood Group Detailed Report Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-600" />
                <span>রক্তের গ্রুপভিত্তিক রিপোর্ট (Blood Group Detailed Report)</span>
              </h3>
              <button
                onClick={() => exportToCSV('blood_group')}
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV ডাউনলোড</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 rounded-l-xl">রক্তের গ্রুপ</th>
                    <th className="p-3">মোট রক্তদাতা</th>
                    <th className="p-3">প্রস্তুত (Available)</th>
                    <th className="p-3">অনুপস্থিত (Unavailable)</th>
                    <th className="p-3 rounded-r-xl">অনুপাত / শতকরা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {data.bloodGroupReport.map((bg) => (
                    <tr key={bg.bloodGroup} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 bg-red-600 text-white rounded-lg font-black text-xs">
                          {bg.bloodGroup}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{bg.totalDonors} জন</td>
                      <td className="p-3 text-emerald-600 font-bold">{bg.available} জন</td>
                      <td className="p-3 text-red-500 font-bold">{bg.unavailable} জন</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-slate-600 dark:text-slate-300">{bg.percentage}%</span>
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-red-600 h-full rounded-full" style={{ width: `${Math.max(bg.percentage, 2)}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Location Report Table (Division, District, Upazila, Union) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>এলাকাভিত্তিক লোকেশন রিপোর্ট (Location Report: Division, District, Upazila, Union)</span>
              </h3>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ইউনিয়ন বা উপজেলা খুঁজুন..."
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setLocationPage(1);
                    }}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>

                <button
                  onClick={() => exportToCSV('location')}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">বিভাগ</th>
                    <th className="p-3">জেলা</th>
                    <th className="p-3">উপজেলা</th>
                    <th className="p-3 cursor-pointer hover:text-emerald-600" onClick={() => { setLocationSortField('union'); setLocationSortOrder(locationSortOrder === 'asc' ? 'desc' : 'asc'); }}>
                      <span className="flex items-center gap-1">
                        <span>ইউনিয়ন/পৌরসভা</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </span>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-emerald-600" onClick={() => { setLocationSortField('donorCount'); setLocationSortOrder(locationSortOrder === 'asc' ? 'desc' : 'asc'); }}>
                      <span className="flex items-center gap-1">
                        <span>মোট ডোনার</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </span>
                    </th>
                    <th className="p-3">প্রস্তুত ডোনার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {paginatedLocations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 text-xs">
                        কোন এলাকা তথ্য পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    paginatedLocations.map((loc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 text-slate-600 dark:text-slate-400">{loc.division}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{loc.district}</td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">{loc.upazila}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{loc.union}</td>
                        <td className="p-3 font-bold text-red-600">{loc.donorCount} জন</td>
                        <td className="p-3 font-bold text-emerald-600">{loc.availableCount} জন</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalLocationPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 text-xs font-bold text-slate-500">
                <span>পৃষ্ঠা {locationPage} / {totalLocationPages} ({filteredLocations.length} টি এন্ট্রি)</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={locationPage === 1}
                    onClick={() => setLocationPage(p => p - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={locationPage === totalLocationPages}
                    onClick={() => setLocationPage(p => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Donation Report & Request Report Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donation Time-Based Report */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>রক্তদান সময়ভিত্তিক রিপোর্ট (Donation Report)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500">আজকের রক্তদান</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{data.donationReport.todayDonations} ব্যাগ</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500">এই সপ্তাহে</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{data.donationReport.weekDonations} ব্যাগ</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500">এই মাসে</p>
                  <p className="text-2xl font-black text-purple-600 mt-1">{data.donationReport.monthDonations} ব্যাগ</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500">এই বছরে</p>
                  <p className="text-2xl font-black text-red-600 mt-1">{data.donationReport.yearDonations} ব্যাগ</p>
                </div>
              </div>
            </div>

            {/* Request Report Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-rose-600" />
                <span>রক্ত চাহিদার স্ট্যাটাস অনুপাত (Request Status Report)</span>
              </h3>

              <div className="space-y-3">
                {data.requestReport.map((req) => (
                  <div key={req.status} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{req.label}</span>
                      <span className="text-slate-600 dark:text-slate-400">{req.count} টি ({req.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          req.status === 'COMPLETED' ? 'bg-emerald-500' :
                          req.status === 'MATCHED' ? 'bg-blue-500' :
                          req.status === 'SEARCHING' ? 'bg-amber-500' :
                          req.status === 'PENDING' ? 'bg-rose-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(req.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                <span>সাম্প্রতিক কার্যক্রম ও আপডেট (Recent Activity Feed)</span>
              </h3>

              {/* Activity Sub-Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setActivityTab('donors')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activityTab === 'donors' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  নিবন্ধন
                </button>
                <button
                  onClick={() => setActivityTab('requests')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activityTab === 'requests' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  আবেদন
                </button>
                <button
                  onClick={() => setActivityTab('donations')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activityTab === 'donations' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  রক্তদান
                </button>
                <button
                  onClick={() => setActivityTab('logs')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activityTab === 'logs' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  লগস
                </button>
              </div>
            </div>

            {/* Tab Content List */}
            <div className="space-y-3">
              {activityTab === 'donors' && (
                <div className="space-y-2">
                  {data.recentActivity.latestDonors.map(d => (
                    <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                          {d.bloodGroup}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{d.name}</p>
                          <p className="text-[11px] text-slate-500">{d.upazila}, {d.district} • {d.phone}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString('bn-BD') : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activityTab === 'requests' && (
                <div className="space-y-2">
                  {data.recentActivity.latestRequests.map(r => (
                    <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                          {r.bloodGroup}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">রোগী: {r.patientName} ({r.bagsNeeded} ব্যাগ)</p>
                          <p className="text-[11px] text-slate-500">{r.hospitalName}, {r.upazila} • {r.requiredDate}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                        r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        r.status === 'PENDING' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activityTab === 'donations' && (
                <div className="space-y-2">
                  {data.recentActivity.latestDonations.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">কোন সাম্প্রতিক রক্তদানের রেকর্ড পাওয়া যায়নি।</p>
                  ) : (
                    data.recentActivity.latestDonations.map(h => (
                      <div key={h.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">হাসপাতাল: {h.hospitalName}</p>
                            <p className="text-[11px] text-slate-500">রোগী: {h.patientName || 'N/A'} • {h.bagsCount} ব্যাগ</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">{h.date}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activityTab === 'logs' && (
                <div className="space-y-2">
                  {data.recentActivity.latestAuditLogs.map(l => (
                    <div key={l.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{l.action} ({l.actorName})</p>
                        <p className="text-[11px] text-slate-500">{l.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(l.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ReportsAnalytics;
