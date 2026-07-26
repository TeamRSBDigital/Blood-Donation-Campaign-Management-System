import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Tag,
  Send
} from 'lucide-react';
import { MessageTemplate, MessageTemplateCategory, BroadcastPriority, BroadcastChannel } from '../../../types/index.js';
import { communicationService } from '../../../services/communicationService.js';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (tmpl: MessageTemplate) => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MessageTemplateCategory>('CUSTOM');
  const [formSubject, setFormSubject] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formPriority, setFormPriority] = useState<BroadcastPriority>('MEDIUM');
  const [formChannels, setFormChannels] = useState<BroadcastChannel[]>(['TELEGRAM_GROUP', 'WHATSAPP_CLOUD', 'DASHBOARD_NOTIFICATION']);
  const [errorMsg, setErrorMsg] = useState('');

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const list = await communicationService.getTemplates();
      setTemplates(list);
    } catch (err: any) {
      setErrorMsg(err.message || 'টেমপ্লেট লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setIsEditing(false);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormCategory('ANNOUNCEMENT');
    setFormSubject('');
    setFormBody('');
    setFormPriority('MEDIUM');
    setFormChannels(['TELEGRAM_GROUP', 'WHATSAPP_CLOUD', 'DASHBOARD_NOTIFICATION']);
    setErrorMsg('');
  };

  const handleEdit = (tmpl: MessageTemplate) => {
    setEditingId(tmpl.id);
    setFormName(tmpl.name);
    setFormCategory(tmpl.category);
    setFormSubject(tmpl.subject || '');
    setFormBody(tmpl.body);
    setFormPriority(tmpl.defaultPriority);
    setFormChannels(tmpl.defaultChannels);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই মেসেজ টেমপ্লেটটি মুছে ফেলতে চান?')) return;
    try {
      await communicationService.deleteTemplate(id);
      loadTemplates();
    } catch (err: any) {
      alert(err.message || 'ডিলিট করতে ব্যর্থ হয়েছে');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBody.trim()) {
      setErrorMsg('টেমপ্লেট নাম এবং মেসেজের বিবরণ আবশ্যক');
      return;
    }

    try {
      if (editingId) {
        await communicationService.updateTemplate(editingId, {
          name: formName,
          category: formCategory,
          subject: formSubject,
          body: formBody,
          defaultPriority: formPriority,
          defaultChannels: formChannels
        });
      } else {
        await communicationService.createTemplate({
          name: formName,
          category: formCategory,
          subject: formSubject,
          body: formBody,
          defaultPriority: formPriority,
          defaultChannels: formChannels
        });
      }
      resetForm();
      setIsEditing(false);
      loadTemplates();
    } catch (err: any) {
      setErrorMsg(err.message || 'সংরক্ষণ করতে ব্যর্থ হয়েছে');
    }
  };

  const insertVariable = (variable: string) => {
    setFormBody(prev => prev + variable);
  };

  if (!isOpen) return null;

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                মেসেজ টেমপ্লেট ম্যানেজার (Message Templates)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                পুনর্ব্যবহারযোগ্য মেসেজ টেমপ্লেট পরিচালনা করুন ও ড্রাফট তৈরি করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isEditing ? (
            /* Edit / Create Form */
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">
                  {editingId ? 'টেমপ্লেট এডিট করুন' : 'নতুন টেমপ্লেট যোগ করুন'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  বাতিল করুন
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    টেমপ্লেটের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="যেমন: জরুরী রক্তের প্রয়োজন টেমপ্লেট"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as MessageTemplateCategory)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="EMERGENCY">জরুরী রক্তদান (Emergency)</option>
                    <option value="ANNOUNCEMENT">ঘোষণা (Announcement)</option>
                    <option value="DONATION_CAMP">ক্যাম্পেইন (Camp)</option>
                    <option value="THANK_YOU">ধন্যবাদ বার্তা (Thank You)</option>
                    <option value="MEETING">সভা / মিটিং (Meeting)</option>
                    <option value="CUSTOM">কাস্টম (Custom)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  বিষয় / সাবজেক্ট (Subject Line)
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  placeholder="যেমন: পাংশা রক্তদান সোসাইটি জরুরি বিজ্ঞপ্তি"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মেসেজের মূল বিবরণ (Body) *
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">ভ্যারিয়েবলস:</span>
                    {['{donor_name}', '{blood_group}', '{district}', '{hospital_name}', '{date}'].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="bg-slate-200 dark:bg-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  required
                  rows={4}
                  value={formBody}
                  onChange={e => setFormBody(e.target.value)}
                  placeholder="এখানে মেসেজের বিবরণ টাইপ করুন..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          ) : (
            /* Templates List */
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="টেমপ্লেট খুঁজুন..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white font-bold"
                  >
                    <option value="ALL">সকল ক্যাটাগরি</option>
                    <option value="EMERGENCY">জরুরী রক্তদান</option>
                    <option value="ANNOUNCEMENT">ঘোষণা</option>
                    <option value="DONATION_CAMP">ক্যাম্পেইন</option>
                    <option value="THANK_YOU">ধন্যবাদ বার্তা</option>
                    <option value="MEETING">মিটিং</option>
                    <option value="GENERAL">সাধারণ</option>
                  </select>

                  <button
                    onClick={() => {
                      resetForm();
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন টেমপ্লেট</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-10 text-xs text-slate-400">লোডিং হচ্ছে...</div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">কোন টেমপ্লেট পাওয়া যায়নি</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map(tmpl => (
                    <div
                      key={tmpl.id}
                      className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-red-400 dark:hover:border-red-500 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                            {tmpl.name}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 uppercase">
                            {tmpl.category}
                          </span>
                        </div>
                        {tmpl.subject && (
                          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            বিষয়: {tmpl.subject}
                          </div>
                        )}
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
                          {tmpl.body}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60 pt-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(tmpl)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tmpl.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {onSelectTemplate && (
                          <button
                            onClick={() => {
                              onSelectTemplate(tmpl);
                              onClose();
                            }}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-xs transition-all"
                          >
                            <Send className="w-3 h-3" />
                            <span>ইউজ করুন</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
