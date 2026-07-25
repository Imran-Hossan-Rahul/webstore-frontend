"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, TrendingUp, Star, Layout, Tag, ArrowRight, Eye, Download, Sparkles, Zap, Package, ChevronRight } from "lucide-react";
import { api } from "@/utils/api";

export default function ArtifactsListSidebar() {
  const [trendingArtifacts, setTrendingArtifacts]   = useState([]);
  const [popularArtifacts, setPopularArtifacts]     = useState([]);
  const [categories, setCategories]                 = useState([]);
  const [trendingTags, setTrendingTags]             = useState([]);
  const [trendingLoading, setTrendingLoading]       = useState(true);
  const [popularLoading, setPopularLoading]         = useState(true);
  const [catLoading, setCatLoading]                 = useState(true);
  const [tagsLoading, setTagsLoading]               = useState(true);

  useEffect(() => {
    fetchTrending();
    fetchPopular();
    fetchCategories();
    fetchTags();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await api.get("/artifact/featured/trending?limit=3");
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTrendingArtifacts(res.data.slice(0, 3));
      }
    } catch (e) {
      console.error("Failed to fetch trending artifacts:", e);
    } finally {
      setTrendingLoading(false);
    }
  };

  const fetchPopular = async () => {
    try {
      const res = await api.get("/artifact/featured/popular?limit=4");
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPopularArtifacts(res.data.slice(0, 4));
      }
    } catch (e) {
      console.error("Failed to fetch popular artifacts:", e);
    } finally {
      setPopularLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/artifact/popular-categories?limit=8");
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch artifact categories:", e);
    } finally {
      setCatLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await api.get("/artifact/trending-tags?limit=8");
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTrendingTags(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch artifact tags:", e);
    } finally {
      setTagsLoading(false);
    }
  };

  // Category icon mapping
  const getCategoryIcon = (cat) => {
    const map = {
      "UI": "🎨", "Site Artifacts": "🌐", "eCommerce": "🛒",
      "Admin Dashboard": "📊", "Animation": "✨", "Codexging": "💻",
      "Marketing": "📣", "Mobile Ui": "📱", "Components": "🧩", "Other": "📦"
    };
    return map[cat] || "📦";
  };

  return (
    <aside className="flex flex-col gap-6 pb-32">

      {/* ── Trending Right Now ── */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Flame className="text-orange-500" size={16} />
            Trending Now
          </h3>
          <Link
            href="/artifacts?sort=trending"
            className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {trendingLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-14 h-10 rounded-lg bg-slate-100 dark:bg-white/5 shrink-0" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-4/5" />
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : trendingArtifacts.length > 0 ? (
            trendingArtifacts.map((artifact, idx) => (
              <Link
                key={artifact._id}
                href={`/artifacts/${artifact._id}`}
                className="flex gap-3 group"
              >
                {/* Thumbnail */}
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 shrink-0 relative">
                  {artifact.previewFile ? (
                    <img
                      src={artifact.previewFile}
                      alt={artifact.title}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Layout size={18} />
                    </div>
                  )}
                  {/* Rank badge */}
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center text-white text-[9px] font-black">
                    {idx + 1}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 leading-tight">
                    {artifact.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                      <Eye size={9} /> {artifact.viewsCount || 0}
                    </span>
                    <span className="text-[10px] text-pink-500 font-semibold flex items-center gap-0.5">
                      <Star size={9} fill="currentColor" /> {artifact.likeCount || 0}
                    </span>
                    {artifact.priceType === "free" ? (
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Free</span>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full">{artifact.price} TKNS</span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">No trending artifacts yet</p>
          )}
        </div>
      </section>

      {/* ── Most Popular ── */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Star className="text-amber-500" size={16} />
            Most Popular
          </h3>
          <Link
            href="/artifacts?sort=popular"
            className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {popularLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded w-3/4" />
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : popularArtifacts.length > 0 ? (
            popularArtifacts.map((artifact) => (
              <Link
                key={artifact._id}
                href={`/artifacts/${artifact._id}`}
                className="flex items-center gap-3 group border-b border-slate-100 dark:border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 shrink-0">
                  {artifact.previewFile ? (
                    <img src={getOptimizedUrl(artifact.previewFile)} alt={artifact.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Package size={14} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {artifact.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Download size={9} /> {artifact.downloadsCount || 0}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-400 capitalize">{artifact.category}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">No popular artifacts yet</p>
          )}
        </div>
      </section>

      {/* ── Browse by Category ── */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 text-sm">
          <Layout className="text-indigo-500" size={16} />
          Browse by Category
        </h3>

        <div className="space-y-1">
          {catLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
            ))
          ) : categories.length > 0 ? (
            categories.map((cat, idx) => (
              <Link
                key={cat.category || `cat-${idx}`}
                href={`/artifacts?category=${encodeURIComponent(cat.category || cat)}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 group transition-all"
              >
                <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <span className="text-sm">{getCategoryIcon(cat.category || cat)}</span>
                  {cat.category || cat}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  {cat.artifactCount !== undefined && <span>{cat.artifactCount}</span>}
                  <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-opacity" />
                </span>
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">No categories found</p>
          )}
        </div>
      </section>

      {/* ── Trending Tags ── */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 text-sm">
          <Tag className="text-purple-500" size={16} />
          Trending Tags
        </h3>

        <div className="flex flex-wrap gap-2">
          {tagsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-7 w-20 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
            ))
          ) : trendingTags.length > 0 ? (
            trendingTags.map((tag, idx) => {
              const tagName = tag.name || tag.tag || tag;
              return (
                <Link
                  key={tagName + idx}
                  href={`/artifacts?tag=${encodeURIComponent(tagName)}`}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all"
                >
                  #{tagName}
                </Link>
              );
            })
          ) : (
            <span className="text-xs text-slate-400 italic">No trending tags yet</span>
          )}
        </div>
      </section>

      {/* ── Upload CTA ── */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-14 -mt-14 group-hover:opacity-80 transition-opacity duration-700" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-yellow-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">For Craftsmen</span>
          </div>
          <h3 className="font-bold text-lg mb-2 leading-tight">Share Your Artifacts</h3>
          <p className="text-indigo-100 text-[11px] mb-4 leading-relaxed">
            Publish your UI components, templates & tools. Earn tokens from downloads.
          </p>
          <Link
            href="/upload-artifact"
            className="inline-flex items-center gap-2 text-xs font-bold bg-white text-indigo-600 px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Zap size={13} /> Upload Artifact
          </Link>
        </div>
      </div>

    </aside>
  );
}


