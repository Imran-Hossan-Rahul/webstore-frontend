"use client";
import React, { useState, useEffect, useContext } from "react";
import { api } from "@/utils/api";
import ClassicExploreCard from "./cards/ClassicExploreCard";
import ViewToolbar from "./ViewToolbar";
import EmptyState from "../ui/EmptyState";
import { DashboardContext } from "../../app/(dashboard)/layout";

export default function DevlogsPage() {
  const { user, isGuest, requireAuth } = useContext(DashboardContext) || { isGuest: true, user: null };
  const [devlogs, setDevlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [viewMode, setViewMode] = useState('grid');
  const [gridCols, setGridCols] = useState(3);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchDevlogs();
  }, []);

  const fetchDevlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts?limit=100&type=devlog");
      if (response.data) {
        setDevlogs(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch devlogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevlogs = devlogs.filter(p => {
      if (activeCategory === "My Devlogs") {
          return user && (p.user?._id === user._id || p.author?._id === user._id || p.userId?._id === user._id || p.userId === user._id);
      }
      return activeCategory === "All" || p.category === activeCategory;
  });

  // Dynamically collect all unique categories from the loaded devlogs
  const baseCategories = Array.from(new Set(devlogs.map(p => p.category).filter(Boolean)));
  const categories = ["All"];
  if (!isGuest) categories.push("My Devlogs");
  categories.push(...baseCategories);

  return (
    <div className="w-full max-w-6xl pb-20 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between gap-6 mb-10 border-b border-slate-100 dark:border-white/10 pb-4">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-[var(--font-syne)] shrink-0">Devlogs Explore</h1>
          
          <ViewToolbar 
              viewMode={viewMode}
              setViewMode={setViewMode}
              gridCols={gridCols}
              setGridCols={setGridCols}
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              noBorder={true}
          />
      </div>

      {loading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 animate-pulse"
            >
              <div className="aspect-video bg-slate-100 dark:bg-white/5 rounded-xl mb-4" />
              <div className="h-6 bg-slate-100 dark:bg-white/5 rounded mb-2" />
              <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredDevlogs.length > 0 ? (
          
          viewMode === 'grid' ? (
              <div className={`grid gap-6 ${
                  Number(gridCols) === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                  Number(gridCols) === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
              }`}>
                {filteredDevlogs.map((devlog) => (
                  <ClassicExploreCard key={devlog._id} item={{...devlog, type: 'devlog'}} gridCols={gridCols} />
                ))}
              </div>
          ) : (
              <div className="flex flex-col border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-900/20 backdrop-blur-md shadow-sm divide-y divide-slate-100 dark:divide-white/5">
                   {filteredDevlogs.map((devlog) => (
                       <div key={devlog._id} className="w-full">
                            <ClassicExploreCard item={{...devlog, type: 'devlog'}} viewMode={viewMode} />
                       </div>
                   ))}
              </div>
          )
          
      ) : (
        <div className="py-20 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
           <EmptyState type="devlogs" />
        </div>
      )}
    </div>
  );
}

