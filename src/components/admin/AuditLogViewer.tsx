import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { ShieldAlert, Clock, User, Activity } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/reports/audit-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setLogs(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span>সিকিউরিটি অডিট ট্রেইল (Audit Logs)</span>
        </h2>
        <p className="text-xs text-slate-500">সিস্টেমের সকল এডমিন এক্টিভিটি ও ডাটা পরিবর্তনের নিরাপদ লগ রেকর্ড</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b font-bold text-slate-700 dark:text-slate-300">
            <tr>
              <th className="p-3.5">সময়</th>
              <th className="p-3.5">এডমিন / ইউজার</th>
              <th className="p-3.5">অ্যাকশন</th>
              <th className="p-3.5">বিবরণ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-6">লোডিং...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-6">কোনো অডিট রেকর্ড নেই।</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{log.userName || log.userId}</td>
                  <td className="p-3.5 font-bold text-red-600">{log.action}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
