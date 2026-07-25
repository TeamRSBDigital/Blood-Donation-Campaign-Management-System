import React, { useState } from 'react';
import { Bell, Droplet, AlertTriangle, Check, CheckCheck, Trash2, X } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'CRITICAL' | 'SYSTEM' | 'DONOR';
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateRequests?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  onNavigateRequests,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'জরুরী রক্তের প্রয়োজন (O+)',
      description: 'পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্সের জন্য ২ ব্যাগ ও-পজিটিভ রক্ত জরুরী।',
      time: '১০ মিনিট আগে',
      read: false,
      type: 'CRITICAL',
    },
    {
      id: '2',
      title: 'নতুন রক্তদাতা আবেদন',
      description: 'মোঃ তানভীর পাংশা পৌরসভা থেকে নিবন্ধন আবেদন করেছেন।',
      time: '১ ঘণ্টা আগে',
      read: false,
      type: 'DONOR',
    },
    {
      id: '3',
      title: 'সিস্টেম অটো-ব্যাকআপ সম্পন্ন',
      description: 'আজকের ডাটাবেজ ব্যাকআপ সফলভাবে সংরক্ষণ করা হয়েছে।',
      time: '৩ ঘণ্টা আগে',
      read: true,
      type: 'SYSTEM',
    },
  ]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-red-600" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">নোটিফিকেশন</h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px]">
              {unreadCount} নতুন
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-bold text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
              title="সব পঠিত চিহ্নিত করুন"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>সব পড়া হয়েছে</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">কোনো নোটিফিকেশন নেই</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                toggleRead(item.id);
                if (item.type === 'CRITICAL' && onNavigateRequests) {
                  onNavigateRequests();
                  onClose();
                }
              }}
              className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                !item.read
                  ? 'bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'CRITICAL'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                    : item.type === 'DONOR'
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                }`}
              >
                {item.type === 'CRITICAL' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : item.type === 'DONOR' ? (
                  <Droplet className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={clearAll}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ক্লিয়ার করুন</span>
          </button>
          <span className="text-[10px] text-slate-400 font-bold">
            পাংশা ব্লাড ডোনার্স এসোসিয়েশন নোটিফাই
          </span>
        </div>
      )}
    </div>
  );
};
