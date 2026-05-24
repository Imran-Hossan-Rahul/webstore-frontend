"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import CodexCard from "../cards/CodexCard";
import useSWR from "swr";

const fetcher = async (url) => {
    const res = await api.get(url);
    if (!res) throw new Error("Failed to fetch");
    return res.codex || res.data || res;
};

export default function CodexFeed({ searchQuery = "", isGuest = false }) {
  const [activeTab, setActiveTab] = useState("latest");

  const { data: codexData, error, isLoading: loading } = useSWR("/codex", fetcher);
  const codex = Array.isArray(codexData) ? codexData : [];

  const tabs = [
    { id: "latest", label: "Latest" },
    { id: "trending", label: "Trending" },
    { id: "tutorials", label: "Tutorials" },
  ];

  // patron side filtering for search query
  const filteredCodex = codex.filter(codex => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
        codex.title?.toLowerCase().includes(q) ||
        codex.excerpt?.toLowerCase().includes(q) ||
        codex.author?.name?.toLowerCase().includes(q) ||
        codex.category?.toLowerCase().includes(q)
    );
  });

  // patron side sorting based on tab
  const displayCodex = [...filteredCodex].sort((a, b) => {
      if (activeTab === "trending") {
          const scoreA = (a.views || 0) + (a.likesCount || 0) * 2;
          const scoreB = (b.views || 0) + (b.likesCount || 0) * 2;
          return scoreB - scoreA;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const finalCodex = activeTab === "tutorials" 
    ? displayCodex.filter(b => b.category?.toLowerCase() === 'tutorial')
    : displayCodex;

  return (
    <div className="max-w-[1000px] mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* Header Section */}
      <div className="mb-8 mt-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
              Insights & Codex
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
              Discover industry trends, tutorials, and deep dives from top craftsmen.
          </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-8 border-b border-slate-200 dark:border-white/10">
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 text-[15px] font-semibold transition-all duration-200 relative ${
                            isActive 
                            ? "text-slate-900 dark:text-white" 
                            : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        {tab.label}
                        {isActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-t-full" />
                        )}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Feed Content */}
      {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
              <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading amazing codex...</p>
          </div>
      ) : finalCodex.length === 0 ? (
          <div className="text-center py-24 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Codex Found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {searchQuery 
                      ? "We couldn't find any codex matching your search. Try different keywords." 
                      : "There are currently no codex in this section. Check back later!"}
              </p>
          </div>
      ) : (
          <div className="flex flex-col gap-4">
              {finalCodex.map((codex) => (
                  <div key={codex._id} className="rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                      <CodexCard codex={codex} isGuest={isGuest} />
                  </div>
              ))}
          </div>
      )}

    </div>
  );
}



