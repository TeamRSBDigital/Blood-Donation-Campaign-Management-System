import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Radio,
  Send,
  Plus,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  Copy,
  Users,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { BroadcastCampaign, UserRole } from '../../types/index.js';
import { communicationService } from '../../services/communicationService.js';
import { BroadcastComposerModal } from './communication/BroadcastComposerModal.js';
import { BroadcastDetailModal } from './communication/BroadcastDetailModal.js';
import { TemplateManagerModal } from './communication/TemplateManagerModal.js';

interface CommunicationCenterProps {
  currentUserRole: UserRole;
}

export const CommunicationCenter: React.FC<CommunicationCenterProps> = ({ currentUserRole }) => {
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modals state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEmergencyComposer, setIsEmergencyComposer] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [selectedCampaignForDetail, setSelectedCampaignForDetail] = useState<BroadcastCampaign | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await communicationService.getCampaigns({
        status: selectedStatus,
        type: selectedType,
        searchQuery
      });
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || 'ব্রডকাস্ট তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedStatus, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${title}" ব্রডকাস্ট ক্যাম্পেইন রেকর্ডটি মুছে ফেলতে চান?`)) return;
    try {
      await communicationService.deleteCampaign(id);
      fetchCampaigns();
    } catch (err: any) {
      alert(err.message || 'মুছে ফেলা সম্ভব হয়নি');
    }
  };

  // RBAC Access Control Check
  if (currentUserRole !== 'SUPER_ADMIN' && currentUserRole !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="p-4 bg-red-100 text-red-600 rounded-2xl w-fit mx-auto">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">প্রবেশাধিকার সংরক্ষিত</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          কমিউনিকেশন সেন্টার ও স্মার্ট ব্রডকাস্ট সিস্টেম শুধুমাত্র সুপার এডমিন এবং এডমিনদের জন্য নির্ধারিত।
        </p>
      </div>
    );
  }

  // Calculate Summary Stats
  const totalCampaigns = campaigns.length;
  const totalDelivered = campaigns.reduce((acc, curr) => acc + (curr.deliveredCount || 0), 0);
  const totalScheduled = campaigns.filter(c => c.status === 'SCHEDULED').length;
  const totalEmergency = campaigns.filter(c => c.isEmergency).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-red-100">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-300" />
            <span>COMMUNICATION CENTER & SMART BROADCAST SYSTEM</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            কমিউনিকেশন সেন্টার ও স্মার্ট ব্রডকাস্ট
          </h1>
          <p className="text-xs md:text-sm text-red-100 font-medium leading-relaxed">
            টেলিগ্রাম গ্রুপ, হোয়াটসঅ্যাপ ক্রাউড API এবং ড্যাশবোর্ড নোটিফিকেশনের মাধ্যমে নির্দিষ্ট রক্তদাতা ও ভলান্টিয়ারদের সাথে রিয়েলটাইম যোগাযোগের স্মার্ট প্ল্যাটফর্ম।
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
          <button
            onClick={() => {
              setIsEmergencyComposer(true);
              setIsComposerOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-red-700 hover:bg-red-50 font-black text-xs px-4 py-3 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <ShieldAlert className="w-4 h-4 text-red-600 animate-bounce" />
            <span>🚨 ইমার্জেন্সি ব্রডকাস্ট</span>
          </button>

          <button
            onClick={() => {
              setIsEmergencyComposer(false);
              setIsComposerOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-950/60 hover:bg-red-900/80 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-red-500/30 backdrop-blur-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ব্রডকাস্ট</span>
          </button>

          <button
            onClick={() => setIsTemplateManagerOpen(true)}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-colors"
            title="মেসেজ টেমপ্লেট ম্যানেজার"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 block">মোট ব্রডকাস্ট ক্যাম্পেইন</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCampaigns} টি</span>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-600 rounded-2xl">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 block">সফল বার্তা পৌঁছেছে</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalDelivered} জন</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 block">সিডিউলড কিউয়ে আছে</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalScheduled} টি</span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 block">ইমার্জেন্সি এলার্টস</span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{totalEmergency} টি</span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="টাইটেল বা মেসেজ দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-900 dark:text-white"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white"
          >
            <option value="ALL">সকল স্ট্যাটাস</option>
            <option value="SENT">পাঠানো সম্পন্ন (Sent)</option>
            <option value="SCHEDULED">সিডিউলড (Scheduled)</option>
            <option value="DRAFT">ড্রাফট (Draft)</option>
            <option value="CANCELLED">বাতিলকৃত (Cancelled)</option>
          </select>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white"
          >
            <option value="ALL">সকল ক্যাটাগরি</option>
            <option value="EMERGENCY_BLOOD_REQUEST">🚨 জরুরী রক্তদান</option>
            <option value="GENERAL_ANNOUNCEMENT">📢 সাধারণ ঘোষণা</option>
            <option value="CAMPAIGN_UPDATE">🩸 ক্যাম্পেইন আপডেট</option>
            <option value="VOLUNTEER_NOTICE">🤝 ভলান্টিয়ার নোটিশ</option>
          </select>

          <button
            onClick={fetchCampaigns}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Campaigns History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-600" />
            <span>ব্রডকাস্ট ইতিহাস ও ক্যাম্পেইন লগ ({campaigns.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400 font-bold">ব্রডকাস্ট লগ লোড হচ্ছে...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-xs text-slate-400 font-bold">কোন ব্রডকাস্ট বার্তা পাওয়া যায়নি</p>
            <button
              onClick={() => {
                setIsEmergencyComposer(false);
                setIsComposerOpen(true);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
            >
              প্রথম ব্রডকাস্ট তৈরি করুন
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold">
                <tr>
                  <th className="p-4">টাইটেল ও বিষয়</th>
                  <th className="p-4">ক্যাটাগরি & প্রাধিকার</th>
                  <th className="p-4">চ্যানেলসমূহ</th>
                  <th className="p-4">প্রাপক সংখ্যা</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4">তারিখ & সময়</th>
                  <th className="p-4 text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        {c.isEmergency && (
                          <span className="p-1 rounded-md bg-red-100 text-red-600 text-[10px] font-black">🚨 CRITICAL</span>
                        )}
                        <span className="line-clamp-1">{c.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 font-mono mt-0.5">
                        {c.message}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 block w-fit">
                        {c.type}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {c.channels.map(ch => (
                          <span key={ch} className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                            {ch.split('_')[0]}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-black text-slate-800 dark:text-white">
                        {c.deliveredCount} / {c.estimatedRecipientsCount} জন
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        c.status === 'SENT'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : c.status === 'SCHEDULED'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          : c.status === 'SENDING'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 animate-pulse'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('bn-BD')}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCampaignForDetail(c)}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          title="বিস্তারিত বিবরণ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(c.id, c.title)}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modals */}
      <BroadcastComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSuccess={fetchCampaigns}
        initialEmergencyMode={isEmergencyComposer}
      />

      <BroadcastDetailModal
        campaign={selectedCampaignForDetail}
        isOpen={!!selectedCampaignForDetail}
        onClose={() => setSelectedCampaignForDetail(null)}
        onRefresh={fetchCampaigns}
      />

      <TemplateManagerModal
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
      />
    </div>
  );
};
