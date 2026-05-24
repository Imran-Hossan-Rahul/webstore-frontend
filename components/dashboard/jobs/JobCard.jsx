"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { MapPin, Zap, Users, ArrowUpRight, Heart } from "lucide-react";
import { api } from "@/utils/api";
import { showToast } from "@/utils/toast";

export const JobCard = ({ job, isGuest, onRequireAuth }) => {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = React.useState(job.isFavorited);
  
  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('save'); return; }
    
    const newStatus = !isFavorited;
    setIsFavorited(newStatus);
    try {
        await api.post('/favorites/toggle', { postId: job._id, itemType: 'job' });
    } catch (err) {
        console.error("Favorite failed", err);
        setIsFavorited(!newStatus);
        showToast("Failed to update saved status", "error");
    }
  };

  const isHourly = job.budget?.type === "hourly";
  const budgetDisplay = isHourly 
    ? `${job.budget?.min || 0}-${job.budget?.max || 0} TKNS/hr`
    : `${job.budget?.min || 0}-${job.budget?.max || 0} TKNS`;

  return (
    <div 
        onClick={() => router.push(`/jobs/${job._id}`)}
        className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-xl p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all duration-300 cursor-pointer relative"
    >
        <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors leading-tight line-clamp-2">
                    {job.title}
                </h3>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleFavorite}
                        className={`transition-all p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 ${
                            isFavorited ? 'text-rose-500' : 'text-slate-400'
                        }`}
                    >
                        <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
                    </button>
                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap mt-1 uppercase tracking-wider">
                        {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">
                        {isHourly ? "Hourly" : "Fixed-price"}: {budgetDisplay}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    <span className="text-slate-500 font-medium uppercase text-[10px] tracking-wider px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10">
                        {job.level}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{job.location || "Remote"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-slate-400" />
                        <span>{job.applicants?.length || 0} Proposals</span>
                    </div>
                    {job.applicants?.filter(a => a.stage === "hired").length > 0 && (
                        <div className="flex items-center gap-1.5">
                             {/* Icon removed */}
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Hired: {job.applicants.filter(a => a.stage === "hired").length}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Skills */}
            <div className="pt-2 flex flex-wrap gap-2">
                {job.skills?.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded bg-slate-50 dark:bg-white/5 text-slate-500 font-semibold border border-slate-200 dark:border-white/10 uppercase tracking-tight">
                        {skill}
                    </span>
                ))}
                {job.skills?.length > 3 && (
                    <span className="text-[10px] font-bold text-slate-400 self-center">
                        +{job.skills.length - 3}
                    </span>
                )}
            </div>
        </div>
    </div>
  );
};
