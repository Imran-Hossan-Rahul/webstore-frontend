"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ClassicExploreCard from "../cards/ClassicExploreCard";
import ViewToolbar from "../ViewToolbar";
import { DashboardContext } from "../../../app/(dashboard)/layout";

export default function ArtifactsFeed({ searchQuery }) {
  const { isGuest, requireAuth } = useContext(DashboardContext) || { isGuest: true };
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [viewMode, setViewMode] = useState('list');
  const [gridCols, setGridCols] = useState(3);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchArtifacts = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.get(`${API_URL}/artifact`, { params: { page: 1, limit: 50 }, withCredentials: true });
            
            if (res.data && (res.data.success || res.data.data)) {
                 const data = res.data.data || res.data.artifacts || [];
                 setArtifacts(data);
            }
        } catch (e) {
            console.error("Artifacts fetch failed", e);
        } finally {
            setLoading(false);
        }
    };
    fetchArtifacts();
  }, []);

  const filteredArtifacts = artifacts.filter(t => {
      const matchesSearch = searchQuery 
        ? t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      const matchesCategory = activeCategory === "All" 
        ? true 
        : t.category?.includes(activeCategory) || t.category === activeCategory;

      return matchesSearch && matchesCategory;
  });

  // Dynamically collect all unique categories from the loaded artifacts
  const categories = ["All", ...Array.from(new Set(artifacts.map(t => t.category).filter(Boolean)))];

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
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 animate-pulse">
                        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl mb-4" />
                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded mb-2 w-1/2" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                    </div>
                ))}
            </div>
        ) : filteredArtifacts.length > 0 ? (
            
            viewMode === 'grid' ? (
                <div className={`grid gap-6 ${
                  Number(gridCols) === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                  Number(gridCols) === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
              }`}>
                    {filteredArtifacts.map(t => (
                        <ClassicExploreCard 
                            key={t._id} 
                            item={{...t, type: 'artifact'}} 
                            gridCols={gridCols}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-sm">
                     {filteredArtifacts.map((t) => (
                         <div key={t._id} className="w-full">
                              <ClassicExploreCard item={{...t, type: 'artifact'}} viewMode={viewMode} />
                         </div>
                     ))}
                </div>
            )

        ) : (
            <div className="text-center py-20 bg-white/50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No artifacts found.</p>
            </div>
        )}

    </div>
  );
}

