"use client";
import { useState, useEffect } from "react";
import { Ban, X, Plus, Hash, Search, Loader2, Check } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import Image from "next/image";

/* ─── Blocked Users Section ─── */
function BlockedUsers({ user, refreshUser }) {
  const { showToast } = useToast();
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState("");

  useEffect(() => {
    api.get("/user/blocked")
      .then(r => { if (r.success) setBlocked(r.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnblock = async (userId, name) => {
    setUnblocking(userId);
    try {
      const res = await api.delete(`/user/block/${userId}`);
      if (res.success) {
        showToast(`${name} unblocked`, "success");
        setBlocked(p => p.filter(u => u._id !== userId));
        if (refreshUser) refreshUser();
      }
    } catch { showToast("Failed to unblock", "error"); }
    finally { setUnblocking(""); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="w-10 h-10 border border-red-500/30 flex items-center justify-center">
          <Ban size={18} className="text-red-500" />
        </div>
        <div>
          <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tighter">Restriction</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Blocked Accounts</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-400" /></div>
      ) : blocked.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-white/10">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No active blocks</p>
        </div>
      ) : (
        <div className="space-y-0">
          {blocked.map(u => (
            <div key={u._id} className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-white/5 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-slate-200 dark:border-white/10 overflow-hidden flex-shrink-0">
                  {u.profilePicture ? (
                    <Image src={u.profilePicture} alt={u.name} width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-xs uppercase">{u.name?.[0]}</div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-white">{u.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">@{u.username}</p>
                </div>
              </div>
              <button onClick={() => handleUnblock(u._id, u.name)} disabled={unblocking === u._id}
                className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-white/10 hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-40">
                {unblocking === u._id ? <Loader2 size={10} className="animate-spin" /> : "Unblock"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Muted Keywords Section ─── */
function MutedKeywords({ user, refreshUser }) {
  const { showToast } = useToast();
  const [keywords, setKeywords] = useState([]);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.mutedKeywords) setKeywords(user.mutedKeywords);
  }, [user]);

  const addKeyword = () => {
    const kw = input.trim().toLowerCase();
    if (!kw || keywords.includes(kw) || keywords.length >= 50) return;
    setKeywords(p => [...p, kw]);
    setInput("");
  };

  const removeKeyword = (kw) => setKeywords(p => p.filter(k => k !== kw));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/user/muted-keywords", { keywords });
      if (res.success) {
        showToast("Muted keywords saved!", "success");
        if (refreshUser) refreshUser();
      }
      else showToast("Failed to save", "error");
    } catch { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="w-10 h-10 border border-slate-200 dark:border-white/10 flex items-center justify-center">
          <Hash size={18} className="text-slate-500 dark:text-white/60" />
        </div>
        <div>
          <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tighter">Content Muting</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Muted Keywords & Phrases</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addKeyword()}
            placeholder="Add keyword..."
            className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 focus:border-black dark:focus:border-white py-4 text-sm font-black uppercase tracking-widest outline-none transition-all rounded-none pr-12" />
          <button onClick={addKeyword} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-black dark:hover:text-white transition-all">
            <Plus size={20} />
          </button>
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <span key={kw} className="flex items-center gap-3 px-4 py-2 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                {kw}
                <button onClick={() => removeKeyword(kw)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{keywords.length} / 50 Keywords</p>
          <button onClick={handleSave} disabled={saving}
            className="px-12 py-4 bg-black dark:bg-white text-white dark:text-black rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 flex items-center gap-2 disabled:opacity-40 transition-all">
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : "Update Keywords"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BlockedMutedTab({ user, refreshUser }) {
  return (
    <div className="max-w-full space-y-12">
      <header>
        <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase">Safety & Moderation</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Manage your personal boundaries and curate your content experience.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-x-12 gap-y-16">
        <BlockedUsers user={user} refreshUser={refreshUser} />
        
        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-white/10" />

        <MutedKeywords user={user} refreshUser={refreshUser} />
      </div>
    </div>
  );
}
