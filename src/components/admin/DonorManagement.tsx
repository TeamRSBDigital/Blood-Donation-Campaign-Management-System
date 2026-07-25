import React, { useState, useEffect } from 'react';
import { Donor, BloodGroup } from '../../types/index.js';
import { PANGSHA_UNIONS } from '../../constants/locations.js';
import { useAuth } from '../../context/AuthContext.js';
import Papa from 'papaparse';
import {
  Users,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Phone,
  CheckCircle2,
  Clock,
  Heart,
  FileSpreadsheet,
  FileCode,
  X,
  Droplet
} from 'lucide-react';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonorManagement: React.FC = () => {
  const { token, user } = useAuth();

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedUnion, setSelectedUnion] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [recordingDonationDonor, setRecordingDonationDonor] = useState<Donor | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Donor Form State
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    bloodGroup: 'B+' as BloodGroup,
    phone: '',
    alternativePhone: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    age: 25,
    weightKg: 65,
    district: 'Rajbari',
    upazila: 'পাংশা',
    union: 'পাংশা পৌরসভা',
    village: '',
    lastDonationDate: '',
    hemoglobinLevel: '14.0 g/dL',
    medicalNotes: '',
    isVerified: true
  });

  // Record Donation State
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospitalName, setHospitalName] = useState('পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স');
  const [patientName, setPatientName] = useState('');
  const [notes, setNotes] = useState('');

  // Bulk Import State
  const [importJsonText, setImportJsonText] = useState('');

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGroup !== 'ALL') params.append('bloodGroup', selectedGroup);
      if (selectedUnion !== 'ALL') params.append('union', selectedUnion);
      if (searchQuery.trim()) params.append('searchQuery', searchQuery.trim());

      const res = await fetch(`/api/donors?${params.toString()}`);
      if (res.ok) {
        setDonors(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedGroup, selectedUnion, searchQuery]);

  // Handle Add/Edit Donor Submit
  const handleSaveDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingDonor;
      const url = isEdit ? `/api/donors/${editingDonor.id}` : '/api/donors';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowAddModal(false);
        setEditingDonor(null);
        resetForm();
        fetchDonors();
      } else {
        alert('রক্তদাতার ডাটা সংরক্ষণ করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error('Save donor error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      bloodGroup: 'B+',
      phone: '',
      alternativePhone: '',
      gender: 'MALE',
      age: 25,
      weightKg: 65,
      district: 'Rajbari',
      upazila: 'পাংশা',
      union: 'পাংশা পৌরসভা',
      village: '',
      lastDonationDate: '',
      hemoglobinLevel: '14.0 g/dL',
      medicalNotes: '',
      isVerified: true
    });
  };

  // Open Edit Modal
  const openEditModal = (donor: Donor) => {
    setEditingDonor(donor);
    setFormData({
      name: donor.name,
      nameEn: donor.nameEn || '',
      bloodGroup: donor.bloodGroup,
      phone: donor.phone,
      alternativePhone: donor.alternativePhone || '',
      gender: donor.gender,
      age: donor.age,
      weightKg: donor.weightKg || 65,
      district: donor.district,
      upazila: donor.upazila,
      union: donor.union,
      village: donor.village,
      lastDonationDate: donor.lastDonationDate || '',
      hemoglobinLevel: donor.hemoglobinLevel || '14.0 g/dL',
      medicalNotes: donor.medicalNotes || '',
      isVerified: donor.isVerified
    });
    setShowAddModal(true);
  };

  // Handle Delete Donor
  const handleDeleteDonor = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে ${name} কে মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/donors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDonors();
      }
    } catch (err) {
      console.error('Delete donor error:', err);
    }
  };

  // Record Donation Submit
  const handleRecordDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingDonationDonor) return;

    try {
      const res = await fetch(`/api/donors/${recordingDonationDonor.id}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: donationDate,
          hospitalName,
          patientName,
          notes
        })
      });

      if (res.ok) {
        setRecordingDonationDonor(null);
        fetchDonors();
        alert('রক্তদানের তথ্য সফলভাবে রেকর্ড করা হয়েছে!');
      }
    } catch (err) {
      console.error('Record donation error:', err);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvData = donors.map(d => ({
      'ID': d.id,
      'Name': d.name,
      'Blood Group': d.bloodGroup,
      'Phone': d.phone,
      'Union': d.union,
      'Village': d.village,
      'Last Donation': d.lastDonationDate || 'N/A',
      'Total Donations': d.totalDonations,
      'Verified': d.isVerified ? 'Yes' : 'No'
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PBDA_Donors_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Import
  const handleBulkImportSubmit = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        alert('বৈধ JSON অ্যারে প্রদান করুন');
        return;
      }

      const res = await fetch('/api/donors/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ donors: parsed })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`সফলভাবে ${data.importedCount} জন রক্তদাতার ডাটা ইমপোর্ট হয়েছে!`);
        setShowImportModal(false);
        setImportJsonText('');
        fetchDonors();
      }
    } catch (err) {
      alert('JSON ফরম্যাট সঠিক নয়। সঠিক JSON স্ট্রাকচার পরীক্ষা করুন।');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            <span>রক্তদাতা ডাটাবেজ ব্যবস্থাপনা</span>
          </h2>
          <p className="text-xs text-slate-500">পাংশা উপজেলার নিবন্ধিত সকল রক্তদাতার তালিকা, এডিট ও ইমপোর্ট/এক্সপোর্ট</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingDonor(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন রক্তদাতা</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>CSV এক্সপোর্ট</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>ইমপোর্ট (JSON)</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">রক্তের গ্রুপ:</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
          >
            <option value="ALL">সকল রক্তের গ্রুপ</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">ইউনিয়ন:</label>
          <select
            value={selectedUnion}
            onChange={(e) => setSelectedUnion(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
          >
            <option value="ALL">সকল ইউনিয়ন</option>
            {PANGSHA_UNIONS.map(u => <option key={u.id} value={u.nameBn}>{u.nameBn}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">খুঁজুন:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3.5">গ্রুপ</th>
                <th className="p-3.5">নাম ও তথ্য</th>
                <th className="p-3.5">মোবাইল</th>
                <th className="p-3.5">ঠিকানা (ইউনিয়ন)</th>
                <th className="p-3.5">সর্বশেষ রক্তদান</th>
                <th className="p-3.5">অবস্থা</th>
                <th className="p-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">লোডিং ডাটা...</td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">কোনো রক্তদাতা পাওয়া যায়নি।</td>
                </tr>
              ) : (
                donors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-bold">
                      <span className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{d.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">বয়স: {d.age} • মোট দান: {d.totalDonations} বার</span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{d.phone}</td>
                    <td className="p-3.5">{d.union}, {d.village}</td>
                    <td className="p-3.5">{d.lastDonationDate || 'কখনো দেওয়া হয়নি'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status === 'AVAILABLE' ? 'প্রস্তুত' : 'প্রস্তুত নয়'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => setRecordingDonationDonor(d)}
                        title="নতুন রক্তদান রেকর্ড করুন"
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(d)}
                        title="এডিট করুন"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDonor(d.id, d.name)}
                        title="মুছে ফেলুন"
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Donor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingDonor ? 'রক্তদাতার তথ্য এডিট করুন' : 'নতুন রক্তদাতা যুক্ত করুন'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDonor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">রক্তদাতার নাম (বাংলায়) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">রক্তের গ্রুপ *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-red-600"
                  >
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ফোন নাম্বার *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ইউনিয়ন *</label>
                  <select
                    value={formData.union}
                    onChange={(e) => setFormData({ ...formData, union: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    {PANGSHA_UNIONS.map(u => <option key={u.id} value={u.nameBn}>{u.nameBn}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">গ্রামের নাম *</label>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">সর্বশেষ রক্তদানের তারিখ</label>
                  <input
                    type="date"
                    value={formData.lastDonationDate}
                    onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">বয়স</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Donation Modal */}
      {recordingDonationDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b pb-2">
              রক্তদানের তথ্য রেকর্ড করুন ({recordingDonationDonor.name})
            </h3>

            <form onSubmit={handleRecordDonationSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">রক্তদানের তারিখ *</label>
                <input
                  type="date"
                  required
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">হাসপাতাল / ক্লাইনিকের নাম *</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">রোগীর নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordingDonationDonor(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
                >
                  রেকর্ড করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b pb-2">
              বাল্ক রক্তদাতা ইমপোর্ট (JSON)
            </h3>
            <p className="text-xs text-slate-500">
              নিচে JSON ফরম্যাটে রক্তদাতাদের তালিকা পেস্ট করুন:
            </p>
            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[{"name": "মো: শফিক", "bloodGroup": "B+", "phone": "01712000000", "union": "হাবাসপুর", "village": "হাবাসপুর"}]'
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                বাতিল
              </button>
              <button
                onClick={handleBulkImportSubmit}
                className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
              >
                ইমপোর্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
