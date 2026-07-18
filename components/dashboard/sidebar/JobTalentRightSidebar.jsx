"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useEffect, useContext } from "react";
import { 
   Clock, Users, MapPin, ArrowRight, CheckCircle, ShieldCheck, Info, X,
   FileSignature, Star, Heart, TrendingUp, Layout, ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { useToast } from "@/components/ui/ToastProvider";
import CraftsmanHoverCard from "../cards/CraftsmanHoverCard";

export default function JobTalentRightSidebar({ jobId }) {
  const router = useRouter();
  const { user, isGuest, requireAuth, jobView, setJobView } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        if (res.success) setJob(res.data);
      } catch (err) {
        console.error("Failed to fetch job for sidebar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-white dark:bg-white/5 rounded-2xl" />
        <div className="h-64 bg-white dark:bg-white/5 rounded-2xl" />
        <div className="h-48 bg-white dark:bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!job) return null;

  const canApply = (user?.walletBalance || 0) >= 1;
  const myApplication = !isGuest && user && job.applicants?.find(a => {
    const applicantId = a.user?._id?.toString() || a.user?.toString();
    const currentUserId = user._id?.toString();
    return applicantId === currentUserId;
  });
  
  const myProposalStage = myApplication?.stage;
  const isOwner = !isGuest && user && job.patron && (job.patron?._id || job.patron) === user._id;

  const STAGES = [
    { key: "proposal_sent",  label: "Proposal Sent" },
    { key: "under_review",   label: "Under Review"  },
    { key: "shortlisted",    label: "Shortlisted"   },
    { key: "interview",      label: "Interview"     },
    { key: "offer_sent",     label: "Offer Sent"    },
    { key: "hired",          label: "Hired"         },
  ];

  return (
    <aside className="space-y-6 pb-20">
      
      {/* Action Card */}
      {isOwner ? (
        <div className="w-full py-4 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
           <ShieldCheck size={16} /> Your Posting
        </div>
      ) : (
        <div className="bg-black dark:bg-white text-white dark:text-black rounded-2xl p-8 shadow-lg">
            <div className="space-y-6">
              {(!myProposalStage) && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-1">Budget Allocation</p>
                  <p className="text-3xl font-bold">{job.budget?.min} – {job.budget?.max} <span className="text-sm font-bold text-purple-500 ml-1">TKNS</span></p>
                </div>
              )}
              
              {myProposalStage ? (
                <div className="space-y-4">
                  <div className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold uppercase border transition-all ${
                     myProposalStage === "hired" ? "bg-green-500 text-white border-transparent shadow-lg shadow-green-500/20" :
                     myProposalStage === "rejected" ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400" :
                     "bg-white/10 text-white border-white/20 backdrop-blur-sm"
                  }`}>
                     {myProposalStage === "hired" && <CheckCircle size={16} />}
                     {myProposalStage === "rejected" && <X size={16} />}
                     {(!["hired", "rejected"].includes(myProposalStage || "")) && <Clock size={16} />}
                     
                     {myProposalStage === "hired" ? "Hired for this Role" :
                      myProposalStage === "rejected" ? "Proposal Declined" :
                      STAGES.find(s => s.key === (myProposalStage || "proposal_sent"))?.label || "Proposal Sent"}
                  </div>
                  
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center leading-relaxed px-2">
                     {myProposalStage === "hired" ? "Congratulations! You've been selected for this devlog." :
                      myProposalStage === "rejected" ? "Thank you for applying. The patron has moved forward with other candidates." :
                      myProposalStage === "offer_sent" ? "You have an active offer waiting! Please review and sign the agreement." :
                      "Your proposal is being reviewed. The patron will reach out if they're interested."}
                  </p>
                </div>
              ) : (
                <button
                   onClick={() => { 
                     if (isGuest) { requireAuth("submit proposals"); return; } 
                     if (!canApply && jobView === "details") {
                       showToast("Insufficient Tokens. You need at least 1 token to apply.", "warning", "Balance Too Low");
                       return;
                     }
                     setJobView(jobView === "details" ? "proposal" : "details"); 
                   }}
                   disabled={job.status === "closed"}
                   className={`w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                     job.status === "closed"
                       ? "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                       : !canApply && jobView === "details"
                       ? "bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-500 cursor-not-allowed"
                       : "bg-purple-600 text-white hover:bg-purple-700 shadow-xl shadow-purple-600/20"
                   }`}
                >
                   {jobView === "details" ? (!canApply ? "Insufficient Tokens" : "Apply Now") : "Cancel & Return"} <ArrowRight size={16} />
                </button>
              )}
              
              {!myProposalStage && (
                <p className="text-[10px] text-center text-slate-500 font-medium uppercase tracking-wider">
                   Secured by Antigravity Escrow
                </p>
              )}
            </div>
         </div>
      )}

      {/* Job Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6 shadow-sm">
         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-3">Devlog Overview</h4>
         <div className="divide-y divide-slate-100 dark:divide-white/5">
            {[
              { label: "Job Posted",   value: new Date(job.createdAt).toLocaleDateString() },
              { label: "Job Reference", value: `#${job._id.slice(-6).toUpperCase()}` },
              { label: "Category",     value: job.category || "General" },
              { label: "Budget Type",  value: job.budget?.type === "hourly" ? "Hourly TKNS" : "Fixed TKNS" },
              { label: "Experience",   value: job.level },
              { label: "Applicants",   value: `${job.applicants?.length || 0} Proposals` },
              { label: "Hired",        value: `${job.applicants?.filter(a => a.stage === "hired").length || 0} Hired` },
              { label: "Location",     value: job.location || "Remote" },
            ].map((item, i) => (
              <div key={i} className="py-3.5 flex justify-between items-center text-xs group">
                 <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-tighter group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {item.label}
                 </span>
                 <span className="text-slate-900 dark:text-white font-bold text-right ml-4">
                    {item.value}
                 </span>
              </div>
            ))}
          </div>
      </div>

      {/* patron Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-3 mb-5">patron Verification</h4>
         
         <div className="flex items-center gap-4 mb-6">
            <CraftsmanHoverCard
              userId={job.patron?._id || job.patron?.id}
              username={job.patron?.username}
              avatarUrl={job.patron?.profilePicture}
              displayName={job.patron?.name}
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10 cursor-pointer">
                 {job.patron?.profilePicture ? (
                   <img src={getOptimizedUrl(job.patron.profilePicture)} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-lg font-bold text-slate-400">{(job.patron?.name || 'P')[0]}</span>
                 )}
              </div>
            </CraftsmanHoverCard>

            <div>
               <CraftsmanHoverCard
                 userId={job.patron?._id || job.patron?.id}
                 username={job.patron?.username}
                 avatarUrl={job.patron?.profilePicture}
                 displayName={job.patron?.name}
                 wrapperDisplay="inline"
               >
                 <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors">
                   {job.patron?.name || "Unknown Patron"}
                   {job.patron?.isVerified && <ShieldCheck size={14} className="text-indigo-600" />}
                 </p>
               </CraftsmanHoverCard>
               {job.patron?.username && (
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">@{job.patron.username}</p>
               )}
            </div>
         </div>

         {/* Patron Stats */}
         <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="text-center p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
               <span className="block text-[13px] font-black text-indigo-600 dark:text-indigo-400">
                  {job.patronStats?.active || 0}
               </span>
               <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Active</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
               <span className="block text-[13px] font-black text-emerald-600 dark:text-emerald-400">
                  {job.patronStats?.completed || 0}
               </span>
               <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Completed</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
               <span className="block text-[13px] font-black text-rose-600 dark:text-rose-400">
                  {job.patronStats?.cancelled || 0}
               </span>
               <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Cancelled</span>
            </div>
         </div>
      </div>

    </aside>
  );
}

