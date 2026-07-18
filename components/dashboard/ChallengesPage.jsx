"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useEffect, useContext } from "react";
import { api } from "@/utils/api";
import EmptyState from "../ui/EmptyState";
import { DashboardContext } from "../../app/(dashboard)/layout";
import { Trophy, Calendar, Zap, Code, PenTool, Layout as LayoutIcon, ArrowRight, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VerificationBadge from "../ui/VerificationBadge";
import { ShieldCheck, Plus } from "lucide-react";
import CraftsmanHoverCard from "./cards/CraftsmanHoverCard";

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(endDate) - new Date();
      if (difference <= 0) {
        setTimeLeft("Ended");
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return <span>{timeLeft}</span>;
};

export default function ChallengesPage() {
  const { isGuest, requireAuth, user } = useContext(DashboardContext) || { isGuest: true };
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // View State
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await api.get("/challenges");
      if (response.success && response.data) {
        setChallenges(response.data);
      } else if (response.data) {
        setChallenges(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic categories from data
  const availableTypes = ["All", ...new Set(challenges.map(c => {
    const t = c.category || c.type;
    return t?.toLowerCase() === 'code' ? 'Dev' : t;
  }).filter(Boolean))].map(t => 
    t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
  );

  const filteredChallenges = challenges.filter(c => {
    const cat = c.category || c.type;
    return activeType === "All" || cat?.toLowerCase() === activeType.toLowerCase();
  });

  const getTypeIcon = (type, size = 18) => {
    const t = (type || "").toLowerCase();
    if (t.includes('design') || t === '3d')  return <PenTool size={size} className="text-slate-400" />;
    if (t.includes('code') || t.includes('dev'))   return <Code size={size} className="text-slate-400" />;
    if (t.includes('content') || t.includes('marketing')) return <LayoutIcon size={size} className="text-slate-400" />;
    if (t.includes('ai') || t.includes('data')) return <Zap size={size} className="text-slate-400" />;
    return <Trophy size={size} className="text-slate-400" />;
  };

  return (
    <div className="w-full max-w-6xl pb-12 px-4 animate-in fade-in duration-500">
      
      {/* Professional Header */}
      <div className="mb-5 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white -mt-[1px]">
              Community Challenges
            </h1>
          </div>

          <div className="flex items-center gap-8 border-b border-transparent pb-1 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`relative py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeType === type
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                }`}
              >
                {type}
                {activeType === type && (
                  <motion.div
                    layoutId="activeTabChallenges"
                    className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-slate-900 dark:bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-2xl p-6 animate-pulse">
              <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6" />
              <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mb-4" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full mb-2" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredChallenges.map((challenge) => {
            const now = new Date();
            const phases = challenge.phases || {};
            const submissionEnd = phases.submissionEnd || challenge.endDate;
            const registrationStart = phases.registrationStart || challenge.startDate;
            
            // Dynamic Phase & Status Logic
            let statusLabel = "Active";
            let statusStyle = "bg-white text-slate-900 border-slate-200 shadow-sm";
            let isActive = true;

            if (now < new Date(registrationStart)) {
              statusLabel = "Upcoming";
              statusStyle = "bg-slate-50 text-slate-400 border-slate-100";
              isActive = false;
            } else if (now > new Date(submissionEnd)) {
              isActive = false;
              if (phases.judgingStart && now > new Date(phases.judgingStart) && now < new Date(phases.judgingEnd)) {
                statusLabel = "Judging";
                statusStyle = "bg-amber-50 text-amber-700 border-amber-100";
              } else if (challenge.status === 'completed') {
                statusLabel = "Completed";
                statusStyle = "bg-slate-50 text-slate-400 border-slate-100";
              } else {
                statusLabel = "Under Review";
                statusStyle = "bg-indigo-50 text-indigo-700 border-indigo-100";
              }
            } else {
              statusLabel = "Active";
              statusStyle = "bg-white text-slate-900 border-slate-200 shadow-sm";
            }

            const rawCat = challenge.category || challenge.type || "";
            const challengeCat = rawCat.toLowerCase() === 'code' ? 'Dev' : rawCat;
            const displayCat = challengeCat.charAt(0).toUpperCase() + challengeCat.slice(1).toLowerCase();

            return (
              <Link 
                href={`/challenges/${challenge._id}`}
                key={challenge._id} 
                className="group bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-2xl overflow-hidden hover:border-black dark:hover:border-white transition-all duration-150 cursor-pointer flex flex-col"
              >
                <div className="h-44 relative bg-slate-50 dark:bg-slate-900/50">
                  {challenge.coverImage ? (
                    <img 
                      src={challenge.coverImage} 
                      alt={challenge.title} 
                      className="w-full h-full object-cover transition-transform duration-150 group-hover:-translate-y-0.5" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      {getTypeIcon(challengeCat, 48)}
                    </div>
                  )}
                  
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${statusStyle}`}>
                      {statusLabel}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white border border-white/20 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                      {getTypeIcon(challengeCat)}
                      {displayCat}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {challenge.craftsman && (
                    <CraftsmanHoverCard 
                      userId={challenge.craftsman?._id || challenge.craftsman}
                      displayName={challenge.craftsman?.name}
                      username={challenge.craftsman?.username}
                      avatarUrl={challenge.craftsman?.profilePicture}
                    >
                      <div className="flex items-center gap-2 mb-3 cursor-pointer">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 border border-slate-200 dark:border-[#262626] flex items-center justify-center">
                          {challenge.craftsman.profilePicture ? (
                            <img src={getOptimizedUrl(challenge.craftsman.profilePicture)} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] font-bold text-slate-500">{challenge.craftsman.name?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          Hosted by {challenge.craftsman.name}
                          {challenge.craftsman.isVerified && <VerificationBadge size={10} />}
                        </span>
                      </div>
                    </CraftsmanHoverCard>
                  )}
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                    {challenge.title}
                  </h3>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed mb-6">
                    {challenge.description}
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600 dark:text-gray-300">
                        {challenge.prize}
                      </span>
                    </div>

                    {isActive ? (
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                        <Clock size={12} className="text-slate-400" />
                        <CountdownTimer endDate={challenge.endDate} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                         <Users size={12} />
                         {challenge.submissions?.length || 0} Entries
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          title="No challenges found" 
          description="Try adjusting your filter or check back later for new competitions."
          icon={<Trophy size={48} />}
        />
      )}
    </div>
  );
}

