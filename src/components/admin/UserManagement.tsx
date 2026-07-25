import React, { useState, useEffect } from 'react';
import { AdminUser, UserRole } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { Shield, UserPlus, Mail, Phone, CheckCircle2 } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { token, user: currentUser } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('VOLUNTEER');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, phone, role })
      });

      if (res.ok) {
        setName('');
        setEmail('');
        setPhone('');
        setShowAddForm(false);
        fetchUsers();
      } else {
        alert('নতুন ইউজার যুক্ত করা সম্ভব হয়নি।');
      }
    } catch (err) {
      console.error('Create user error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span>এডমিন ও ভলান্টিয়ার ভূমিকা (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500">পাংশা ব্লাড ডোনার্স এসোসিয়েশনের স্টাফদের রোল ও পারমিশন ব্যবস্থাপনা</p>
        </div>

        {currentUser?.role === 'SUPER_ADMIN' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ নতুন এডমিন/ভলান্টিয়ার</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateUser} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold border-b pb-2">নতুন এডমিন ইউজার যোগ করুন</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="নাম *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border p-2 rounded-xl text-xs"
            />
            <input
              type="email"
              required
              placeholder="ইমেইল *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border p-2 rounded-xl text-xs"
            />
            <input
              type="tel"
              placeholder="ফোন"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border p-2 rounded-xl text-xs"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-slate-50 dark:bg-slate-800 border p-2 rounded-xl text-xs font-bold"
            >
              <option value="VOLUNTEER">ভলান্টিয়ার (Volunteer)</option>
              <option value="ADMIN">এডমিন (Admin)</option>
              <option value="SUPER_ADMIN">সুপার এডমিন (Super Admin)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
            >
              তৈরি করুন
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b font-bold text-slate-700 dark:text-slate-300">
            <tr>
              <th className="p-3.5">নাম</th>
              <th className="p-3.5">ইমেইল</th>
              <th className="p-3.5">মোবাইল</th>
              <th className="p-3.5">ভূমিকা (Role)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-6">লোডিং...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{u.name}</td>
                  <td className="p-3.5 font-mono">{u.email}</td>
                  <td className="p-3.5">{u.phone || 'N/A'}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-red-600">
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
