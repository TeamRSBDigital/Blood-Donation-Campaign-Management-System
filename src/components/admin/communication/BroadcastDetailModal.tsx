import React from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Copy,
  AlertTriangle,
  Users,
  MapPin,
  Radio,
  FileText
} from 'lucide-react';
import { BroadcastCampaign } from '../../../types/index.js';
import { communicationService } from '../../../services/communicationService.js';

interface BroadcastDetailModalProps {
  campaign: BroadcastCampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const BroadcastDetailModal: React.FC<BroadcastDetailModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onRefresh
}) => {
  if (!isOpen || !campaign) return null;

  const handleDuplicate = async () => {
    try {
      await communicationService.duplicateCampaign(campaign.id);
      alert('ক্যাম্পেইনটি ড্রাফট হিসেবে কপি করা হয়েছে');
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'কপি করা যায়নি');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই সিডিউলড ব্রডকাস্টটি বাতিল করতে চান?')) return;
    try {
      await communicationService.cancelCampaign(campaign.id);
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'বাতিল করা যায়নি');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className={`p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between ${
          campaign.isEmergency
            ? 'bg-red-600 text-white'
            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${campaign.isEmergency ? 'bg-white/20' : 'bg-red-100 dark:bg-red-950 text-red-600'}`}>
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">{campaign.title}</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 uppercase">
                  {campaign.status}
                </span>
              </div>
              <p className={`text-xs ${campaign.isEmergency ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
                তৈরি করেছেন: {campaign.createdBy} ({campaign.creatorRole}) • {new Date(campaign.createdAt).toLocaleString('bn-BD')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              campaign.isEmergency
                ? 'hover:bg-white/20 text-white'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">মোট টার্গেট প্রাপক</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {campaign.estimatedRecipientsCount} জন
              </span>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">সফল ডেলিভারি</span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {campaign.deliveredCount}
              </span>
            </div>

            <div className="bg-red-50 dark:bg-red-950/40 p-3.5 rounded-2xl border border-red-200 dark:border-red-900/40">
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 block mb-1">ব্যর্থ ডেলিভারি</span>
              <span className="text-xl font-black text-red-700 dark:text-red-300">
                {campaign.failedCount}
              </span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/40">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-1">চ্যানেলসমূহ</span>
              <span className="text-xs font-black text-blue-800 dark:text-blue-300 line-clamp-1">
                {campaign.channels.join(', ')}
              </span>
            </div>
          </div>

          {/* Message Content Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 block">
              মেসেজের বিবরণ (Message Content)
            </span>
            <p className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              {campaign.message}
            </p>
            {campaign.linkUrl && (
              <a
                href={campaign.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline block pt-1"
              >
                🔗 {campaign.linkUrl}
              </a>
            )}
          </div>

          {/* Delivery Log Table if Available */}
          {campaign.deliveryReport && campaign.deliveryReport.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                প্রাপক ভিত্তিক ডেলিভারি লগ (Recipient Log)
              </span>
              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">প্রাপকের নাম</th>
                      <th className="p-2.5">ফোন নম্বর</th>
                      <th className="p-2.5">চ্যানেল</th>
                      <th className="p-2.5">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {campaign.deliveryReport.map((rep, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-bold text-slate-800 dark:text-white">{rep.recipientName}</td>
                        <td className="p-2.5 text-slate-500 font-mono">{rep.phone}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400 font-bold">{rep.channel}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            rep.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                          }`}>
                            {rep.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>ক্যাম্পেইন কপি করুন</span>
          </button>

          {campaign.status === 'SCHEDULED' && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>সিডিউল বাতিল করুন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
