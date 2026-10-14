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
      const response = await api.get("/blogs?limit=100&lang=en");
      let rawBlogs = response.data || response.blogs || [];
      
      // Map multilingual data to what the old UI expects
      const mappedBlogs = rawBlogs.map(b => ({
        ...b, type: "blog",
        title: b.en?.title || b.title,
        excerpt: b.en?.excerpt || b.excerpt || b.en?.content,
        content: b.en?.content || b.content
      }));
      
      if (mappedBlogs.length > 0) {
        setBlogs(mappedBlogs);
      }
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
