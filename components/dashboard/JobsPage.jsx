"use client";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import EmptyState from "../ui/EmptyState";
import ViewToolbar from "./ViewToolbar";
import CustomSelect from "../ui/CustomSelect";
import CraftsmanHoverCard from "./cards/CraftsmanHoverCard";
import { DashboardContext } from "../../app/(dashboard)/layout";
import { Search, MapPin, Zap, Clock, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

// ── Live relative-time hook (auto-updates every 60s) ──────────────────────────
function useTimeAgo(date) {
  const calc = useCallback(() => {
    if (!date) return "";
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60)  return "just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60)     return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24)    return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7)      return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4)     return `${weeks}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }, [date]);

  const [label, setLabel] = useState(calc);
  useEffect(() => {
    setLabel(calc());
    const id = setInterval(() => setLabel(calc()), 60_000);
    return () => clearInterval(id);
  }, [calc]);
  return label;
}

function TimeAgo({ date }) {
  const label = useTimeAgo(date);
  return <span>{label}</span>;
}

// ── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    open:        "bg-white text-slate-900 border-slate-200 shadow-sm",
    in_progress: "bg-indigo-50/50 text-indigo-700 border-indigo-100",
    closed:      "bg-slate-50 text-slate-400 border-slate-100",
  };
  const label = { open: "Open", in_progress: "In Progress", closed: "Closed" };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap ${cfg[status] || cfg.closed}`}>
      {label[status] || status}
    </span>
  );
}

// ── CARD VIEW (grid) ─────────────────────────────────────────────────────────
function JobCard({ job }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/jobs/${job._id}`)}
      className="group bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-2xl p-6 hover:border-black dark:hover:border-white transition-all duration-150 cursor-pointer relative overflow-hidden flex flex-col h-full"
    >


      <div className="flex-1 flex flex-col">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 break-words">
          {job.title}
        </h3>
        <p className="text-[11px] font-jakarta text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed h-8 break-words">
          {job.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-0 h-11 overflow-hidden content-start">
          {job.skills && job.skills.length > 0 ? (
            <>
              {job.skills.slice(0, 3).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-slate-50 dark:bg-[#171717] text-slate-500 dark:text-slate-400 rounded-md text-[9px] font-bold uppercase tracking-wider border border-slate-200 dark:border-[#262626]">
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="text-[9px] font-bold text-slate-400 self-center">+{job.skills.length - 3}</span>
              )}
            </>
          ) : (
            <span className="text-[9px] text-slate-400 italic">No skills listed</span>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#262626] flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Zap size={12} className="text-slate-400" />
            {job.budget?.min}–{job.budget?.max} T
          </span>
          <span className="flex items-center gap-1"><Clock size={12} />{job.level}</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all">
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
}

// ── LIST VIEW ────────────────────────────────────────────────────────────────
function JobListRow({ job }) {
  const router = useRouter();
  const truncatedDescription = job.description?.length > 400 
    ? job.description.substring(0, 400) + "..." 
    : job.description;

  return (
    <div
      onClick={() => router.push(`/jobs/${job._id}`)}
      className="group w-full border border-slate-200 dark:border-[#262626] bg-white dark:bg-[#0A0A0A] hover:border-slate-300 dark:hover:border-[#404040] hover:shadow-md cursor-pointer transition-all duration-200 overflow-hidden rounded-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Section: Title & Metadata Stack (Table Cell Feel) */}
        <div className="md:col-span-5 py-6 px-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-[#262626] space-y-4">
          
          <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-2 break-words">
            {job.title}
          </h3>

          <div className="space-y-4">
            {/* Row 1: Level & Time Ago */}
            <div className="flex items-center gap-10">
              <div className="w-24 flex-shrink-0">
                <span className="px-2 py-0.5 bg-slate-50 dark:bg-[#171717] rounded border border-slate-200 dark:border-[#262626] text-slate-500 text-[10px] font-semibold uppercase block w-fit">
                  {job.level}
                </span>
              </div>
              <div className="flex items-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <span className="font-medium">
                  <TimeAgo date={job.createdAt} />
                </span>
              </div>
            </div>

            {/* Row 2: Price & Type */}
            <div className="flex items-center gap-10">
              <div className="w-24 flex-shrink-0">
                <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  {job.budget?.type === "hourly" ? "Hourly" : "Fixed-price"}
                </span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap size={14} className="text-slate-400" />
                {job.budget?.min}–{job.budget?.max} TKNS
              </div>
            </div>

            {/* Row 3: Location & Proposals */}
            <div className="flex items-center gap-10">
              <div className="w-24 flex-shrink-0 flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  {job.location || "Remote"}
                </span>
              </div>
              <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span>{job.applicants?.length || 0} Proposals</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Description & Skills (Table Cell Feel) */}
        <div className="md:col-span-7 py-4 pl-8 pr-16 flex flex-col gap-3 relative">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal line-clamp-3 break-words">
              {truncatedDescription}
            </p>
          </div>

          {/* Tech Stack (Skills) - Directly after description */}
          <div className="flex flex-wrap gap-2 pt-2">
            {job.skills?.slice(0, 6).map(skill => (
              <span key={skill} className="px-3 py-1 bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-md text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                {skill}
              </span>
            ))}
            {job.skills?.length > 6 && (
              <span className="text-[10px] font-semibold text-slate-400 self-center">
                +{job.skills.length - 6}
              </span>
            )}
          </div>
          
          {/* Hover Arrow */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all">
               <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'budget_high', label: 'Highest Budget' },
    { value: 'budget_low', label: 'Lowest Budget' },
    { value: 'applicants', label: 'Most Proposals' }
];

export default function JobsPage() {
  const { isGuest, requireAuth } = useContext(DashboardContext) || { isGuest: true };
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);

  // View state — mirrors CodexPage pattern
  const [viewMode, setViewMode]             = useState("list");
  const [gridCols, setGridCols]             = useState(3);
  
  // Minimalist Filters
  const [activeCategory, setActiveCategory] = useState("All");
  const [paymentType, setPaymentType]       = useState("All");
  const [level, setLevel]                   = useState("All");
  const [skill, setSkill]                   = useState("All");
  const [sortBy, setSortBy]                 = useState("newest");

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs");
      if (response.success && response.data) setJobs(response.data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(jobs.map(j => {
    return j.category?.toLowerCase() === 'code' ? 'Dev' : j.category;
  }).filter(Boolean)))].map(t => 
    t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
  );
  const allSkills = ["All", ...Array.from(new Set(jobs.flatMap(j => j.skills || []))).sort()];

  const filteredJobs = jobs.filter(j => {
    const rawCat = j.category || "";
    const mappedCat = rawCat.toLowerCase() === 'code' ? 'Dev' : rawCat;
    const matchCat    = activeCategory === "All" || (mappedCat && (mappedCat.charAt(0).toUpperCase() + mappedCat.slice(1).toLowerCase()) === activeCategory);
    const matchPayment = paymentType === "All" || (paymentType === "Hourly" && j.budget?.type === "hourly") || (paymentType === "Fixed" && j.budget?.type === "fixed");
    const matchLevel   = level === "All" || j.level?.toLowerCase() === level.toLowerCase();
    const matchSkill   = skill === "All" || (j.skills && j.skills.includes(skill));
    return matchCat && matchPayment && matchLevel && matchSkill;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'budget_high') return (b.budget?.max || 0) - (a.budget?.max || 0);
    if (sortBy === 'budget_low') return (a.budget?.min || 0) - (b.budget?.min || 0);
    if (sortBy === 'applicants') return (b.applicants?.length || 0) - (a.applicants?.length || 0);
    return 0;
  });

  const gridClass =
    Number(gridCols) === 2 ? "grid-cols-1 sm:grid-cols-2" :
    Number(gridCols) === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" :
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="w-full max-w-6xl px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 border-b border-slate-100 dark:border-[#262626] pb-0">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-none pb-4">
          Discover Opportunities
        </h1>

        <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative flex flex-col items-center pb-3 transition-all whitespace-nowrap ${
                        activeCategory === cat ? "opacity-100" : "opacity-50 hover:opacity-80"
                    }`}
                >
                    <span className={`text-sm font-bold transition-colors ${
                        activeCategory === cat 
                          ? "text-slate-900 dark:text-white" 
                          : "text-slate-500"
                    }`}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
                    </span>
                    {activeCategory === cat && (
                        <motion.div
                            layoutId="activeCategoryJobs"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 dark:bg-white rounded-full"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Filters and ViewToolbar Row */}
      <div className="relative z-20 flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-6 border-b border-slate-100 dark:border-[#262626] pb-4">
        <div className="flex flex-wrap items-center gap-4">
            <CustomSelect 
                label="Filter by Skill"
                options={allSkills}
                value={skill}
                onChange={setSkill}
                searchable={true}
                className="min-w-[180px]"
            />

            <CustomSelect 
                label="Expertise Level"
                options={["All", "Entry", "Intermediate", "Expert"]}
                value={level}
                onChange={setLevel}
                className="min-w-[160px]"
            />

            <CustomSelect 
                label="Payment Type"
                options={["All", "Hourly", "Fixed"]}
                value={paymentType}
                onChange={setPaymentType}
                className="min-w-[160px]"
            />
        </div>

        <div className="flex-shrink-0">
          <ViewToolbar
            viewMode={viewMode}
            setViewMode={setViewMode}
            gridCols={gridCols}
            setGridCols={setGridCols}
            sortOptions={SORT_OPTIONS}
            sortBy={sortBy}
            setSortBy={setSortBy}
            noBorder={true}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={`grid gap-6 ${viewMode === "grid" ? gridClass : "grid-cols-1"}`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <EmptyState type="default" />
      ) : (
        <div className={`grid ${viewMode === "grid" ? `gap-6 ${gridClass}` : "grid-cols-1 gap-4"}`}>
          <AnimatePresence mode="popLayout">
            {filteredJobs.map(job => (
              <motion.div
                key={job._id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {viewMode === "grid" ? <JobCard job={job} /> : <JobListRow job={job} />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}



