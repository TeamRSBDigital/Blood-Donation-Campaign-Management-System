import React, { useState, useEffect, useCallback } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Power,
  Trash2,
  Send,
  ShieldAlert,
  Battery,
  Clock,
  UserCheck,
  MessageSquare,
  Sparkles,
  ArrowRightLeft,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { WhatsappQrSessionState, WhatsappProviderType } from '../../types';

export const WhatsAppQrManager: React.FC = () => {
  const { user, token } = useAuth();
  const [session, setSession] = useState<WhatsappQrSessionState | null>(null);
  const [activeWhatsappProvider, setActiveWhatsappProvider] = useState<WhatsappProviderType>('CLOUD_API');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Test message states
  const [testPhone, setTestPhone] = useState('8801712345678');
  const [testCustomMsg, setTestCustomMsg] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Custom pairing simulation fields
  const [simPhone, setSimPhone] = useState('+8801712000000');
  const [simAccountName, setSimAccountName] = useState('পাংশা ব্লাড ডোনার্স হেল্পডেস্ক (PBDA Official)');
  const [showSimModal, setShowSimModal] = useState(false);

  // Countdown timer for QR expiration
  const [timeLeft, setTimeLeft] = useState<number>(60);

  // Restrict to Super Admin only
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const fetchSessionStatus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/whatsapp-qr/session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        setActiveWhatsappProvider(data.activeWhatsappProvider || 'CLOUD_API');
      } else {
        setError('সেশন স্ট্যাটাস লোড করা সম্ভব হয়নি।');
      }
    } catch {
      setError('সার্ভার কানেকশন ত্রুটি।');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSessionStatus();
    // Auto-poll status every 5 seconds
    const interval = setInterval(() => {
      fetchSessionStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchSessionStatus]);

  // Handle QR expiration countdown
  useEffect(() => {
    if (session?.status === 'PAIRING_QR' && session.qrExpiresAt) {
      const calculateLeft = () => {
        const exp = new Date(session.qrExpiresAt!).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((exp - now) / 1000));
        setTimeLeft(diff);
        if (diff === 0 && session.status === 'PAIRING_QR') {
          fetchSessionStatus();
        }
      };
      calculateLeft();
      const timer = setInterval(calculateLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [session, fetchSessionStatus]);

  const handleGenerateQr = async () => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/whatsapp-qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data.session);
        setSuccessMsg('নতুন কিউআর কোড প্রস্তুত হয়েছে! আপনার হোয়াটসঅ্যাপ স্ক্যানার দিয়ে দ্রুত স্ক্যান করুন।');
        setTimeLeft(60);
      } else {
        setError(data.error || 'কিউআর কোড জেনারেট ব্যর্থ হয়েছে।');
      }
    } catch {
      setError('কিউআর জেনারেট করার সময় ত্রুটি ঘটেছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/whatsapp-qr/simulate-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: simPhone,
          accountName: simAccountName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data.session);
        setSuccessMsg('কিউআর স্ক্যান সফল হয়েছে! হোয়াটসঅ্যাপ সেশন সফলভাবে কানেক্ট করা হয়েছে।');
        setShowSimModal(false);
      } else {
        setError(data.error || 'স্ক্যান কানেকশন ব্যর্থ হয়েছে।');
      }
    } catch {
      setError('স্ক্যান প্রক্রিয়াকরণে ত্রুটি ঘটেছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReconnect = async () => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/whatsapp-qr/reconnect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data.session);
        setSuccessMsg('হোয়াটসঅ্যাপ সেশন সফলভাবে রিকানেক্ট করা হয়েছে!');
      } else {
        setError(data.error || 'রিকানেক্ট প্রক্রিয়া ব্যর্থ হয়েছে।');
      }
    } catch {
      setError('রিকানেক্ট করার সময় সমস্যা ঘটেছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে হোয়াটসঅ্যাপ সেশনটি ডিসকানেক্ট করতে চান?')) return;
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/whatsapp-qr/disconnect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data.session);
        setSuccessMsg('হোয়াটসঅ্যাপ কিউআর সেশন ডিসকানেক্ট করা হয়েছে।');
      } else {
        setError(data.error || 'ডিসকানেক্ট ব্যর্থ হয়েছে।');
      }
    } catch {
      setError('ডিসকানেক্ট করতে সমস্যা হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm('🚨 সেশন ডাটা মুছে ফেললে সমস্ত ক্রেডেনশিয়াল রিমুভ হয়ে যাবে। আপনি কি নিশ্চিত?')) return;
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/whatsapp-qr/delete-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data.session);
        setSuccessMsg('হোয়াটসঅ্যাপ সেশন ডাটা সম্পূর্ণ মুছে ফেলা হয়েছে।');
      } else {
        setError(data.error || 'সেশন মুছতে সমস্যা হয়েছে।');
      }
    } catch {
      setError('সেশন ডিলিট করার সময় ত্রুটি হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSwitchProvider = async (provider: WhatsappProviderType) => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/settings/notification-providers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          activeWhatsappProvider: provider
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveWhatsappProvider(provider);
        setSuccessMsg(`হোয়াটসঅ্যাপ নোটিফিকেশন প্রোভাইডার পরিবর্তন করে '${provider === 'QR_SESSION' ? 'WhatsApp QR Session' : 'Official Cloud API'}' সেট করা হয়েছে!`);
      } else {
        setError(data.error || 'প্রোভাইডার পরিবর্তন করা যায়নি।');
      }
    } catch {
      setError('প্রোভাইডার পরিবর্তনের সময়ে ত্রুটি ঘটেছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendTestMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      setError('ফোন নম্বর প্রদান করুন।');
      return;
    }
    setSendingTest(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/whatsapp-qr/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientPhone: testPhone,
          customMsg: testCustomMsg
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`টেস্ট বার্তা সফলভাবে পাঠানো হয়েছে! (Message ID: ${data.waMessageId})`);
        setTestCustomMsg('');
      } else {
        setError(data.error || 'টেস্ট বার্তা পাঠানো ব্যর্থ হয়েছে।');
      }
    } catch {
      setError('টেস্ট বার্তা প্রেরণে নেটওয়ার্ক ত্রুটি।');
    } finally {
      setSendingTest(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm">
        <ShieldAlert className="w-16 h-16 text-rose-600 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-rose-900 mb-2">অনুমতি নেই (Access Denied)</h2>
        <p className="text-rose-700 text-sm">
          হোয়াটসঅ্যাপ কিউআর লগইন সেশন শুধুমাত্র **Super Admin** নিয়ন্ত্রণ করতে পারবেন।
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">হোয়াটসঅ্যাপ QR সেশন ডাটা লোড হচ্ছে...</p>
      </div>
    );
  }

  const isQrActiveProvider = activeWhatsappProvider === 'QR_SESSION';
  const status = session?.status || 'DISCONNECTED';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <QrCode className="w-3.5 h-3.5" />
              WhatsApp Web Multi-Device
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              হোয়াটসঅ্যাপ কিউআর লগইন মডিউল (QR Web Session)
            </h1>
            <p className="text-emerald-100/80 text-sm mt-2 max-w-2xl leading-relaxed">
              অফিসিয়াল হোয়াটসঅ্যাপ ওয়েব সেশন সংযুক্ত করুন। মোবাইল অ্যাপ থেকে QR কোড স্ক্যান করে সরাসরি রক্তদানের জরুরী নোটিফিকেশন অ্যালার্ট ও আপডেট স্বয়ংক্রিয় বিতরণ করুন।
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="text-xs text-emerald-200 font-medium">হোয়াটসঅ্যাপ অ্যাক্টিভ প্রোভাইডার:</div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isQrActiveProvider ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-700 text-slate-200'}`}>
                {isQrActiveProvider ? '📱 QR Session Active' : '☁️ Cloud API Active'}
              </span>
            </div>
            <button
              onClick={() => handleSwitchProvider(isQrActiveProvider ? 'CLOUD_API' : 'QR_SESSION')}
              disabled={actionLoading}
              className="mt-1 inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white underline font-semibold cursor-pointer transition-colors"
            >
              <ArrowRightLeft className="w-3 h-3" />
              {isQrActiveProvider ? 'Switch to Cloud API' : 'Activate QR Session Provider'}
            </button>
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-3 shadow-sm animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{error}</div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{successMsg}</div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Code & Status Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {/* Status Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-600' : status === 'PAIRING_QR' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">সেশন স্ট্যাটাস (Connection Status)</h2>
                  <p className="text-xs text-slate-500">হোয়াটসঅ্যাপ অ্যাকাউন্ট কানেকশন মনিটর</p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {status === 'CONNECTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    🟢 সেশন সক্রিয় (Connected)
                  </span>
                )}
                {status === 'PAIRING_QR' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    🟡 কিউআর স্ক্যানের অপেক্ষায় ({timeLeft}s)
                  </span>
                )}
                {status === 'EXPIRED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold">
                    🔴 কিউআর মেয়াদ উত্তীর্ণ (Expired)
                  </span>
                )}
                {status === 'DISCONNECTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    ⚪ ডিসকানেক্টেড (Disconnected)
                  </span>
                )}
              </div>
            </div>

            {/* Display Body according to status */}
            <div className="py-8 flex flex-col items-center justify-center text-center">
              {status === 'CONNECTED' ? (
                <div className="space-y-6 w-full max-w-md">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50 dark:border-emerald-900/50 shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {session?.connectedAccountName || 'WhatsApp Account Connected'}
                    </h3>
                    <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      {session?.connectedPhone || 'Phone Number'}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      এই হোয়াটসঅ্যাপ নাম্বার ব্যবহার করে সকল অ্যালার্ট পাঠানো হবে।
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">ডিভাইস / সিস্টেম:</span>
                      <span className="text-slate-700 dark:text-slate-200 font-semibold">{session?.deviceInfo || 'WhatsApp Web'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">ব্যাটারি লেভেল:</span>
                      <span className="text-slate-700 dark:text-slate-200 font-semibold inline-flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-emerald-500" />
                        {session?.batteryLevel ?? 98}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">কানেকশন সময়:</span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium">
                        {session?.connectedAt ? new Date(session.connectedAt).toLocaleString('bn-BD') : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">সর্বশেষ অ্যাক্টিভিটি:</span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium">
                        {session?.lastActiveAt ? new Date(session.lastActiveAt).toLocaleTimeString('bn-BD') : 'এখনই'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : status === 'PAIRING_QR' && session?.qrCodeDataUrl ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-lg inline-block relative group">
                    <img
                      src={session.qrCodeDataUrl}
                      alt="WhatsApp Web QR Code"
                      className="w-64 h-64 mx-auto object-contain"
                    />
                    <div className="mt-2 text-xs text-slate-500 font-mono">
                      মেয়াদ শেষ হবে: <span className="font-bold text-amber-600">{timeLeft} সেকেন্ড</span>
                    </div>
                  </div>

                  <div className="max-w-xs mx-auto text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">📱 কিভাবে কানেক্ট করবেন:</p>
                    <p>১. আপনার মোবাইলে WhatsApp চালু করুন।</p>
                    <p>২. Menu (⋮) অথবা Settings-এ গিয়ে **Linked Devices** এ ট্যাপ করুন।</p>
                    <p>৩. **Link a Device** চাপুন এবং এই QR কোডটি স্ক্যান করুন।</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-6">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                    <QrCode className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">কোন সেশন সংযুক্ত নেই</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      হোয়াটসঅ্যাপ বার্তা পাঠানোর জন্য নতুন QR কোড জেনারেট করে স্ক্যান সম্পন্ন করুন।
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Control Action Buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateQr}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  {status === 'PAIRING_QR' ? 'QR রিফ্রেশ করুন' : 'নতুন QR কোড তৈরি করুন'}
                </button>

                {status === 'PAIRING_QR' && (
                  <button
                    onClick={() => setShowSimModal(true)}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    স্ক্যান সিমিউলেশন টেস্ট
                  </button>
                )}

                {status === 'CONNECTED' && (
                  <button
                    onClick={handleReconnect}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                    রিকানেক্ট
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {status === 'CONNECTED' && (
                  <button
                    onClick={handleDisconnect}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                    ডিসকানেক্ট
                  </button>
                )}

                <button
                  onClick={handleDeleteSession}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                  title="সেশন ডাটা মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  মুছে ফেলুন
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Provider Control & Interactive Test Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Notification Provider Selector Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">নোটিফিকেশন প্রোভাইডার সেটিংস</h3>
                <p className="text-xs text-slate-500">সক্রিয় হোয়াটসঅ্যাপ ডেলিভারি চ্যানেল বেছে নিন</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option 1: WhatsApp Cloud API */}
              <label
                onClick={() => handleSwitchProvider('CLOUD_API')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${activeWhatsappProvider === 'CLOUD_API' ? 'bg-emerald-50/70 border-emerald-500 dark:bg-emerald-950/30 dark:border-emerald-700 shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <input
                  type="radio"
                  name="waProvider"
                  checked={activeWhatsappProvider === 'CLOUD_API'}
                  onChange={() => {}}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Official WhatsApp Cloud API</span>
                    {activeWhatsappProvider === 'CLOUD_API' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    মেটার অফিশিয়াল হোয়াটসঅ্যাপ বিজনেস ক্লাউড এপিআই। ওয়েব হুক এবং টোকেন ভিত্তিক সুরক্ষিত ডেলিভারি।
                  </p>
                </div>
              </label>

              {/* Option 2: WhatsApp QR Session */}
              <label
                onClick={() => handleSwitchProvider('QR_SESSION')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${activeWhatsappProvider === 'QR_SESSION' ? 'bg-emerald-50/70 border-emerald-500 dark:bg-emerald-950/30 dark:border-emerald-700 shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <input
                  type="radio"
                  name="waProvider"
                  checked={activeWhatsappProvider === 'QR_SESSION'}
                  onChange={() => {}}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp QR Session (Web)</span>
                    {activeWhatsappProvider === 'QR_SESSION' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    মোবাইল হোয়াটসঅ্যাপ ওয়েব কিউআর কোড লগইন। কোনো থার্ডপার্টি এপিআই ফি ছাড়া সরাসরি পার্সোনাল / বিজনেস চ্যানেল কানেকশন।
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Test Message Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">টেস্ট বার্তা প্রেরণ (Test Message)</h3>
                <p className="text-xs text-slate-500">হোয়াটসঅ্যাপ কানেকশন পরীক্ষা করুন</p>
              </div>
            </div>

            <form onSubmit={handleSendTestMsg} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  প্রাপকের হোয়াটসঅ্যাপ মোবাইল নম্বর
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="8801712345678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  কাস্টম টেস্ট মেসেজ (ঐচ্ছিক)
                </label>
                <textarea
                  value={testCustomMsg}
                  onChange={(e) => setTestCustomMsg(e.target.value)}
                  placeholder="পরীক্ষামূলক বার্তা লিখুন..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={sendingTest}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {sendingTest ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sendingTest ? 'বার্তা পাঠানো হচ্ছে...' : 'টেস্ট মেসেজ পাঠান'}
              </button>
            </form>
          </div>

          {/* Quick Info & Security Box */}
          <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
              <Info className="w-4 h-4" />
              নিরাপত্তা ও সেসন নির্দেশিকা
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800/90 dark:text-amber-300/80">
              <li>হোয়াটসঅ্যাপ সেশন কিউআর ডাটা সুরক্ষিতভাবে সার্ভার মেমরিতে সংরক্ষিত হয়।</li>
              <li>সার্ভার রিস্টার্ট হলেও সেশন ভ্যালিড থাকলে স্বয়ংক্রিয়ভাবে কানেক্ট থাকবে।</li>
              <li>শুধুমাত্র **Super Admin** কিউআর কোড জেনারেট এবং ডিসকানেক্ট করতে পারবেন।</li>
            </ul>
          </div>
        </div>
      </div>

      {/* QR Scan Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                কিউআর কোড স্ক্যান সিমিউলেশন (Scan Pairing)
              </h3>
              <button onClick={() => setShowSimModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              মোবাইল ডিভাইসের সাহায্যে কিউআর কোড স্ক্যান সম্পন্ন করে সেশন সংযুক্ত করার সিমিউলেশন। নিচের টেস্ট অ্যাকাউন্ট ও নাম্বার কনফার্ম করুন:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সংযুক্ত হোয়াটসঅ্যাপ মোবাইল নাম্বার:
                </label>
                <input
                  type="text"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  অ্যাাকাউন্টের নাম (Business / Personal Name):
                </label>
                <input
                  type="text"
                  value={simAccountName}
                  onChange={(e) => setSimAccountName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowSimModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={handleSimulateScan}
                disabled={actionLoading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                স্ক্যান নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
