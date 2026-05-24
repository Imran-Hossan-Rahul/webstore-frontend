"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Tag, BookOpen, Clock, Star, Zap, ChevronRight, PenTool } from "lucide-react";
import { api } from "@/utils/api";

export default function CodexListSidebar() {
  const [popularTopics, setPopularTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  
  const [recentCodex, setRecentCodex] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
    fetchRecentCodex();
  }, []);

  const fetchTopics = async () => {
    try {
      setTopicsLoading(true);
      const res = await api.get("/codex/popular-topics?limit=8");
      if (res.success && Array.isArray(res.data)) {
        setPopularTopics(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch topics", e);
    } finally {
      setTopicsLoading(false);
    }
  };

  const fetchRecentCodex = async () => {
    try {
      setRecentLoading(true);
      const res = await api.get("/codex?limit=4");
      if (res.success && Array.isArray(res.codex)) {
        setRecentCodex(res.codex);
      }
    } catch (e) {
      console.error("Failed to fetch recent codex", e);
    } finally {
      setRecentLoading(false);
    }
  };

  const formatTag = (tag) => tag.replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <aside className="flex flex-col gap-6 pb-32">
      
      {/* ── Popular Topics ── */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
          <Tag className="text-indigo-500" size={16} /> Popular Topics
        </h3>

        {topicsLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
                <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-10" />
              </div>
            ))}
          </div>
        ) : popularTopics.length > 0 ? (
          <div className="flex flex-col gap-1">
            {popularTopics.map((item, idx) => (
              <Link
                key={item.tag || `tag-${idx}`}
                href={`/codex?tag=${encodeURIComponent(item.tag)}`}
                className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/70 dark:hover:bg-white/5 cursor-pointer group transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 dark:text-slate-600 w-4 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {formatTag(item.tag)}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full tabular-nums group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all">
                  {item.codexCount}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-2">No topics found</p>
        )}
      </section>

      {/* ── Recent Chronicles ── */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Clock className="text-amber-500" size={16} />
            Recent Codex
          </h3>
        </div>

        <div className="space-y-4">
          {recentLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-full" />
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : recentCodex.length > 0 ? (
            recentCodex.map((codex) => (
              <Link
                key={codex._id}
                href={`/codex/${codex.slug}`}
                className="flex gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-center text-slate-400">
                  {codex.coverImage ? (
                    <img src={codex.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <BookOpen size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                    {codex.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-medium">
                    <span className="capitalize">{codex.author?.name || "Anonymous"}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">No recent codex</p>
          )}
        </div>
      </section>

      {/* ── Start Writing CTA ── */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group border border-slate-800">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Share Knowledge</span>
          </div>
          <h3 className="font-bold text-lg mb-2 leading-tight">Write a Codex</h3>
          <p className="text-slate-300 text-[11px] mb-4 leading-relaxed">
            Document your coding journey, share tutorials, and build your reputation as an elite craftsman.
          </p>
          <Link
            href="/codex-editor"
            className="inline-flex items-center gap-2 text-xs font-bold bg-indigo-500 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
          >
            <PenTool size={13} /> Start Writing
          </Link>
        </div>
      </div>

    </aside>
  );
}
