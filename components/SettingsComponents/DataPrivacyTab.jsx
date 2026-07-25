"use client";
import { useState, useRef } from "react";
import { Download, Trash2, FileText, AlertTriangle, Loader2, Eye, EyeOff, Check } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";

const GDPR_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ─── Data Export ─── */
function DataExport({ showToast }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await api.post("/gdpr/export-request", {});
      if (res.success) {
        showToast("Data export requested!", "success");
      } else showToast(res.message || "Export failed", "error");
    } catch { showToast("Failed to request export.", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5 border-b border-slate-100 dark:border-white/5 pb-5">
        <div className="w-12 h-12 border border-slate-200 dark:border-white/10 flex items-center justify-center">
          <Download size={20} className="text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-tighter text-slate-900 dark:text-white">Data Portability</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Request archive</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-tight">
          Export a complete copy of your digital footprint — posts, earnings, profile, and conversations.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {["Profile Data", "Artifacts", "Messages", "Financials"].map(item => (
            <div key={item} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <Check size={10} className="text-emerald-500" />{item}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleExport} disabled={loading}
        className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        Request Archive
      </button>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Processing takes up to 24 hours (GDPR Art. 20)</p>
    </div>
  );
}

/* ─── Cookie Preferences ─── */
function CookiePrefs({ showToast }) {
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false, functional: true });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("cookiePrefs", JSON.stringify(prefs));
      showToast("Preferences saved", "success");
      setSaving(false);
    }, 600);
  };

  const Row = ({ k, label, desc, locked }) => (
    <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-white/5 last:border-0">
      <div>
        <p className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-white">{label}</p>
        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{desc}</p>
      </div>
      {locked ? (
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 dark:border-white/10 px-2 py-1">Required</span>
      ) : (
        <button type="button" onClick={() => setPrefs(p => ({ ...p, [k]: !p[k] }))}
          className={`relative inline-flex h-5 w-10 items-center rounded-none transition-all ${prefs[k] ? "bg-black dark:bg-white" : "bg-slate-200 dark:bg-white/10"}`}>
          <span className={`inline-block h-3 w-3 bg-white dark:bg-black shadow transform transition-opacity ${prefs[k] ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5 border-b border-slate-100 dark:border-white/5 pb-5">
        <div className="w-12 h-12 border border-slate-200 dark:border-white/10 flex items-center justify-center">
          <FileText size={20} className="text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-tighter text-slate-900 dark:text-white">Privacy Controls</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cookie Management</p>
        </div>
      </div>
      <div className="space-y-0">
        <Row k="functional" label="Functional" desc="Platform essentials" locked />
        <Row k="analytics"  label="Analytics"  desc="Usage tracking" />
        <Row k="marketing"  label="Marketing"  desc="Personalized offers" />
      </div>
      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 border border-black dark:border-white text-black dark:text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-40">
        {saving ? <Loader2 size={14} className="animate-spin" /> : "Apply Settings"}
      </button>
    </div>
  );
}

/* ─── Delete Account ─── */
function DeleteAccount({ showToast }) {
  const router = useRouter();
  const [step, setStep] = useState("idle"); 
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeactivate = async () => {
    if (!password) return setError("Password is required");
    setLoading(true); setError("");
    try {
      const res = await api.post("/user/deactivate", { password, reason });
      if (res.success) {
        showToast("Account deactivated.", "success");
        setTimeout(async () => {
          await api.post("/auth/logout");
          router.push("/");
        }, 2000);
      } else setError(res.message || "Failed");
    } catch (e) { setError(e?.response?.data?.message || "Error"); }
    finally { setLoading(false); }
  };

  const REASONS = ["Take a break", "Privacy", "Other"];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5 border-b border-red-500/30 pb-5">
        <div className="w-12 h-12 border border-red-500/30 flex items-center justify-center">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-tighter text-red-500">Deactivation</p>
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Permanent Removal</p>
        </div>
      </div>

      {step === "idle" && (
        <div className="space-y-6">
          <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-tight">
            Once deactivated, your profile and content will be hidden. You have 30 days to recover your account.
          </p>
          <button onClick={() => setStep("confirm")}
            className="w-full py-4 border-2 border-red-500/20 text-red-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500/5 transition-all">
            Deactivate My Account
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-6">
          <div className="p-4 border border-red-500/20 bg-red-500/[0.03]">
            <p className="text-[10px] text-red-500 font-black uppercase tracking-widest leading-relaxed">
              Critical: Deactivation will remove you from search and feeds instantly. Enter password to confirm.
            </p>
          </div>

          <div className="space-y-6">
            <CustomSelect
              label="Reason for Deactivation"
              value={reason}
              onChange={v => setReason(v)}
              options={REASONS}
            />

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-sm font-black outline-none focus:border-red-500 transition-all rounded-none" />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{error}</p>}

          <div className="flex gap-4">
            <button onClick={() => setStep("idle")}
              className="flex-1 py-4 border-b border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest">Cancel</button>
            <button onClick={handleDeactivate} disabled={!password || loading}
              className="flex-1 py-4 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest">
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Data Privacy Tab ─── */
export default function DataPrivacyTab() {
  const { showToast } = useToast();

  return (
    <div className="max-w-full space-y-12">
      <header>
        <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase">Compliance & Rights</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Manage your data rights and account status under GDPR regulations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-x-12 gap-y-20">
        <div className="space-y-20">
          <DataExport showToast={showToast} />
          <CookiePrefs showToast={showToast} />
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-white/10" />

        <div>
          <DeleteAccount showToast={showToast} />
        </div>
      </div>
    </div>
  );
}

