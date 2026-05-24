"use client";
import React, { useState, useEffect, useContext } from "react";
import { api } from "@/utils/api";
import ClassicExploreCard from "./cards/ClassicExploreCard";
import ViewToolbar from "./ViewToolbar";
import { DashboardContext } from "../../app/(dashboard)/layout";

export default function CodexPage() {
  const { isGuest, requireAuth, user } = useContext(DashboardContext) || { isGuest: true };
  const [codex, setCodex] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [viewMode, setViewMode] = useState('list');
  const [gridCols, setGridCols] = useState(3);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchCodex();
  }, []);

  const fetchCodex = async () => {
    try {
      setLoading(true);
      const response = await api.get("/codex?limit=100");
      if (response.codex) {
        setCodex(response.codex);
      }
    } catch (error) {
      console.error("Failed to fetch codex:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCodex = codex.filter(b => {
      if (activeCategory === "All") return true;
      if (activeCategory === "My Codex") {
          return user && (b.author?._id === user._id || b.author === user._id);
      }
      return b.category === activeCategory;
  });

  // Dynamically collect all unique categories from the loaded codex
  const categories = ["All", ...(user ? ["My Codex"] : []), ...Array.from(new Set(codex.map(b => b.category).filter(Boolean)))];

  return (
    <div className="w-full max-w-6xl pb-20 animate-in fade-in duration-500">
      
      <ViewToolbar 
          viewMode={viewMode}
          setViewMode={setViewMode}
          gridCols={gridCols}
          setGridCols={setGridCols}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
      />

      {loading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-lg p-6 animate-pulse"
            >
              <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg mb-4" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredCodex.length > 0 ? (
          
          viewMode === 'grid' ? (
              <div className={`grid gap-6 ${
                  Number(gridCols) === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                  Number(gridCols) === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
              }`}>
                {filteredCodex.map((codex) => (
                  <ClassicExploreCard key={codex._id} item={{...codex, type: 'codex'}} gridCols={gridCols} />
                ))}
              </div>
          ) : (
              <div className="flex flex-col border border-slate-100 dark:border-white/10 rounded-lg overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-sm">
                   {filteredCodex.map((codex) => (
                       <div key={codex._id} className="w-full">
                            <ClassicExploreCard item={{...codex, type: 'codex'}} viewMode={viewMode} />
                       </div>
                   ))}
              </div>
          )
          
      ) : (
        <div className="text-center py-20 bg-white/50 dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5">
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            No codex found for this category.
          </p>
        </div>
      )}
    </div>
  );
}


