"use client";
import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone, Loader2, Check } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import SettingsToggle from "./SettingsToggle";

const EMAIL_PREFS = [
  { key: "newFollower",      label: "New Follower",          desc: "When someone follows you" },
  { key: "newComment",       label: "New Comment",           desc: "When someone comments on your work" },
  { key: "newLike",          label: "New Like",              desc: "When someone likes your content" },
  { key: "newJob",           label: "New Job Match",         desc: "Jobs matching your skills" },
  { key: "challengeUpdates", label: "Challenge Updates",     desc: "Results and phase changes" },
  { key: "weeklyDigest",     label: "Weekly Digest",         desc: "Weekly summary of your activity" },
  { key: "marketingEmails",  label: "Marketing & Promotions",desc: "Platform news and offers" },
];

const INAPP_PREFS = [
  { key: "newFollower",      label: "New Follower",      desc: "In-app follower alerts" },
  { key: "newComment",       label: "New Comment",       desc: "In-app comment alerts" },
  { key: "newLike",          label: "New Like",          desc: "In-app like alerts" },
  { key: "newJob",           label: "Job Opportunities", desc: "In-app job alerts" },
  { key: "challengeUpdates", label: "Challenge Updates", desc: "In-app challenge alerts" },
];

export default function NotificationsTab({ user, refreshUser }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({ email: {}, inApp: {} });

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPrefs({
        email: { newFollower: true, newComment: true, newLike: false, newJob: true, challengeUpdates: true, weeklyDigest: true, marketingEmails: false, ...user.notificationPreferences.email },
        inApp:  { newFollower: true, newComment: true, newLike: true, newJob: true, challengeUpdates: true, ...user.notificationPreferences.inApp },
      });
    } else {
      setPrefs({
        email: { newFollower: true, newComment: true, newLike: false, newJob: true, challengeUpdates: true, weeklyDigest: true, marketingEmails: false },
        inApp:  { newFollower: true, newComment: true, newLike: true, newJob: true, challengeUpdates: true },
      });
    }
  }, [user]);

  const toggle = (section, key) => setPrefs(p => ({ ...p, [section]: { ...p[section], [key]: !p[section][key] } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/user/notifications", prefs);
      if (res.success) {
        showToast("Notification preferences saved!", "success");
        if (refreshUser) refreshUser();
      }
      else showToast("Failed to save", "error");
    } catch { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const Section = ({ icon: Icon, title, subtitle, items, section }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="w-10 h-10 border border-slate-200 dark:border-white/10 flex items-center justify-center">
          <Icon size={18} className="text-slate-500 dark:text-white/60" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-1">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-4 border-b border-slate-100/50 dark:border-white/[0.02] last:border-0">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{desc}</p>
            </div>
            <SettingsToggle checked={!!prefs[section]?.[key]} onChange={() => toggle(section, key)} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-full space-y-10">
      <header>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Notifications</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Control exactly how and when you receive updates.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-x-12 gap-y-16">
        <Section icon={Mail}        title="Email"    subtitle="Sent to inbox" items={EMAIL_PREFS} section="email" />
        
        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-white/10" />

        <Section icon={Smartphone}  title="In-App"   subtitle="Platform alerts"  items={INAPP_PREFS} section="inApp" />
      </div>

      <div className="pt-10 border-t border-slate-100 dark:border-white/5 flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-all flex items-center gap-2.5 disabled:opacity-40">
          {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Check size={16} />Update Settings</>}
        </button>
      </div>
    </div>
  );
}
