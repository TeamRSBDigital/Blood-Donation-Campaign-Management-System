import React, { useState } from 'react';
import { donorService } from '../../../services/donorService.js';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_JSON = [
  {
    "name": "মোঃ রফিক আহমেদ",
    "nameEn": "Md. Rafiq Ahmed",
    "bloodGroup": "O+",
    "phone": "01711223344",
    "gender": "MALE",
    "age": 28,
    "district": "রাজবাড়ী",
    "upazila": "পাংশা",
    "union": "পাংশা পৌরসভা",
    "village": "কলেজ রোড",
    "lastDonationDate": "2025-10-15"
  },
  {
    "name": "মোসাঃ সাবরিনা রহমান",
    "bloodGroup": "B+",
    "phone": "01822334455",
    "gender": "FEMALE",
    "age": 23,
    "district": "রাজবাড়ী",
    "upazila": "পাংশা",
    "union": "হাবাসপুর",
    "village": "চর হাবাসপুর",
    "lastDonationDate": "2025-08-01"
  }
];

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonText(text);
        setError('');
      } catch (err) {
        setError('ফাইল রিড করা যায়নি');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setError('');
    setResultMessage('');

    if (!jsonText.trim()) {
      setError('অনুগ্রহ করে JSON ডেটা লিখুন বা ফাইল আপলোড করুন।');
      return;
    }

    let parsedData: any[];
    try {
      parsedData = JSON.parse(jsonText);
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        setError('JSON অবশ্যই একটি অ্যারে (Array) হতে হবে এবং অন্তত ১টি অবজেক্ট থাকতে হবে।');
        return;
      }
    } catch (err) {
      setError('অবৈধ JSON ফরম্যাট। অনুগ্রহ করে সঠিক JSON ফরম্যাট ব্যবহার করুন।');
      return;
    }

    setLoading(true);
    try {
      const res = await donorService.bulkImport(parsedData);
      if (res.error) {
        setError(res.error);
      } else {
        setResultMessage(`সফলভাবে ${res.importedCount} জন নতুন রক্তদাতা ইম্পোর্ট করা হয়েছে!`);
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'ইম্পোর্ট করা সম্ভব হয়নি');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setJsonText(JSON.stringify(SAMPLE_JSON, null, 2));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5 text-red-500" />
            <h3 className="font-extrabold text-base">বাল্ক রক্তদাতা ইম্পোর্ট (Bulk Import)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {resultMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{resultMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              JSON ডাটা পেস্ট করুন বা ফাইল আপলোড করুন
            </label>

            <button
              type="button"
              onClick={loadSample}
              className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>নমুনা টেমপ্লেট দেখুন</span>
            </button>
          </div>

          <textarea
            rows={10}
            placeholder={`[\n  {\n    "name": "মোঃ রফিক",\n    "bloodGroup": "O+",\n    "phone": "01700000000",\n    "upazila": "পাংশা",\n    "village": "কলেজ রোড"\n  }\n]`}
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px] outline-none"
          />

          <div className="flex items-center justify-between pt-2">
            <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer hover:bg-slate-300">
              <FileText className="w-4 h-4" />
              <span>JSON ফাইল বেছে নিন</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md disabled:opacity-50"
              >
                {loading ? 'ইম্পোর্ট হচ্ছে...' : 'ইম্পোর্ট করুন'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
