import React from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AuthRequired() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="relative w-16 h-16 bg-brand-cloud dark:bg-brand-surface rounded-[4px] flex items-center justify-center border border-brand-navy/[0.08] dark:border-white/10">
            <Lock size={28} className="text-brand-navy dark:text-white" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-[28px] font-display font-medium tracking-tight text-brand-navy dark:text-white leading-tight">
            {t("authentication_required") || "Authentication Required"}
          </h2>
          <p className="text-[14px] font-sans text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {t("authentication_required_desc") || "Please sign in to access this feature and continue your journey."}
          </p>
        </div>

        <div className="pt-6 flex flex-col gap-3">
          <Link 
            href="/auth/login"
            className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-sans font-medium text-[15px] rounded-[4px] transition-all flex items-center justify-center gap-2 group"
          >
            {t("sign_in_to_continue") || "Sign in to Continue"}
            <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/"
            className="w-full py-3.5 bg-brand-cloud dark:bg-transparent border border-brand-navy/[0.08] dark:border-white/20 text-brand-navy dark:text-white hover:bg-slate-100 dark:bg-brand-surface/[0.05] dark:hover:bg-brand-surface/5 font-sans font-medium text-[15px] rounded-[4px] transition-all"
          >
            {t("back_to_home") || "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
