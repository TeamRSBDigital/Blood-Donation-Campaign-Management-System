import React, { useState, useEffect, useMemo } from 'react';
import { AdminUser, UserRole, UserStatus, AuditLog } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Shield,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit3,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  X,
  Clock
} from 'lucide-react';
import { UserDetailModal } from './UserDetailModal.js';
import { UserEditModal } from './UserEditModal.js';
import { ChangeRoleModal } from './ChangeRoleModal.js';
import { RemoveUserConfirmModal } from './RemoveUserConfirmModal.js';

export const UserManagement: React.FC = () => {
  const { token, user: currentUser } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  // Form & Modals state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('VOLUNTEER');
  const [creating, setCreating] = useState(false);

  // Active Modals target
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [changingRoleUser, setChangingRoleUser] = useState<AdminUser | null>(null);
  const [removingUser, setRemovingUser] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        const err = await res.json();
        console.error('Fetch users failed:', err);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (currentUser?.role !== 'SUPER_ADMIN') return;
    try {
      const res = await fetch('/api/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const logs: AuditLog[] = await res.json();
        const rbacLogs = logs.filter(l =>
          ['USER_CREATED', 'USER_UPDATED', 'USER_ROLE_CHANGED', 'USER_STATUS_CHANGED', 'USER_REMOVED', 'ADD_ADMIN_USER'].includes(l.action)
        );
        setAuditLogs(rbacLogs);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.role !== 'VOLUNTEER') {
      fetchUsers();
      fetchAuditLogs();
    }
  }, [currentUser]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setCreating(true);
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
        showNotification('success', 'নতুন ব্যবহারকারী অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে!');
        fetchUsers();
        fetchAuditLogs();
      } else {
        const errData = await res.json();
        showNotification('error', errData.error || 'নতুন ইউজার যুক্ত করা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'নেটওয়ার্ক এরর।');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveUserEdit = async (updatedData: { name: string; email: string; phone: string }) => {
    if (!editingUser) return;
    const res = await fetch(`/api/users/${editingUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    });

    if (res.ok) {
      showNotification('success', 'ব্যবহারকারীর তথ্য সফলভাবে আপডেট করা হয়েছে।');
      fetchUsers();
      fetchAuditLogs();
    } else {
      const errData = await res.json();
      throw new Error(errData.error || 'ইউজার তথ্য আপডেট করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleConfirmRoleChange = async (newRole: UserRole) => {
    if (!changingRoleUser) return;
    const res = await fetch(`/api/users/${changingRoleUser.id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });

    if (res.ok) {
      showNotification('success', `${changingRoleUser.name}-এর ভূমিকা সফলভাবে ${newRole}-এ পরিবর্তন করা হয়েছে।`);
      fetchUsers();
      fetchAuditLogs();
    } else {
      const errData = await res.json();
      throw new Error(errData.error || 'ভূমিকা পরিবর্তন করতে সমস্যা হয়েছে।');
    }
  };

  const handleToggleStatus = async (userToToggle: AdminUser) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      showNotification('error', 'শুধুমাত্র সুপার এডমিন স্ট্যাটাস পরিবর্তন করতে পারবেন।');
      return;
    }

    if (currentUser.id === userToToggle.id || currentUser.email.toLowerCase() === userToToggle.email.toLowerCase()) {
      showNotification('error', 'আপনি নিজের অ্যাকাউন্ট স্থগিত বা নিষ্ক্রিয় করতে পারবেন না।');
      return;
    }

    const currentStatus = userToToggle.status || (userToToggle.active ? 'ACTIVE' : 'INACTIVE');
    const newStatus: UserStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    try {
      const res = await fetch(`/api/users/${userToToggle.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showNotification('success', `${userToToggle.name}-এর স্ট্যাটাস ${newStatus === 'ACTIVE' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে।`);
        fetchUsers();
        fetchAuditLogs();
      } else {
        const errData = await res.json();
        showNotification('error', errData.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'নেটওয়ার্ক এরর।');
    }
  };

  const handleConfirmRemove = async () => {
    if (!removingUser) return;
    const res = await fetch(`/api/users/${removingUser.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      showNotification('success', 'ব্যবহারকারী অ্যাকাউন্ট সফলভাবে রিমুভ করা হয়েছে (Soft Deleted)।');
      fetchUsers();
      fetchAuditLogs();
    } else {
      const errData = await res.json();
      throw new Error(errData.error || 'ব্যবহারকারী অপসারণ করতে ব্যর্থ হয়েছে।');
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.phone && u.phone.includes(query)) ||
        u.role.toLowerCase().includes(query);

      // Role Filter
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

      // Status Filter
      const userStatus = u.status || (u.active ? 'ACTIVE' : 'INACTIVE');
      const matchesStatus = statusFilter === 'ALL' || userStatus === statusFilter;

      // Date Filter
      let matchesDate = true;
      if (dateFilter !== 'ALL') {
        const createdDate = new Date(u.createdAt).getTime();
        const now = Date.now();
        if (dateFilter === 'LAST_7_DAYS') {
          matchesDate = now - createdDate <= 7 * 24 * 3600 * 1000;
        } else if (dateFilter === 'LAST_30_DAYS') {
          matchesDate = now - createdDate <= 30 * 24 * 3600 * 1000;
        } else if (dateFilter === 'THIS_YEAR') {
          matchesDate = new Date(u.createdAt).getFullYear() === new Date().getFullYear();
        }
      }

      return matchesSearch && matchesRole && matchesStatus && matchesDate;
    });
  }, [users, searchQuery, roleFilter, statusFilter, dateFilter]);

  if (currentUser?.role === 'VOLUNTEER') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center max-w-2xl mx-auto shadow-lg space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto dark:bg-red-950/60 dark:text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">অনুমতি সীমাবদ্ধ (Access Restricted)</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          ভলান্টিয়ার অ্যাকাউন্টের মাধ্যমে এডমিন ও স্টাফ রোল ম্যানেজমেন্ট (RBAC System) অ্যাক্সেস করার অনুমতি নেই।
          প্রয়োজনে সুপার এডমিনের সাথে যোগাযোগ করুন।
        </p>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            <span>এডমিন ও ভলান্টিয়ার ভূমিকা (RBAC Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            পাংশা ব্লাড ডোনার্স এসোসিয়েশনের স্টাফদের ভূমিকা, অ্যাকাউন্ট স্ট্যাটাস ও রোল-ভিত্তিক পারমিশন সিস্টেম
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              onClick={() => setShowAuditLogs(!showAuditLogs)}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-200 transition-colors"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>{showAuditLogs ? 'ইউজার তালিকা' : 'অডিট লগ'}</span>
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ নতুন এডমিন/ভলান্টিয়ার</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <form onSubmit={handleCreateUser} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-red-600" />
              <span>নতুন এডমিন বা ভলান্টিয়ার অ্যাকাউন্ট তৈরি করুন</span>
            </h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">পূর্ণ নাম *</label>
              <input
                type="text"
                required
                placeholder="নাম লিখুন"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">ইমেইল ঠিকানা *</label>
              <input
                type="email"
                required
                placeholder="example@pbda.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">মোবাইল নম্বর</label>
              <input
                type="tel"
                placeholder="01712..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">প্রাথমিক ভূমিকা (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="VOLUNTEER">ভলান্টিয়ার (Volunteer)</option>
                <option value="ADMIN">এডমিন (Admin)</option>
                <option value="SUPER_ADMIN">সুপার এডমিন (Super Admin)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {creating ? 'তৈরি হচ্ছে...' : 'অ্যাাকাউন্ট তৈরি করুন'}
            </button>
          </div>
        </form>
      )}

      {/* Audit Log View */}
      {showAuditLogs ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>সিস্টেম আরবিএসি অডিট লগ (RBAC Audit Trail)</span>
            </h3>
            <button onClick={() => setShowAuditLogs(false)} className="text-xs font-bold text-red-600 hover:underline">
              ইউজার তালিকায় ফিরুন
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">কোন আরবিএসি সংক্রান্ত অডিট লগ পাওয়া যায়নি।</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="py-3 text-xs flex items-start justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{log.actorName}</span>
                    <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-bold">
                      {log.actorRole}
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString('bn-BD')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="নাম, ইমেইল, ফোন দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 py-2 focus:outline-none"
              >
                <option value="ALL">সকল ভূমিকা (All Roles)</option>
                <option value="SUPER_ADMIN">সুপার এডমিন (Super Admin)</option>
                <option value="ADMIN">এডমিন (Admin)</option>
                <option value="VOLUNTEER">ভলান্টিয়ার (Volunteer)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 py-2 focus:outline-none"
              >
                <option value="ALL">সকল স্ট্যাটাস (All Status)</option>
                <option value="ACTIVE">সক্রিয় (Active)</option>
                <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                <option value="SUSPENDED">স্থগিত (Suspended)</option>
              </select>
            </div>

            {/* Registration Date Filter */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 py-2 focus:outline-none"
              >
                <option value="ALL">সকল সময় (All Time)</option>
                <option value="LAST_7_DAYS">গত ৭ দিন (Last 7 Days)</option>
                <option value="LAST_30_DAYS">গত ৩০ দিন (Last 30 Days)</option>
                <option value="THIS_YEAR">চলতি বছর ({new Date().getFullYear()})</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">ব্যবহারকারী (User)</th>
                    <th className="p-3.5">ইমেইল ও মোবাইল</th>
                    <th className="p-3.5">ভূমিকা (Role)</th>
                    <th className="p-3.5">স্ট্যাটাস</th>
                    <th className="p-3.5">নিবন্ধনের তারিখ</th>
                    <th className="p-3.5 text-center">অ্যাকশন (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                        ডাটা লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                        কোন ব্যবহারকারী পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const userStatus = u.status || (u.active ? 'ACTIVE' : 'INACTIVE');
                      const isSelf = currentUser?.id === u.id || currentUser?.email.toLowerCase() === u.email.toLowerCase();

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-red-600 font-bold flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                  u.name.slice(0, 2)
                                )}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isSelf && (
                                    <span className="text-[9px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-1.5 py-0.5 rounded-full">
                                      আপনি (You)
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-mono text-slate-800 dark:text-slate-200">{u.email}</div>
                            <div className="text-[11px] text-slate-500">{u.phone || 'মোবাইল নেই'}</div>
                          </td>

                          <td className="p-3.5">
                            {u.role === 'SUPER_ADMIN' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 inline-flex items-center gap-1">
                                <Shield className="w-3 h-3" /> সুপার এডমিন
                              </span>
                            )}
                            {u.role === 'ADMIN' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 inline-flex items-center gap-1">
                                <Shield className="w-3 h-3" /> এডমিন
                              </span>
                            )}
                            {u.role === 'VOLUNTEER' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                ভলান্টিয়ার
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            {userStatus === 'ACTIVE' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 inline-flex items-center gap-1">
                                🟢 সক্রিয়
                              </span>
                            )}
                            {userStatus === 'INACTIVE' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 inline-flex items-center gap-1">
                                ⚪ নিষ্ক্রিয়
                              </span>
                            )}
                            {userStatus === 'SUSPENDED' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 inline-flex items-center gap-1">
                                🔒 স্থগিত
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                          </td>

                          {/* Actions Column */}
                          <td className="p-3.5">
                            <div className="flex items-center justify-center gap-1">
                              {/* 👁 View User */}
                              <button
                                onClick={() => setViewingUser(u)}
                                title="প্রোফাইল দেখুন (View)"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* ✏ Edit User */}
                              <button
                                onClick={() => setEditingUser(u)}
                                disabled={!isSuperAdmin}
                                title={isSuperAdmin ? 'সম্পাদনা করুন (Edit)' : 'শুধুমাত্র সুপার এডমিন সম্পাদনা করতে পারেন'}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* 🔄 Change Role */}
                              <button
                                onClick={() => setChangingRoleUser(u)}
                                disabled={!isSuperAdmin || isSelf}
                                title={isSelf ? 'নিজের ভূমিকা পরিবর্তন সম্ভব নয়' : isSuperAdmin ? 'ভূমিকা পরিবর্তন করুন (Change Role)' : 'শুধুমাত্র সুপার এডমিন'}
                                className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>

                              {/* 🔒 Suspend / Activate */}
                              <button
                                onClick={() => handleToggleStatus(u)}
                                disabled={!isSuperAdmin || isSelf}
                                title={isSelf ? 'নিজের অ্যাকাউন্ট স্থগিত করা সম্ভব নয়' : userStatus === 'ACTIVE' ? 'অ্যাকাউন্ট স্থগিত করুন (Suspend)' : 'অ্যাকাউন্ট সক্রিয় করুন (Activate)'}
                                className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${
                                  userStatus === 'ACTIVE'
                                    ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                }`}
                              >
                                {userStatus === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>

                              {/* 🗑 Remove User */}
                              <button
                                onClick={() => setRemovingUser(u)}
                                disabled={!isSuperAdmin || isSelf}
                                title={isSelf ? 'নিজের অ্যাকাউন্ট অপসারণ সম্ভব নয়' : isSuperAdmin ? 'ব্যবহারকারী রিমুভ করুন (Remove)' : 'শুধুমাত্র সুপার এডমিন'}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <UserDetailModal user={viewingUser} onClose={() => setViewingUser(null)} />

      <UserEditModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUserEdit}
      />

      <ChangeRoleModal
        user={changingRoleUser}
        onClose={() => setChangingRoleUser(null)}
        onConfirm={handleConfirmRoleChange}
      />

      <RemoveUserConfirmModal
        user={removingUser}
        onClose={() => setRemovingUser(null)}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
};
