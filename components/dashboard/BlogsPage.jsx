"use client";
import React, { useState, useEffect, useContext } from "react";
import { api } from "@/utils/api";
import ClassicExploreCard from "./cards/ClassicExploreCard";
import ViewToolbar from "./ViewToolbar";
import { DashboardContext } from "../../app/(dashboard)/layout";

export default function BlogsPage() {
  const { isGuest, requireAuth } = useContext(DashboardContext) || { isGuest: true };
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [viewMode, setViewMode] = useState('list');
  const [gridCols, setGridCols] = useState(3);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const academyUrl = process.env.NEXT_PUBLIC_ACADEMY_URL || "https://academy.codalina.com";
      
      let rawBlogs = [];
      // 1. Fetch directly from Codalina Academy live API
      try {
        const academyRes = await fetch(`${academyUrl}/api/blogs?status=published&limit=100`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (academyRes.ok) {
          const json = await academyRes.json();
          rawBlogs = json.data || json.blogs || [];
        }
      } catch (err) {
        console.warn("Could not reach Academy API, attempting local fallback:", err);
      }

      // 2. Fallback to local backend API if Academy API is offline
      if (!rawBlogs || rawBlogs.length === 0) {
        try {
          const response = await api.get("/blogs?limit=100&lang=en");
          rawBlogs = response.data || response.blogs || [];
        } catch (e) {}
      }
      
      // Map multilingual data to what the UI expects
      const mappedBlogs = rawBlogs.map(b => ({
        ...b,
        type: "blog",
        title: b.en?.title || b.bn?.title || b.title,
        excerpt: b.en?.excerpt || b.bn?.excerpt || b.excerpt || b.en?.content || "",
        content: b.en?.content || b.bn?.content || b.content || "",
        category: b.category || "Engineering",
        isAcademy: true,
        academyUrl: `${academyUrl}/blog/${b.slug}`,
      }));
      
      setBlogs(mappedBlogs);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(b => {
      if (activeCategory === "All") return true;
      return b.category === activeCategory;
  });

  // Dynamically collect all unique categories from the loaded blogs
  const categories = ["All", ...Array.from(new Set(blogs.map(b => b.category).filter(Boolean)))];

  return (
    <div className="w-full max-w-6xl pt-8 pb-20 animate-in fade-in duration-500">
      
      {/* Academy Insights Header Banner */}
      <div className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#DCE3EA]/40 via-white/80 to-[#E6EBF0]/40 dark:from-white/5 dark:via-black/30 dark:to-white/5 border border-[rgba(17,20,24,0.18)] dark:border-white/10 backdrop-blur-xl shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#111418]/5 text-[#111418] dark:text-white border border-[rgba(17,20,24,0.18)] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#0E7C86] animate-pulse" />
              Codalina Academy Engineering Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              Engineering Insights & Technical Guides
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              In-depth architectural articles, system design tutorials, and developer guides powered by Codalina's software engineering team.
            </p>
          </div>
          <a
            href={process.env.NEXT_PUBLIC_ACADEMY_URL || "https://academy.codalina.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-2xl bg-[#111418] hover:bg-[#2B3038] active:bg-[#000000] text-white text-xs md:text-sm font-semibold shadow-md shadow-[rgba(17,20,24,0.20)] transition-all flex items-center gap-2 active:scale-95"
          >
            <span>Visit Full Academy</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      <ViewToolbar 
          viewMode={viewMode}
          setViewMode={setViewMode}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
      />

      {loading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 animate-pulse"
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredBlogs.length > 0 ? (
          
          viewMode === 'grid' ? (
              <div className={`grid gap-6 ${
                  gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' :
                  gridCols === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              }`}>
                {filteredBlogs.map((blog) => (
                  <ClassicExploreCard key={blog._id} item={{...blog, type: 'blog'}} />
                ))}
              </div>
          ) : (
              <div className="flex flex-col border border-gray-100 dark:border-white/10 rounded-3xl overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-sm">
                   {filteredBlogs.map((blog) => (
                       <div key={blog._id} className="w-full">
                            <ClassicExploreCard item={{...blog, type: 'blog'}} viewMode={viewMode} />
                       </div>
                   ))}
              </div>
          )
          
      ) : (
        <div className="text-center py-20 bg-white/50 dark:bg-black/20 rounded-3xl border border-gray-100 dark:border-white/5">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            No blogs found for this category.
          </p>
        </div>
      )}
    </div>
  );
}
