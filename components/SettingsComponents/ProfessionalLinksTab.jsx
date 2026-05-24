"use client";
import { useState, useEffect } from "react";
import { Github, Linkedin, Globe, Twitter, ExternalLink, Check, Loader2 } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";

const LINKS = [
  { key: "github",    label: "GitHub",    icon: Github,   placeholder: "https://github.com/username", color: "text-slate-800 dark:text-white" },
  { key: "linkedin",  label: "LinkedIn",  icon: Linkedin, placeholder: "https://linkedin.com/in/username", color: "text-blue-600" },
  { key: "portfolio", label: "Portfolio", icon: Globe,    placeholder: "https://yourportfolio.com", color: "text-emerald-600" },
  { key: "twitter",   label: "Twitter / X", icon: Twitter, placeholder: "https://twitter.com/username", color: "text-sky-500" },
];

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;

export default function ProfessionalLinksTab({ user, refreshUser }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [links, setLinks] = useState({ github: "", linkedin: "", portfolio: "", twitter: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.professionalLinks) setLinks({ github: "", linkedin: "", portfolio: "", twitter: "", ...user.professionalLinks });
  }, [user]);

  const set = (k, v) => {
    setLinks(p => ({ ...p, [k]: v }));
    if (v && !URL_REGEX.test(v)) {
      setErrors(p => ({ ...p, [k]: "Invalid URL" }));
    } else {
      setErrors(p => {
        const newErrors = { ...p };
        delete newErrors[k];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const errs = {};
    Object.entries(links).forEach(([k, v]) => { if (v && !URL_REGEX.test(v)) errs[k] = "Invalid URL"; });
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); showToast("Fix invalid URLs before saving", "error"); return; }
    setSaving(true);
    try {
      const res = await api.patch("/user/profile", { professionalLinks: links });
      if (res.success) { showToast("Links saved!", "success"); if (refreshUser) await refreshUser(); }
    } catch { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-full space-y-10">
      <header>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Professional Links</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Add links that appear on your public profile.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-x-12 gap-y-12">
        <div className="space-y-12">
          {LINKS.slice(0, 2).map(({ key, label, icon: Icon, placeholder, color }) => (
            <div key={key} className="space-y-3">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-2 px-0">
                <Icon size={14} className={color} />{label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Icon size={16} className={`${color} opacity-60`} />
                </div>
                <input type="url" value={links[key] || ""} onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  className={`w-full bg-transparent border-b ${errors[key] ? "border-red-400" : "border-slate-200 dark:border-white/10 focus:border-black dark:focus:border-white"} pl-8 pr-12 py-3 text-sm font-medium transition-all outline-none rounded-none`} />
                {links[key] && !errors[key] && (
                  <a href={links[key]} target="_blank" rel="noopener noreferrer"
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              {errors[key] && <p className="text-xs text-red-500 font-medium mt-1 px-0">{errors[key]}</p>}
            </div>
          ))}
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-white/10" />

        <div className="space-y-12">
          {LINKS.slice(2).map(({ key, label, icon: Icon, placeholder, color }) => (
            <div key={key} className="space-y-3">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-2 px-0">
                <Icon size={14} className={color} />{label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Icon size={16} className={`${color} opacity-60`} />
                </div>
                <input type="url" value={links[key] || ""} onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  className={`w-full bg-transparent border-b ${errors[key] ? "border-red-400" : "border-slate-200 dark:border-white/10 focus:border-black dark:focus:border-white"} pl-8 pr-12 py-3 text-sm font-medium transition-all outline-none rounded-none`} />
                {links[key] && !errors[key] && (
                  <a href={links[key]} target="_blank" rel="noopener noreferrer"
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              {errors[key] && <p className="text-xs text-red-500 font-medium mt-1 px-0">{errors[key]}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-10 border-t border-slate-100 dark:border-white/5 flex justify-end">
        <button onClick={handleSave} disabled={saving || Object.keys(errors).length > 0}
          className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-40">
          {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Check size={16} />Update Links</>}
        </button>
      </div>
    </div>
  );
}
