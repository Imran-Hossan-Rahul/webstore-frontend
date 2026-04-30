"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ClassicExploreCard from "../cards/ClassicExploreCard";
import ViewToolbar from "../ViewToolbar";
import { DashboardContext } from "../../../app/(dashboard)/layout";

export default function TemplatesFeed({ searchQuery }) {
  const { isGuest, requireAuth } = useContext(DashboardContext) || { isGuest: true };
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [viewMode, setViewMode] = useState('list');
  const [gridCols, setGridCols] = useState(3);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchTemplates = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.get(`${API_URL}/template`, { params: { page: 1, limit: 50 }, withCredentials: true });
            
            if (res.data && (res.data.success || res.data.data)) {
                 const data = res.data.data || res.data.templates || [];
                 setTemplates(data);
            }
        } catch (e) {
            console.error("Templates fetch failed", e);
        } finally {
            setLoading(false);
        }
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(t => {
      const matchesSearch = searchQuery 
        ? t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      const matchesCategory = activeCategory === "All" 
        ? true 
        : t.category?.includes(activeCategory) || t.category === activeCategory;

      return matchesSearch && matchesCategory;
  });

  // Dynamically collect all unique categories from the loaded templates
  const categories = ["All", ...Array.from(new Set(templates.map(t => t.category).filter(Boolean)))];

  return (
    <div className="w-full max-w-6xl pb-20 animate-in fade-in duration-500">
        
        <ViewToolbar 
            viewMode={viewMode}
            setViewMode={setViewMode}
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
        />

        {loading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 animate-pulse">
                        <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2 w-1/2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                    </div>
                ))}
            </div>
        ) : filteredTemplates.length > 0 ? (
            
            viewMode === 'grid' ? (
                <div className={`grid gap-6 ${
                    gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    gridCols === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                }`}>
                    {filteredTemplates.map(t => (
                        <ClassicExploreCard 
                            key={t._id} 
                            item={{...t, type: 'template'}} 
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col border border-gray-100 dark:border-white/10 rounded-3xl overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-sm">
                     {filteredTemplates.map((t) => (
                         <div key={t._id} className="w-full">
                              <ClassicExploreCard item={{...t, type: 'template'}} viewMode={viewMode} />
                         </div>
                     ))}
                </div>
            )

        ) : (
            <div className="text-center py-20 bg-white/50 dark:bg-black/20 rounded-3xl border border-gray-100 dark:border-white/5">
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No templates found.</p>
            </div>
        )}

    </div>
  );
}
