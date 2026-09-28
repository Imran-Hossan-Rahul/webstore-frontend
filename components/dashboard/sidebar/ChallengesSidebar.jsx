import React, { useContext } from "react";
import Link from "next/link";
import { Trophy, ShieldCheck, Zap, Star, Info, Plus } from "lucide-react";
import { DashboardContext } from "@/app/(dashboard)/layout";

export default function ChallengesSidebar() {
  const { user } = useContext(DashboardContext) || {};
  const isAuthorized = user?.isHost || user?.role === 'admin' || user?.role === 'patron';

  return (
    <aside className="flex flex-col gap-4 pb-10">
      
      {/* Host a Challenge CTA - Premium Card */}
      <div className="bg-[#0f172a] dark:bg-brand-surface/[0.03] p-6 rounded-[4px] border border-white/5 shadow-sm relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-blue/10 blur-[80px] rounded-full group-hover:bg-brand-blue/20 transition-all duration-700" />
        
        <div className="relative z-10">
          <h3 className="text-white font-bold text-lg mb-1 tracking-tight">Host a Challenge?</h3>
          <p className="text-slate-400 text-[11px] mb-6 leading-relaxed font-medium">
            Set up a professional track for elite craftsmen and discover top talent for your devlogs.
          </p>
          
          <Link 
            href={isAuthorized ? "/challenges/create" : "/verify"}
            className="flex items-center justify-center gap-2 w-full py-3 bg-brand-surface text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all hover:bg-slate-100 dark:bg-brand-surface/[0.05] hover:opacity-80 active:opacity-60 shadow-sm shadow-black/20"
          >
            {isAuthorized ? (
              <>
                <Plus size={16} strokeWidth={1.5} /> Create Challenge
              </>
            ) : (
              <>
                <ShieldCheck size={16} strokeWidth={1.5} /> Become a Host
              </>
            )}
          </Link>
        </div>
      </div>

      {/* Participation CTA */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[4px] p-6 text-white shadow-sm shadow-blue-500/20 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-surface/10 rounded-full blur-2xl group-hover:bg-brand-surface/20 transition-colors" />
        <h3 className="font-bold text-lg mb-1 relative z-10 flex items-center gap-2">
          <Trophy size={18} strokeWidth={1.5} /> Ready to Compete?
        </h3>
        <p className="text-blue-100 text-[11px] mb-5 leading-relaxed font-medium relative z-10">
          Prove your skills in real-world scenarios and climb the global leaderboards.
        </p>
        <Link 
          href="/achievements"
          className="w-full py-3 bg-brand-surface text-brand-blue hover:bg-brand-cloud rounded-xl font-bold text-xs shadow-sm transition-all relative z-10 flex items-center justify-center gap-2"
        >
          <Star size={14} strokeWidth={1.5} /> View Achievements
        </Link>
      </div>

      {/* Guidelines & Benefits */}
      <div className="bg-brand-surface/80 dark:bg-slate-900/40 backdrop-blur-md border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-6 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
          <Info size={14} strokeWidth={1.5} className="text-brand-blue" /> Challenge Rules
        </h3>
        <div className="space-y-5">
          <div className="flex gap-4 group">
            <div className="w-8 h-8 rounded-lg bg-brand-sky dark:bg-brand-blue/10 flex-shrink-0 flex items-center justify-center text-brand-blue font-bold text-xs">
              <Zap size={14} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-blue transition-colors">Original Work</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">All submissions must be your own original work.</p>
            </div>
          </div>
          <div className="flex gap-4 group">
            <div className="w-8 h-8 rounded-lg bg-brand-sky dark:bg-brand-blue/10 flex-shrink-0 flex items-center justify-center text-brand-blue font-bold text-xs">
              <ShieldCheck size={14} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-blue transition-colors">Fair Judging</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Entries are evaluated based on a strict rubric.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}


