"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { ShieldCheck, Zap, Clock, Calendar, User, ArrowUpRight, MessageSquare, CheckCircle2, XCircle, Briefcase } from "lucide-react";
import CraftsmanHoverCard from "../cards/CraftsmanHoverCard";

export default function ProposalDetailSidebar() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = React.useContext(DashboardContext) || {};
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/jobs/proposals/${id}`);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error("Failed to fetch proposal details for sidebar", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[32px]" />
        <div className="h-48 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[32px]" />
      </div>
    );
  }

  if (!data) return null;

  const { applicant, patron } = data;
  const proposal = applicant.proposal;
  const isPatronView = user && patron && user._id.toString() === patron._id.toString();
  const person = isPatronView ? applicant.user : patron;

  return (
    <aside className="h-full flex flex-col gap-6 pb-10">
      
      {/* Role Card */}
      <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[20px] p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
          {isPatronView ? "The Applicant" : "The patron"}
        </h3>
        
        <div className="flex items-center gap-4 mb-6">
          <CraftsmanHoverCard
            userId={person?._id || person?.id}
            username={person?.username}
            avatarUrl={person?.avatar || person?.profilePicture}
            displayName={person?.name}
          >
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-white/10 shadow-sm bg-slate-50 dark:bg-white/5 cursor-pointer">
              <Image 
                src={person?.avatar || person?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person?.username || person?.name || 'User'}`}
                alt={person?.name}
                width={56}
                height={56}
                className="object-cover"
              />
            </div>
          </CraftsmanHoverCard>

          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <CraftsmanHoverCard
                userId={person?._id || person?.id}
                username={person?.username}
                avatarUrl={person?.avatar || person?.profilePicture}
                displayName={person?.name}
                wrapperDisplay="inline"
              >
                <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight capitalize hover:text-indigo-600 transition-colors cursor-pointer">
                  {person?.name}
                </h4>
              </CraftsmanHoverCard>
              <ShieldCheck size={14} className="text-indigo-500" />
            </div>
            {person?.username && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">
                @{person.username}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availability</span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{proposal.availability}</span>
           </div>
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Since</span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                {new Date(person?.createdAt).toLocaleDateString()}
              </span>
           </div>
        </div>

        <button 
          onClick={() => router.push(`/u/${person?.username}`)}
          className="w-full mt-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[11px] hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          View Full Profile <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Financials Card */}
      <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[20px] p-6 shadow-sm relative overflow-hidden group">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Financial Proposal</h3>
        
        <div className="space-y-5 relative z-10">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Expected Rate</span>
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{proposal.expectedRate}</span>
              <span className="text-[10px] font-bold mb-1 text-slate-400">TKNS</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-md mb-1 ml-auto uppercase">
                {proposal.rateType}
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />

          <div className="grid grid-cols-2 gap-4">
            <div>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Timeline</span>
               <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{proposal.estimatedDays} Days</span>
            </div>
            <div className="text-right">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Applied</span>
               <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{new Date(applicant.appliedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Card (Only for patron if they want to move stage) */}
      {isPatronView && (
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[20px] p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Manage Workflow</h3>
            <div className="grid grid-cols-1 gap-2.5">
              <button className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl font-bold text-[11px] hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-500/20">
                  <CheckCircle2 size={16} /> Shortlist Candidate
              </button>
              <button className="flex items-center gap-3 p-3.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl font-bold text-[11px] hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-500/20">
                  <MessageSquare size={16} /> Start Interview
              </button>
              <button className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-xl font-bold text-[11px] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all border border-slate-100 dark:border-white/10">
                  <XCircle size={16} /> Reject Proposal
              </button>
            </div>
        </div>
      )}

      {/* Safety Message */}
      <div className="p-6 border border-dashed border-slate-200 dark:border-white/10 rounded-[20px]">
         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Safety First</h4>
         <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
           Never share personal contact information before a formal contract is started.
         </p>
      </div>

    </aside>
  );
}


