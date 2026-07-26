import React, { useState } from 'react';
import { AdminUser } from '../../types/index.js';
import { Trash2, AlertOctagon, X } from 'lucide-react';

interface RemoveUserConfirmModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const RemoveUserConfirmModal: React.FC<RemoveUserConfirmModalProps> = ({ user, onClose, onConfirm }) => {
  if (!user) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'ব্যবহারকারী অপসারণ করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-red-600" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 rounded-2xl shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">ব্যবহারকারী অপসারণ নিশ্চিতকরণ</h3>
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold">সতর্কবার্তা: সফট ডিলিট অপারেশন</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2 mb-4">
          <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
          <div className="text-slate-500 font-mono">{user.email} | {user.phone || 'ফোন নেই'}</div>
          <div className="text-slate-500">ভূমিকা: <span className="font-bold text-slate-700 dark:text-slate-300">{user.role}</span></div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
          "Are you sure you want to remove this user? This action cannot be undone."<br />
          <span className="text-slate-500 text-[11px] block mt-1">
            (নোট: ডাটাবেজ সুরক্ষার স্বার্থে ইউজারের মূল রেকর্ড স্থায়ীভাবে মুছে যাবে না, সফট ডিলিট করে অ্যাকাউন্ট নিষ্ক্রিয় করা হবে।)
          </span>
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            বাতিল
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="px-5 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? 'অপসারণ হচ্ছে...' : 'অপসারণ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
