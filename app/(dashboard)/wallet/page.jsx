"use client";
import React, { useState, useEffect, useContext } from "react";
import { 
  History, 
  ShieldCheck, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { DashboardContext } from "../layout";
import AuthRequired from "@/components/ui/AuthRequired";

const TokenLedgerPage = () => {
  const { user, refreshUser } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTokenData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return <AuthRequired />;
  }

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        api.get("/tokens/balance"),
        api.get("/tokens/history")
      ]);

      if (balanceRes.success) {
        setBalance(balanceRes.tokenBalance ?? 0);
        setTotalEarned(balanceRes.totalEarned ?? 0);
      } else if (user) {
        setBalance(user.walletBalance || 0);
        setTotalEarned(user.totalEarnings || 0);
      }
      
      if (historyRes.success) {
        setTransactions(historyRes.data);
      }
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error(err);
      if (user) {
        setBalance(user.walletBalance || 0);
        setTotalEarned(user.totalEarnings || 0);
      }
      showToast("Failed to sync assets", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl px-4 pt-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Simple Professional Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Wallet & Rewards</h1>
        </div>
      </div>

      {/* 2. Unified Asset Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 p-2 rounded-2xl shadow-sm mb-8">
          <div className="flex-1 px-8 py-4 border-r border-slate-50 dark:border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available</p>
              <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{(balance || 0).toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TKNS</span>
              </div>
          </div>
          <div className="flex-1 px-8 py-4 border-r border-slate-50 dark:border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lifetime</p>
              <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{(totalEarned || 0).toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TKNS</span>
              </div>
          </div>
          <div className="flex-1 px-8 py-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authority</p>
              <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{(user?.gamification?.xp || 0).toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">XP</span>
              </div>
          </div>
      </div>

      {/* 3. Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Transaction History */}
        <div className="lg:col-span-12 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <History size={14} /> Activity Ledger
              </h2>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden min-h-[400px] max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {loading ? (
                 <div className="h-60 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                 </div>
              ) : transactions.length === 0 ? (
                 <div className="h-60 flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <History size={32} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No activity recorded</p>
                 </div>
              ) : (
                 <div className="divide-y divide-slate-50 dark:divide-white/5">
                    {transactions.map((tx) => (
                       <div key={tx._id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all group">
                          <div className="flex items-center gap-5">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'reward' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'}`}>
                                {tx.type === 'reward' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white capitalize leading-none mb-1">{tx.source.replace(/_/g, ' ')}</p>
                                <p className="text-[11px] text-slate-500 font-medium">{tx.description}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className={`text-sm font-bold tabular-nums ${tx.type === 'reward' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {tx.type === 'reward' ? '+' : '-'}{tx.amount.toLocaleString()}
                             </p>
                             <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">
                                {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                             </p>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>



      </div>
    </div>
  );
};

export default TokenLedgerPage;
