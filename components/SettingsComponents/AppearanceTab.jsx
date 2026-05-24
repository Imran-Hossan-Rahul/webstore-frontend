
"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, Laptop, Layout, Globe, Clock, Check, Save, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/CustomSelect";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { useTheme } from "@/context/ThemeContext";

const THEMES = [
  { value: "dark",   label: "Dark",   icon: Moon,    desc: "Easy on the eyes" },
  { value: "light",  label: "Light",  icon: Sun,     desc: "Bright & clean" },
  { value: "system", label: "System", icon: Laptop, desc: "Follow OS setting" },
];

const TIMEZONES = [
  "Asia/Dhaka", "Asia/Kolkata", "America/New_York", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney", "UTC",
];

const FEEDS = [
  { value: "trending",     label: "Trending",      desc: "Most popular content" },
  { value: "following",    label: "Following",      desc: "From people you follow" },
  { value: "recommended",  label: "Recommended",    desc: "AI-curated for you" },
];

const DEFAULT = { theme: "system", language: "en", timezone: "Asia/Dhaka", currency: "USD", defaultFeed: "trending" };

function SelectField({ label, icon: Icon, value, onChange, options }) {
  return (
    <CustomSelect
      label={label}
      icon={Icon}
      value={value}
      onChange={onChange}
      options={options}
      className="w-full"
    />
  );
}

function ThemeOption({ icon: Icon, label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 border-2 transition-all rounded-xl ${active ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-white/20 text-slate-500"}`}>
      <Icon size={20} className="mb-2" />
      <span className="text-xs font-bold uppercase">{label}</span>
    </button>
  );
}

export default function AppearanceTab({ user, refreshUser }) {
  const { showToast } = useToast();
  const { theme, applyTheme } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT);

  useEffect(() => {
    if (user?.appearancePreferences) setPrefs({ ...DEFAULT, ...user.appearancePreferences });
  }, [user]);

  // Bidirectional Sync: Update prefs.theme when global theme changes (e.g. from navbar)
  useEffect(() => {
    if (theme && theme !== prefs.theme) {
      setPrefs(p => ({ ...p, theme }));
    }
  }, [theme]);

  const set = (k, v) => {
    setPrefs(p => ({ ...p, [k]: v }));
    // Live Preview: Apply theme immediately when changed in settings
    if (k === 'theme') applyTheme(v);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.patch("/user/appearance", prefs);
      if (res.success) {
        showToast("Appearance saved!", "success");
        applyTheme(prefs.theme);
        if (refreshUser) refreshUser();
      }
    } catch { showToast("Failed to save", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-full space-y-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-500" />
            {t("interface_title")}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("interface_desc")}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? t("updating") : t("update_interface")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Theme Selector & Timezone */}
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-3 h-3" />
              {t("theme_mode")}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <ThemeOption icon={Sun} label="Light" active={prefs.theme === 'light'} onClick={() => set('theme', 'light')} />
              <ThemeOption icon={Moon} label="Dark" active={prefs.theme === 'dark'} onClick={() => set('theme', 'dark')} />
              <ThemeOption icon={Laptop} label="System" active={prefs.theme === 'system'} onClick={() => set('theme', 'system')} />
            </div>
          </div>

          <div className="space-y-4 max-w-xs">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {t("timezone")}
            </label>
            <SelectField icon={Clock} value={prefs.timezone} onChange={v => set("timezone", v)}
              options={TIMEZONES.map(tz => ({ value: tz, label: tz }))} />
          </div>
        </div>

        {/* Default View */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Layout className="w-3 h-3" />
            {t("default_view")}
          </label>
          <div className="space-y-2">
            {FEEDS.map(f => (
              <button
                key={f.value}
                onClick={() => set('defaultFeed', f.value)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  prefs.defaultFeed === f.value
                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className={`text-sm font-bold ${prefs.defaultFeed === f.value ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {f.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">{f.desc}</span>
                </div>
                {prefs.defaultFeed === f.value && <Check className="w-4 h-4 text-blue-500" />}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
