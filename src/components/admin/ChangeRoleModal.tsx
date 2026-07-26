import React, { useState } from 'react';
import { AdminUser, UserRole } from '../../types/index.js';
import { RefreshCw, Shield, AlertTriangle, X } from 'lucide-react';

interface ChangeRoleModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (newRole: UserRole) => Promise<void>;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({ user, onClose, onConfirm }) => {
  if (!user) return null;

  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [showSuperAdminConfirm, setShowSuperAdminConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    if (selectedRole === 'SUPER_ADMIN' && !showSuperAdminConfirm) {
      setShowSuperAdminConfirm(true);
      return;
    }

    executeRoleChange();
  };

  const executeRoleChange = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(selectedRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'ভূমিকা পরিবর্তন করতে সমস্যা হয়েছে।');
      setShowSuperAdminConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2.5 bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 rounded-xl">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">ব্যবহারকারীর ভূমিকা (Role) পরিবর্তন</h3>
            <p className="text-xs text-slate-500">{user.name} ({user.email})</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {showSuperAdminConfirm ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>সুপার এডমিন (Super Admin) নিশ্চিতকরণ</span>
              </div>
              <p className="text-amber-700 dark:text-amber-400">
                আপনি <strong>{user.name}</strong>-কে <strong>সুপার এডমিন (Super Admin)</strong> এর পূর্ণ দায়িত্ব প্রদান করছেন। সুপার এডমিনরা ডাটাবেজ ব্যাকআপ, সেটিংস পরিবর্তন এবং অন্য এডমিনদের বরখাস্ত/অপসারণ করতে পারেন।
              </p>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                আপনি কি এই পরিবর্তনের বিষয়ে সম্পূর্ণ নিশ্চিত?
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSuperAdminConfirm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold rounded-xl"
              >
                পিছনে যান
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={executeRoleChange}
                className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Shield className="w-4 h-4" />
                <span>{loading ? 'পরিবর্তন হচ্ছে...' : 'হ্যাঁ, সুপার এডমিন বানান'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2">বর্তমান ভূমিকা: <span className="text-red-600">{user.role}</span></label>
              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedRole === 'VOLUNTEER' ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="VOLUNTEER"
                    checked={selectedRole === 'VOLUNTEER'}
                    onChange={() => setSelectedRole('VOLUNTEER')}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">ভলান্টিয়ার (Volunteer)</span>
                    <span className="text-[11px] text-slate-500">সীমিত এক্সেস, রক্তদাতা ও আবেদন তথ্য সংগ্রহে সহায়তা।</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedRole === 'ADMIN' ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={selectedRole === 'ADMIN'}
                    onChange={() => setSelectedRole('ADMIN')}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">এডমিন (Admin)</span>
                    <span className="text-[11px] text-slate-500">রক্তদাতা ও রক্তের আবেদন অনুমোদন, কনটেন্ট সম্পাদনা।</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedRole === 'SUPER_ADMIN' ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="SUPER_ADMIN"
                    checked={selectedRole === 'SUPER_ADMIN'}
                    onChange={() => setSelectedRole('SUPER_ADMIN')}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-bold text-purple-700 dark:text-purple-400 block flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> সুপার এডমিন (Super Admin)
                    </span>
                    <span className="text-[11px] text-slate-500">সর্বোচ্চ নিয়ন্ত্রণ, ব্যাকআপ, সিস্টেম সেটিংস ও ইউজার পরিচালনা।</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={loading || selectedRole === user.role}
                className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                ভূমিকা আপডেট করুন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
