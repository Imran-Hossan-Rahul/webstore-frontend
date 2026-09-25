"use client";
import React from "react";
import { Info, CheckCircle, ShieldAlert } from "lucide-react";

export default function PostJobSidebar() {
  return (
    <aside className="h-full flex flex-col gap-6 pb-10">
      {/* Posting Best Practices */}
      <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Info size={14} className="text-brand-blue" /> Posting Guide
        </h3>
        <div className="space-y-6">
          <div className="flex gap-4 group">
            <div className="w-8 h-8 rounded-lg bg-brand-sky dark:bg-brand-blue/10 flex-shrink-0 flex items-center justify-center text-brand-blue font-bold text-xs">
              1
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-blue transition-colors">Clear Title</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Use a concise title like &quot;React Frontend Developer for E-commerce&quot; instead of just &quot;Developer needed&quot;.</p>
            </div>
          </div>
          <div className="flex gap-4 group">
            <div className="w-8 h-8 rounded-lg bg-brand-sky dark:bg-brand-blue/10 flex-shrink-0 flex items-center justify-center text-brand-blue font-bold text-xs">
              2
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-blue transition-colors">Detailed Scope</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">List specific deliverables, tech stack, and expected timelines.</p>
            </div>
          </div>
          <div className="flex gap-4 group">
            <div className="w-8 h-8 rounded-lg bg-brand-sky dark:bg-brand-blue/10 flex-shrink-0 flex items-center justify-center text-brand-blue font-bold text-xs">
              3
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-blue transition-colors">Realistic Budget</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Attract top-tier professionals by matching your budget to the devlog&apos;s complexity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Safety */}
      <div className="bg-slate-900 dark:bg-white rounded-2xl p-6 text-white dark:text-slate-900 shadow-xl shadow-black/10 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-teal/20 rounded-full blur-3xl group-hover:bg-brand-teal/30 transition-colors" />
        <h3 className="font-bold text-sm mb-3 relative z-10 flex items-center gap-2">
          <ShieldAlert size={16} className="text-emerald-400 dark:text-brand-teal" /> Trust & Safety
        </h3>
        <ul className="space-y-3 relative z-10">
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-emerald-400 dark:text-brand-teal mt-0.5 flex-shrink-0" />
            <span className="text-[11px] text-white/80 dark:text-brand-slate leading-relaxed font-medium">Payments are held securely in Escrow until you approve the work.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-emerald-400 dark:text-brand-teal mt-0.5 flex-shrink-0" />
            <span className="text-[11px] text-white/80 dark:text-brand-slate leading-relaxed font-medium">Keep communications on-platform for dispute protection.</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

