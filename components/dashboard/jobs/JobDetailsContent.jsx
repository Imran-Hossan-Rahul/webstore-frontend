"use client";
import React, { useState, useCallback, useEffect, useContext } from "react";
import { MapPin, Clock, Users, Calendar, ArrowRight, CheckCircle, Send, Link, ChevronLeft, ShieldCheck, Info, X, FileSignature, ShieldAlert, Star, FileText, Check, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { useToast } from "@/components/ui/ToastProvider";

const STAGES = [
  { key: "proposal_sent",  label: "Proposal Sent" },
  { key: "under_review",   label: "Under Review"  },
  { key: "shortlisted",    label: "Shortlisted"   },
  { key: "interview",      label: "Interview"     },
  { key: "offer_sent",     label: "Offer Sent"    },
  { key: "hired",          label: "Hired"         },
];

// ── Live relative-time hook ──────────────────────────────────────────────────
function useTimeAgo(date) {
  const calc = useCallback(() => {
    if (!date) return "Long ago";
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60)  return "just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60)     return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24)    return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30)     return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }, [date]);

  const [label, setLabel] = useState(calc);
  useEffect(() => {
    setLabel(calc());
    const id = setInterval(() => setLabel(calc()), 60_000);
    return () => clearInterval(id);
  }, [calc]);
  return label;
}

export default function JobDetailsContent({ job, isGuest, onRequireAuth, myProposalStage, myApplication, isOwner }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isRejected = myProposalStage === "rejected";
  const { showToast } = useToast();
  const { user, refreshUser } = useContext(DashboardContext);
  const [jobView, setJobView] = useState("details");

  const canApply = (user?.walletBalance || 0) >= 1;

  const patronLastActive = useTimeAgo(job.patron?.lastActiveAt);

  const [proposal, setProposal] = useState({
    coverLetter:   "",
    expectedRate:  "",
    rateType:      "fixed",
    availability:  "Immediately",
    estimatedDays: "",
    portfolioLinks: [{ url: "", label: "" }]
  });

  const currentStageIdx = myProposalStage
    ? STAGES.findIndex(s => s.key === myProposalStage)
    : -1;

  const handleProposalChange = (field, value) => {
    setProposal(prev => ({ ...prev, [field]: value }));
  };

  const handlePortfolioChange = (idx, field, value) => {
    const links = [...proposal.portfolioLinks];
    links[idx] = { ...links[idx], [field]: value };
    setProposal(prev => ({ ...prev, portfolioLinks: links }));
  };

  const addPortfolioLink = () => {
    setProposal(prev => ({ ...prev, portfolioLinks: [...prev.portfolioLinks, { url: "", label: "" }] }));
  };

  const removePortfolioLink = (idx) => {
    setProposal(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmitProposal = async () => {
    if (isGuest) { onRequireAuth("submit proposals"); return; }
    if (!proposal.coverLetter.trim()) {
      showToast("Please write a cover letter", "warning"); return;
    }
    if (!proposal.expectedRate) {
      showToast("Please enter your expected rate", "warning"); return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        coverLetter:    proposal.coverLetter,
        expectedRate:   Number(proposal.expectedRate),
        rateType:       proposal.rateType,
        availability:   proposal.availability,
        estimatedDays:  Number(proposal.estimatedDays) || undefined,
        portfolioLinks: proposal.portfolioLinks
          .filter(l => l.url?.trim())
          .map(l => ({ url: l.url.trim(), label: l.label.trim() || l.url.trim() }))
      };
      const res = await api.post(`/jobs/${job._id}/apply`, payload);
      if (res.success) {
        showToast("Proposal submitted successfully", "success");
        setJobView("details");
        await refreshUser(); // Update balance
        window.location.reload(); // Refresh to update stages
      } else {
        showToast(res.message || "Failed to submit proposal", "error");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!job) return null;

  return (
    <div className="max-w-[1250px] mx-auto pt-[31px] pb-6 px-[13px] animate-in fade-in duration-500">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors font-medium text-sm"
        >
          <ChevronLeft size={16} />
          Back to Jobs
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 items-start">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="col-span-1 space-y-2">
          
          {/* Job Title Section */}
          <div className="pt-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {job.title}
            </h1>
            {!isOwner && !myApplication && job.status === "open" && (
              <button 
                onClick={() => setJobView(jobView === "details" ? "proposal" : "details")}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shrink-0"
              >
                {jobView === "details" ? "Apply Now" : "Back to Details"}
              </button>
            )}
          </div>

          {/* Pipeline Tracker (if applied) */}
          {myProposalStage && myProposalStage !== "rejected" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Application Status</h3>
              <div className="relative flex items-center justify-between">
                {STAGES.map((stage, idx) => {
                  const isPast    = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  return (
                    <div key={stage.key} className="flex flex-col items-center relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all ${
                        isCurrent || isPast ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20" :
                                     "bg-white dark:bg-black border-slate-200 dark:border-white/10 text-slate-400"
                      }`}>
                        {isPast ? <CheckCircle size={14} /> : idx + 1}
                      </div>
                      <span className={`text-[9px] font-bold mt-2 text-center uppercase whitespace-nowrap tracking-wider ${isCurrent ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
                {/* Connector Line */}
                <div className="absolute top-4 left-0 w-full h-[2px] bg-slate-100 dark:bg-white/5 -z-0" />
                <div 
                  className="absolute top-4 left-0 h-[2px] bg-green-500 transition-all duration-500 -z-0" 
                  style={{ width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Offer Banner */}
          {myProposalStage === "offer_sent" && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6 shadow-sm animate-in zoom-in-95 duration-300">
               <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                     <FileSignature size={24} />
                  </div>
                  <div className="flex-1">
                     <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400">Offer Received!</h3>
                     <p className="text-sm text-blue-700 dark:text-indigo-600/80 mt-1 leading-relaxed">
                        The patron has extended a formal hiring agreement. Please review the terms, milestones, and legal clauses before accepting.
                     </p>
                     <div className="flex gap-3 mt-6">
                        <button 
                          onClick={() => {
                            const contractId = myApplication?.offer?._id || myApplication?.offer;
                            if (contractId) {
                              router.push(`/contracts/${contractId}`);
                            } else {
                              showToast("Hiring agreement link is being repaired. Please refresh the page.", "info");
                              setTimeout(() => window.location.reload(), 2000);
                            }
                          }}
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md"
                        >
                          Review Agreement
                        </button>
                        <button 
                          onClick={() => showToast("Requesting changes to the agreement... This feature will be available shortly.", "info")}
                          className="px-6 py-2.5 bg-transparent text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-slate-900 dark:hover:border-white transition-all"
                        >
                          Request Changes
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {jobView === "details" ? (
            <>
              {/* Description Section */}
              <div className="py-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-white/5 pb-1">
                  Job Description
                </h3>
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-normal break-words overflow-hidden">
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>
              </div>

              {/* Skills Section */}
              {job.skills && job.skills.length > 0 && (
                <div className="py-8">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                    Required Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(skill => (
                      <span key={skill} className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* PROPOSAL FORM: Professional Style */
            <div className="py-8 animate-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4">
                  Submit Your Proposal
               </h3>
               
               <div className="space-y-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 block">Cover Letter</label>
                    <textarea
                      value={proposal.coverLetter}
                      onChange={e => handleProposalChange("coverLetter", e.target.value)}
                      placeholder="Explain why you are the best fit for this devlog..."
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-slate-900 dark:focus:border-white transition-all min-h-[300px] resize-none text-base font-normal"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 block">Expected Rate (TKNS)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">T</span>
                        <input
                          type="number" value={proposal.expectedRate}
                          onChange={e => handleProposalChange("expectedRate", e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-slate-900 dark:focus:border-white font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 block">Billing Type</label>
                      <select
                        value={proposal.rateType}
                        onChange={e => handleProposalChange("rateType", e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-slate-900 dark:focus:border-white font-medium appearance-none cursor-pointer"
                      >
                        <option value="fixed">Fixed TKNS</option>
                        <option value="hourly">Hourly TKNS</option>
                      </select>
                    </div>
                  </div>

                  <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 block">Portfolio / Proof of Work</label>
                      <div className="space-y-4">
                        {proposal.portfolioLinks.map((link, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                             <div className="flex-1 w-full space-y-3">
                               <input
                                 type="text" value={link.label}
                                 onChange={e => handlePortfolioChange(idx, "label", e.target.value)}
                                 placeholder="Link Label (e.g. GitHub Repo, Live Demo)"
                                 className="w-full px-4 py-2.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-sm font-medium focus:border-slate-900 dark:focus:border-white"
                               />
                               <input
                                 type="url" value={link.url}
                                 onChange={e => handlePortfolioChange(idx, "url", e.target.value)}
                                 placeholder="Devlog URL (https://...)"
                                 className="w-full px-4 py-2.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-xs font-normal text-slate-500 focus:border-slate-900 dark:focus:border-white"
                               />
                             </div>
                             {proposal.portfolioLinks.length > 1 && (
                               <button 
                                 onClick={() => removePortfolioLink(idx)} 
                                 className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors sm:mt-1"
                                 title="Remove Link"
                               >
                                 <X size={18} />
                               </button>
                             )}
                          </div>
                        ))}
                      </div>
                     <button onClick={addPortfolioLink} className="mt-3 text-xs font-bold text-slate-900 dark:text-white hover:underline uppercase tracking-wider">
                        + Add Additional Link
                     </button>
                  </div>

                  <div className="pt-4 space-y-4">
                     <div className={`p-4 rounded-xl flex gap-3 transition-colors ${!canApply ? "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30" : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"}`}>
                        <Info size={16} className={`${!canApply ? "text-red-600" : "text-slate-500"} shrink-0 mt-0.5`} />
                        <div className="space-y-1">
                          <p className={`text-[10px] font-medium leading-relaxed ${!canApply ? "text-red-700 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}`}>
                             Applying costs **1 Token**. {canApply ? "This fee is an investment in your career proof." : "You currently have **0 Tokens** and cannot apply."}
                          </p>
                          {!canApply && (
                            <p className="text-[9px] text-red-600/80 font-bold uppercase tracking-wider">
                               Please verify more devlogs to earn tokens.
                            </p>
                          )}
                        </div>
                     </div>
                     <button
                       onClick={handleSubmitProposal}
                       disabled={isSubmitting || !canApply}
                       className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 dark:shadow-white/5"
                     >
                       {isSubmitting ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                       ) : (
                         <>{!canApply ? "Insufficient Tokens" : "Submit Final Proposal"}</>
                       )}
                     </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

