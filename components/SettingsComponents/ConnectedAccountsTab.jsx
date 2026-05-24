"use client";
import { useState, useEffect } from "react";
import { Github, Chrome, Linkedin, Check, Loader2, Unplug, ExternalLink } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { useSearchParams } from "next/navigation";

const PROVIDERS = [
  {
    id: "github", label: "GitHub", icon: Github,
    color: "bg-[#24292e] dark:bg-white/10",
    description: "Connect to auto-fill your GitHub profile and verify open-source contributions.",
    connectUrl: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/oauth/github/connect`,
  },
  {
    id: "google", label: "Google", icon: Chrome,
    color: "bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10",
    description: "Connect your Google account for faster sign-in and identity verification.",
    connectUrl: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/oauth/google/connect`,
  },
  {
    id: "linkedin", label: "LinkedIn", icon: Linkedin,
    color: "bg-[#0077b5] dark:bg-[#0077b5]/80",
    description: "Import your professional information and verify your work experience.",
    connectUrl: null, // Manual URL entry for LinkedIn
  },
];

export default function ConnectedAccountsTab({ user, refreshUser }) {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState({});
  const [disconnecting, setDisconnecting] = useState("");

  useEffect(() => {
    // Load from user data
    if (user?.connectedAccounts) setAccounts(user.connectedAccounts);

    // Handle OAuth redirect results
    const success = searchParams?.get("oauth_success");
    const error   = searchParams?.get("oauth_error");
    const ghUser  = searchParams?.get("github_user");
    const gEmail  = searchParams?.get("google_email");

    if (success === "github") {
      showToast(`GitHub connected as @${ghUser}`, "success");
      setAccounts(p => ({ ...p, github: { connected: true, username: ghUser, connectedAt: new Date() } }));
      // Clean URL
      window.history.replaceState({}, "", "/settings");
    }
    if (success === "google") {
      showToast(`Google connected: ${gEmail}`, "success");
      setAccounts(p => ({ ...p, google: { connected: true, email: gEmail, connectedAt: new Date() } }));
      window.history.replaceState({}, "", "/settings");
    }
    if (error) {
      showToast(`OAuth connection failed: ${error}`, "error");
      window.history.replaceState({}, "", "/settings");
    }
  }, [user, searchParams]);

  const handleConnect = (provider) => {
    const token = localStorage.getItem("token");
    if (!token) return showToast("Please log in first", "error");
    // Redirect to OAuth (token passed via backend session via existing auth middleware)
    // We attach the token as a header — since redirect flows can't use headers, we use a temporary cookie
    document.cookie = `connect_token=${token}; path=/; max-age=300; SameSite=Lax`;
    window.location.href = provider.connectUrl + `?token=${token}`;
  };

  const handleDisconnect = async (providerId) => {
    setDisconnecting(providerId);
    try {
      const res = await api.delete(`/oauth/disconnect/${providerId}`);
      if (res.success) {
        showToast(`${providerId} disconnected`, "success");
        setAccounts(p => ({ ...p, [providerId]: { connected: false } }));
        if (refreshUser) refreshUser();
      }
    } catch { showToast("Failed to disconnect", "error"); }
    finally { setDisconnecting(""); }
  };

  return (
    <div className="max-w-full space-y-12">
      <header>
        <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase">Integrations</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Connect your social and professional networks to verify your identity.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-x-12 gap-y-12">
        <div className="space-y-12">
          {PROVIDERS.slice(0, 2).map(({ id, label, icon: Icon, color, description, connectUrl }) => {
            const acc     = accounts?.[id];
            const isConn  = acc?.connected;
            const meta    = acc?.username || acc?.email || acc?.profileUrl;

            return (
              <div key={id} className="p-8 border border-slate-100 dark:border-white/5 flex flex-col justify-between gap-8 transition-all hover:border-black dark:hover:border-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-white/10`}>
                      <Icon size={24} className={id === "google" ? "text-slate-700 dark:text-white" : "text-slate-800 dark:text-white/80"} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-black uppercase tracking-tighter text-slate-900 dark:text-white">{label}</p>
                        {isConn && <span className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-500 border border-emerald-500/30 px-2 py-0.5 flex items-center gap-1">
                          <Check size={9} />Active
                        </span>}
                      </div>
                      {isConn && meta ? (
                        <p className="text-[10px] text-slate-400 mt-1 font-mono font-bold uppercase">{meta}</p>
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wide leading-relaxed">{description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {isConn ? (
                  <button onClick={() => handleDisconnect(id)} disabled={disconnecting === id}
                    className="w-full py-4 bg-transparent border-b-2 border-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/5 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                    {disconnecting === id ? <Loader2 size={12} className="animate-spin" /> : <Unplug size={12} />}
                    Disconnect {label}
                  </button>
                ) : (
                  <button onClick={() => connectUrl ? handleConnect({ connectUrl }) : showToast("LinkedIn OAuth coming soon", "info")}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 flex items-center justify-center gap-2 transition-all">
                    <ExternalLink size={12} />
                    Authorize {label}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-white/10" />

        <div className="space-y-12">
          {PROVIDERS.slice(2).map(({ id, label, icon: Icon, color, description, connectUrl }) => {
            const acc     = accounts?.[id];
            const isConn  = acc?.connected;
            const meta    = acc?.username || acc?.email || acc?.profileUrl;

            return (
              <div key={id} className="p-8 border border-slate-100 dark:border-white/5 flex flex-col justify-between gap-8 transition-all hover:border-black dark:hover:border-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-white/10`}>
                      <Icon size={24} className={id === "google" ? "text-slate-700 dark:text-white" : "text-slate-800 dark:text-white/80"} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-black uppercase tracking-tighter text-slate-900 dark:text-white">{label}</p>
                        {isConn && <span className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-500 border border-emerald-500/30 px-2 py-0.5 flex items-center gap-1">
                          <Check size={9} />Active
                        </span>}
                      </div>
                      {isConn && meta ? (
                        <p className="text-[10px] text-slate-400 mt-1 font-mono font-bold uppercase">{meta}</p>
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wide leading-relaxed">{description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {isConn ? (
                  <button onClick={() => handleDisconnect(id)} disabled={disconnecting === id}
                    className="w-full py-4 bg-transparent border-b-2 border-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/5 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                    {disconnecting === id ? <Loader2 size={12} className="animate-spin" /> : <Unplug size={12} />}
                    Disconnect {label}
                  </button>
                ) : (
                  <button onClick={() => connectUrl ? handleConnect({ connectUrl }) : showToast("LinkedIn OAuth coming soon", "info")}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 flex items-center justify-center gap-2 transition-all">
                    <ExternalLink size={12} />
                    Authorize {label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-l-4 border-slate-200 dark:border-white/10 bg-transparent opacity-60">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] leading-relaxed">
          Connecting accounts doesn't allow external platforms to post or log in separately. These are used only for profile verification and secure data import.
        </p>
      </div>
    </div>
  );
}
