"use client";
import React, { useState, useEffect, useContext, useRef } from "react";
import { api } from "@/utils/api";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { DashboardContext } from "@/app/(dashboard)/layout";
import CraftsmanHoverCard from "@/components/dashboard/cards/CraftsmanHoverCard";
import {
  ArrowLeft, MessageCircle, UserCheck, ChevronDown, Loader2,
  Calendar, FileText, Plus, Trash2, CheckCircle,
  ExternalLink, Clock, Star, User, Send, X,
  AlertCircle, ShieldCheck, LayoutList
} from "lucide-react";

const STAGE_OPTIONS = [
  { key: "under_review",  label: "Reviewing" },
  { key: "shortlisted",   label: "Shortlisted" },
  { key: "interview",     label: "Interview" },
  { key: "rejected",      label: "Rejected" },
];

const STAGE_CONFIG = {
  proposal_sent:  { label: "Proposal",    color: "text-slate-500",   bg: "bg-slate-100 dark:bg-white/5" },
  under_review:   { label: "Reviewing",   color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  shortlisted:    { label: "Shortlisted", color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20" },
  interview:      { label: "Interview",   color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  offer_sent:     { label: "Offer Sent",  color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  hired:          { label: "Hired ✓",     color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  rejected:       { label: "Rejected",    color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/20" },
};

export default function ProposalDetailPage() {
  const router = useRouter();
  const { jobId, appId } = useParams();
  const { user, openChatWithUser } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  const formRef = useRef(null);

  const [job, setJob] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movingStage, setMovingStage] = useState(false);
  const [stageDropdown, setStageDropdown] = useState(false);
  const [showHireForm, setShowHireForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyHired, setAlreadyHired] = useState(false);
  const isCraftsman = user?._id === (applicant?.user?._id || applicant?.user);

  // Agreement form state
  const [agreement, setAgreement] = useState({
    scope: "",
    agreedBudget: "", // This will be total for fixed, or hourly rate for hourly
    weeklyLimit: "20", // Default 20 hours for hourly contracts
    budgetType: "fixed",
    milestones: [{ title: "Initial Token (20%)", amount: "0", isInitial: true }],
  });

  useEffect(() => {
    if (showHireForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showHireForm]);

  // Auto-calculate milestones (Tailored for Fixed vs Hourly)
  useEffect(() => {
    if (!agreement.agreedBudget) return;

    const budgetStr = String(agreement.agreedBudget);
    let updatedMilestones = agreement.milestones.map(m => ({ ...m }));
    let hasChanged = false;

    if (agreement.budgetType === "fixed") {
      // --- FIXED PRICE LOGIC (20% Security + 80% Balance) ---
      let initialAmount = "0";
      let balanceAmount = "0";
      const rangeMatch = budgetStr.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/i);
      
      if (rangeMatch) {
        const min = parseFloat(rangeMatch[1]) || 0;
        const max = parseFloat(rangeMatch[2]) || 0;
        initialAmount = `${(min * 0.2).toFixed(2)} - ${(max * 0.2).toFixed(2)}`;
        balanceAmount = `${(min * 0.8).toFixed(2)} - ${(max * 0.8).toFixed(2)}`;
      } else {
        const budget = parseFloat(budgetStr.replace(/[^\d.]/g, "")) || 0;
        initialAmount = (budget * 0.2).toFixed(2);
        balanceAmount = (budget * 0.8).toFixed(2);
      }

      const fixedInitialTitle = "Devlog Initiation & Security Escrow (20%)";
      const fixedBalanceTitle = "Final Deliverable & Transfer (80%)";

      // If we have standard 2-milestone setup, just update them
      if (updatedMilestones.length === 2 && updatedMilestones[0].isInitial && updatedMilestones[1].isAutoBalance) {
        if (
          updatedMilestones[0].amount !== initialAmount || 
          updatedMilestones[1].amount !== balanceAmount ||
          updatedMilestones[0].title !== fixedInitialTitle ||
          updatedMilestones[1].title !== fixedBalanceTitle ||
          !updatedMilestones[0].isAutoFunded ||
          !updatedMilestones[1].isAutoFunded
        ) {
          updatedMilestones[0].amount = initialAmount;
          updatedMilestones[0].title = fixedInitialTitle;
          updatedMilestones[0].isAutoFunded = true;
          updatedMilestones[1].amount = balanceAmount;
          updatedMilestones[1].title = fixedBalanceTitle;
          updatedMilestones[1].isAutoFunded = true;
          hasChanged = true;
        }
      } else if (updatedMilestones.length <= 1) {
        // Initialize if empty or only 1 exists
        updatedMilestones = [
          { title: fixedInitialTitle, amount: initialAmount, isInitial: true, isLocked: true, isAutoFunded: true },
          { title: fixedBalanceTitle, amount: balanceAmount, isAutoBalance: true, isLocked: true, isAutoFunded: true }
        ];
        hasChanged = true;
      } else {
        // More than 2 milestones: just update the first (Initial) and find the auto-balance one
        if (updatedMilestones[0].isInitial && (updatedMilestones[0].amount !== initialAmount || updatedMilestones[0].title !== fixedInitialTitle || !updatedMilestones[0].isAutoFunded)) {
          updatedMilestones[0].amount = initialAmount;
          updatedMilestones[0].title = fixedInitialTitle;
          updatedMilestones[0].isAutoFunded = true;
          hasChanged = true;
        }
        const autoIdx = updatedMilestones.findIndex(m => m.isAutoBalance);
        if (autoIdx > -1) {
          let currentSum = 0;
          updatedMilestones.forEach((m, idx) => {
            if (idx !== autoIdx) currentSum += parseFloat(String(m.amount).replace(/[^\d.]/g, "")) || 0;
          });
          const budget = parseFloat(budgetStr.replace(/[^\d.]/g, "")) || 0;
          const newAutoAmount = Math.max(0, budget - currentSum).toFixed(2);
          if (updatedMilestones[autoIdx].amount !== newAutoAmount || !updatedMilestones[autoIdx].isAutoFunded) {
            updatedMilestones[autoIdx].amount = newAutoAmount;
            updatedMilestones[autoIdx].isAutoFunded = true;
            hasChanged = true;
          }
        }
      }
    } else {
      // --- HOURLY RATE LOGIC (20% Security Retainer + 80% Rolling Escrow) ---
      const rate = parseFloat(budgetStr.replace(/[^\d.]/g, "")) || 0;
      const limit = parseFloat(agreement.weeklyLimit) || 0;
      const weeklyTotal = rate * limit;
      
      const initialAmount = (weeklyTotal * 0.2).toFixed(2);
      const rollingAmount = (weeklyTotal * 0.8).toFixed(2);
      
      const retainerTitle = `Initial Week Retainer (${limit} hrs/week)`;
      const rollingTitle = "Rolling Weekly Escrow (Auto-funded)";

      if (updatedMilestones.length === 2 && updatedMilestones[0].isInitial && updatedMilestones[1].isAutoBalance) {
        if (
          updatedMilestones[0].amount !== initialAmount || 
          updatedMilestones[1].amount !== rollingAmount ||
          updatedMilestones[0].title !== retainerTitle ||
          updatedMilestones[1].title !== rollingTitle ||
          !updatedMilestones[0].isAutoFunded ||
          !updatedMilestones[1].isAutoFunded
        ) {
          updatedMilestones[0].amount = initialAmount;
          updatedMilestones[0].title = retainerTitle;
          updatedMilestones[0].isAutoFunded = true;
          updatedMilestones[1].amount = rollingAmount;
          updatedMilestones[1].title = rollingTitle;
          updatedMilestones[1].isAutoFunded = true;
          hasChanged = true;
        }
      } else {
        updatedMilestones = [
          { title: retainerTitle, amount: initialAmount, isInitial: true, isLocked: true, isAutoFunded: true },
          { title: rollingTitle, amount: rollingAmount, isAutoBalance: true, isLocked: true, isAutoFunded: true }
        ];
        hasChanged = true;
      }
    }

    if (hasChanged) {
      setAgreement(prev => ({ ...prev, milestones: updatedMilestones }));
    }
  }, [agreement.agreedBudget, agreement.budgetType, agreement.weeklyLimit, showHireForm]);

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId, appId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${jobId}`);
      if (res.success) {
        setJob(res.data);
        const app = res.data.applicants?.find(a => a._id === appId);
        if (app) {
          setApplicant(app);
          const hasOffer = ["hired", "offer_sent"].includes(app.stage);
          setAlreadyHired(hasOffer);
          
          if (app.offer) {
             setAgreement({
               scope: app.offer.description || "",
               agreedBudget: app.offer.agreedBudget || "",
               budgetType: app.offer.budgetType || "fixed",
               milestones: app.offer.milestones || [],
               weeklyLimit: app.offer.weeklyLimit || "20"
             });
          } else {
             setAgreement(prev => ({
               ...prev,
               agreedBudget: app.proposal?.expectedRate || "",
               budgetType: app.proposal?.rateType || "fixed",
               milestones: [{ title: "Initial Token (20%)", amount: "0", isInitial: true }],
               scope: ""
             }));
          }
        }
      }
    } catch (err) {
      showToast("Failed to load proposal", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (newStage) => {
    if (!applicant) return;
    try {
      setMovingStage(true);
      setStageDropdown(false);
      const res = await api.patch(`/jobs/${jobId}/applicants/${appId}/stage`, { stage: newStage });
      if (res.success) {
        setApplicant(prev => ({ ...prev, stage: newStage }));
        setAlreadyHired(["hired", "offer_sent"].includes(newStage));
        
        // If moving to Hired and no contract exists, trigger agreement modal automatically
        if (newStage === "hired" && !alreadyHired) {
          setShowHireForm(true);
        } else {
          showToast(`Moved to ${STAGE_CONFIG[newStage]?.label}`, "success");
        }
      }
    } catch (err) {
      showToast(err.message || "Failed to update stage", "error");
    } finally {
      setMovingStage(false);
    }
  };

  const handleSendAgreement = async () => {
    if (!agreement.scope.trim()) return showToast("Scope of work is required", "error");
    if (!agreement.agreedBudget) return showToast("Valid budget is required", "error");
    if (agreement.milestones.some(m => !m.title.trim() || !m.amount)) return showToast("All milestones need a title and amount", "error");

    try {
      setSubmitting(true);
      const payload = {
        title: `${job.title} — ${applicant?.user?.name}`,
        description: agreement.scope,
        budgetType: agreement.budgetType,
        agreedBudget: String(agreement.agreedBudget),
        milestones: agreement.milestones.map(m => ({ 
          title: m.title, 
          amount: String(m.amount),
          isAutoFunded: !!m.isAutoFunded,
          isInitial: !!m.isInitial,
          isAutoBalance: !!m.isAutoBalance
        })),
        craftsmanId: applicant?.user?._id || applicant?.user,
        jobId: jobId,
      };

      const offerId = applicant.offer?._id || applicant.offer;
      const res = offerId && applicant.stage === "offer_sent"
        ? await api.patch(`/contracts/${offerId}/offer`, payload)
        : await api.post("/contracts", payload);

      if (res.success) {
        showToast(offerId && applicant.stage === "offer_sent" ? "Hiring offer updated!" : "Hiring offer sent! Awaiting craftsman acceptance.", "success");
        setShowHireForm(false);
        setApplicant(prev => ({ 
          ...prev, 
          stage: "offer_sent",
          offer: res.data 
        }));
        setAlreadyHired(true);
      }
    } catch (err) {
      showToast(err.message || "Failed to process offer", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const addMilestone = () => setAgreement(prev => ({ ...prev, milestones: [...prev.milestones, { title: "", amount: "" }] }));
  const removeMilestone = (i) => {
    if (i === 0) return; // Cannot delete initial milestone
    setAgreement(prev => ({ ...prev, milestones: prev.milestones.filter((_, idx) => idx !== i) }));
  };
  const updateMilestone = (i, field, val) => {
    if (i === 0 && field === "amount") return; // Cannot manually change initial amount
    const updated = [...agreement.milestones];
    updated[i][field] = val;
    
    // If user manually edits the second milestone, stop auto-calculating it
    if (i === 1) updated[i].isAutoBalance = false;
    
    setAgreement(prev => ({ ...prev, milestones: updated }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    );
  }

  if (!job || !applicant) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Proposal not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-indigo-600 text-sm font-bold">← Go back</button>
      </div>
    );
  }

  const stageCfg = STAGE_CONFIG[applicant.stage] || STAGE_CONFIG.proposal_sent;
  
  // Calculate total across milestones (handling ranges)
  const calculateTotal = () => {
    let minTotal = 0;
    let maxTotal = 0;
    let isRange = false;

    agreement.milestones.forEach(m => {
        const val = String(m.amount);
        const match = val.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/i);
        if (match) {
            minTotal += parseFloat(match[1]) || 0;
            maxTotal += parseFloat(match[2]) || 0;
            isRange = true;
        } else {
            const num = parseFloat(val) || 0;
            minTotal += num;
            maxTotal += num;
        }
    });

    if (isRange) {
        return `${minTotal.toFixed(2)} - ${maxTotal.toFixed(2)}`;
    }
    return minTotal.toFixed(2);
  };

  const totalDisplay = calculateTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Back */}
      <button
        onClick={() => router.push(`/manage-jobs/${jobId}`)}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-800 dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={14} /> {job.title}
      </button>

      {/* Unified Applicant Details Card */}
      <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden mb-6">
        
        {/* Header Section (Integrated) */}
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center gap-6">
          <CraftsmanHoverCard
            userId={applicant.user?._id}
            username={applicant.user?.username}
            avatarUrl={applicant.user?.profilePicture}
            displayName={applicant.user?.name}
          >
            <img
              src={applicant.user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${applicant.user?.name || 'User'}`}
              alt={applicant.user?.name}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-100 dark:border-white/10 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            />
          </CraftsmanHoverCard>
          <div className="flex-1 min-w-0">
            <CraftsmanHoverCard
              userId={applicant.user?._id}
              username={applicant.user?.username}
              avatarUrl={applicant.user?.profilePicture}
              displayName={applicant.user?.name}
            >
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors">
                {applicant.user?.name}
              </h1>
            </CraftsmanHoverCard>
            <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-slate-400 flex-wrap">
              <span className="flex items-center gap-1"><Calendar size={13} />Applied {new Date(applicant.appliedAt).toLocaleDateString()}</span>
              {applicant.proposal?.estimatedDays && (
                <span className="flex items-center gap-1"><Clock size={13} />{applicant.proposal.estimatedDays} days estimated</span>
              )}
              {applicant.proposal?.availability && (
                <span className="flex items-center gap-1"><CheckCircle size={13} />{applicant.proposal.availability}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Chat */}
            <button
              onClick={() => openChatWithUser?.(applicant.user?._id || applicant.user)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              <MessageCircle size={14} /> Chat
            </button>

            {/* Stage dropdown */}
            {!alreadyHired && (
              <div className="relative">
                <button
                  onClick={() => setStageDropdown(v => !v)}
                  disabled={movingStage}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  {movingStage ? <Loader2 size={14} className="animate-spin" /> : <LayoutList size={14} />}
                  Move Stage <ChevronDown size={12} />
                </button>
                {stageDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#111] border border-slate-100 dark:border-white/10 rounded-xl shadow-xl z-50 min-w-[160px] overflow-hidden">
                    {STAGE_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => handleMoveStage(opt.key)}
                        className={`w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all ${
                          applicant.stage === opt.key ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 dark:border-white/5" />
                    <button
                      onClick={() => handleMoveStage("rejected")}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hire Button / Edit Offer */}
            {!alreadyHired && !showHireForm && (
              <button
                onClick={() => setShowHireForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:-translate-y-0.5 active:scale-95 transition-all shadow-md"
              >
                <UserCheck size={14} /> Hire
              </button>
            )}

            {!isCraftsman && applicant.stage === "offer_sent" && !showHireForm && (
              <button
                onClick={() => setShowHireForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                <Plus size={14} /> Edit Offer
              </button>
            )}

            {/* Already Hired / Offer Sent badge */}
            {alreadyHired && applicant.stage === "offer_sent" && (
              <div className="flex items-center gap-2">
                {applicant.offer?.isRevised && (
                   <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-amber-200 dark:border-amber-700/30">
                      Revised
                   </span>
                )}
                {isCraftsman ? (
                  <button
                    onClick={() => router.push(`/contracts/${applicant.offer?._id || applicant.offer}`)} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                  >
                    <ShieldCheck size={14} /> View & Accept Offer
                  </button>
                ) : (
                  <span className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-700/30">
                    <ShieldCheck size={14} /> Offer Sent
                  </span>
                )}
              </div>
            )}
            {alreadyHired && applicant.stage === "hired" && (
               <span className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-700/30">
                 <CheckCircle size={14} /> Hired ✓
               </span>
            )}
          </div>
        </div>

        {/* Cover Letter */}
        <div className="p-8">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Cover Letter</h2>
          <div className="max-w-full overflow-hidden">
            <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words text-justify">
              {applicant.proposal?.coverLetter || <span className="text-slate-400 italic">No cover letter provided.</span>}
            </p>
          </div>
        </div>

        {/* Portfolio Links */}
        {applicant.proposal?.portfolioLinks?.length > 0 && (
          <div className="px-8 pb-8 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Portfolio / Work Samples</h2>
            <div className="space-y-2">
              {applicant.proposal.portfolioLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                >
                  <ExternalLink size={13} /> {link.label || link.url}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Stage History */}
        {applicant.stageHistory?.length > 0 && (
          <div className="px-8 pb-8 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Stage History</h2>
            <div className="space-y-2">
              {applicant.stageHistory.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20 shrink-0" />
                  <span className="font-bold">{STAGE_CONFIG[h.stage]?.label || h.stage}</span>
                  {h.note && <span className="text-slate-400">— {h.note}</span>}
                  <span className="ml-auto shrink-0">{new Date(h.changedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Hire / Agreement Form ── */}
      {showHireForm && (
        <div ref={formRef} className="p-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send Hiring Offer</h2>
              <p className="text-xs text-slate-400 mt-1">Define the contract terms. Craftsman must accept before work begins.</p>
            </div>
            <button onClick={() => setShowHireForm(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Scope */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Scope of Work *</label>
              <textarea
                value={agreement.scope}
                onChange={e => setAgreement(p => ({ ...p, scope: e.target.value }))}
                placeholder="Describe exactly what needs to be delivered..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-black dark:focus:border-white text-sm min-h-[100px] resize-none transition-colors"
              />
            </div>

            {/* Budget & Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={agreement.budgetType === 'hourly' ? 'md:col-span-1' : 'md:col-span-2'}>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {agreement.budgetType === 'hourly' ? 'Hourly Rate (TKNS/hr) *' : 'Total Budget (TKNS) *'}
                </label>
                <input
                  type="text"
                  value={agreement.agreedBudget}
                  onChange={e => setAgreement(p => ({ ...p, agreedBudget: e.target.value }))}
                  placeholder={agreement.budgetType === 'hourly' ? "e.g. 15" : "e.g. 100 or 2-5"}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-black dark:focus:border-white text-sm font-bold transition-colors"
                />
              </div>

              {agreement.budgetType === 'hourly' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Weekly Limit (Hrs)</label>
                  <input
                    type="number"
                    value={agreement.weeklyLimit}
                    onChange={e => setAgreement(p => ({ ...p, weeklyLimit: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-black dark:focus:border-white text-sm font-bold transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Budget Type</label>
                <select
                  value={agreement.budgetType}
                  onChange={e => setAgreement(p => ({ ...p, budgetType: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-black dark:focus:border-white text-sm font-bold transition-colors"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Milestones *</label>
                <button onClick={addMilestone} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {agreement.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 animate-in fade-in duration-300">
                    <input
                      placeholder="Deliverable (e.g. Design mockups)"
                      value={m.title}
                      readOnly={m.isLocked}
                      onChange={e => updateMilestone(i, "title", e.target.value)}
                      className={`flex-[2] px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-[11px] font-bold transition-colors ${m.isLocked ? "opacity-60 cursor-not-allowed text-slate-400" : "text-slate-900 dark:text-white focus:border-black dark:focus:border-white"}`}
                    />
                    <div className="flex-1 relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">T</span>
                       <input
                         placeholder="0.00"
                         type="text"
                         value={m.amount}
                         readOnly={m.isLocked}
                         onChange={e => updateMilestone(i, "amount", e.target.value)}
                         className={`w-full pl-6 pr-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-[11px] font-bold transition-colors ${m.isLocked ? "opacity-60 cursor-not-allowed text-slate-400" : "text-slate-900 dark:text-white focus:border-black dark:focus:border-white"}`}
                       />
                    </div>
                    {!m.isLocked && (
                      <button onClick={() => removeMilestone(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {parseFloat(totalDisplay) > 0 && (
                <p className="text-[10px] text-slate-400 font-bold mt-2 text-right">
                  Total: <span className="text-slate-900 dark:text-white">{totalDisplay} TKNS</span>
                </p>
              )}
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
              <ShieldCheck size={18} className="text-indigo-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">Escrow Protection Protocol</p>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                  The first two milestones ({agreement.milestones[0]?.amount} & {agreement.milestones[1]?.amount} TKNS) will be <span className="font-bold">automatically funded</span> from your wallet into escrow once the talent accepts. Subsequent milestones must be funded manually.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowHireForm(false)}
                className="flex-1 py-3 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAgreement}
                disabled={submitting}
                className="flex-[2] py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : (applicant.offer?._id && applicant.stage === 'offer_sent' ? <CheckCircle size={14} /> : <Send size={14} />)}
                {submitting ? "Processing..." : (applicant.offer?._id && applicant.stage === 'offer_sent' ? "Update Hiring Offer" : "Send Hiring Offer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
