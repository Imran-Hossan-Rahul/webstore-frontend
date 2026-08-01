"use client";
import React from "react";
import Link from "next/link";
import { Plus, Target, Users, ShieldCheck } from "lucide-react";

export default function ManageJobsSidebar() {
  return (
    <aside className="h-full flex flex-col gap-6 pb-10">
      {/* Quick Action */}
      <div className="bg-slate-900 dark:bg-white rounded-2xl p-6 text-white dark:text-black shadow-xl shadow-slate-900/10 dark:shadow-white/5 relative overflow-hidden group">
        <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
          Need more talent?
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-xs mb-5 leading-relaxed font-medium relative z-10">
          Scale your team with elite professionals tailored to your requirements.
        </p>
        <Link 
          href="/post-job"
          className="w-full py-2.5 bg-white dark:bg-black text-slate-900 dark:text-white hover:bg-slate-50 rounded-xl font-bold text-xs shadow-lg transition-all relative z-10 flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Post a New Job
        </Link>
      </div>

      {/* Hiring Tips */}
      <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Target size={14} className="text-indigo-600" /> Hiring Success
        </h3>
        <div className="space-y-6">
          <div className="flex gap-4 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-xs">
              <Users size={14} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">Review Candidates</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Check portfolios and verify previous work to ensure a good match.</p>
            </div>
          </div>
          <div className="flex gap-4 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex-shrink-0 flex items-center justify-center text-emerald-600 font-bold text-xs">
              <ShieldCheck size={14} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">Secure Contracts</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Use the platform&apos;s milestone system to manage deliverables safely.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
