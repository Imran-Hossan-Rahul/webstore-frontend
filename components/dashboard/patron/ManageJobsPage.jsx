"use client";
import { motion } from "framer-motion";
import React, { useState, useEffect, useContext } from "react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Users, ChevronRight, Plus, Clock, CheckCircle, XCircle, Loader2, ArrowUpRight, TrendingUp, FileText } from "lucide-react";

const STATUS_CONFIG = {
  open:        { label: "Open",        color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", dot: "bg-emerald-500" },
  in_progress: { label: "In Progress", color: "text-indigo-600",    bg: "bg-blue-50 dark:bg-blue-900/20",    dot: "bg-indigo-600" },
  closed:      { label: "Closed",      color: "text-slate-400",    bg: "bg-slate-50 dark:bg-white/5",        dot: "bg-slate-400" },
};

export default function ManageJobsPage() {
  const router = useRouter();
  const { user } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    if (user && (user.role === "patron" || user.role === "admin")) fetchMyJobs();
  }, [user]);

  if (!user) return null;
  if (user.role !== "patron" && user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-slate-500 mt-2">Only patrons can manage jobs.</p>
      </div>
    );
  }

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs?status=all&patron=${user._id}`);
      if (res.success && res.data) {
        const myJobs = res.data.filter(j => j.patron?._id === user._id || j.patron === user._id);
        setJobs(myJobs);
      }
    } catch (err) {
      showToast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants?.filter(a => a.stage !== "trash").length || 0), 0);
  const hiredCount = jobs.reduce((s, j) => s + (j.applicants?.filter(a => ["hired", "offer_sent"].includes(a.stage)).length || 0), 0);
  const activeJobs = jobs.filter(j => j.status === "open" || j.status === "in_progress").length;
  const closedJobs = jobs.filter(j => j.status === "closed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    );
  }

  const filteredJobs = jobs.filter(job => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Active") return job.status === "open" || job.status === "in_progress";
    if (activeFilter === "Proposals") return (job.applicants?.filter(a => a.stage !== "trash").length || 0) > 0;
    if (activeFilter === "Hired") return (job.applicants?.filter(a => ["hired", "offer_sent"].includes(a.stage)).length || 0) > 0;
    if (activeFilter === "Closed") return job.status === "closed";
    return true;
  });

  return (
    <div className="w-full max-w-7xl px-4 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-slate-100 dark:border-white/5 pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">My Jobs</h1>
        </div>

        <div className="flex items-center gap-10">
          {[
            { label: "All", value: jobs.length },
            { label: "Active", value: activeJobs },
            { label: "Proposals", value: totalApplicants },
            { label: "Hired", value: hiredCount },
            { label: "Closed", value: closedJobs },
          ].map((stat) => (
            <button 
              key={stat.label} 
              onClick={() => setActiveFilter(stat.label)}
              className={`relative flex flex-col items-center pb-4 transition-all ${
                activeFilter === stat.label ? "opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                activeFilter === stat.label 
                  ? "text-slate-900 dark:text-white" 
                  : "text-slate-400"
              }`}>
                {stat.label}
              </span>
              {activeFilter === stat.label && (
                <motion.div
                  layoutId="activeFilterJobs"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 dark:bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h3 className="text-xl font-bold text-gray-300 dark:text-white/20 uppercase tracking-widest">
            {activeFilter === "All" ? "No Jobs Yet" : `No ${activeFilter} Jobs`}
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            {activeFilter === "All" ? "Post your first job to start receiving proposals." : "Adjust your filters to see more listings."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map(job => {
            const status = STATUS_CONFIG[job.status] || STATUS_CONFIG.open;
            const proposalCount = job.applicants?.filter(a => a.stage !== "trash").length || 0;
            const hiredInJob = job.applicants?.filter(a => ["hired", "offer_sent"].includes(a.stage)).length || 0;
            const newProposals = job.applicants?.filter(a => a.stage === "proposal_sent").length || 0;

            return (
              <div
                key={job._id}
                onClick={() => router.push(`/manage-jobs/${job._id}`)}
                className="group flex items-center gap-5 p-5 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-slate-300 dark:hover:border-white/15 hover:shadow-md cursor-pointer transition-all duration-200"
              >
                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate text-base">{job.title}</h3>
                    {newProposals > 0 && (
                      <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold shrink-0">
                        {newProposals} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1"><FileText size={11} />{proposalCount} proposals</span>
                    {hiredInJob > 0 && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle size={11} />{hiredInJob} hired/offered</span>}
                    <span className="flex items-center gap-1 capitalize">{job.budget?.type || "Fixed"}</span>
                    <span className="flex items-center gap-1">{job.budget?.min}–{job.budget?.max} TKNS</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status & Arrow */}
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${status.bg} ${status.color}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
                    {status.label}
                  </span>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-slate-600 dark:group-hover:text-white/60 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

