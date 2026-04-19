"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, PenTool, ArrowUpRight, Sparkles, Layout, Clock, Heart, Eye, Code } from "lucide-react";
import Link from "next/link";
import { api } from "@/utils/api";

const TopBlogItem = ({ blog }) => (
    <Link href={`/blog/${blog.slug}`} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0 group cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 px-2 rounded-lg">
        <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 shadow-sm border border-orange-100 dark:border-orange-500/20 group-hover:scale-105 transition-transform">
            <PenTool size={18} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-orange-500 transition-colors truncate">{blog.title}</div>
            <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1"><Heart size={10} /> {blog.likes || blog.likesCount || 0}</span>
                <span className="flex items-center gap-1"><Eye size={10} /> {blog.views || blog.viewsCount || 0}</span>
            </div>
        </div>
        <ArrowUpRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
);

export default function ExploreRightPanel() {
    const [topBlogs, setTopBlogs] = useState([]);
    const [featuredProject, setFeaturedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPanelData = async () => {
            try {
                setLoading(true);
                const [blogsRes, projectsRes] = await Promise.allSettled([
                    api.get("/blog?limit=5"), 
                    api.get("/feed?type=projects&limit=10")
                ]);

                if (blogsRes.status === "fulfilled") {
                   const bData = blogsRes.value.blogs || blogsRes.value.data || blogsRes.value;
                   if (Array.isArray(bData)) setTopBlogs(bData.slice(0, 5));
                }

                if (projectsRes.status === "fulfilled") {
                    const pData = projectsRes.value.data || projectsRes.value;
                    if (Array.isArray(pData)) {
                        // Pick the most liked or viewed project
                        const sorted = [...pData].sort((a,b) => (b.likes || 0) - (a.likes || 0));
                        if (sorted.length > 0) setFeaturedProject(sorted[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch explore panel data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPanelData();
    }, []);

  return (
    <aside className="w-full space-y-6">
        
      {/* Popular Blogs Block */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 p-6 shadow-xl shadow-black/5 hover:shadow-2xl transition-all duration-500">
           <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <TrendingUp size={18} className="text-orange-500" /> Hot Discussions
           </h3>
           
           <div className="flex flex-col">
               {loading ? (
                   [1,2,3,4,5].map(i => (
                       <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                           <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800" />
                           <div className="flex-1 space-y-2">
                               <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                               <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                           </div>
                       </div>
                   ))
               ) : topBlogs.length > 0 ? (
                   topBlogs.map(blog => <TopBlogItem key={blog._id} blog={blog} />)
               ) : (
                   <p className="text-sm text-gray-500 text-center py-4">No discussions found.</p>
               )}
           </div>
      </div>

      {/* Featured Project */}
      {featuredProject && !loading && (
          <div className="bg-gray-900 dark:bg-black rounded-3xl p-1 relative overflow-hidden shadow-2xl group cursor-pointer border border-gray-800 dark:border-white/10">
               {/* Animated Gradient Border Effect */}
               <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-indigo-600/30 opacity-50 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
               <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
               
               <div className="relative z-10 bg-gray-900/90 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[22px] p-5 h-full">
                   <div className="flex items-center justify-between mb-4">
                       <div className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Project Spotlight</div>
                       <Sparkles size={14} className="text-pink-400 animate-pulse" />
                   </div>
                   
                   <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 border border-gray-800 dark:border-white/5 shadow-inner">
                        {featuredProject.previewFile || featuredProject.coverImage ? (
                            <img src={featuredProject.previewFile || featuredProject.coverImage} className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-[1.5s] ease-out" alt="Featured" />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600"><Code size={30} /></div>
                        )}
                   </div>
                   
                   <h3 className="text-[15px] font-bold text-white mb-3 line-clamp-1 group-hover:text-purple-300 transition-colors drop-shadow-md">{featuredProject.title}</h3>
                   
                   <Link href={`/project/${featuredProject._id}`}>
                       <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-white/5 active:scale-95">
                           View Project <ArrowUpRight size={16} />
                       </button>
                   </Link>
               </div>
          </div>
      )}
      
      {/* Footer / Links */}
      <div className="flex flex-wrap gap-3 px-3 justify-center">
           {['Guidelines', 'Privacy', 'Terms', 'About'].map(link => (
               <Link href="#" key={link} className="text-xs font-semibold tracking-wide text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                   {link}
               </Link>
           ))}
           <span className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-600 w-full text-center mt-2 uppercase">© 2026 Creative</span>
      </div>

    </aside>
  );
}
