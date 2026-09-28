"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { X, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function BecomePatronModal({ isOpen, onClose, onUpdate }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    industry: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.patch("/user/profile", {
        role: "patron",
        companyDetails: {
          name: formData.companyName,
          website: formData.website,
          industry: formData.industry
        }
      });

      if (response.success) {
        showToast("Account upgraded successfully.", "success");
        if (onUpdate) onUpdate(response.data);
        onClose();
        window.location.reload();
      }
    } catch (err) {
      showToast(err.message || "Failed to upgrade account", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-brand-surface dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-sm border border-brand-navy/[0.10] dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Become a patron</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upgrade your account to start hiring.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:bg-brand-surface/[0.05] dark:hover:bg-brand-surface/5 rounded-full transition-colors group"
            >
              <X size={18} className="text-slate-400 group-hover:text-brand-slate dark:text-slate-300 dark:group-hover:text-white" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <div className="space-y-5 py-4">
            {/* Field: Company or patron Name */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest">Entity Name</label>
                    <span className="text-[9px] font-medium text-slate-400 italic">Personal or Business</span>
                </div>
                <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Your Full Name or Studio Name"
                    className="w-full px-4 py-3.5 bg-brand-surface dark:bg-brand-surface/5 border border-brand-navy/[0.10] dark:border-white/10 rounded-2xl outline-none text-sm font-semibold text-slate-900 dark:text-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all placeholder:text-slate-400/50"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 leading-relaxed px-1">
                    If you&apos;re hiring for yourself, simply enter your name. This will be shown on your job postings.
                </p>
            </div>

            {/* Field: Website */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Portfolio or Website (Optional)</label>
                <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwork.com"
                    className="w-full px-4 py-3.5 bg-brand-surface dark:bg-brand-surface/5 border border-brand-navy/[0.10] dark:border-white/10 rounded-2xl outline-none text-sm font-semibold text-slate-900 dark:text-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all placeholder:text-slate-400/50"
                />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.companyName}
              className="flex-[2] py-3 bg-brand-blue hover:bg-brand-blue text-white rounded-xl text-sm font-bold shadow-sm shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : "Upgrade Account"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

