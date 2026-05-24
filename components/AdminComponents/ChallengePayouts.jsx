"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/ToastProvider';
import { Trophy, CheckCircle2, AlertCircle, Loader2, DollarSign, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ChallengePayouts() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/challenges?status=completed');
      if (res.success) {
        setChallenges(res.data);
      }
    } catch (error) {
      showToast("Failed to load completed challenges", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReleasePayout = async (challengeId) => {
    try {
      setProcessingId(challengeId);
      const res = await api.post(`/challenges/${challengeId}/payout`);
      if (res.success) {
        showToast("Payout released successfully", "success");
        fetchChallenges(); // Refresh list
      }
    } catch (error) {
      showToast(error.message || "Failed to release payout", "error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={32} />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Challenge Payouts</p>
      </div>
    );
  }

  const pendingPayouts = challenges.filter(c => c.payoutStatus === 'pending');
  const distributedPayouts = challenges.filter(c => c.payoutStatus === 'distributed');

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Pending Payouts */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-white/5 pb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <AlertCircle size={16} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Pending Payouts</h2>
            <p className="text-xs text-slate-500">Completed challenges awaiting token distribution to winners.</p>
          </div>
        </div>

        {pendingPayouts.length === 0 ? (
          <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl p-10 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-4" />
            <p className="font-bold text-slate-700 dark:text-slate-300">All caught up</p>
            <p className="text-xs text-slate-500 mt-1">No pending challenge payouts require action.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingPayouts.map(challenge => (
              <PayoutCard 
                key={challenge._id} 
                challenge={challenge} 
                onPayout={handleReleasePayout}
                isProcessing={processingId === challenge._id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Distributed Payouts History */}
      {distributedPayouts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Payout History</h2>
              <p className="text-xs text-slate-500">Previously distributed token payouts for challenges.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {distributedPayouts.map(challenge => (
              <PayoutCard 
                key={challenge._id} 
                challenge={challenge} 
                isHistory
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

function PayoutCard({ challenge, onPayout, isProcessing, isHistory }) {
  const totalPayout = challenge.prizePool || 0;
  
  return (
    <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 transition-all hover:border-slate-300 dark:hover:border-white/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{challenge.title}</h3>
            <Link 
              href={`/challenges/${challenge._id}`}
              target="_blank"
              className="text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              <ExternalLink size={14} />
            </Link>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" />
              {challenge.winners?.length || 0} Winners
            </span>
            <span className="w-1 h-1 bg-slate-300 dark:bg-white/10 rounded-full" />
            <span className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-500" />
              {totalPayout.toLocaleString()} Tokens Total
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5 pt-4 md:pt-0 md:pl-6">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
              isHistory 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : 'bg-amber-500/10 text-amber-500'
            }`}>
              {isHistory ? 'Distributed' : 'Pending Audit'}
            </span>
          </div>

          {!isHistory && (
            <button
              onClick={() => onPayout(challenge._id)}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Release Payout'}
            </button>
          )}
        </div>

      </div>

      {/* Winner List Preview */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {challenge.winners?.map((w, idx) => {
          return (
            <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden shrink-0">
                {w.user?.profilePicture ? (
                  <img src={w.user.profilePicture} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                    {w.user?.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Rank {w.rank}</p>
                <p className="text-[10px] text-emerald-500 font-bold">{challenge.rewardDistribution?.find(d => d.rank === w.rank)?.amount || 0} Tokens</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
