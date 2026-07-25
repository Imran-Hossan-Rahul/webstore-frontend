"use client";
import React from "react";
import { Zap, Coins, ShieldCheck, UserPlus, FileText, Rocket, MessageSquare, TrendingUp, Award, Star } from "lucide-react";

const WalletRightSidebar = () => {
  const earningRules = [
    {
      title: "Token Rewards (TKNS)",
      icon: <Coins className="text-amber-500" size={18} />,
      items: [
        { label: "Identity Verification", reward: "100 TKNS", icon: <ShieldCheck size={14} /> },
        { label: "Complete Profile", reward: "50 TKNS", icon: <UserPlus size={14} /> },
        { label: "Create Devlog", reward: "30 TKNS", icon: <Rocket size={14} /> },
        { label: "Write Codex Post", reward: "20 TKNS", icon: <FileText size={14} /> },
        { label: "Publish Post", reward: "10 TKNS", icon: <FileText size={14} /> },
        { label: "Daily Check-in", reward: "5 TKNS", icon: <Zap size={14} /> },
        { label: "Get Comment", reward: "2 TKNS", icon: <MessageSquare size={14} /> },
        { label: "Get Like", reward: "1 TKNS", icon: <Star size={14} /> },
      ]
    }
  ];

  return (
    <aside className="h-full flex flex-col gap-6 pb-20 overflow-y-auto scrollbar-none">


      {/* 2. Earning Sections */}
      {earningRules.map((section, idx) => (
        <div key={idx} className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-100 dark:border-white/10 rounded-3xl p-6 shadow-sm shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
              {section.icon}
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{section.title}</h3>
          </div>

          <div className="space-y-1">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </div>
                <span className="text-[10px] font-black tabular-nums bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  +{item.reward}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 3. Authority CTA */}
      <div className="bg-slate-900 dark:bg-white rounded-3xl p-6 text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-slate-200/50 relative overflow-hidden group shrink-0">
         <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 dark:bg-slate-900/5 rounded-full blur-2xl group-hover:opacity-80 transition-opacity duration-700" />
         <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-slate-100 flex items-center justify-center shrink-0 text-white dark:text-slate-900">
               <Award size={16} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest">Authority Bonus</h3>
         </div>
         <p className="text-[11px] text-slate-300 dark:text-slate-600 leading-relaxed font-medium relative z-10 mb-4">
            Higher authority levels unlock exclusive features, lower commission rates, and priority support.
         </p>
         <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <ShieldCheck size={10} /> Tier 1: Verified Contributor
         </div>
      </div>
    </aside>
  );
};

export default WalletRightSidebar;

