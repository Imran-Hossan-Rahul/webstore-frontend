"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, TrendingUp, BookOpen, ArrowRight, FileText } from "lucide-react";
import { api } from "@/utils/api";
import Image from "next/image";
import CraftsmanHoverCard from "../cards/CraftsmanHoverCard";

export default function DevlogsListSidebar() {
  const [featuredCraftsmen, setFeaturedCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [topDevlogs, setTopDevlogs] = useState([]);
  const [devlogsLoading, setDevlogsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCraftsman();
    fetchTrendingTags();
    fetchTopDevlogs();
  }, []);

  const fetchFeaturedCraftsman = async () => {
    try {
      const response = await api.get("/user/featured-craftsmen?limit=3");
      if (response.success) setFeaturedCraftsmen(response.data);
    } catch (error) {
      console.error("Failed to fetch featured craftsmen:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingTags = async () => {
    try {
      const response = await api.get("/feed/trending-tags?limit=6");
      if (response.success && response.data.length > 0) {
        setTrendingTags(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch trending tags:", error);
    } finally {
      setTagsLoading(false);
    }
  };

  const fetchTopDevlogs = async () => {
    try {
      const response = await api.get("/posts?limit=5&type=devlog");
      // API returns { success, data: [...] } directly
      const posts = response.data || response.posts || [];
      if (Array.isArray(posts) && posts.length > 0) {
        setTopDevlogs(posts.slice(0, 4));
      }
    } catch (error) {
      console.error("Failed to fetch top devlogs:", error);
    } finally {
      setDevlogsLoading(false);
    }
  };

  return (
    <aside className="flex flex-col gap-8 pb-32">
      {/* Featured Devloggers */}
      <section className="bg-brand-surface/60 dark:bg-slate-900/40 backdrop-blur-xl border border-brand-navy/[0.08] dark:border-white/10 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="text-brand-amber" size={18} /> Top Devloggers
          </h3>
          <Link href="/search?view=craftsmen" className="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:underline">View All</Link>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-brand-surface/5" />
                <div className="space-y-1">
                  <div className="w-24 h-3 bg-slate-100 dark:bg-brand-surface/5 rounded" />
                  <div className="w-16 h-2 bg-slate-100 dark:bg-brand-surface/5 rounded" />
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-5">
            {featuredCraftsmen.map((craftsman, idx) => (
              <CraftsmanHoverCard
                key={craftsman._id || `craftsman-${idx}`}
                userId={craftsman._id}
                username={craftsman.username}
                avatarUrl={craftsman.avatar}
                specialty={craftsman.specialty}
                level={craftsman.level}
                isPro={craftsman.isPro}
                totalCodex={craftsman.totalCodex}
                totalArtifacts={craftsman.totalArtifacts}
                totalLikes={craftsman.totalLikes}
                totalViews={craftsman.totalViews}
                bio={craftsman.bio}
              >
                <Link 
                  href={`/u/${craftsman.username}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors shrink-0">
                    <Image
                      src={craftsman.avatar || "/placeholder.png"}
                      alt={craftsman.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white transition-colors leading-tight">{craftsman.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Level {craftsman.gamification?.level || 1} Craftsman</p>
                    <div className="flex items-center gap-2 mt-1">
                      {craftsman.totalLikes > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-pink-500 font-semibold">
                          <Star size={9} fill="currentColor" /> {craftsman.totalLikes}
                        </span>
                      )}
                      {craftsman.postCount > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
                          <FileText size={9} /> {craftsman.postCount} devlog{craftsman.postCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </CraftsmanHoverCard>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Popular Devlogs */}
      <section className="bg-brand-surface/60 dark:bg-slate-900/40 backdrop-blur-xl border border-brand-navy/[0.08] dark:border-white/10 rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="text-pink-500" size={18} /> Popular Devlogs
        </h3>
        
        <div className="space-y-4">
          {devlogsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse mb-4">
                 <div className="h-3 w-full bg-slate-100 dark:bg-brand-surface/5 rounded"></div>
                 <div className="h-3 w-2/3 bg-slate-100 dark:bg-brand-surface/5 rounded"></div>
              </div>
            ))
          ) : topDevlogs.length > 0 ? (
             topDevlogs.map((devlog) => {
                const textContent = devlog.content ? devlog.content.replace(/<[^>]*>?/gm, '') : 'Untitled Devlog';
                return (
                  <Link href={`/post/${devlog._id}`} key={devlog._id} className="block group border-b border-slate-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold text-brand-slate dark:text-slate-300 group-hover:text-brand-blue dark:group-hover:text-indigo-400 line-clamp-2 leading-relaxed transition-colors">
                        {textContent.length > 80 ? textContent.slice(0, 80) + '...' : textContent || 'No Content'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                            {devlog.user?.avatar || devlog.author?.avatar ? (
                                <Image src={devlog.user?.avatar || devlog.author?.avatar} width={14} height={14} className="rounded-full object-cover w-3.5 h-3.5" alt="" />
                            ) : (
                                <div className="w-3.5 h-3.5 bg-slate-200 dark:bg-brand-surface/10 rounded-full" />
                            )}
                            {devlog.user?.username || devlog.author?.username || 'user'}
                        </span>
                        {devlog.views > 0 && <span className="text-[10px] text-slate-400 font-medium">• {devlog.views} views</span>}
                    </div>
                  </Link>
                );
             })
          ) : (
            <p className="text-xs text-slate-400 italic">No popular devlogs found</p>
          )}
        </div>
      </section>

      {/* Trending Devlog Tags */}
      <section className="bg-brand-surface/60 dark:bg-slate-900/40 backdrop-blur-xl border border-brand-navy/[0.08] dark:border-white/10 rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-brand-blue" size={18} /> Trending Tags
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {tagsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-7 w-20 bg-slate-100 dark:bg-brand-surface/5 rounded-full animate-pulse" />
            ))
          ) : trendingTags.length > 0 ? (
            trendingTags.map((t, idx) => {
              const tagName = t.name || t.tag || 'unknown';
              return (
                <Link 
                  key={tagName + idx} 
                  href={`/shop?q=${tagName}`}
                  className="px-3 py-1.5 bg-brand-cloud dark:bg-brand-surface/5 border border-slate-100 dark:border-white/10 rounded-full text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:bg-brand-blue hover:text-white dark:hover:bg-brand-surface dark:hover:text-slate-900 dark:text-white transition-all"
                >
                  #{tagName}
                </Link>
              );
            })
          ) : (
            <span className="text-xs text-slate-400 italic">No trending tags found</span>
          )}
        </div>
      </section>

      {/* Community CTA */}
      <div className="bg-pink-600 rounded-lg p-6 text-white shadow-sm shadow-pink-500/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-24 h-24 bg-brand-surface/10 rounded-full -mr-12 -mt-12 group-hover:opacity-80 transition-opacity duration-700" />
         <h3 className="font-bold text-lg mb-2 relative z-10">Share Your Journey</h3>
         <p className="text-pink-100 text-[11px] mb-4 leading-relaxed relative z-10">
           Document your creative process, share insights, and connect with other developers.
         </p>
         <Link href="/devlogs" className="inline-flex items-center gap-2 text-xs font-bold bg-brand-surface text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors relative z-10">
           Write a Devlog <ArrowRight size={14} />
         </Link>
      </div>
    </aside>
  );
}
