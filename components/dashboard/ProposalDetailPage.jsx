"use client";
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { DashboardContext } from "../../app/(dashboard)/layout";
import { useToast } from "@/components/ui/ToastProvider";
import { ArrowLeft, Clock, Zap, User, Calendar, FileText, ExternalLink, Briefcase, MessageSquare, CheckCircle2, XCircle, AlertCircle, ChevronRight } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import CraftsmanHoverCard from "./cards/CraftsmanHoverCard";

// --- Status Pill ---
function StagePill({ stage }) {
  const cfg = {
    proposal_sent: { label: "SENT",        color: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-slate-400" },
    under_review:  { label: "REVIEWING",   color: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-amber-400" },
    shortlisted:   { label: "SHORTLISTED", color: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-emerald-400" },
    interview:     { label: "INTERVIEW",   color: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-indigo-400" },
    offer_sent:    { label: "OFFER SENT",  color: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-blue-400" },
    hired:         { label: "HIRED",       color: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-violet-400" },
    rejected:      { label: "REJECTED",    color: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-rose-400" },
    trash:         { label: "TRASH",       color: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-slate-300" }
  };

  const current = cfg[stage] || cfg.proposal_sent;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${current.bg} border border-slate-200 dark:border-[#262626] transition-all duration-300`}>
      <div className={`w-1.5 h-1.5 rounded-full ${current.dot} shadow-none`} />
      <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${current.color}`}>
        {current.label}
      </span>
    </div>
  );
}

export default function ProposalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, refreshUser } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [proposalData, setProposalData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) fetchProposalDetails();
  }, [id]);

  const fetchProposalDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/proposals/${id}`);
      if (res.success) {
        setProposalData(res.data);
      } else {
        setError(res.message || "Failed to load proposal");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!proposalData?.jobId) return;
    try {
      setIsAccepting(true);
      const res = await api.post(`/jobs/${proposalData.jobId}/applicants/accept-offer`);
      if (res.success) {
        showToast("Agreement accepted! You are now officially hired.", "success");
        await refreshUser();
        fetchProposalDetails();
      } else {
        showToast(res.message || "Failed to accept offer", "error");
      }
    } catch (err) {
      showToast("An error occurred while accepting the offer", "error");
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl px-[15px] pb-20 animate-pulse">
        <div className="h-8 w-64 bg-slate-100 dark:bg-[#171717] rounded-lg mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-3xl" />
            <div className="h-96 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-3xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-3xl" />
            <div className="h-64 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !proposalData) {
    return (
      <div className="w-full max-w-6xl px-[15px] py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{error || "Proposal Not Found"}</h2>
        <p className="text-slate-500 mb-8 max-w-md">The proposal you are looking for might have been deleted or you don't have permission to view it.</p>
        <button 
          onClick={() => router.push("/proposals")}
          className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:shadow-xl transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Proposals
        </button>
      </div>
    );
  }

  const { jobTitle, jobCategory, applicant, patron } = proposalData;
  const isPatronView = user?._id.toString() === patron?._id.toString();
  const person = isPatronView ? applicant.user : patron;
  const proposal = applicant.proposal;

  return (
    <div className="w-full max-w-6xl px-[15px] animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header & Back Button */}
      <div className="mb-8">
        <button 
          onClick={() => router.push("/proposals")}
          className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Proposals</span>
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Proposal Details
            </h1>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-sm">{jobTitle}</span>
            </div>
          </div>
          <StagePill stage={applicant.stage} />
        </div>

        {/* Offer Banner if Sent */}
        {applicant.stage === "offer_sent" && applicant.offer && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm animate-in zoom-in-95 duration-500">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400">Formal Offer Received</h3>
                <p className="text-sm text-blue-700 dark:text-indigo-600/80 mt-1 leading-relaxed">
                  The patron has sent a formal contract agreement. Review the terms and accept to start working on the devlog.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button 
                    onClick={handleAcceptOffer}
                    disabled={isAccepting}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                  >
                    {isAccepting ? "Signing..." : "Accept Agreement"}
                  </button>
                  <button 
                    onClick={() => router.push(`/contracts/${applicant.offer._id || applicant.offer}`)}
                    className="px-6 py-2.5 bg-white dark:bg-[#0A0A0A] text-slate-700 dark:text-white border border-slate-200 dark:border-[#262626] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-[#171717] transition-all"
                  >
                    View Offer Terms
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-12">
        {/* Cover Letter Section */}
        <section className="">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cover Letter</h2>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words font-jakarta text-[15px]">
              {proposal.coverLetter}
            </p>
          </div>
        </section>

        {/* Portfolio & Links */}
        {proposal.portfolioLinks?.length > 0 && (
          <section className="">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Relevant Work & Portfolio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {proposal.portfolioLinks.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group p-4 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#171717] transition-all shadow-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                      <ExternalLink size={14} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{link.label || "Devlog Link"}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* History / Timeline */}
        <section className="">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Proposal History</h2>
           <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-[#262626]">
              {applicant.stageHistory.map((event, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-[#F3F4F6] dark:border-[#0a0a0a] flex items-center justify-center transition-colors">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{event.stage.replace("_", " ")}</span>
                      <span className="text-[10px] font-medium text-slate-400">{new Date(event.changedAt).toLocaleString()}</span>
                    </div>
                    {event.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{event.note}</p>
                    )}
                  </div>
                </div>
              )).reverse()}
           </div>
        </section>
      </div>
    </div>
  );
}


