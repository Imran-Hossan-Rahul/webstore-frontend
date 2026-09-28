"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/ToastProvider';
import { AlertTriangle, CheckCircle, XCircle, ExternalLink, User, DollarSign, MessageSquare } from "lucide-react";
import Link from 'next/link';
import AppleSpinner from "@/components/ui/AppleSpinner";

export default function DevlogDisputes() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDisputedContracts();
  }, []);

  const fetchDisputedContracts = async () => {
    try {
      setLoading(true);
      // We'll need to fetch all contracts that have status 'disputed'
      // For now, let's assume we can fetch them via a query
      const res = await api.get('/contracts?status=disputed');
      if (res.success) {
        setContracts(res.data);
      }
    } catch (error) {
      showToast("Failed to load disputed contracts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (contractId, milestoneId, resolution, message) => {
    try {
      setResolvingId(`${contractId}-${milestoneId}`);
      const res = await api.post(`/contracts/${contractId}/milestones/${milestoneId}/resolve`, {
        resolution,
        message
      });
      if (res.success) {
        showToast(`Dispute resolved: Funds ${resolution === 'release' ? 'released' : 'refunded'}`, "success");
        fetchDisputedContracts();
      }
    } catch (error) {
      showToast(error.message || "Failed to resolve dispute", "error");
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AppleSpinner className="animate-spin text-slate-400 mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Scanning for Disputes</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-brand-navy/[0.08] dark:border-white/10 pb-4">
          <div className="w-8 h-8 rounded-[4px] bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Active Disputes</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Milestones flagged by patrons for review and resolution.</p>
          </div>
        </div>

        {contracts.length === 0 ? (
          <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-10 text-center">
            <CheckCircle size={32} className="mx-auto text-brand-teal mb-4" />
            <p className="font-bold text-brand-slate dark:text-slate-300">Peaceful Waters</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No active disputes requiring arbitration.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {contracts.map(contract => (
              <DisputeCard 
                key={contract._id} 
                contract={contract} 
                onResolve={handleResolve}
                isResolving={resolvingId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DisputeCard({ contract, onResolve, isResolving }) {
  const disputedMilestones = contract.milestones.filter(m => m.status === 'disputed');
  const [resolveMessage, setResolveMessage] = useState("");

  return (
    <div className="bg-brand-surface dark:bg-brand-surface border border-red-500/20 dark:border-red-500/10 rounded-[4px] p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4">
        <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-md">
          Action Required
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Devlog Info */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-brand-navy dark:text-white">{contract.title}</h3>
              <Link href={`/dashboard/devlogs/${contract._id}`} target="_blank">
                <ExternalLink size={14} className="text-slate-400 hover:text-brand-blue transition-colors" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{contract.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-cloud dark:bg-brand-surface/5 p-3 rounded-[4px] border border-slate-100 dark:border-white/10">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                <User size={10} /> patron
              </p>
              <div className="flex items-center gap-2">
                <img src={getOptimizedUrl(contract.patron?.profilePicture)} className="w-5 h-5 rounded-full object-cover" alt="" />
                <span className="text-xs font-bold text-brand-slate dark:text-slate-200 truncate">{contract.patron?.name}</span>
              </div>
            </div>
            <div className="bg-brand-cloud dark:bg-brand-surface/5 p-3 rounded-[4px] border border-slate-100 dark:border-white/10">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                <User size={10} /> Craftsman
              </p>
              <div className="flex items-center gap-2">
                <img src={getOptimizedUrl(contract.craftsman?.profilePicture)} className="w-5 h-5 rounded-full object-cover" alt="" />
                <span className="text-xs font-bold text-brand-slate dark:text-slate-200 truncate">{contract.craftsman?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dispute Details & Action */}
        <div className="lg:w-96 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/10 pt-6 lg:pt-0 lg:pl-8">
          {disputedMilestones.map(milestone => (
            <div key={milestone._id} className="space-y-4">
              <div className="p-4 bg-red-500/5 rounded-[4px] border border-red-500/10">
                <p className="text-[10px] font-bold uppercase text-red-500 mb-1">Disputed Milestone</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{milestone.title}</p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-slate dark:text-slate-400">
                  <DollarSign size={14} className="text-brand-teal" />
                  {milestone.amount} Tokens
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <MessageSquare size={10} /> Resolution Note
                </p>
                <textarea 
                  value={resolveMessage}
                  onChange={(e) => setResolveMessage(e.target.value)}
                  placeholder="Explain the reason for this resolution..."
                  className="w-full h-24 bg-brand-surface dark:bg-black border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-3 text-xs focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onResolve(contract._id, milestone._id, 'release', resolveMessage)}
                  disabled={isResolving === `${contract._id}-${milestone._id}`}
                  className="flex-1 px-4 py-2.5 bg-brand-teal hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-[4px] transition-all disabled:opacity-50"
                >
                  {isResolving === `${contract._id}-${milestone._id}` ? <AppleSpinner size={14} className="animate-spin mx-auto" /> : 'Release to Craftsman'}
                </button>
                <button
                  onClick={() => onResolve(contract._id, milestone._id, 'refund', resolveMessage)}
                  disabled={isResolving === `${contract._id}-${milestone._id}`}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-[4px] transition-all disabled:opacity-50"
                >
                   {isResolving === `${contract._id}-${milestone._id}` ? <AppleSpinner size={14} className="animate-spin mx-auto" /> : 'Refund to patron'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

