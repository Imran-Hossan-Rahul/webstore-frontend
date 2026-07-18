"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { Users, Star, MessageCircle, UserPlus, UserCheck, Eye, Heart, CheckCircle2, Trophy, Activity as ActivityIcon, Code, Briefcase } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import ViewToolbar from "./ViewToolbar";

export default function CraftsmenList() {
  const router = useRouter();
  const [craftsmen, setCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [leaderboard, setLeaderboard] = useState([]);
  const [activities, setActivities] = useState([]);
  const [featuredDevlogs, setFeaturedDevlogs] = useState([]);
  const [openBounties, setOpenBounties] = useState([]);
  const [squads, setSquads] = useState([]);
  const [listType, setListType] = useState('individuals'); // 'individuals' or 'squads'
  const { showToast } = useToast();

  // Toolbar State
  const [viewMode, setViewMode] = useState("grid");
  const [gridCols, setGridCols] = useState(3);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchCraftsmen();
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      const [leaderboardRes, activitiesRes, devlogsRes, bountiesRes, squadsRes] = await Promise.all([
        api.get("/user/leaderboard").catch(() => ({ success: false })),
        api.get("/community/activities?limit=4").catch(() => ({ success: false })),
        api.get("/posts?limit=3&type=devlog").catch(() => ({ success: false })),
        api.get("/jobs?limit=3&status=open").catch(() => ({ success: false })),
        api.get("/squads").catch(() => ({ success: false }))
      ]);
      if (leaderboardRes.success) setLeaderboard(leaderboardRes.data || []);
      if (activitiesRes.success) setActivities(activitiesRes.data || []);
      setFeaturedDevlogs(devlogsRes.posts || devlogsRes.data || []);
      setOpenBounties(bountiesRes.data || []);
      setSquads(squadsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch community data:", err);
    }
  };

  const fetchCraftsmen = async () => {
    try {
      setLoading(true);
      const res = await api.get("/craftsman/profiles/all");
      setCraftsmen(res.craftsmen || []);
      
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const followRes = await api.get("/user/following");
          const followingList = followRes.following || [];
          const followingUserIds = followingList.map(f => typeof f === 'object' ? f._id : f);
          setFollowingIds(new Set(followingUserIds));
        } catch (err) {
          console.log("Following status not available");
        }
      }
    } catch (error) {
      console.error("Failed to fetch craftsmen:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (craftsman, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to follow craftsmen.", "info", "Login Required");
      return;
    }
    
    const targetUserId = craftsman.userId ? (typeof craftsman.userId === 'object' ? craftsman.userId._id : craftsman.userId) : null;
    if (!targetUserId) {
      showToast("Unable to follow this craftsman.", "error", "Error");
      return;
    }
    
    try {
      const res = await api.post(`/user/follow/${targetUserId}`);
      if (res.success) {
        setFollowingIds(prev => {
          const newSet = new Set(prev);
          if (res.action === "follow") newSet.add(targetUserId);
          else newSet.delete(targetUserId);
          return newSet;
        });
      }
    } catch (error) {
      showToast("Failed to follow craftsman.", "error", "Error");
    }
  };

  const handleOpenProfile = (craftsman, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const userObj = craftsman.userId && typeof craftsman.userId === 'object' ? craftsman.userId : null;
    const username = userObj?.username;
    
    if (username) {
        router.push(`/u/${username}`);
    } else {
        const targetUserId = userObj?._id || (typeof craftsman.userId === 'string' ? craftsman.userId : null);
        if (targetUserId) {
            window.dispatchEvent(new CustomEvent('openCraftsmanModal', { detail: { userId: targetUserId }}));
        }
    }
  };

  // Extract unique roles for the categories filter (Memoized)
  const categories = useMemo(() => {
    const allRoles = [...new Set(craftsmen.map(c => c.workType).filter(Boolean))];
    return ["All", ...allRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1))];
  }, [craftsmen]);

  // Filtered craftsmen list (Memoized)
  const filteredCraftsmen = useMemo(() => {
    return craftsmen.filter(craftsman => {
      if (activeCategory === "All") return true;
      return craftsman.workType && craftsman.workType.toLowerCase() === activeCategory.toLowerCase();
    });
  }, [craftsmen, activeCategory]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <Users className="w-6 h-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
              Community<span className="text-slate-400">.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs font-bold uppercase tracking-widest">
              Elite professional network of system designers and engineers
            </p>
          </div>
        </div>

        {/* Squads vs Individuals Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl relative z-20">
           <button 
             type="button"
             onClick={() => setListType('individuals')}
             className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 ${listType === 'individuals' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
              Individuals
           </button>
           <button 
             type="button"
             onClick={() => setListType('squads')}
             className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 relative z-10 ${listType === 'squads' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
              Squads <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-md text-[10px] pointer-events-none">NEW</span>
           </button>
        </div>
      </div>

      {/* Community Widgets: Leaderboard & Activity Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Leaderboard Widget */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Trophy size={16} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Top Craftsmen Leaderboard</h2>
          </div>
          <div className="space-y-4">
            {leaderboard.slice(0, 3).map((user, idx) => (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    {user.profilePicture ? (
                      <img src={getOptimizedUrl(user.profilePicture)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-indigo-500 text-white">
                        {user.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Lvl {user.gamification?.level || 1}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-indigo-600">{(user.gamification?.xp || 0).toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">XP</span>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-xs text-slate-500 italic">No leaderboard data available.</p>}
          </div>
        </div>

        {/* Live Activity Ticker Widget */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ActivityIcon size={16} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Live Activity Ticker</h2>
          </div>
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 shrink-0 overflow-hidden flex items-center justify-center">
                  {act.user?.profilePicture ? (
                    <img src={getOptimizedUrl(act.user.profilePicture)} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-slate-500">{act.user?.name?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white mr-1">{act.user?.name || "Someone"}</span>
                    {act.action || "completed an activity"}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                    {new Date(act.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {activities.length === 0 && <p className="text-xs text-slate-500 italic">No recent activities found.</p>}
          </div>
        </div>
      </div>

      {/* Phase 2 Community Widgets: Featured Devlogs & Open Bounties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Featured Devlogs */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Code size={16} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Featured Devlogs</h2>
            </div>
            <button onClick={() => router.push('/explore')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">View All</button>
          </div>
          <div className="space-y-4">
            {featuredDevlogs.map((devlog) => (
              <div key={devlog._id} className="group cursor-pointer border border-slate-100 dark:border-white/5 rounded-2xl p-4 hover:border-indigo-500/30 transition-all" onClick={() => router.push(`/post/${devlog._id}`)}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">{devlog.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                     {devlog.user?.profilePicture ? <img src={getOptimizedUrl(devlog.user.profilePicture)} className="w-full h-full object-cover" /> : null}
                   </div>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{devlog.user?.name || 'Anonymous'}</span>
                   <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{devlog.likesCount || 0} Likes</span>
                </div>
              </div>
            ))}
            {featuredDevlogs.length === 0 && <p className="text-xs text-slate-500 italic">No featured devlogs available.</p>}
          </div>
        </div>

        {/* Open Bounties */}
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Briefcase size={16} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Hot Bounties</h2>
            </div>
            <button onClick={() => router.push('/jobs')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">View All</button>
          </div>
          <div className="space-y-4">
            {openBounties.map((job) => (
              <div key={job._id} className="group cursor-pointer border border-slate-100 dark:border-white/5 rounded-2xl p-4 hover:border-emerald-500/30 transition-all flex flex-col justify-between" onClick={() => router.push(`/jobs/${job._id}`)}>
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">{job.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{job.description}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">${job.budget?.min || 0} - ${job.budget?.max || 0}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md uppercase tracking-widest">Apply</span>
                </div>
              </div>
            ))}
            {openBounties.length === 0 && <p className="text-xs text-slate-500 italic">No open bounties at the moment.</p>}
          </div>
        </div>
      </div>

      <ViewToolbar 
          viewMode={viewMode}
          setViewMode={setViewMode}
          gridCols={gridCols}
          setGridCols={setGridCols}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
      />

      {listType === 'individuals' ? (
        <div className={`grid gap-6 mt-6 ${
            viewMode === 'grid' 
                ? gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' 
                : gridCols === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
        }`}>
          {filteredCraftsmen.map((craftsman) => {
          const craftsmanUserId = craftsman.userId ? (typeof craftsman.userId === 'object' ? craftsman.userId._id : craftsman.userId) : null;
          const isFollowing = followingIds.has(craftsmanUserId);
          const isCompactGrid = viewMode === 'grid' && gridCols >= 3;
          const isVeryCompact = viewMode === 'grid' && gridCols === 4;

          return (
            <div
              key={craftsman._id}
              className={`group flex ${viewMode === 'list' ? 'flex-row items-center p-6' : 'flex-col p-6'} bg-white dark:bg-[#111111] border border-slate-100 dark:border-white/5 rounded-[28px] hover:border-slate-900 dark:hover:border-white transition-all duration-300 relative`}
            >
              
              {/* Left Column (Avatar + Buttons) */}
              <div className={`flex flex-col items-center ${viewMode === 'list' ? 'w-[200px] shrink-0 border-r border-dashed border-slate-200 dark:border-white/10 pr-6 mr-6' : 'mb-6 w-full'}`}>
                  {/* Avatar */}
                  <div className="w-28 h-28 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 relative overflow-hidden mb-6 shrink-0">
                      {craftsman.profilePicture ? (
                        <img src={getOptimizedUrl(craftsman.profilePicture)} alt={craftsman.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white font-bold text-4xl">
                            {craftsman.displayName?.[0]?.toUpperCase() || "C"}
                        </div>
                      )}
                  </div>

                  {/* Buttons Row */}
                  <div className={`flex items-center justify-center gap-2 w-full ${isVeryCompact ? 'flex-col' : 'flex-row'}`}>
                      <button 
                        onClick={(e) => handleOpenProfile(craftsman, e)}
                        className="flex-1 py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                      >
                         Profile
                      </button>
                      <button
                        onClick={(e) => handleFollow(craftsman, e)}
                        className={`flex-1 py-2.5 px-4 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                          isFollowing
                            ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                            : "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-slate-100"
                        }`}
                      >
                        {isFollowing ? "Joined" : "Invite"}
                      </button>
                  </div>
              </div>

              {/* Right Column (Info) */}
              <div className="flex-1 min-w-0 flex flex-col justify-center w-full">
                  
                  {/* Top Badge (Role) */}
                  {craftsman.workType && (
                      <div className="mb-3">
                          <span className="inline-flex items-center px-3 py-1 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">
                              {craftsman.workType}
                          </span>
                      </div>
                  )}

                  {/* Name & Verified */}
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter truncate group-hover:text-slate-500 transition-colors">
                          {craftsman.displayName}
                      </h3>
                      {craftsman.isVerified && (
                          <div className="bg-[#EFFFBB] dark:bg-green-500/20 text-[#4CAF50] dark:text-green-400 p-0.5 rounded-full shrink-0">
                              <CheckCircle2 size={16} className="fill-current text-[#111] dark:text-transparent stroke-2" />
                          </div>
                      )}
                  </div>

                  {/* Stats Row (Views, Followers, Likes) */}
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-1 mb-4 text-sm font-bold text-slate-700 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                           <span>{(craftsman.totalViews || 0).toLocaleString()}</span>
                           <span className="text-slate-400 dark:text-slate-500 font-semibold text-xs uppercase tracking-wider">Views</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                      <div className="flex items-center gap-1.5">
                           <span>{(craftsman.followersCount || 0).toLocaleString()}</span>
                           <span className="text-slate-400 dark:text-slate-500 font-semibold text-xs uppercase tracking-wider">Followers</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                      <div className="flex items-center gap-1.5">
                           <span>{(craftsman.totalLikes || 0).toLocaleString()}</span>
                           <span className="text-slate-400 dark:text-slate-500 font-semibold text-xs uppercase tracking-wider">Likes</span>
                      </div>
                  </div>

                  {/* Bio (Hidden on very compact grid to save space) */}
                  {!isVeryCompact && craftsman.bio && (
                      <p className={`text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-5 ${isCompactGrid ? 'line-clamp-2' : 'line-clamp-3'}`}>
                          {craftsman.bio}
                      </p>
                  )}
                  {/* Space filler if no bio in list mode */}
                  {viewMode === 'list' && !craftsman.bio && <div className="h-4"></div>}

                  {/* Skills Pills */}
                  {craftsman.skills && craftsman.skills.length > 0 && (
                      <div className={`flex flex-wrap gap-2 mt-auto pt-2 ${viewMode === 'grid' ? 'border-t border-dashed border-slate-100 dark:border-white/10' : ''}`}>
                          {craftsman.skills.slice(0, isVeryCompact ? 2 : isCompactGrid ? 3 : 5).map((skill, idx) => (
                              <span
                                  key={idx}
                                  className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 rounded-xl text-xs font-bold"
                              >
                                  {skill}
                              </span>
                          ))}
                          {craftsman.skills.length > (isVeryCompact ? 2 : isCompactGrid ? 3 : 5) && (
                              <span className="px-2 py-1 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-xl text-xs font-bold">
                                  +{craftsman.skills.length - (isVeryCompact ? 2 : isCompactGrid ? 3 : 5)}
                              </span>
                          )}
                      </div>
                  )}

              </div>

            </div>
          );
        })}

        {filteredCraftsmen.length === 0 && !loading && (
          <div className="col-span-full text-center py-32 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-black/20 backdrop-blur-sm mt-8">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No community members found matching this category</p>
          </div>
        )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {squads.map((squad) => (
            <div key={squad._id} className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                  {squad.logo ? <img src={getOptimizedUrl(squad.logo)} className="w-full h-full object-cover" /> : <Users size={20} className="text-slate-400" />}
                </div>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 font-bold text-[10px] uppercase tracking-widest rounded-lg">Level {Math.floor(squad.totalXP / 1000) || 1}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{squad.name}</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{squad.description || "An elite squad ready for enterprise contracts."}</p>
              
              <div className="mt-6 flex items-center gap-4 border-t border-slate-100 dark:border-white/5 pt-4">
                 <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Members</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{squad.members?.length || 0}</p>
                 </div>
                 <div className="w-px h-8 bg-slate-100 dark:bg-white/5"></div>
                 <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Squad XP</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{(squad.totalXP || 0).toLocaleString()}</p>
                 </div>
              </div>

              <button className="w-full mt-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl hover:bg-black dark:hover:bg-slate-200 transition-colors">
                View Squad
              </button>
            </div>
          ))}
          {squads.length === 0 && (
            <div className="col-span-full text-center py-20 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
              <Users size={32} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">No squads formed yet.</p>
              <button onClick={() => router.push('/squads/create')} className="mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Create the first Squad</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
