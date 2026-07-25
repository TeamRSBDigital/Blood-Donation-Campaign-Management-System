import React, { useState, useEffect } from 'react';
import { BloodRequest, RequestStatus, RequestPriority, BloodGroup, Donor } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { BLOOD_GROUPS } from '../../constants/bloodGroups.js';
import { RAJBARI_DISTRICTS } from '../../constants/locations.js';
import {
  Droplet,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Building,
  Users,
  Search,
  Sparkles,
  AlertTriangle,
  Filter,
  Eye,
  Trash2,
  Edit3,
  Calendar,
  MapPin,
  FileText,
  User,
  X,
  MessageSquare
} from 'lucide-react';

export const BloodRequestManagement: React.FC = () => {
  const { token, user } = useAuth();
  const isAdminOrSuper = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('ALL');
  const [filterDistrict, setFilterDistrict] = useState<string>('ALL');
  const [filterRequiredDate, setFilterRequiredDate] = useState<string>('');

  // Modals state
  const [viewDetailModalReq, setViewDetailModalReq] = useState<BloodRequest | null>(null);
  const [selectedReqForMatching, setSelectedReqForMatching] = useState<BloodRequest | null>(null);
  const [matchedDonors, setMatchedDonors] = useState<Donor[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(false);

  // Notes Modal State
  const [editNotesModalReq, setEditNotesModalReq] = useState<BloodRequest | null>(null);
  const [adminNotesText, setAdminNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchRequests();
        if (viewDetailModalReq && viewDetailModalReq.id === id) {
          setViewDetailModalReq(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!editNotesModalReq) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/requests/${editNotesModalReq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminNotes: adminNotesText })
      });

      if (res.ok) {
        fetchRequests();
        setEditNotesModalReq(null);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই আবেদনটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchRequests();
        if (viewDetailModalReq?.id === id) setViewDetailModalReq(null);
      }
    } catch (err) {
      console.error('Failed to delete request:', err);
    }
  };

  // Find smart matching donors
  const handleOpenSmartMatcher = async (req: BloodRequest) => {
    setSelectedReqForMatching(req);
    setLoadingDonors(true);

    try {
      const compatibleMap: Record<BloodGroup, string[]> = {
        'A+': ['A+', 'A-', 'O+', 'O-'],
        'A-': ['A-', 'O-'],
        'B+': ['B+', 'B-', 'O+', 'O-'],
        'B-': ['B-', 'O-'],
        'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        'AB-': ['A-', 'B-', 'AB-', 'O-'],
        'O+': ['O+', 'O-'],
        'O-': ['O-']
      };

      const validGroups = compatibleMap[req.bloodGroup] || [req.bloodGroup];
      
      const res = await fetch(`/api/donors?availableOnly=true`);
      if (res.ok) {
        const allAvailable: Donor[] = await res.json();
        const filtered = allAvailable.filter(d => validGroups.includes(d.bloodGroup));
        setMatchedDonors(filtered);
      }
    } catch (err) {
      console.error('Failed to match donors:', err);
    } finally {
      setLoadingDonors(false);
    }
  };

  // Filter & Search Logic
  const filteredRequests = requests.filter((r) => {
    // Search Query (Patient Name, Phone, Blood Group, Request Number)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = r.patientName.toLowerCase().includes(q);
      const matchPhone = r.contactPhone.toLowerCase().includes(q) || (r.whatsAppNumber && r.whatsAppNumber.toLowerCase().includes(q));
      const matchGroup = r.bloodGroup.toLowerCase().includes(q);
      const matchReqNum = (r.requestNumber || r.id).toLowerCase().includes(q);
      const matchHospital = r.hospitalName.toLowerCase().includes(q);

      if (!matchName && !matchPhone && !matchGroup && !matchReqNum && !matchHospital) {
        return false;
      }
    }

    // Status
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'COMPLETED' || filterStatus === 'FULFILLED') {
        if (r.status !== 'FULFILLED' && r.status !== 'COMPLETED') return false;
      } else if (r.status !== filterStatus) {
        return false;
      }
    }

    // Priority
    if (filterPriority !== 'ALL' && r.priority !== filterPriority) {
      return false;
    }

    // Blood Group
    if (filterBloodGroup !== 'ALL' && r.bloodGroup !== filterBloodGroup) {
      return false;
    }

    // District
    if (filterDistrict !== 'ALL') {
      const dist = (r.district || '').toLowerCase();
      if (!dist.includes(filterDistrict.toLowerCase())) return false;
    }

    // Required Date
    if (filterRequiredDate && r.requiredDate !== filterRequiredDate) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Droplet className="w-5 h-5 text-red-600" />
            <span>জরুরী রক্তের চাহিদা ম্যানেজমেন্ট</span>
          </h2>
          <p className="text-xs text-slate-500">রোগীদের রিকুয়েস্ট ফিল্টারিং, সার্চিং, স্ট্যাটাস আপডেট ও স্মার্ট ডোনার ম্যাচিং</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-2xl">
          <span>মোট আবেদন: <strong className="text-red-600 font-extrabold">{requests.length}</strong></span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="সার্চ করুন: রোগীর নাম, ফোন নাম্বার, রক্তের গ্রুপ বা আবেদন নম্বর (e.g. REQ-2026-0001)..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">স্ট্যাটাস</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">সকল স্ট্যাটাস</option>
              <option value="PENDING">অপেক্ষমাণ (Pending)</option>
              <option value="SEARCHING">সার্চিং (Searching)</option>
              <option value="MATCHED">ম্যাচড (Matched)</option>
              <option value="COMPLETED">সম্পন্ন (Completed)</option>
              <option value="CANCELLED">বাতিল (Cancelled)</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">জরুরী মাত্রা</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">সকল মাত্রা</option>
              <option value="CRITICAL">অতীব জরুরী (Critical)</option>
              <option value="URGENT">জরুরী (Urgent)</option>
              <option value="NORMAL">সাধারণ (Normal)</option>
            </select>
          </div>

          {/* Blood Group Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">রক্তের গ্রুপ</label>
            <select
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">সকল গ্রুপ</option>
              {BLOOD_GROUPS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">জেলা</label>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">সকল জেলা</option>
              {RAJBARI_DISTRICTS.map(d => (
                <option key={d.id} value={d.nameBn}>{d.nameBn}</option>
              ))}
            </select>
          </div>

          {/* Required Date Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">প্রয়োজনের তারিখ</label>
            <input
              type="date"
              value={filterRequiredDate}
              onChange={(e) => setFilterRequiredDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-medium text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filterStatus !== 'ALL' || filterPriority !== 'ALL' || filterBloodGroup !== 'ALL' || filterDistrict !== 'ALL' || filterRequiredDate || searchQuery) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
                setFilterPriority('ALL');
                setFilterBloodGroup('ALL');
                setFilterDistrict('ALL');
                setFilterRequiredDate('');
              }}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              সকল ফিল্টার রিসেট করুন
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3.5">আবেদন নং</th>
                <th className="p-3.5">রোগীর নাম</th>
                <th className="p-3.5">গ্রুপ</th>
                <th className="p-3.5">হাসপাতাল & জেলা</th>
                <th className="p-3.5">জরুরী মাত্রা</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5">তারিখ</th>
                <th className="p-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">লোডিং হচ্ছে...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">কোনো রক্তের আবেদন পাওয়া যায়নি।</td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const isCritical = r.priority === 'CRITICAL';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      
                      {/* Request Number */}
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-[11px] text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-700">
                          {r.requestNumber || r.id}
                        </span>
                      </td>

                      {/* Patient Name */}
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{r.patientName}</div>
                        <span className="text-[10px] text-slate-400 font-normal">যোগাযোগ: {r.contactPhone}</span>
                      </td>

                      {/* Blood Group */}
                      <td className="p-3.5 font-bold">
                        <span className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {r.bloodGroup}
                        </span>
                      </td>

                      {/* Hospital & District */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{r.hospitalName}</div>
                        <span className="text-[10px] text-slate-400">{r.upazila}, {r.district || 'রাজবাড়ী'}</span>
                      </td>

                      {/* Priority */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCritical
                            ? 'bg-red-600 text-white animate-pulse'
                            : r.priority === 'URGENT'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {isCritical ? 'অতীব জরুরী' : r.priority === 'URGENT' ? 'জরুরী' : 'সাধারণ'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value as RequestStatus)}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1 text-[11px] font-bold text-slate-900 dark:text-white"
                        >
                          <option value="PENDING">অপেক্ষমাণ (Pending)</option>
                          <option value="SEARCHING">সার্চিং (Searching)</option>
                          <option value="MATCHED">ম্যাচড (Matched)</option>
                          <option value="FULFILLED">সম্পন্ন (Fulfilled)</option>
                          <option value="COMPLETED">সম্পন্ন (Completed)</option>
                          <option value="CANCELLED">বাতিল (Cancelled)</option>
                        </select>
                      </td>

                      {/* Required Date */}
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {r.requiredDate}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => setViewDetailModalReq(r)}
                          title="বিস্তারিত বিবরণ"
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenSmartMatcher(r)}
                          title="স্মার্ট রক্তদাতা ম্যাচিং"
                          className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setEditNotesModalReq(r);
                            setAdminNotesText(r.adminNotes || '');
                          }}
                          title="এডমিন নোটস"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {isAdminOrSuper && (
                          <button
                            onClick={() => handleDeleteRequest(r.id)}
                            title="মুছে ফেলুন (Soft Delete)"
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {viewDetailModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 bg-red-600 text-white font-black text-xl rounded-2xl flex items-center justify-center shadow-md">
                  {viewDetailModalReq.bloodGroup}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {viewDetailModalReq.patientName} (আবেদন নং: {viewDetailModalReq.requestNumber || viewDetailModalReq.id})
                  </h3>
                  <p className="text-xs text-slate-400">প্রয়োজন: {viewDetailModalReq.bagsNeeded} ব্যাগ রক্ত</p>
                </div>
              </div>
              <button onClick={() => setViewDetailModalReq(null)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">টাইমলাইন ও স্ট্যাটাস ট্রেসিং</span>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={`px-2.5 py-1 rounded-lg ${viewDetailModalReq.status === 'PENDING' ? 'bg-amber-500 text-slate-900 font-extrabold' : 'bg-slate-200 text-slate-600'}`}>
                  ১. পেন্ডিং
                </span>
                <span className={`px-2.5 py-1 rounded-lg ${viewDetailModalReq.status === 'SEARCHING' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  ২. ডোনার সন্ধান
                </span>
                <span className={`px-2.5 py-1 rounded-lg ${viewDetailModalReq.status === 'MATCHED' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  ৩. ডোনার ম্যাচড
                </span>
                <span className={`px-2.5 py-1 rounded-lg ${viewDetailModalReq.status === 'FULFILLED' || viewDetailModalReq.status === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  ৪. রক্তদান সম্পন্ন
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">হাসপাতাল & ঠিকানা</span>
                <p className="font-bold text-slate-900 dark:text-white">{viewDetailModalReq.hospitalName}</p>
                <p className="text-slate-500">{viewDetailModalReq.upazila}, {viewDetailModalReq.district || 'রাজবাড়ী'}</p>
                {viewDetailModalReq.exactAddress && <p className="text-slate-400 italic">ঠিকানা: {viewDetailModalReq.exactAddress}</p>}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">যোগাযোগ</span>
                <p className="font-bold text-slate-900 dark:text-white">{viewDetailModalReq.contactPerson}</p>
                <p className="text-red-600 font-extrabold">ফোন: {viewDetailModalReq.contactPhone}</p>
                {viewDetailModalReq.whatsAppNumber && <p className="text-emerald-600 font-bold">WhatsApp: {viewDetailModalReq.whatsAppNumber}</p>}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">তারিখ ও সময়</span>
                <p className="font-bold text-slate-900 dark:text-white">তারিখ: {viewDetailModalReq.requiredDate}</p>
                {viewDetailModalReq.requiredTime && <p className="text-slate-500">সময়: {viewDetailModalReq.requiredTime}</p>}
                <p className="text-slate-400 text-[10px]">আবেদনের সময়: {new Date(viewDetailModalReq.createdAt).toLocaleString('bn-BD')}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">জরুরী মাত্রা & ডাক্তার</span>
                <p className="font-bold text-slate-900 dark:text-white">মাত্রা: {viewDetailModalReq.priority}</p>
                {viewDetailModalReq.doctorName && <p className="text-slate-500">ডাক্তার: {viewDetailModalReq.doctorName}</p>}
              </div>
            </div>

            {/* Reason & Notes */}
            {viewDetailModalReq.diseaseOrReason && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">রোগ / অপারেশনের কারণ</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{viewDetailModalReq.diseaseOrReason}</p>
              </div>
            )}

            {viewDetailModalReq.adminNotes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs space-y-1">
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block">এডমিন নোটস</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{viewDetailModalReq.adminNotes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setViewDetailModalReq(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notes Edit Modal */}
      {editNotesModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>এডমিন নোটস যুক্ত করুন / এডিট করুন</span>
              </h3>
              <button onClick={() => setEditNotesModalReq(null)} className="p-1 text-slate-400">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              রোগী: <strong className="text-slate-800 dark:text-slate-200">{editNotesModalReq.patientName}</strong> ({editNotesModalReq.requestNumber || editNotesModalReq.id})
            </p>

            <textarea
              rows={4}
              value={adminNotesText}
              onChange={(e) => setAdminNotesText(e.target.value)}
              placeholder="যেমন: রক্তদাতা জাহিদ ভাইকে এসাইন করা হয়েছে, ডোনার হাসপাতালে রওয়ানা হয়েছেন..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditNotesModalReq(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveAdminNotes}
                disabled={savingNotes}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                {savingNotes ? 'সংরক্ষণ হচ্ছে...' : 'নোট সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Donor Matcher Modal */}
      {selectedReqForMatching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>স্মার্ট রক্তদাতা ম্যাচিং: {selectedReqForMatching.patientName} ({selectedReqForMatching.bloodGroup})</span>
                </h3>
                <p className="text-xs text-slate-500">উপযুক্ত ও প্রস্তুত রক্তদাতাদের শর্টলিস্ট</p>
              </div>
              <button onClick={() => setSelectedReqForMatching(null)} className="p-1 text-slate-400">✕</button>
            </div>

            {loadingDonors ? (
              <p className="py-8 text-center text-xs text-slate-400">উপযুক্ত রক্তদাতা ডাটাবেজে সার্চ করা হচ্ছে...</p>
            ) : matchedDonors.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">দুঃখিত, বর্তমানে কোনো উপযুক্ত প্রস্তুত রক্তদাতা পাওয়া যায়নি।</p>
            ) : (
              <div className="space-y-2">
                {matchedDonors.map((donor) => (
                  <div
                    key={donor.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {donor.bloodGroup}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{donor.name}</p>
                        <p className="text-slate-500">{donor.union}, {donor.village} • {donor.phone}</p>
                      </div>
                    </div>

                    <a
                      href={`tel:${donor.phone}`}
                      className="inline-flex items-center gap-1 bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>কল করুন</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
