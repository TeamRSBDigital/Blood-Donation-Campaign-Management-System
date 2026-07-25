import React, { useState, useEffect } from 'react';
import { BloodRequest, RequestStatus, Donor, BloodGroup } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
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
  AlertTriangle
} from 'lucide-react';

export const BloodRequestManagement: React.FC = () => {
  const { token } = useAuth();

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReqForMatching, setSelectedReqForMatching] = useState<BloodRequest | null>(null);
  const [matchedDonors, setMatchedDonors] = useState<Donor[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(false);

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
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Find smart matching donors for a blood group
  const handleOpenSmartMatcher = async (req: BloodRequest) => {
    setSelectedReqForMatching(req);
    setLoadingDonors(true);

    try {
      // Calculate compatible blood groups
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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Droplet className="w-5 h-5 text-red-600" />
          <span>জরুরী রক্তের চাহিদা পরিচালনা</span>
        </h2>
        <p className="text-xs text-slate-500">রোগীদের রক্তের আবেদন অনুমোদন, সম্পন্নকরণ ও স্মার্ট রক্তদাতা ম্যাচিং</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3.5">গ্রুপ</th>
                <th className="p-3.5">রোগীর নাম</th>
                <th className="p-3.5">হাসপাতাল & ইউনিয়ন</th>
                <th className="p-3.5">যোগাযোগ</th>
                <th className="p-3.5">জরুরী মাত্রা</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5 text-right">স্মার্ট ম্যাচ / অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">লোডিং...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">কোনো আবেদন পাওয়া যায়নি।</td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-bold">
                      <span className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                        {r.bloodGroup}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{r.patientName}</div>
                      <span className="text-[10px] text-red-600 font-bold">{r.bagsNeeded} ব্যাগ প্রয়োজন</span>
                    </td>
                    <td className="p-3.5">
                      <div>{r.hospitalName}</div>
                      <span className="text-[10px] text-slate-400">{r.union || 'পাংশা'}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{r.contactPhone}</div>
                      <span className="text-[10px] text-slate-400">{r.contactPerson}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.priority === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : r.priority === 'URGENT'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {r.priority === 'CRITICAL' ? 'অতীব জরুরী' : r.priority === 'URGENT' ? 'জরুরী' : 'সাধারণ'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value as RequestStatus)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1 text-xs font-bold"
                      >
                        <option value="PENDING">অপেক্ষমাণ (Pending)</option>
                        <option value="APPROVED">অনুমোদিত (Approved)</option>
                        <option value="FULFILLED">সম্পন্ন (Fulfilled)</option>
                        <option value="CANCELLED">বাতিল (Cancelled)</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenSmartMatcher(r)}
                        className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ডোনার ম্যাচ করুন</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
