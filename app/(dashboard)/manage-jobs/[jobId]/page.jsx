"use client";
import React, { useState, useEffect, useContext } from "react";
import { api } from "@/utils/api";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Users, Loader2, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import CraftsmanHoverCard from "@/components/dashboard/cards/CraftsmanHoverCard";

const STAGE_CONFIG = {
  proposal_sent:  { label: "Proposal",    color: "text-slate-500",   bg: "bg-slate-100 dark:bg-white/5" },
  under_review:   { label: "Reviewing",   color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  shortlisted:    { label: "Shortlisted", color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20" },
  interview:      { label: "Interview",   color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  offer_sent:     { label: "Offer Sent",  color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  hired:          { label: "Hired",       color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  rejected:       { label: "Rejected",    color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/20" },
  paused:         { label: "Paused",      color: "text-slate-400",   bg: "bg-slate-50 dark:bg-white/5" },
};

const FILTER_TABS = [
  { key: "all",           label: "All" },
  { key: "proposal_sent", label: "New" },
  { key: "under_review",  label: "Reviewing" },
  { key: "shortlisted",   label: "Shortlisted" },
  { key: "interview",     label: "Interview" },
  { key: "offer_sent",    label: "Offered" },
  { key: "hired",         label: "Hired" },
  { key: "rejected",      label: "Rejected" },
];

export default function JobProposalsPage() {
  const router = useRouter();
  const { jobId } = useParams();
  const { user } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${jobId}`);
      if (res.success) setJob(res.data);
    } catch (err) {
      showToast("Failed to load job", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Job not found</h2>
        <button onClick={() => router.push("/manage-jobs")} className="mt-4 text-indigo-600 text-sm font-bold">← Back to jobs</button>
      </div>
    );
  }

  const applicants = job.applicants?.filter(a => a.stage !== "trash") || [];

  const filteredApplicants = activeFilter === "all"
    ? applicants
    : activeFilter === "hired"
      ? applicants.filter(a => ["hired", "offer_sent"].includes(a.stage))
      : applicants.filter(a => a.stage === activeFilter);

  const getCount = (key) => {
    if (key === "all") return applicants.length;
    if (key === "hired") return applicants.filter(a => ["hired", "offer_sent"].includes(a.stage)).length;
    return applicants.filter(a => a.stage === key).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-[19px] py-10 pb-32">
      {/* Back & Title */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 border-b border-slate-100 dark:border-white/5 pb-8">
          <div>
            <button
              onClick={() => router.push("/manage-jobs")}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-800 dark:hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={14} /> Back to Jobs
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {job.title}
            </h1>
          </div>
          
          <button 
            onClick={() => router.push(`/manage-jobs/${jobId}/edit`)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:shadow-lg transition-all border border-slate-200 dark:border-white/10 shrink-0"
          >
             Update Devlog
          </button>
        </div>

        {/* Job Details Summary - Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Budget Allocation</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {job.budget?.min} – {job.budget?.max} <span className="text-xs text-indigo-500">TKNS</span>
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 capitalize">{job.budget?.type} Price</p>
          </div>
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Devlog Category</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{job.category}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{job.level} Level</p>
          </div>
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location / Skills</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{job.location}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {job.skills?.slice(0, 3).map(s => (
                <span key={s} className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">{s}</span>
              ))}
              {job.skills?.length > 3 && <span className="text-[8px] font-bold text-slate-400">+{job.skills.length - 3}</span>}
            </div>
          </div>
        </div>

        {/* Detailed Description - Card */}
        <div className="mb-16">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">Detailed Description</h3>
          <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl p-8 shadow-sm">
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {job.description}
            </p>
          </div>
        </div>



      {/* Proposals List */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Applicants</h2>
          </div>
          
          {/* Filter Tabs (Underline Style) */}
          <div className="flex items-center gap-6">
            {FILTER_TABS.map(tab => {
              const count = getCount(tab.key);
              if (count === 0 && tab.key !== "all" && tab.key !== "hired") return null;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`relative pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    activeFilter === tab.key
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-white/60"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {count > 0 && (
                      <span className="text-[9px] text-slate-400 font-medium">
                        {count}
                      </span>
                    )}
                  </span>
                  {activeFilter === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {filteredApplicants.length === 0 ? (
          <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-white/10">
            <Users className="mx-auto text-slate-300 mb-4" size={40} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No proposals yet</h3>
            <p className="text-sm text-slate-400 mt-1">Sit tight! We're matching your job with the best craftsmans.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredApplicants.map((app) => {
              const stage = STAGE_CONFIG[app.stage] || STAGE_CONFIG.proposal_sent;
              return (
                <div
                  key={app._id}
                  onClick={() => router.push(`/manage-jobs/${jobId}/proposals/${app._id}`)}
                  className="group flex items-center gap-5 p-5 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-slate-300 dark:hover:border-white/15 hover:shadow-md cursor-pointer transition-all duration-300"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <CraftsmanHoverCard
                      userId={app.user?._id}
                      username={app.user?.username}
                      avatarUrl={app.user?.profilePicture}
                      displayName={app.user?.name}
                    >
                      <div className="relative group/avatar">
                        <img
                          src={app.user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${app.user?.name || 'User'}`}
                          alt={app.user?.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm transition-opacity group-hover/avatar:scale-105"
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${app.user?.name || 'User'}`;
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                      </div>
                    </CraftsmanHoverCard>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CraftsmanHoverCard
                        userId={app.user?._id}
                        username={app.user?.username}
                        avatarUrl={app.user?.profilePicture}
                        displayName={app.user?.name}
                      >
                        <span className="font-bold text-slate-900 dark:text-white text-base truncate hover:text-indigo-600 transition-colors">
                          {app.user?.name || "Talent"}
                        </span>
                      </CraftsmanHoverCard>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest shrink-0 ${stage.bg} ${stage.color}`}>
                        {stage.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 italic">
                      "{app.proposal?.coverLetter || "I am interested in this devlog..."}"
                    </p>
                  </div>

                  {/* Rate + Date */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1">
                      {app.proposal?.expectedRate} <span className="text-[10px] text-slate-400">TKNS</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                      {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-slate-600 dark:group-hover:text-white/60 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
