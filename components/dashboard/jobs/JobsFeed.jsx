"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Search, Filter, Plus } from "lucide-react";
import { JobCard } from "./JobCard";

export default function JobsFeed() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, saved, applied

  useEffect(() => {
    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs?limit=20');
            if (res.success) {
                setJobs(res.data);
            }
        } catch (e) {
            console.error("Jobs fetch failed", e);
        } finally {
            setLoading(false);
        }
    };
    fetchJobs();
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto animate-in fade-in duration-500">
        
        {/* Helper / Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                 <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Find Work</h1>
                 <p className="text-gray-500 dark:text-gray-400 mt-1">
                     Hand-picked opportunities for top-tier developers.
                 </p>
             </div>
             
             <button className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:transform hover:scale-105 transition-all shadow-xl shadow-purple-500/20">
                 <Plus size={18} /> Post a Job
             </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="sticky top-24 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-2 mb-8 shadow-sm flex items-center justify-between gap-4">
             <div className="flex-1 flex items-center px-4 gap-3">
                 <Search className="text-gray-400" size={20} />
                 <input 
                    type="text" 
                    placeholder="Search by title, skill, or keyword..." 
                    className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
                 />
             </div>
             <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10 hidden md:block" />
             <div className="hidden md:flex items-center gap-2 pr-2">
                 <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors">
                     <Filter size={20} />
                 </button>
                 <select className="bg-transparent text-sm font-bold text-gray-700 dark:text-white outline-none cursor-pointer">
                     <option>Sort by: Newest</option>
                     <option>Highest Budget</option>
                 </select>
             </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4 pb-20">
            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading Opportunities...</div>
            ) : jobs.length > 0 ? (
                jobs.map(job => (
                    <JobCard key={job._id} job={job} onClick={() => console.log("View Job", job._id)} />
                ))
            ) : (
                <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                    <h3 className="text-lg font-bold">No jobs found</h3>
                    <p className="text-gray-500">Be the first to post a job!</p>
                </div>
            )}
        </div>

    </div>
  );
}
