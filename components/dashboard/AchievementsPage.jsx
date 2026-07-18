"use client";
import React from "react";
import useSWR from "swr";
import { api } from "@/utils/api";
import { Trophy, Star, Zap, Target, Award, ShieldCheck, Flame, TrendingUp, Heart, Eye, Users, ArrowUpRight, History } from "lucide-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { DashboardContext } from "../../app/(dashboard)/layout";
import { useContext } from "react";
import AuthRequired from "../ui/AuthRequired";

const fetcher = (url) => api.get(url).then((res) => res.data);

const AchievementCard = ({ icon: Icon, title, description, date, color, isUnlocked = true, href }) => {
  const content = (
    <div className={`bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all group ${!isUnlocked && "opacity-50 grayscale"} ${href ? 'cursor-pointer hover:shadow-lg hover:border-indigo-500/30' : 'hover:shadow-lg'}`}>
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 ${href && "group-hover:scale-110"} transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{description}</p>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {isUnlocked ? `Unlocked: ${date}` : "Locked"}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block w-full h-full">
      {content}
    </Link>
  ) : content;
};

export default function AchievementsPage() {
  const { user: contextUser } = useContext(DashboardContext) || {};
  
  const { data: userProfile, error: userError } = useSWR(contextUser ? "/user/profile" : null, fetcher);
  const { data: craftsmanProfile, error: craftsmanError } = useSWR(contextUser ? "/craftsman/profile" : null, fetcher);
  const { data: xpHistoryData, isLoading: xpLoading } = useSWR(contextUser ? "/user/xp-history" : null, fetcher);
  const xpTransactions = Array.isArray(xpHistoryData) ? xpHistoryData : [];
  const { data: achievementsData, error: achievementsError } = useSWR(contextUser ? "/user/achievements" : null, fetcher);
  if (!contextUser) {
    return <AuthRequired />;
  }

  const isLoading = !userProfile && !userError;

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const user = userProfile;
  const craftsman = craftsmanProfile;
  const stats = [
    { label: "Total XP", value: achievementsData?.totalXP || 0, icon: Zap, color: "text-blue-500" },
    { label: "Points", value: user?.gamification?.points || 0, icon: Award, color: "text-amber-500" },
    { label: "Level", value: achievementsData?.level || 1, icon: Target, color: "text-indigo-500" },
    { label: "Streak", value: user?.gamification?.streak?.current || 0, icon: Flame, color: "text-orange-500" },
    { label: "Views", value: craftsman?.totalViews || 0, icon: Eye, color: "text-emerald-500" },
    { label: "Likes", value: craftsman?.totalLikes || 0, icon: Heart, color: "text-rose-500" },
    { label: "Followers", value: user?.followers?.length || 0, icon: Users, color: "text-purple-500" },
    { label: "Tokens", value: user?.walletBalance || 0, icon: Star, color: "text-yellow-500" },
  ].filter(s => s.value > 0 || ["Total XP", "Level"].includes(s.label));

  // Combine static achievements with real status
  const badges = [
    {
      icon: ShieldCheck,
      title: "Verified Craftsman",
      description: "Successfully verified your professional identity.",
      date: new Date(user?.createdAt).toLocaleDateString(),
      color: "bg-emerald-500 shadow-emerald-500/20",
      isUnlocked: user?.isVerified,
      href: "/verify"
    },
    {
      icon: Award,
      title: "Challenge Winner",
      description: "Won a community challenge with distinction.",
      date: "Recent",
      color: "bg-amber-500 shadow-amber-500/20",
      isUnlocked: user?.gamification?.completedChallenges?.length > 0,
      href: "/challenges"
    },
    {
      icon: Zap,
      title: "Fastest Coder",
      description: "Submitted a solution within the first 24 hours.",
      date: "Milestone",
      color: "bg-blue-500 shadow-blue-500/20",
      isUnlocked: user?.gamification?.xp > 500,
      href: "/challenges"
    },
    {
      icon: Star,
      title: "Elite Status",
      description: "Reached level 10 through consistent contribution.",
      date: "Rank Up",
      color: "bg-indigo-500 shadow-indigo-500/20",
      isUnlocked: user?.gamification?.level >= 10
    }
  ];
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const searchQuery = searchParams?.get("q")?.toLowerCase() || "";
  const displayedBadges = searchQuery 
    ? badges.filter(b => b.title.toLowerCase().includes(searchQuery) || b.description.toLowerCase().includes(searchQuery))
    : badges;


  return (
    <div className="max-w-6xl mx-auto pb-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Achievements</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm border border-slate-200/50 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Real Achievements List */}
      {achievementsData?.achievements && (
        <div className="mb-16">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
             <Trophy size={20} className="text-amber-500" /> Milestone Progression
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementsData.achievements.map((ach) => (
                <div key={ach.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ach.completed ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20" : "bg-slate-100 text-slate-400 dark:bg-white/10"}`}>
                        {ach.completed ? <ShieldCheck size={20} /> : <Target size={20} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ach.label}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{ach.xp} Reward</p>
                      </div>
                   </div>
                   <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${ach.completed ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}>
                      {ach.completed ? "Completed" : "In Progress"}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Badges Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Professional Badges"}
          </h2>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
            {displayedBadges.filter(b => b.isUnlocked).length} / {displayedBadges.length} Unlocked
          </span>
        </div>
        
        {displayedBadges.length === 0 ? (
          <div className="text-center py-12 bg-white/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
             <p className="text-sm font-bold text-slate-500">No badges match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedBadges.map((badge, i) => (
              <AchievementCard key={i} {...badge} />
            ))}
          </div>
        )}
      </div>

      {/* XP Activity Ledger */}
      <div className="mt-16 mb-8">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
           <History size={14} /> Activity Ledger
        </h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm overflow-y-auto max-h-[450px]">
           {xpLoading ? (
              <div className="h-60 flex items-center justify-center">
                 <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
           ) : xpTransactions.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center p-8 opacity-40">
                 <History size={32} className="text-slate-300 mb-2" />
                 <p className="text-xs font-bold uppercase tracking-widest">No activity recorded</p>
              </div>
           ) : (
              <div className="divide-y divide-slate-50 dark:divide-white/5">
                 {xpTransactions.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all group">
                       <div className="flex items-center gap-5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
                             <ArrowUpRight size={16} />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                               {tx.source === 'daily_checkin' ? 'Daily Login' : tx.source?.replace(/_/g, ' ')}
                             </h4>
                             <p className="text-xs text-slate-500 font-medium mt-0.5">{tx.description}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-bold text-emerald-500">+{tx.xpAmount}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                             {new Date(tx.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
      </div>

      {/* Empty State / Encouragement */}
      {!user?.isVerified && (
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-center text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <Award className="w-12 h-12 text-white/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Unlock Your Full Potential</h3>
          <p className="text-blue-100 text-sm max-w-md mx-auto mb-6 font-medium">Verify your identity to earn the <span className="font-bold text-white">Verified Craftsman</span> badge and unlock higher payout limits.</p>
          <a href="/verify" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
            Start Verification <TrendingUp size={16} />
          </a>
        </div>
      )}
    </div>
  );
}

