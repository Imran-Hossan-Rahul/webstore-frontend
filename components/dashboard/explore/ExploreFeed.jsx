"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Sparkles, TrendingUp, Grid, Award, Heart, Eye, PenTool, Layout, Code } from "lucide-react";
import Link from "next/link";
import CreatorProfileModal from '../modals/CreatorProfileModal';

import ClassicExploreCard from '../cards/ClassicExploreCard';

export default function ExploreFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchMixedContent = async () => {
        try {
            setLoading(true);
            
            const [projectsRes, templatesRes, blogsRes] = await Promise.allSettled([
                api.get('/feed?type=projects&limit=20'),
                api.get('/template?limit=20'),
                api.get('/blog?limit=20')
            ]);

            let mixed = [];

            if (projectsRes.status === 'fulfilled') {
                const val = projectsRes.value;
                const data = val.data || val; 
                if (Array.isArray(data)) {
                    mixed = [...mixed, ...data.map(p => ({...p, type: 'project'}))];
                }
            }

            if (templatesRes.status === 'fulfilled') {
                 const val = templatesRes.value;
                 const data = val.templates || val.data || val;
                 if (Array.isArray(data)) {
                     mixed = [...mixed, ...data.map(t => ({...t, type: 'template'}))];
                 }
            }

            if (blogsRes.status === 'fulfilled') {
                const val = blogsRes.value;
                const data = val.blogs || val.data || val;
                if (Array.isArray(data)) {
                    mixed = [...mixed, ...data.map(b => ({...b, type: 'blog'}))];
                }
            }

            mixed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setItems(mixed);
        } catch (e) {
            console.error("Explore fetch failed", e);
        } finally {
            setLoading(false);
        }
    };
    fetchMixedContent();
  }, []);

  const tabs = [
      { id: "all", label: "All" },
      { id: "project", label: "Projects" },
      { id: "blog", label: "Blogs" },
      { id: "template", label: "Templates" },
  ];

  const filteredItems = React.useMemo(() => {
    return activeTab === "all" ? items : items.filter(item => item.type === activeTab);
  }, [items, activeTab]);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-gray-400 text-sm tracking-widest uppercase">Loading...</div>;

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
        
        <div className="mb-8">
            <div className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-800">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`pb-3 text-sm font-medium transition-all duration-200 relative ${
                              isActive 
                              ? "text-gray-900 dark:text-white" 
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                        >
                          {tab.label}
                          {isActive && (
                              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
                          )}
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
             {filteredItems.map((item, idx) => (
                 <ClassicExploreCard key={`${item.type}-${item._id || idx}`} item={item} />
             ))}
        </div>
        
        {filteredItems.length === 0 && (
             <div className="text-center py-20 text-gray-400 dark:text-gray-600">
                 No items found.
             </div>
        )}

    </div>
  );
}
