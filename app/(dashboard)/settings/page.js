"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  User, Link as LinkIcon, Shield, Bell, Eye,
  Palette, Plug, Ban, Download, Loader2
} from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

// Lazy-loaded tabs
import ProfileTab          from "@/components/SettingsComponents/ProfileTab";
import ProfessionalLinksTab from "@/components/SettingsComponents/ProfessionalLinksTab";
import SecurityTab         from "@/components/SettingsComponents/SecurityTab";
import NotificationsTab    from "@/components/SettingsComponents/NotificationsTab";
import PrivacyTab          from "@/components/SettingsComponents/PrivacyTab";
import AppearanceTab       from "@/components/SettingsComponents/AppearanceTab";
import ConnectedAccountsTab from "@/components/SettingsComponents/ConnectedAccountsTab";
import BlockedMutedTab     from "@/components/SettingsComponents/BlockedMutedTab";
import DataPrivacyTab      from "@/components/SettingsComponents/DataPrivacyTab";
import { useLanguage } from "@/context/LanguageContext";

const TABS = [
  { id: "profile",    label: "Profile",           icon: User,       component: ProfileTab },
  { id: "links",      label: "Professional Links", icon: LinkIcon,   component: ProfessionalLinksTab },
  { id: "security",   label: "Security",           icon: Shield,     component: SecurityTab },
  { id: "notifications", label: "Notifications",   icon: Bell,       component: NotificationsTab },
  { id: "privacy",    label: "Privacy",            icon: Eye,        component: PrivacyTab },
  { id: "appearance", label: "Appearance",         icon: Palette,    component: AppearanceTab },
  { id: "connected",  label: "Connected Accounts", icon: Plug,       component: ConnectedAccountsTab },
  // { id: "blocked",    label: "Blocked & Muted",    icon: Ban,        component: BlockedMutedTab },
  { id: "data",       label: "Data & Privacy",     icon: Download,   component: DataPrivacyTab },
];

function SettingsContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") || "profile";

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const TRANSLATED_TABS = [
    { id: "profile",    label: t("profile"),           icon: User,       component: ProfileTab },
    { id: "links",      label: t("professional_links"), icon: LinkIcon,   component: ProfessionalLinksTab },
    { id: "security",   label: t("security"),           icon: Shield,     component: SecurityTab },
    { id: "notifications", label: t("notifications_tab"),   icon: Bell,       component: NotificationsTab },
    { id: "privacy",    label: t("privacy"),            icon: Eye,        component: PrivacyTab },
    { id: "appearance", label: t("appearance"),         icon: Palette,    component: AppearanceTab },
    { id: "connected",  label: t("connected_accounts"), icon: Plug,       component: ConnectedAccountsTab },
    // { id: "blocked",    label: t("blocked_muted"),    icon: Ban,        component: BlockedMutedTab },
    { id: "data",       label: t("data_privacy"),     icon: Download,   component: DataPrivacyTab },
  ];

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/settings");
      if (res.success) setUser(res.data);
    } catch (e) {
        console.error("Failed to load user data:", e);
    }
    finally { setLoadingUser(false); }
  };

  useEffect(() => { fetchUser(); }, []);

  const activeTabData = TRANSLATED_TABS.find(t => t.id === activeTab) || TRANSLATED_TABS[0];
  const ActiveComponent = activeTabData.component;

  const handleTabChange = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.history.replaceState({}, "", `/settings?tab=${id}`);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="animate-spin text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">{t("loading_settings")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
            <div className="relative w-20 h-20 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl flex items-center justify-center border border-slate-100 dark:border-white/5">
              <Lock size={32} className="text-slate-900 dark:text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("authentication_required")}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {t("authentication_required_desc")}
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link 
              href="/auth/login"
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {t("sign_in_to_continue")}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/"
              className="w-full py-4 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
            >
              {t("back_to_home")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-white">
      {/* Page Header */}
      <div className="px-0 py-10 border-b border-slate-100 dark:border-white/[0.03] mb-10 pl-[15px]">
        <div className="max-w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("settings")}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {t("interface_desc")}
            </p>
          </div>
          
          {activeTab === "profile" && (
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("trigger-save-profile"))}
              className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-lg shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              Update Profile
            </button>
          )}
        </div>
      </div>

      <div className="max-w-full px-0 py-0 pl-[15px]">
        {/* ── Horizontal Navigation ── */}
        <div className="mb-10">
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-4 scrollbar-hide border-b border-slate-100 dark:border-white/[0.03]">
            {TRANSLATED_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-lg ${
                  activeTab === id
                    ? "bg-white dark:bg-white/10 text-black dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}>
                <Icon
                  size={16}
                  className={`transition-all ${
                    activeTab === id ? "opacity-100" : "opacity-60"
                  }`} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Main Content ── */}
        <main className="min-w-0">
          <Suspense fallback={
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          }>
            <ActiveComponent user={user} refreshUser={fetchUser} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
