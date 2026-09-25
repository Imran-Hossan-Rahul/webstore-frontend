"use client";
import React, { useContext } from "react";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { ShieldCheck, CheckCircle2, ArrowRight, Zap, Target } from "lucide-react";
import Link from "next/link";

export default function VerifySidebar() {
  const { user } = useContext(DashboardContext) || {};

  const isTier1Completed = user?.isVerified || user?.verificationStatus === 'approved';
  const isTier2Completed = !!user?.verificationGrants?.tier2Awarded;
  const isTier3Completed = !!user?.verificationGrants?.tier3Awarded;

  let score = 0;
  if (isTier1Completed) score += 33;
  if (isTier2Completed) score += 33;
  if (isTier3Completed) score += 34;

  return (
    <aside className="space-y-6 pb-20">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-3 mb-5 flex items-center gap-2">
          <Target size={12} className="text-brand-blue" /> Trust Score
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Verification Progress</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {score}% <span className="text-sm font-bold text-brand-blue ml-1">Complete</span>
              </p>
            </div>
            <ShieldCheck size={28} className={score === 100 ? "text-brand-teal" : "text-indigo-200"} />
          </div>
          
          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
            <div className="bg-brand-blue h-2 rounded-full transition-all duration-1000" style={{ width: `${score}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-3 mb-5 flex items-center gap-2">
           <Zap size={12} className="text-brand-amber" /> Verification Benefits
         </h4>
         
         <div className="space-y-4">
            <div className="flex gap-3 items-start">
               <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-brand-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} className="text-brand-teal dark:text-emerald-400" />
               </div>
               <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Higher Trust</h5>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Verified users are 3x more likely to be hired by premium patrons.</p>
               </div>
            </div>

            <div className="flex gap-3 items-start">
               <div className="w-6 h-6 rounded-full bg-brand-sky dark:bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} className="text-brand-blue dark:text-indigo-400" />
               </div>
               <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Instant Grants</h5>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Earn TKNS instantly upon completing each verification tier.</p>
               </div>
            </div>
         </div>
      </div>
      
      {score < 100 && (
          <div className="bg-brand-blue rounded-[32px] p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <ShieldCheck size={14} /> Claim Rewards
              </h3>
              <p className="text-sm font-medium text-indigo-100 leading-relaxed mb-6">
                Complete your profile verification to unlock all TKNS rewards and platform authority.
              </p>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center justify-between w-full py-4 px-5 bg-white text-brand-blue hover:bg-brand-sky rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg">
                Complete Now <ArrowRight size={14} />
              </button>
            </div>
          </div>
      )}
    </aside>
  );
}
