"use client";
import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import EmptyState from "../ui/EmptyState";
import ViewToolbar from "./ViewToolbar";
import CustomSelect from "../ui/CustomSelect";
import { DashboardContext } from "../../app/(dashboard)/layout";
import { Search, MapPin, Zap, Clock, Users, FileText, ChevronRight, ArrowUpRight, User, Calendar, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Time Ago Hook ---
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
    const timer = setInterval(() => setLabel(calc()), 60000);
    return () => clearInterval(timer);
  }, [calc]);
  return label;
}

function TimeAgo({ date }) {
  const label = useTimeAgo(date);
  return <span>{label}</span>;
}

// --- Status Pill (Refined for Compact Design) ---
function StagePill({ stage }) {
  const cfg = {
    proposal_sent: { label: "SENT",        color: "text-slate-500",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-slate-400" },
    under_review:  { label: "REVIEWING",   color: "text-amber-600",    bg: "bg-amber-50 dark:bg-amber-900/10",   dot: "bg-amber-500" },
    shortlisted:   { label: "SHORTLISTED", color: "text-emerald-600",  bg: "bg-emerald-50 dark:bg-emerald-900/10", dot: "bg-emerald-500" },
    interview:     { label: "INTERVIEW",   color: "text-indigo-600",   bg: "bg-indigo-50 dark:bg-indigo-900/10", dot: "bg-indigo-500" },
    offer_sent:    { label: "OFFER",       color: "text-slate-500",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-slate-400" },
    hired:         { label: "HIRED",       color: "text-emerald-500",  bg: "bg-emerald-50 dark:bg-emerald-900/10", dot: "bg-emerald-500" },
    rejected:      { label: "REJECTED",    color: "text-slate-400",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-slate-300" },
    closed:        { label: "CLOSED",      color: "text-slate-400",    bg: "bg-slate-50 dark:bg-[#171717]",        dot: "bg-slate-300" },
  };

  const item = cfg[stage] || cfg.closed;

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-normal tracking-widest flex items-center gap-1.5 ${item.color} ${item.bg} border border-current/10`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

// --- Card View ---
function ProposalCard({ item, isSent }) {
  const router = useRouter();
  const title = item.jobTitle;
  const subText = isSent ? `To: ${item.patron?.name}` : `From: ${item.applicantName}`;
  const rate = item.proposal?.expectedRate;
  const rateType = item.proposal?.rateType;
  const proposalId = isSent ? item._id : item.applicationId;

  return (
    <div
      onClick={() => router.push(`/proposals/${proposalId}`)}
      className="group bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-2xl p-6 hover:border-black dark:hover:border-white transition-all duration-150 cursor-pointer relative overflow-hidden flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-50 dark:bg-[#171717] rounded-xl border border-slate-200 dark:border-[#262626] flex items-center justify-center flex-shrink-0">
           <FileText size={20} className="text-slate-400" />
        </div>
        <StagePill stage={item.stage} />
      </div>

      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2">
        {title}
      </h3>
      <p className="text-xs font-jakarta text-slate-500 dark:text-slate-400 mb-3 font-medium">
        {subText}
      </p>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#262626] flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <Zap size={12} className="text-slate-400" />
          {rate} <span className="text-[8px] opacity-60">TKNS</span> ({rateType})
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Clock size={12} /><TimeAgo date={isSent ? item.appliedAt : item.appliedAt} /></span>
        </div>
      </div>
    </div>
  );
}

// --- List View Row (New Compact Design) ---
function ProposalListRow({ item, isSent }) {
  const router = useRouter();
  const title = item.jobTitle;
  const subText = isSent ? item.patron?.name : item.applicantName;
  const rate = item.proposal?.expectedRate;
  const rateType = item.proposal?.rateType;
  const proposalId = isSent ? item._id : item.applicationId;

  return (
    <div
      onClick={() => router.push(`/proposals/${proposalId}`)}
      className="group w-full mb-3 p-4 px-6 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-black dark:hover:border-white transition-all duration-150 cursor-pointer"
    >
      <div className="flex-1 w-full">
        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight mb-1">
          {title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-slate-300" />
            <span className="text-slate-500 dark:text-slate-300">{isSent ? "To:" : "From:"}</span>
            <span className="font-bold text-slate-700 dark:text-white">{subText}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-slate-300" />
            <span className="font-bold text-slate-700 dark:text-white">{rate} TKNS</span>
            <span className="opacity-60">({rateType})</span>
          </div>

          <div className="flex items-center gap-1.5 uppercase tracking-wider">
            <Clock size={12} className="text-slate-300" />
            <TimeAgo date={item.appliedAt} />
          </div>
          
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-300" />
            <span>{new Date(item.appliedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-[#262626] md:pl-4 mt-1 md:mt-0">
        <StagePill stage={item.stage} />
        <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function ProposalsPage() {
  const { user, isGuest, requireAuth } = useContext(DashboardContext) || {};
  const [viewMode, setViewMode] = useState("list");
  const [activeTab, setActiveTab] = useState("Sent");
  const [loading, setLoading] = useState(true);
  const [sentProposals, setSentProposals] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [gridCols, setGridCols] = useState(3);
  const [sortBy, setSortBy] = useState("newest");

  const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "rate_high", label: "Rate: High to Low" },
    { value: "rate_low", label: "Rate: Low to High" },
  ];

  const fetchProposals = async () => {
    try {
      setLoading(true);
      // Fetch Sent Proposals
      const sentRes = await api.get("/jobs/my-proposals");
      if (sentRes.success) setSentProposals(sentRes.data || []);

      // Fetch Received Applications (if patron)
      if (user && (user.role === "patron" || user.role === "admin")) {
        const jobsRes = await api.get(`/jobs?status=all&patron=${user._id}`);
        if (jobsRes.success && jobsRes.data) {
          const apps = [];
          jobsRes.data.forEach(job => {
            if (job.applicants) {
              job.applicants.forEach(applicant => {
                if (applicant.stage !== "trash") {
                  apps.push({
                    jobId: job._id,
                    jobTitle: job.title,
                    jobStatus: job.status,
                    applicationId: applicant._id,
                    applicantId: applicant.user?._id || applicant.user,
                    applicantName: applicant.user?.name || "Anonymous",
                    stage: applicant.stage,
                    proposal: applicant.proposal,
                    appliedAt: applicant.appliedAt
                  });
                }
              });
            }
          });
          setReceivedApplications(apps);
        }
      }
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGuest === false) fetchProposals();
    else if (isGuest === true) requireAuth("engage");
  }, [isGuest, user]);

  const filteredItems = useMemo(() => {
    const base = activeTab === "Sent" ? sentProposals : receivedApplications;
    let result = base;

    if (statusFilter !== "All") {
      result = result.filter(item => item.stage === statusFilter.toLowerCase().replace(" ", "_"));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.jobTitle?.toLowerCase().includes(q) || 
        (activeTab === "Sent" ? item.patron?.name : item.applicantName)?.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.appliedAt) - new Date(a.appliedAt);
      if (sortBy === "oldest") return new Date(a.appliedAt) - new Date(b.appliedAt);
      const rateA = a.proposal?.expectedRate || 0;
      const rateB = b.proposal?.expectedRate || 0;
      if (sortBy === "rate_high") return rateB - rateA;
      if (sortBy === "rate_low") return rateA - rateB;
      return 0;
    });

    return result;
  }, [activeTab, sentProposals, receivedApplications, statusFilter, searchQuery, sortBy]);

  const gridClass = gridCols === 2 ? "md:grid-cols-2" : gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-4";

  const tabs = ["Sent", "Received"];

  return (
    <div className="w-full max-w-6xl px-[15px] animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          Applications & Proposals
        </h1>
      </div>

      {/* Filters (Reverted Tab System next to Search) */}
      <div className="relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-y-4 mb-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 flex-1 w-full max-w-2xl">
              {/* Search Bar */}
              <div className="flex-1 relative group w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
                  <input 
                    type="text"
                    placeholder={`Search ${activeTab.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] focus:border-black dark:focus:border-white rounded-xl text-[13px] font-bold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                  />
              </div>

              {/* Sent/Received Filter (Original Underline Style) */}
              <div className="flex items-center gap-8 px-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-[#262626] pt-2 sm:pt-0 sm:pl-8 justify-center sm:justify-start">
                 {tabs.map(tab => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`relative py-3 sm:py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                       activeTab === tab ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                     }`}
                   >
                     {tab}
                     {activeTab === tab && (
                       <motion.div
                         layoutId="activeTabProposals"
                         className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 dark:bg-white rounded-full"
                       />
                     )}
                   </button>
                 ))}
              </div>
          </div>

          <CustomSelect 
            options={["All", "Proposal Sent", "Under Review", "Shortlisted", "Interview", "Offer Sent", "Hired", "Rejected"]}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full lg:w-auto min-w-[200px]"
          />
      </div>

      {/* Toolbar */}
      <ViewToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        gridCols={gridCols}
        setGridCols={setGridCols}
        sortOptions={SORT_OPTIONS}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Content */}
      {loading ? (
        <div className={`grid gap-6 ${viewMode === "grid" ? gridClass : "grid-cols-1"}`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState type="default" />
      ) : (
        <div className={`grid ${viewMode === "grid" ? `gap-6 ${gridClass}` : "grid-cols-1"}`}>
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.jobId + (item.applicantId || idx)}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {viewMode === "grid" 
                  ? <ProposalCard item={item} isSent={activeTab === "Sent"} /> 
                  : <ProposalListRow item={item} isSent={activeTab === "Sent"} />
                }
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

