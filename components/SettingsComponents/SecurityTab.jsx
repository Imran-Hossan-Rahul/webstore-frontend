"use client";
import { useState, useEffect } from "react";
import { Mail, Lock, Shield, Smartphone, History, Check, Loader2, Eye, EyeOff, AlertTriangle, Monitor, Globe, Link2 } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import Image from "next/image";

/* ─── Email Verification ─── */
function EmailSection({ user, refreshUser, showToast }) {
  const [step, setStep] = useState("idle"); // idle, verifying
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/resend-verification");
      if (res.success) { showToast("Verification code sent to your email!", "success"); setStep("verifying"); }
      else setError(res.message);
    } catch (e) { setError(e?.response?.data?.message || "Failed to send code"); }
    finally { setLoading(false); }
  };

  const handleVerifyCode = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get(`/auth/verify-email?token=${code}`);
      if (res.success) { 
        showToast("Email verified successfully!", "success"); 
        setStep("idle"); setCode(""); 
        if (refreshUser) await refreshUser(); 
      }
      else setError(res.message || "Invalid code");
    } catch (e) { setError(e?.response?.data?.message || "Invalid code"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-start gap-5">
      <div className="w-12 h-12 bg-black dark:bg-white flex shrink-0 items-center justify-center">
        <Mail size={22} className="text-white dark:text-black" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 mb-1">Primary Email</p>
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
          {user?.emailVerified ? (
            <span className="text-[10px] font-bold text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">Verified</span>
          ) : step === "idle" ? (
            <button onClick={handleSendCode} disabled={loading} className="text-[10px] shrink-0 font-bold text-red-500 border border-red-500/30 px-2 py-0.5 rounded hover:bg-red-500/5 transition-all uppercase disabled:opacity-50 flex items-center gap-1">
              {loading && <Loader2 size={10} className="animate-spin" />}
              Verify
            </button>
          ) : null}
        </div>
        
        {step === "verifying" && (
          <div className="mt-4 space-y-3">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enter 6-digit code</p>
            <input type="text" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000 000" className="w-full bg-transparent border-b-2 border-black dark:border-white py-2 text-sm font-mono font-black outline-none tracking-[0.5em]" />
            {error && <p className="text-[10px] text-red-500 font-black uppercase">{error}</p>}
            <div className="flex gap-4">
              <button onClick={() => { setStep("idle"); setCode(""); setError(""); }} className="flex-1 py-3 border-b border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleVerifyCode} disabled={code.length !== 6 || loading}
                className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                {loading && <Loader2 size={12} className="animate-spin" />} Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Password Change ─── */
function PasswordSection({ showToast }) {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const requirements = [
    { label: "8+ characters", ok: form.newPass.length >= 8 },
    { label: "Uppercase",      ok: /[A-Z]/.test(form.newPass) },
    { label: "Lowercase",      ok: /[a-z]/.test(form.newPass) },
    { label: "Number",         ok: /\d/.test(form.newPass) },
    { label: "Special char",   ok: /[\W_]/.test(form.newPass) },
  ];
  const allOk = requirements.every(r => r.ok);

  const handleSave = async () => {
    setError("");
    if (!form.current) return setError("Current password is required");
    if (!allOk)        return setError("New password doesn't meet requirements");
    if (form.newPass !== form.confirm) return setError("Passwords don't match");
    setSaving(true);
    try {
      const res = await api.post("/user/change-password", { currentPassword: form.current, newPassword: form.newPass });
      if (res.success) { showToast("Password changed!", "success"); setForm({ current: "", newPass: "", confirm: "" }); }
      else setError(res.message || "Failed");
    } catch (e) { setError(e.message || "Failed to change password"); }
    finally { setSaving(false); }
  };

  const EyeBtn = ({ field }) => (
    <button type="button" onClick={() => setShow(p => ({ ...p, [field]: !p[field] }))}
      className="absolute inset-y-0 right-0 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
      {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  const inputCls = "w-full bg-transparent border-b border-slate-200 dark:border-white/10 focus:border-black dark:focus:border-white py-3 text-sm font-medium outline-none transition-all rounded-none";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border border-slate-200 dark:border-white/10 flex items-center justify-center">
          <Lock size={18} className="text-slate-500 dark:text-white/50" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Update Password</p>
          <p className="text-xs text-slate-500 font-medium">Secure your account</p>
        </div>
      </div>

      <div className="space-y-6">
        {[
          { key: "current", label: "Current Password",  field: "current" },
          { key: "newPass", label: "New Password",      field: "new" },
          { key: "confirm", label: "Confirm New Password", field: "confirm" },
        ].map(({ key, label, field }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">{label}</label>
            <div className="relative">
              <input type={show[field] ? "text" : "password"} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                autoComplete="new-password"
                className={inputCls} />
              <EyeBtn field={field} />
            </div>
          </div>
        ))}
      </div>

      {form.newPass && (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {requirements.map(r => (
            <div key={r.label} className={`flex items-center gap-1.5 text-[10px] font-semibold ${r.ok ? "text-emerald-500" : "text-slate-400"}`}>
              {r.ok ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full border border-current inline-block" />}
              {r.label}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-sm">
        {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : "Change Password"}
      </button>
    </div>
  );
}

/* ─── 2FA Section ─── */
function TwoFASection({ user, refreshUser, showToast }) {
  const [step, setStep] = useState("idle"); 
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const enabled = user?.twoFactorEnabled;

  const startSetup = async () => {
    setSaving(true); setError("");
    try {
      const res = await api.get("/user/2fa/setup");
      if (res.success) { setQrCode(res.data.qrCode); setSecret(res.data.secret); setStep("scanning"); }
      else setError(res.message);
    } catch (e) { setError("Failed to start 2FA setup"); }
    finally { setSaving(false); }
  };

  const confirmEnable = async () => {
    setSaving(true); setError("");
    try {
      const res = await api.post("/user/2fa/enable", { token });
      if (res.success) { showToast("2FA enabled!", "success"); setStep("idle"); setToken(""); if (refreshUser) await refreshUser(); }
      else setError(res.message || "Invalid code");
    } catch (e) { setError(e?.response?.data?.message || "Invalid code"); }
    finally { setSaving(false); }
  };

  const confirmDisable = async () => {
    setSaving(true); setError("");
    try {
      const res = await api.post("/user/2fa/disable", { token });
      if (res.success) { showToast("2FA disabled", "success"); setStep("idle"); setToken(""); if (refreshUser) await refreshUser(); }
      else setError(res.message || "Invalid code");
    } catch (e) { setError(e?.response?.data?.message || "Invalid code"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 border flex items-center justify-center ${enabled ? "border-emerald-500 bg-emerald-500/5" : "border-slate-200 dark:border-white/10"}`}>
            <Smartphone size={18} className={enabled ? "text-emerald-500" : "text-slate-500 dark:text-white/50"} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Auth</p>
            <p className="text-xs text-slate-500 font-medium">{enabled ? "Protected" : "Vulnerable"}</p>
          </div>
        </div>
      </div>

      {step === "idle" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {enabled 
              ? "Your account is protected with an extra layer of security. Any login attempt will require an authenticator code." 
              : "Enhance your account security by requiring a unique code from your phone whenever you sign in."}
          </p>
          <button onClick={enabled ? () => setStep("disabling") : startSetup} disabled={saving}
            className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 border-b-2 ${enabled ? "border-red-500 text-red-500 hover:bg-red-500/5" : "border-black dark:border-white text-black dark:text-white shadow-sm"}`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {enabled ? "Disable 2FA" : "Set Up 2FA"}
          </button>
        </div>
      )}

      {step === "scanning" && (
        <div className="space-y-6">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">Scan with Authenticator App</p>
          {qrCode && (
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-none border-4 border-black">
                <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Manual Key</label>
            <div className="font-mono text-[10px] border-b border-slate-200 dark:border-white/10 py-3 text-slate-600 dark:text-slate-300 break-all select-all">{secret}</div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Enter Verification Code</label>
            <input type="text" maxLength={6} value={token} onChange={e => setToken(e.target.value.replace(/\D/g, ""))}
              placeholder="000 000" className="w-full bg-transparent border-b-2 border-black dark:border-white py-4 text-sm font-mono font-black outline-none tracking-[0.5em] text-center" />
          </div>
          {error && <p className="text-[10px] text-red-500 font-black uppercase">{error}</p>}
          <div className="flex gap-4">
            <button onClick={() => { setStep("idle"); setToken(""); }} className="flex-1 py-4 border-b border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest">Cancel</button>
            <button onClick={confirmEnable} disabled={token.length !== 6 || saving}
              className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest">
              Verify
            </button>
          </div>
        </div>
      )}

      {step === "disabling" && (
        <div className="space-y-4">
          <div className="p-4 border border-red-500/20 bg-red-500/[0.03]">
            <p className="text-[10px] text-red-500 font-black uppercase tracking-widest leading-relaxed">Warning: Disabling 2FA will weaken your account security. Enter code to proceed.</p>
          </div>
          <input type="text" maxLength={6} value={token} onChange={e => setToken(e.target.value.replace(/\D/g, ""))}
            placeholder="000 000" className="w-full bg-transparent border-b-2 border-red-500 py-4 text-sm font-mono font-black outline-none tracking-[0.5em] text-center" />
          {error && <p className="text-[10px] text-red-500 font-black uppercase">{error}</p>}
          <div className="flex gap-4">
            <button onClick={() => { setStep("idle"); setToken(""); }} className="flex-1 py-4 border-b border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest">Cancel</button>
            <button onClick={confirmDisable} disabled={token.length !== 6 || saving}
              className="flex-1 py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest">
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Login History ─── */
function LoginHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/user/login-history")
      .then(r => { if (r.success) setHistory(r.data); else setError(r.message || "Failed to load history"); })
      .catch(e => setError(e.message || "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const getDeviceIcon = (device) => {
    const d = (device || "").toLowerCase();
    if (d === "mobile") return <Smartphone size={16} className="text-slate-400" />;
    return <Monitor size={16} className="text-slate-400" />;
  };

  const formatTimestamp = (ts) => {
    if (!ts) return { date: "—", time: "" };
    const d = new Date(ts);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border border-slate-200 dark:border-white/10 flex items-center justify-center">
          <History size={18} className="text-slate-500 dark:text-white/50" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Login History</p>
          <p className="text-xs text-slate-500 font-medium">Recent sign-in activity</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 p-4 border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 rounded-lg">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-600 dark:text-red-400">Failed to load</p>
            <p className="text-[11px] text-red-500/80 mt-0.5">{error}</p>
          </div>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
          <History size={24} className="text-slate-300 dark:text-white/20" />
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">No login history yet</p>
          <p className="text-[10px] text-slate-400">Sessions will appear here after you sign in</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((h, i) => {
            const { date, time } = formatTimestamp(h.timestamp);
            return (
              <div
                key={i}
                className={`relative flex items-start gap-3 p-3.5 rounded-lg border transition-all ${
                  h.isCurrent
                    ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/5"
                    : "border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]"
                }`}
              >
                {/* Device icon */}
                <div className={`w-8 h-8 rounded-md flex shrink-0 items-center justify-center mt-0.5 ${
                  h.isCurrent ? "bg-emerald-100 dark:bg-emerald-500/10" : "bg-slate-100 dark:bg-white/5"
                }`}>
                  {getDeviceIcon(h.device)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {h.device || "Unknown"} · {h.browser || "Unknown"}
                    </p>
                    {h.isCurrent && (
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                    {/* IP */}
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Globe size={10} />
                      {h.ip || "—"}
                    </span>

                    {/* Referrer */}
                    {h.referrer && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 truncate max-w-[140px]">
                      <Link2 size={10} />
                        {(() => {
                          try { return new URL(h.referrer).hostname; } catch { return h.referrer; }
                        })()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{date}</p>
                  {time && <p className="text-[9px] text-slate-400 mt-0.5">{time}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* ─── Main Security Tab ─── */
export default function SecurityTab({ user, refreshUser }) {
  const { showToast } = useToast();

  return (
    <div className="max-w-full space-y-10">
      <header>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Security & Access</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Protect your account and control active sessions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-x-12 gap-y-16">
        {/* Left Column: Email & Password */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Access</h3>
            
            <EmailSection user={user} refreshUser={refreshUser} showToast={showToast} />
          </div>

          <PasswordSection showToast={showToast} />
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-white/10" />

        {/* Right Column: 2FA & History */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Protection</h3>
            <TwoFASection user={user} refreshUser={refreshUser} showToast={showToast} />
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Activity</h3>
            <LoginHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
