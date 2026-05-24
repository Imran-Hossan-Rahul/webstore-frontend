"use client";
import React, { useState, useEffect, useContext } from "react";
import { api } from "@/utils/api";
import { Search, Filter, Plus } from "lucide-react";
import { JobCard } from "./JobCard";
import { DashboardContext } from "@/app/(dashboard)/layout";

export default function JobsFeed() {
  const { isGuest, requireAuth } = useContext(DashboardContext) || {};
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, saved, applied

  const fetchJobs = async (pageNum, isLoadMore = false) => {
      try {
          if (isLoadMore) setLoadingMore(true);
          else setLoading(true);
          
          const res = await api.get(`/jobs?page=${pageNum}&limit=20`);
          if (res.success) {
              if (res.data.length < 20) setHasMore(false);
              else setHasMore(true);
              
              if (isLoadMore) setJobs(prev => [...prev, ...res.data]);
              else setJobs(res.data);
          }
      } catch (e) {
          console.error("Jobs fetch failed", e);
      } finally {
          setLoading(false);
          setLoadingMore(false);
      }
  };

  useEffect(() => {
    fetchJobs(1, false);
    setPage(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, true);
  };

  return (
    <div className="max-w-[1000px] mx-auto animate-in fade-in duration-500">
        
        {/* Helper / Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                 <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Find Work</h1>
                 <p className="text-slate-500 dark:text-slate-400 mt-1">
                     Hand-picked opportunities for top-tier developers.
                 </p>
             </div>
             
             <button className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:transform hover:-translate-y-0.5 transition-all shadow-xl shadow-purple-500/20">
                 <Plus size={18} /> Post a Job
             </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="sticky top-24 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-2 mb-8 shadow-sm flex items-center justify-between gap-4">
             <div className="flex-1 flex items-center px-4 gap-3">
                 <Search className="text-slate-400" size={20} />
                 <input 
                    type="text" 
                    placeholder="Search by title, skill, or keyword..." 
                    className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                 />
             </div>
             <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 hidden md:block" />
             <div className="hidden md:flex items-center gap-2 pr-2">
                 <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 transition-colors">
                     <Filter size={20} />
                 </button>
                 <select className="bg-transparent text-sm font-bold text-slate-700 dark:text-white outline-none cursor-pointer">
                     <option>Sort by: Newest</option>
                     <option>Highest Budget</option>
                 </select>
             </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4 pb-20">
            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading Opportunities...</div>
            ) : jobs.length > 0 ? (
                jobs.map(job => (
                    <JobCard 
                        key={job._id} 
                        job={job} 
                        isGuest={isGuest}
                        onRequireAuth={requireAuth}
                    />
                ))
            ) : (
                <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                    <h3 className="text-lg font-bold">No jobs found</h3>
                    <p className="text-slate-500">Be the first to post a job!</p>
                </div>
            )}

            {hasMore && !loading && jobs.length > 0 && (
                <div className="flex justify-center mt-12 pt-6">
                    <button 
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm tracking-wide hover:transform hover:-translate-y-0.5 transition-all shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {loadingMore ? "Loading..." : "Load More Jobs"}
                    </button>
                </div>
            )}
        </div>

    </div>
  );
}
