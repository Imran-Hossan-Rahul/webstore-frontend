"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React from "react";
import useSWR from "swr";
import { api } from "@/utils/api";
import { Trophy, TrendingUp, Zap, Star, User as UserIcon, Award, Heart, Eye } from "lucide-react";
import Image from "next/image";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function AchievementsSidebar() {
  const { data: achievements } = useSWR("/user/achievements", fetcher);
  const { data: leaderboard } = useSWR("/user/leaderboard", fetcher);

  const nextLevelXP = (achievements?.level || 1) * 1000;
  const currentXP = achievements?.totalXP || 0;
  const progress = Math.min((currentXP / nextLevelXP) * 100, 100);

  return (
    <aside className="space-y-6 pb-10">
      {/* Level Progress */}
      <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> Next Level
          </h3>
          <span className="text-[10px] font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
            LVL {(achievements?.level || 1) + 1}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-xl font-bold text-slate-900 dark:text-white">{currentXP} <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">XP</span></span>
            <span className="text-[11px] font-bold text-slate-400">{nextLevelXP} XP Target</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Earn {nextLevelXP - currentXP} more XP to reach Level {(achievements?.level || 1) + 1}
          </p>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Trophy size={14} className="text-indigo-600" /> Top Performers
        </h3>
        
        <div className="space-y-4">
          {leaderboard?.slice(0, 5).map((user, i) => (
            <div key={user._id} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/5">
                  {user.profilePicture ? (
                    <img src={getOptimizedUrl(user.profilePicture)} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <UserIcon size={14} className="text-slate-400" />
                  )}
                </div>
                {i === 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    <Star size={8} className="text-white fill-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">{user.gamification?.xp || 0} XP</span>
                  <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">LVL {user.gamification?.level || 1}</span>
                </div>
              </div>
              <div className={`text-xs font-bold ${i === 0 ? "text-amber-500" : "text-slate-400"}`}>
                #{i + 1}
              </div>
            </div>
          ))}
          
          {!leaderboard?.length && (
             <div className="text-center py-4">
                <p className="text-[11px] text-slate-500 font-medium">Be the first to climb the leaderboard!</p>
             </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
        <h3 className="font-bold text-sm mb-4 relative z-10 flex items-center gap-2 text-slate-900 dark:text-white">
          <Award size={16} /> Earn More XP
        </h3>
        <ul className="space-y-3 relative z-10">
          <li className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0 mt-0.5">
              <Zap size={10} />
            </div>
            <div>
              <span className="block text-[12px] font-bold text-slate-900 dark:text-white">Daily Login (Check-in)</span>
              <span className="text-[10px] text-slate-500 font-medium">Log in every day for +50 XP / +0.5 Token</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0 mt-0.5">
              <Star size={10} />
            </div>
            <div>
              <span className="block text-[12px] font-bold text-slate-900 dark:text-white">Publish Codex</span>
              <span className="text-[10px] text-slate-500 font-medium">+200 XP</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0 mt-0.5">
              <Eye size={10} />
            </div>
            <div>
              <span className="block text-[12px] font-bold text-slate-900 dark:text-white">100+ Codex Reads</span>
              <span className="text-[10px] text-slate-500 font-medium">+1 Token per 100 views</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg shrink-0 mt-0.5">
              <Award size={10} />
            </div>
            <div>
              <span className="block text-[12px] font-bold text-slate-900 dark:text-white">Launch Devlog</span>
              <span className="text-[10px] text-slate-500 font-medium">+300 XP / +1 Token</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
              <UserIcon size={10} />
            </div>
            <div>
              <span className="block text-[12px] font-bold text-slate-900 dark:text-white">Verify Identity</span>
              <span className="text-[10px] text-slate-500 font-medium">+1000 XP / +5 Tokens</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center shrink-0">
              <Heart size={10} />
            </div>
            <div>
              <span className="block text-[12px] font-bold text-slate-900 dark:text-white">Community Engagement</span>
              <span className="text-[10px] text-slate-500 font-medium">+10 XP per Like, +20 XP per Comment</span>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );
}

