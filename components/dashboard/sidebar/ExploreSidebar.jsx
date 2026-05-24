"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, TrendingUp, Compass, Award, Tag, Map, Sparkles, ArrowRight } from "lucide-react";
import { api } from "@/utils/api";

export default function ExploreSidebar() {
  const [featuredCraftsmen, setFeaturedCraftsmen] = useState([]);
  const [craftsmenLoading, setCraftsmenLoading] = useState(true);

  const [trendingTags, setTrendingTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  const [artifactCategories, setArtifactCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCraftsmen();
    fetchTrendingTags();
    fetchCategories();
  }, []);

  const fetchFeaturedCraftsmen = async () => {
    try {
      const res = await api.get("/user/featured-craftsmen?limit=4");
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setFeaturedCraftsmen(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch featured craftsmen", e);
    } finally {
      setCraftsmenLoading(false);
    }
  };

  const fetchTrendingTags = async () => {
    try {
      const res = await api.get("/feed/trending-tags?limit=6");
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTrendingTags(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch trending tags", e);
    } finally {
      setTagsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/feed/popular-categories?limit=5");
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setArtifactCategories(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch artifact categories", e);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const formatTag = (tag) => {
    const tagName = tag?.name || tag?.tag || tag || "";
    return typeof tagName === 'string' ? tagName.replace(/\b\w/g, (c) => c.toUpperCase()) : "";
  };

  const defaultSearchQuery = trendingTags.length > 0 ? formatTag(trendingTags[0]) : "explore";

  return (
    <aside className="flex flex-col gap-6 pb-32">
      
      {/* ── Elite Craftsmen ── */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Award className="text-amber-500" size={16} /> Elite Craftsmen
          </h3>
          <Link href="/search?view=craftsmen" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {craftsmenLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
                  <div className="h-2 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : featuredCraftsmen.length > 0 ? (
            featuredCraftsmen.map((craftsman) => (
              <Link
                key={craftsman._id}
                href={`/u/${craftsman.username}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                  <img
                    src={craftsman.profilePicture || craftsman.profile_img || "/default-avatar.png"}
                    alt={craftsman.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => { e.target.src = "/default-avatar.png"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {craftsman.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                    <Star size={10} className="text-amber-400" fill="currentColor" />
                    Level {craftsman.gamification?.level || 1} Craftsman
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">No craftsmen found</p>
          )}
        </div>
      </section>

      {/* ── Trending Across Platforms ── */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
          <TrendingUp className="text-emerald-500" size={16} />
          Trending Topics
        </h3>

        <div className="flex flex-wrap gap-2">
          {tagsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-7 w-20 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
            ))
          ) : trendingTags.length > 0 ? (
            trendingTags.map((tag, idx) => {
              const tagName = formatTag(tag);
              return (
                <Link
                  key={tagName + idx}
                  href={`/search?q=${encodeURIComponent('#' + tagName)}`}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white hover:border-transparent transition-all"
                >
                  #{tagName}
                </Link>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 italic">No trending topics</p>
          )}
        </div>
      </section>

      {/* ── Popular Categories ── */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
          <Map className="text-blue-500" size={16} />
          Popular Categories
        </h3>

        <div className="space-y-1">
          {categoriesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
            ))
          ) : artifactCategories.length > 0 ? (
            artifactCategories.map((cat, idx) => (
              <Link
                key={cat.category || `cat-${idx}`}
                href={`/search?q=${encodeURIComponent('category:"' + (cat.category || cat) + '"')}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 group transition-all"
              >
                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.category || cat}
                </span>
                {cat.artifactCount !== undefined && (
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-500/20 dark:group-hover:text-blue-400">
                    {cat.artifactCount}
                  </span>
                )}
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">No categories found</p>
          )}
        </div>
      </section>

      {/* ── Discover CTA ── */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group border border-slate-800">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -ml-12 -mb-12 group-hover:bg-blue-500/20 transition-colors duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Compass size={16} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Navigate The Web</span>
          </div>
          <h3 className="font-bold text-lg mb-2 leading-tight">Find Inspiration</h3>
          <p className="text-slate-300 text-[11px] mb-4 leading-relaxed">
            Explore thousands of devlogs, high quality UI artifacts, and codex from elite developers worldwide.
          </p>
          <Link
            href={`/search?q=${encodeURIComponent(defaultSearchQuery)}`}
            className="inline-flex items-center gap-2 text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2.5 rounded-lg hover:bg-white hover:text-slate-900 transition-all shadow-lg"
          >
            <Sparkles size={13} /> Advanced Search
          </Link>
        </div>
      </div>

    </aside>
  );
}
