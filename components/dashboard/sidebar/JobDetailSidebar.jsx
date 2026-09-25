"use client";
import AppleSpinner from "@/components/ui/AppleSpinner";

import React, { useState, useEffect } from "react";
import { Target, Briefcase, Award, Globe, Layers, Zap } from "lucide-react";
import { api } from "@/utils/api";

export default function JobDetailSidebar({ jobId }) {
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
      <div className="flex justify-center p-12"><AppleSpinner /></div>
      );
  }

  if (!job) return null;

  return (
    <aside className="space-y-6 pb-10">
      {/* Job Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
          Job Overview
        </h3>
        
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Budget</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
              {job.budget?.type || "Fixed"} • {job.budget?.min}–{job.budget?.max} <span className="text-[10px] text-slate-500 uppercase tracking-tighter">TKNS</span>
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Experience</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{job.experienceLevel || "Intermediate"}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Location</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{job.locationType || "Remote"}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Category</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{job.category || "Design"}</p>
          </div>
        </div>

        {/* Skills Section */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-brand-cloud dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-[11px] font-bold text-brand-slate dark:text-slate-400 hover:border-brand-blue transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pro Tip Card */}
      <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-blue/20 transition-all duration-700" />
        <div className="relative z-10">
          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Award size={14} /> Pro Tip
          </h3>
          <p className="text-xs font-medium text-slate-300 leading-relaxed mb-6">
            Don&apos;t just look at the rate! Review their portfolios and previous patron feedback to ensure the best quality for your devlog.
          </p>
          <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
            Edit Job Details
          </button>
        </div>
      </div>
    </aside>
  );
}

