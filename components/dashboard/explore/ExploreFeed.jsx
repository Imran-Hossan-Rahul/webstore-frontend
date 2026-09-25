"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { TrendingUp, Grid, Award, Eye, PenTool, Layout, Code, Star } from "lucide-react";
import Link from "next/link";
import CraftsmanProfileModal from '../modals/CraftsmanProfileModal';
import ClassicExploreCard from '../cards/ClassicExploreCard';
import Skeleton from "@/components/ui/Skeleton";

export default function ExploreFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchMixedContent = async () => {
        try {
            setLoading(true);
            
            const [devlogsRes, artifactsRes, codexRes] = await Promise.allSettled([
                api.get('/feed?type=devlogs&limit=20'),
                api.get('/artifact?limit=20'),
                api.get('/codex?limit=20')
            ]);

            let mixed = [];

            if (devlogsRes.status === 'fulfilled') {
                const val = devlogsRes.value;
                const data = val.data || val; 
                if (Array.isArray(data)) {
                    mixed = [...mixed, ...data.map(p => ({...p, type: 'devlog'}))];
                }
            }

            if (artifactsRes.status === 'fulfilled') {
                 const val = artifactsRes.value;
                 const data = val.artifacts || val.data || val;
                 if (Array.isArray(data)) {
                     mixed = [...mixed, ...data.map(t => ({...t, type: 'artifact'}))];
                 }
            }

            if (codexRes.status === 'fulfilled') {
                const val = codexRes.value;
                const data = val.codex || val.data || val;
                if (Array.isArray(data)) {
                    mixed = [...mixed, ...data.map(b => ({...b, type: 'codex'}))];
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
      { id: "devlog", label: "Devlogs" },
      { id: "codex", label: "Codex" },
      { id: "artifact", label: "Artifacts" },
  ];

  const filteredItems = React.useMemo(() => {
    return activeTab === "all" ? items : items.filter(item => item.type === activeTab);
  }, [items, activeTab]);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
        
        {/* Tabs Filter Bar (Stays visible & interactive even during load) */}
        <div className="mb-8">
            <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                          key={tab.id}
                          disabled={loading}
                          onClick={() => setActiveTab(tab.id)}
                          className={`pb-3 text-sm font-medium transition-all duration-200 relative ${
                              isActive 
                              ? "text-slate-900 dark:text-white" 
                              : "text-slate-500 dark:text-slate-400 hover:text-brand-slate dark:hover:text-slate-300 disabled:opacity-50"
                          }`}
                        >
                          {tab.label}
                          {isActive && (
                              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white" />
                          )}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Dynamic Card Feed or Shimmer Loading Skeleton Grid */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
             {Array.from({ length: 6 }).map((_, idx) => (
                 <Skeleton key={idx} variant="card" />
             ))}
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                 {filteredItems.map((item, idx) => (
                     <ClassicExploreCard key={`${item.type}-${item._id || idx}`} item={item} />
                 ))}
            </div>
            
            {filteredItems.length === 0 && (
                 <div className="text-center py-20 text-slate-400 dark:text-brand-slate">
                     No items found.
                 </div>
            )}
          </>
        )}

    </div>
  );
}



