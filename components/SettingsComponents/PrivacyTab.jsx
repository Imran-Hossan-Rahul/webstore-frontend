"use client";
import { useState, useEffect } from "react";
import { Eye, MessageCircle, Globe, MapPin, Search, Check, Loader2, Users } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import SettingsToggle from "./SettingsToggle";

const RADIO_GROUPS = [
  {
    key: "profileVisibility", label: "Profile Visibility",
    desc: "Who can see your full profile",
    icon: Eye,
    options: [
      { value: "public",      label: "Public",           desc: "Anyone on the platform" },
      { value: "connections", label: "Connections Only",  desc: "People you follow or follow you" },
      { value: "private",     label: "Private",           desc: "Only you" },
    ],
  },
  {
    key: "whoCanMessage", label: "Who Can Message Me",
    desc: "Control who can start a conversation",
    icon: MessageCircle,
    options: [
      { value: "everyone",   label: "Everyone",        desc: "Any platform member" },
      { value: "followers",  label: "Followers Only",   desc: "People who follow you" },
      { value: "nobody",     label: "Nobody",           desc: "Turn off messages" },
    ],
  },
];

const TOGGLES = [
  { key: "showOnlineStatus",    label: "Show Online Status",        desc: "Let others see when you're active" },
  { key: "showLocation",        label: "Show Location",             desc: "Display your city/country on profile" },
  { key: "allowSearchIndexing", label: "Search Engine Indexing",    desc: "Allow Google to index your profile" },
  { key: "readReceipts",        label: "Read Receipts in Chat",     desc: "Show when you've read messages" },
  { key: "showFollowerCount",   label: "Show Follower Count",       desc: "Display your follower count publicly" },
];

const DEFAULT_PRIVACY = {
  profileVisibility: "public", whoCanMessage: "everyone",
  showOnlineStatus: true, showLocation: true,
  allowSearchIndexing: true, readReceipts: true, showFollowerCount: true,
};

export default function PrivacyTab({ user, refreshUser }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_PRIVACY);

  useEffect(() => {
    if (user?.privacySettings) setSettings({ ...DEFAULT_PRIVACY, ...user.privacySettings });
  }, [user]);

  const set = (key, value) => setSettings(p => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/user/privacy", settings);
      if (res.success) {
        showToast("Privacy settings saved!", "success");
        if (refreshUser) refreshUser();
      }
      else showToast("Failed to save", "error");
    } catch { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-full space-y-10">
      <header>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Privacy & Visibility</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Control how your content and activity are shared across the network.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-x-12 gap-y-16">
        {/* Left Column: Radio Groups */}
        <div className="space-y-12">
          {RADIO_GROUPS.map(({ key, label, desc, icon: Icon, options }) => (
            <div key={key} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                  <Icon size={18} className="text-slate-500 dark:text-white/60" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{label}</p>
                  <p className="text-xs text-slate-500 font-medium">{desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {options.map(({ value, label: optLabel, desc: optDesc }) => (
                  <button key={value} type="button" onClick={() => set(key, value)}
                    className={`p-4 border-2 text-left transition-all rounded-lg ${settings[key] === value ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-sm" : "border-slate-100 dark:border-white/5 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10"}`}>
                    <div className="font-bold text-sm mb-0.5">{optLabel}</div>
                    <div className="text-xs font-medium opacity-70 leading-relaxed">{optDesc}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-white/10" />

        {/* Right Column: Toggle Controls */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Preferences</h3>
          <div className="space-y-0">
            {TOGGLES.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-4 border-b border-slate-100/50 dark:border-white/[0.02] last:border-0">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{desc}</p>
                </div>
                <SettingsToggle checked={!!settings[key]} onChange={val => set(key, val)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-slate-100 dark:border-white/5 flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-all flex items-center gap-2.5 disabled:opacity-40">
          {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Check size={16} />Update Privacy</>}
        </button>
      </div>
    </div>
  );
}
