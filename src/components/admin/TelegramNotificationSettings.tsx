import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Send, Bot, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

export const TelegramNotificationSettings: React.FC = () => {
  const { token } = useAuth();

  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [testMsg, setTestMsg] = useState('পাংশা ব্লাড ডোনার্স এসোসিয়েশন - টেলিগ্রাম এলার্ট টেস্ট মেসেজ');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setBotToken(data.telegramBotToken || '');
          setChatId(data.telegramChatId || '');
        }
      } catch (err) {
        console.error('Failed to load telegram settings:', err);
      }
    };
    loadSettings();
  }, []);

  const handleSendTestAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/notifications/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: testMsg })
      });

      if (res.ok) {
        setTestResult(await res.json());
      }
    } catch (err) {
      console.error('Test telegram alert failed:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <span>টেলিগ্রাম বোট ও অটো-নোটিফিকেশন সেটিং</span>
        </h2>
        <p className="text-xs text-slate-500">জরুরী রক্তদানের আবেদন পোস্ট হলে সরাসরি টেলিগ্রাম চ্যানেল বা গ্রুপে অটো-ব্রডকাস্ট</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <form onSubmit={handleSendTestAlert} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              টেলিগ্রাম বোট টোকেন (Telegram Bot Token)
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRstUVwxyZ"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              টেলিগ্রাম চ্যাট / চ্যানেল আইডি (Chat / Channel ID)
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g. @pangshablooddonors or -10012345678"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              টেস্ট ব্রডকাস্ট বার্তা
            </label>
            <input
              type="text"
              value={testMsg}
              onChange={(e) => setTestMsg(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={testing}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>{testing ? 'প্রসেস হচ্ছে...' : 'টেস্ট টেলিগ্রাম নোটিফিকেশন পাঠান'}</span>
          </button>
        </form>

        {testResult && (
          <div className="p-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-2xl border border-emerald-200 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{testResult.message}</span>
            </p>
            <p className="text-[11px] opacity-80">অডিট লগে ব্রডকাস্ট টেস্ট রেকর্ড অন্তর্ভুক্ত হয়েছে।</p>
          </div>
        )}
      </div>
    </div>
  );
};
