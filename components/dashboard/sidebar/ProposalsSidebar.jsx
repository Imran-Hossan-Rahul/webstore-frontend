"use client";
import React, { useContext } from "react";
import Link from "next/link";
import { Zap, Briefcase, Trophy, Clock, UserCheck, Search, Plus, Target, ShieldCheck } from "lucide-react";
import { DashboardContext } from "@/app/(dashboard)/layout";

export default function ProposalsSidebar() {
  const { user } = useContext(DashboardContext) || {};
  const isPatron = user?.role === "patron" || user?.role === "admin";

  return (
    <aside className="h-full flex flex-col gap-6 pb-10">
      {/* Primary Action Card */}
      <div className="bg-slate-900 dark:bg-brand-surface rounded-2xl p-6 text-white dark:text-black shadow-sm shadow-slate-900/10 dark:shadow-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-surface/[0.03] dark:bg-black/[0.03] rounded-full -mr-16 -mt-16 group-hover:opacity-80 transition-opacity duration-500" />
        
        <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
          {isPatron ? "Find More Talent" : "Boost Your Career"}
        </h3>
        <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs mb-5 leading-relaxed font-medium relative z-10">
          {isPatron 
            ? "Scale your devlogs with elite professionals ready to deliver high-quality work."
            : "Winning more jobs starts with high-quality proposals and a standout profile."
          }
        </p>
        
        <Link 
          href={isPatron ? "/post-job" : "/jobs"}
          className="w-full py-2.5 bg-brand-surface dark:bg-black text-slate-900 dark:text-white hover:bg-brand-cloud dark:hover:bg-slate-900 rounded-xl font-bold text-xs shadow-sm transition-all relative z-10 flex items-center justify-center gap-2"
        >
          {isPatron ? <Plus size={14} /> : <Search size={14} />}
          {isPatron ? "Post a New Job" : "Browse New Jobs"}
        </Link>
      </div>

      {/* Proposal Tips / Success Metrics */}
      <div className="bg-brand-surface/80 dark:bg-slate-900/40 backdrop-blur-md border border-brand-navy/[0.08] dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Target size={14} className="text-slate-900 dark:text-white" /> {isPatron ? "Hiring Success" : "Proposal Tips"}
        </h3>
        
        <div className="space-y-6">
          {isPatron ? (
            <>
              <div className="flex gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-brand-surface/5 flex-shrink-0 flex items-center justify-center text-slate-900 dark:text-white font-bold text-xs">
                  <UserCheck size={14} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-slate dark:text-slate-300 transition-colors">Compare Proposals</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Check portfolios and past reviews to ensure the best fit for your job.</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-brand-surface/5 flex-shrink-0 flex items-center justify-center text-slate-900 dark:text-white font-bold text-xs">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-slate dark:text-slate-300 transition-colors">Secure Escrow</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Always fund milestones before work begins to ensure transparency.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-brand-surface/5 flex-shrink-0 flex items-center justify-center text-slate-900 dark:text-white font-bold text-xs">
                  <Zap size={14} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-slate dark:text-slate-300 transition-colors">Tailored Pitch</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Avoid copy-pasting. Address the patron&apos;s specific problems directly.</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-brand-surface/5 flex-shrink-0 flex items-center justify-center text-slate-900 dark:text-white font-bold text-xs">
                  <Trophy size={14} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-slate dark:text-slate-300 transition-colors">Portfolio Links</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Showcase similar work to build trust and prove your expertise quickly.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Support Card */}
      <div className="p-6 border border-dashed border-brand-navy/[0.08] dark:border-white/10 rounded-2xl">
         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Resources</h4>
         <ul className="space-y-3">
           <li>
             <Link href="#" className="text-[12px] font-bold text-brand-slate dark:text-slate-300 hover:text-slate-900 dark:text-white dark:hover:text-white flex items-center justify-between">
               Help Center <ArrowUpRight size={14} />
             </Link>
           </li>
           <li>
             <Link href="/community" className="text-[12px] font-bold text-brand-slate dark:text-slate-300 hover:text-slate-900 dark:text-white dark:hover:text-white flex items-center justify-between">
               Community Tips <ArrowUpRight size={14} />
             </Link>
           </li>
         </ul>
      </div>
    </aside>
  );
}

function ArrowUpRight({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}

