"use client";
import React, { useContext, useEffect, useState } from "react";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Briefcase, ArrowRight, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function WorkspaceSidebar() {
  const { user } = useContext(DashboardContext) || {};
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/contracts");
      if (res.success && res.data) {
        setContracts(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Derived Stats ---
  // Escrow Calculations
  const totalInEscrow = contracts.reduce((sum, c) => sum + (c.escrowBalance || 0), 0);
  const amountReleased = contracts.reduce((sum, c) => {
     return sum + (c.milestones || []).filter(m => m.status === 'paid').reduce((mSum, m) => mSum + Number(m.amount || 0), 0);
  }, 0);

  // Upcoming Milestones
  const upcomingMilestones = contracts
    .filter(c => ["active", "holding", "disputed"].includes(c.status))
    .flatMap(c => (c.milestones || []).map(m => ({ ...m, contractId: c._id, contractTitle: c.title })))
    .filter(m => ["pending", "funded", "holding"].includes(m.status) && m.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3); // Get next 3

  // Pending Actions
  const pendingSignatures = contracts.filter(c => c.status === 'pending' && 
    ((c.patron?._id === user?._id && !c.patronAccepted) || (c.craftsman?._id === user?._id && !c.craftsmanAccepted))
  ).length;

  const pendingFunding = contracts.flatMap(c => c.milestones || []).filter(m => 
    !m.isFunded && (m.isInitial || m.isAutoFunded) && m.status !== 'paid' && m.status !== 'cancelled'
  ).length;

  if (loading) {
    return (
      <aside className="space-y-6 pb-20 animate-pulse">
        <div className="bg-slate-100 dark:bg-white/5 rounded-2xl h-40"></div>
        <div className="bg-slate-100 dark:bg-white/5 rounded-2xl h-40"></div>
      </aside>
    );
  }

  return (
    <aside className="space-y-6 pb-20">
      {/* 1. Escrow Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-3 mb-5 flex items-center gap-2">
          <Briefcase size={12} className="text-indigo-500" /> Escrow Overview
        </h4>
        
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total in Escrow</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white truncate">
              {totalInEscrow.toLocaleString()} <span className="text-sm font-bold text-indigo-500 ml-1">TKNS</span>
            </p>
          </div>
          
          <div className="h-px bg-slate-100 dark:bg-white/5 w-full my-4" />
          
          <div className="flex justify-between items-center text-[10px]">
             <span className="text-slate-400 font-bold uppercase tracking-tighter">Amount Released</span>
             <span className="text-slate-900 dark:text-white font-bold text-sm truncate max-w-[140px] text-right">
               {amountReleased.toLocaleString()} TKNS
             </span>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-3 mb-5 flex items-center gap-2">
             <Clock size={12} className="text-emerald-500" /> Upcoming Milestones
           </h4>
           
           <div className="divide-y divide-slate-100 dark:divide-white/5">
              {upcomingMilestones.map((m, idx) => (
                <div key={idx} onClick={() => router.push(`/workspace`)} className="py-3.5 group cursor-pointer">
                   <div className="flex justify-between items-start mb-1">
                      <span className="text-slate-900 dark:text-white text-[13px] font-bold group-hover:text-indigo-600 transition-colors line-clamp-1">
                         {m.title}
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${new Date(m.dueDate) < new Date() ? 'text-rose-500' : 'text-slate-400'}`}>
                        {new Date(m.dueDate) < new Date() ? 'Overdue' : 'Upcoming'}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-500">{m.amount} TKNS</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* 3. Action Items */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-3 mb-5 flex items-center gap-2">
           <CheckCircle size={12} className="text-rose-500" /> Pending Actions
         </h4>
         
         <div className="space-y-3">
            <button onClick={() => router.push('/workspace')} className="w-full flex justify-between items-center p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors border border-rose-100 dark:border-rose-500/20">
               <span className="text-[11px] font-bold uppercase tracking-wider">Sign Agreements ({pendingSignatures})</span>
               <ArrowRight size={14} />
            </button>
            <button onClick={() => router.push('/workspace')} className="w-full flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-100 dark:border-white/10">
               <span className="text-[11px] font-bold uppercase tracking-wider">Fund Milestones ({pendingFunding})</span>
               <ArrowRight size={14} />
            </button>
         </div>
      </div>
    </aside>
  );
}
