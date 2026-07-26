import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Clock,
  Save,
  AlertTriangle,
  Radio,
  Eye,
  FileText,
  Sparkles,
  Link,
  Users,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import {
  BroadcastCampaign,
  BroadcastTargetFilter,
  BroadcastType,
  BroadcastPriority,
  BroadcastChannel,
  MessageTemplate,
  RecipientCalculationResult
} from '../../../types/index.js';
import { TargetAudienceSelector } from './TargetAudienceSelector.js';
import { TemplateManagerModal } from './TemplateManagerModal.js';
import { communicationService } from '../../../services/communicationService.js';

interface BroadcastComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialEmergencyMode?: boolean;
}

export const BroadcastComposerModal: React.FC<BroadcastComposerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmergencyMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'COMPOSE' | 'TARGET' | 'PREVIEW'>('COMPOSE');
  const [isEmergency, setIsEmergency] = useState(initialEmergencyMode);

  // Form Fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [type, setType] = useState<BroadcastType>('GENERAL_ANNOUNCEMENT');
  const [priority, setPriority] = useState<BroadcastPriority>('MEDIUM');
  const [channels, setChannels] = useState<BroadcastChannel[]>([
    'TELEGRAM_GROUP',
    'WHATSAPP_CLOUD',
    'DASHBOARD_NOTIFICATION'
  ]);

  const [targetFilter, setTargetFilter] = useState<BroadcastTargetFilter>({});
  const [calculation, setCalculation] = useState<RecipientCalculationResult | null>(null);

  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialEmergencyMode) {
        enableEmergencyDefaults();
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialEmergencyMode]);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setLinkUrl('');
    setType('GENERAL_ANNOUNCEMENT');
    setPriority('MEDIUM');
    setChannels(['TELEGRAM_GROUP', 'WHATSAPP_CLOUD', 'DASHBOARD_NOTIFICATION']);
    setTargetFilter({});
    setIsEmergency(false);
    setIsScheduled(false);
    setScheduledAt('');
    setErrorMsg('');
    setActiveTab('COMPOSE');
  };

  const enableEmergencyDefaults = () => {
    setIsEmergency(true);
    setType('EMERGENCY_BLOOD_REQUEST');
    setPriority('CRITICAL');
    setTitle('🚨 জরুরী রক্তের প্রয়োজন (Urgent Blood Request)');
    setChannels(['TELEGRAM_GROUP', 'WHATSAPP_CLOUD', 'DASHBOARD_NOTIFICATION']);
    setIsScheduled(false);
  };

  const handleToggleEmergency = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsEmergency(checked);
    if (checked) {
      enableEmergencyDefaults();
    } else {
      setPriority('MEDIUM');
      setType('GENERAL_ANNOUNCEMENT');
    }
  };

  const handleChannelToggle = (ch: BroadcastChannel) => {
    if (channels.includes(ch)) {
      setChannels(channels.filter(c => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleSelectTemplate = (tmpl: MessageTemplate) => {
    setTitle(tmpl.subject || tmpl.name);
    setMessage(tmpl.body);
    setPriority(tmpl.defaultPriority);
    setChannels(tmpl.defaultChannels);
    if (tmpl.category === 'EMERGENCY') {
      setIsEmergency(true);
      setType('EMERGENCY_BLOOD_REQUEST');
    }
  };

  const insertTag = (tag: string) => {
    setMessage(prev => prev + tag);
  };

  const handleSubmit = async (submitStatus: 'DRAFT' | 'SENDING' | 'SCHEDULED') => {
    if (!title.trim() || !message.trim()) {
      setErrorMsg('ব্রডকাস্ট টাইটেল এবং মেসেজের মূল বিষয়বস্তু আবশ্যক');
      setActiveTab('COMPOSE');
      return;
    }

    if (channels.length === 0) {
      setErrorMsg('কমপক্ষে একটি ডেলিভারি চ্যানেল সিলেক্ট করুন');
      setActiveTab('COMPOSE');
      return;
    }

    if (submitStatus === 'SCHEDULED' && !scheduledAt) {
      setErrorMsg('সিডিউলকৃত প্রেরণের তারিখ ও সময় সিলেক্ট করুন');
      return;
    }

    setSending(true);
    setErrorMsg('');

    try {
      await communicationService.createCampaign({
        title,
        message,
        linkUrl,
        type,
        priority: isEmergency ? 'CRITICAL' : priority,
        channels,
        isEmergency,
        targetFilter,
        status: submitStatus,
        scheduledAt: submitStatus === 'SCHEDULED' ? scheduledAt : undefined
      });

      setSending(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'ব্রডকাস্ট তৈরি করতে ব্যর্থ হয়েছে');
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className={`p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between ${
          isEmergency
            ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white'
            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isEmergency ? 'bg-white/20' : 'bg-red-100 dark:bg-red-950 text-red-600'}`}>
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">
                  {isEmergency ? '🚨 ইমার্জেন্সি ব্রডকাস্ট কম্পোজার' : 'স্মার্ট ব্রডকাস্ট মেসেজ কম্পোজার'}
                </h2>
                {isEmergency && (
                  <span className="bg-white text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                    EMERGENCY MODE
                  </span>
                )}
              </div>
              <p className={`text-xs ${isEmergency ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
                লক্ষ্যভিত্তিক রক্তদাতা ও ভলান্টিয়ারদের কাছে তাৎক্ষণিক বার্তা পাঠান
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isEmergency
                ? 'hover:bg-white/20 text-white'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/60 dark:bg-slate-800/40 text-xs font-bold gap-2 pt-2">
          <button
            onClick={() => setActiveTab('COMPOSE')}
            className={`py-3 px-4 rounded-t-2xl flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'COMPOSE'
                ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>১. মেসেজ কম্পোজ (Composer)</span>
          </button>

          <button
            onClick={() => setActiveTab('TARGET')}
            className={`py-3 px-4 rounded-t-2xl flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'TARGET'
                ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>২. টার্গেট অডিয়েন্স ({calculation ? calculation.totalUniqueRecipients : 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('PREVIEW')}
            className={`py-3 px-4 rounded-t-2xl flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'PREVIEW'
                ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>৩. লাইভ প্রিভিউ (Live Preview)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: COMPOSE */}
          {activeTab === 'COMPOSE' && (
            <div className="space-y-5">
              {/* Emergency Banner Toggle */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="text-xs font-black text-amber-900 dark:text-amber-200 block">
                      ইমার্জেন্সি মোড (Emergency Critical Mode)
                    </span>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">
                      জরুরী রক্তের রিকোয়েস্টের জন্য সর্বোচ্চ প্রাধিকার এবং সব চ্যানেলে এক ক্লিকে বার্তা পাঠায়
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={handleToggleEmergency}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Title & Type Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>ব্রডকাস্ট টাইটেল *</span>
                    <button
                      type="button"
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="text-red-600 dark:text-red-400 text-xs font-bold hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>টেমপ্লেট থেকে লোড করুন</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="যেমন: B+ রক্তের জরুরী প্রয়োজন - রাজবাড়ী সদর হাসপাতাল"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    বার্তা ক্যাটাগরি
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as BroadcastType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="EMERGENCY_BLOOD_REQUEST">🚨 জরুরী রক্তের প্রয়োজন</option>
                    <option value="GENERAL_ANNOUNCEMENT">📢 সাধারণ ঘোষণা</option>
                    <option value="CAMPAIGN_UPDATE">🩸 ক্যাম্পেইন আপডেট</option>
                    <option value="VOLUNTEER_NOTICE">🤝 ভলান্টিয়ার নোটিশ</option>
                    <option value="SYSTEM_NOTIFICATION">⚙️ সিস্টেম নোটিফিকেশন</option>
                    <option value="CUSTOM_MESSAGE">✉️ কাস্টম মেসেজ</option>
                  </select>
                </div>
              </div>

              {/* Priority & Delivery Channels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    প্রাধিকার (Priority Level)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'LOW', label: 'কম' },
                      { id: 'MEDIUM', label: 'মাঝারি' },
                      { id: 'HIGH', label: 'উচ্চ' },
                      { id: 'CRITICAL', label: 'ক্রিটিক্যাল' }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id as any)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          priority === p.id
                            ? p.id === 'CRITICAL'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channel Options */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    প্রেরণের চ্যানেল (Channels)
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    {[
                      { id: 'TELEGRAM_GROUP', label: 'টেলিগ্রাম গ্রুপ' },
                      { id: 'WHATSAPP_CLOUD', label: 'হোয়াটসঅ্যাপ API' },
                      { id: 'DASHBOARD_NOTIFICATION', label: 'ড্যাশবোর্ড নোটিফিকেশন' },
                      { id: 'EMAIL', label: 'ইমেইল (Future)', disabled: true },
                      { id: 'SMS', label: 'এসএমএস (Future)', disabled: true }
                    ].map(ch => {
                      const selected = channels.includes(ch.id as any);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          disabled={ch.disabled}
                          onClick={() => handleChannelToggle(ch.id as any)}
                          className={`px-3 py-1.5 rounded-xl border transition-all ${
                            ch.disabled
                              ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200'
                              : selected
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {ch.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Message Body & Variables */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মেসেজের বিস্তারিত বিবরণ (Message Content) *
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    <span className="text-[10px] text-slate-400 font-bold">ট্যাগ:</span>
                    {['{donor_name}', '{blood_group}', '{district}', '{hospital_name}', '{contact_phone}', '{date}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertTag(tag)}
                        className="bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  required
                  rows={6}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="এখানে মেসেজের বিস্তারিত লিখুন..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-mono text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Link URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Link className="w-3.5 h-3.5 text-blue-500" />
                  <span>লিংক / ওয়েবসাইট / ফাইল ইউআরএল (ঐচ্ছিক)</span>
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://pbda.org/campaign/123"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 2: TARGET AUDIENCE */}
          {activeTab === 'TARGET' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                স্মার্ট ফিল্টার দিয়ে নির্দিষ্ট রক্তের গ্রুপ, ভৌগোলিক এলাকা, এবং রক্তদানের যোগ্যতা অনুযায়ী প্রাপক বাছুন:
              </p>
              <TargetAudienceSelector
                filter={targetFilter}
                onChangeFilter={setTargetFilter}
                onCalculated={setCalculation}
              />
            </div>
          )}

          {/* TAB 3: PREVIEW */}
          {activeTab === 'PREVIEW' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">
                    মেসেজ প্রিভিউ (Telegram / WhatsApp Layout)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-600 text-white">
                    {type}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {title || '(টাইটেল দেয়া হয়নি)'}
                  </h3>
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {message || '(মেসেজের বিবরণ ফাঁকা)'}
                  </div>
                  {linkUrl && (
                    <div className="pt-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                      🔗 {linkUrl}
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                  <span>অনুমানিক প্রাপক সংখ্যা: {calculation ? calculation.totalUniqueRecipients : 0} জন</span>
                  <span>চ্যানেল: {channels.join(', ')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3">
          {/* Schedule Later Toggle */}
          <div className="flex items-center gap-3">
            {!isEmergency && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={e => setIsScheduled(e.target.checked)}
                  className="rounded-md border-slate-300 text-red-600 focus:ring-red-500"
                />
                <Clock className="w-4 h-4 text-slate-400" />
                <span>পরবর্তীতে সিডিউল করুন (Schedule)</span>
              </label>
            )}

            {isScheduled && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              disabled={sending}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>ড্রাফট রাখুন</span>
            </button>

            {isScheduled ? (
              <button
                type="button"
                onClick={() => handleSubmit('SCHEDULED')}
                disabled={sending}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                <span>{sending ? 'প্রসেসিং...' : 'সিডিউল কনফার্ম করুন'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit('SENDING')}
                disabled={sending}
                className={`px-6 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all flex items-center gap-2 ${
                  isEmergency
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'পাঠানো হচ্ছে...' : isEmergency ? '🚨 ইমার্জেন্সি সেন্ড করুন' : 'তাৎক্ষণিক ব্রডকাস্ট পাঠান'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Template Manager */}
      <TemplateManagerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};
