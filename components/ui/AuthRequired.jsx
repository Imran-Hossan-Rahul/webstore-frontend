import React from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AuthRequired() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
          <div className="relative w-20 h-20 bg-white dark:bg-[#111111] rounded-3xl shadow-2xl flex items-center justify-center border border-slate-100 dark:border-white/5">
            <Lock size={32} className="text-slate-900 dark:text-white" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("authentication_required") || "Authentication Required"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {t("authentication_required_desc") || "Please sign in to access this feature and continue your journey."}
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link 
            href="/auth/login"
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl hover:opacity-80 active:opacity-60 transition-all flex items-center justify-center gap-2 group"
          >
            {t("sign_in_to_continue") || "Sign in to Continue"}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-opacity" />
          </Link>
          <Link 
            href="/"
            className="w-full py-4 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-transparent"
          >
            {t("back_to_home") || "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
