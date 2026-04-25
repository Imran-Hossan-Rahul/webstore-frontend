"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import BlogCard from "../cards/BlogCard";

import useSWR from "swr";

const fetcher = async (url) => {
    const res = await api.get(url);
    if (!res) throw new Error("Failed to fetch");
    return res.blogs || res.data || res;
};

export default function BlogsFeed({ searchQuery = "", isGuest = false }) {
  const [activeTab, setActiveTab] = useState("latest");

  const { data: blogsData, error, isLoading: loading } = useSWR("/blog", fetcher);
  const blogs = Array.isArray(blogsData) ? blogsData : [];

  const tabs = [
    { id: "latest", label: "Latest" },
    { id: "trending", label: "Trending" },
    { id: "tutorials", label: "Tutorials" },
  ];

  // Client side filtering for search query
  const filteredBlogs = blogs.filter(blog => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
        blog.title?.toLowerCase().includes(q) ||
        blog.excerpt?.toLowerCase().includes(q) ||
        blog.author?.name?.toLowerCase().includes(q) ||
        blog.category?.toLowerCase().includes(q)
    );
  });

  // Client side sorting based on tab
  const displayBlogs = [...filteredBlogs].sort((a, b) => {
      if (activeTab === "trending") {
          const scoreA = (a.views || 0) + (a.likesCount || 0) * 2;
          const scoreB = (b.views || 0) + (b.likesCount || 0) * 2;
          return scoreB - scoreA;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const finalBlogs = activeTab === "tutorials" 
    ? displayBlogs.filter(b => b.category?.toLowerCase() === 'tutorial')
    : displayBlogs;

  return (
    <div className="max-w-[1000px] mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* Header Section */}
      <div className="mb-8 mt-2">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Insights & Articles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover industry trends, tutorials, and deep dives from top creators.
          </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-8 border-b border-gray-200 dark:border-white/10">
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 text-[15px] font-semibold transition-all duration-200 relative ${
                            isActive 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                    >
                        {tab.label}
                        {isActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-t-full" />
                        )}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Feed Content */}
      {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading amazing articles...</p>
          </div>
      ) : finalBlogs.length === 0 ? (
          <div className="text-center py-24 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Articles Found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {searchQuery 
                      ? "We couldn't find any articles matching your search. Try different keywords." 
                      : "There are currently no articles in this section. Check back later!"}
              </p>
          </div>
      ) : (
          <div className="flex flex-col gap-4">
              {finalBlogs.map((blog) => (
                  <div key={blog._id} className="rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                      <BlogCard blog={blog} isGuest={isGuest} />
                  </div>
              ))}
          </div>
      )}

    </div>
  );
}
