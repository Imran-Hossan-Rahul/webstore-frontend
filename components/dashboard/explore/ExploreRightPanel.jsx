"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useEffect } from "react";
import { TrendingUp, PenTool, ArrowUpRight, Trophy, Layout, Clock, Eye, Code, Star } from "lucide-react";
import Link from "next/link";
import { api } from "@/utils/api";

const TopCodexItem = ({ codex }) => (
    <Link href={`/codex/${codex.slug}`} className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-white/5 last:border-0 group cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 px-2 rounded-lg">
        <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 shadow-sm border border-orange-100 dark:border-orange-500/20 group-hover:-translate-y-0.5 transition-transform">
            <PenTool size={18} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-slate-900 dark:text-gray-100 group-hover:text-orange-500 transition-colors truncate">{codex.title}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1"><Star size={10} /> {codex.likes || codex.likesCount || 0}</span>
                <span className="flex items-center gap-1"><Eye size={10} /> {codex.views || codex.viewsCount || 0}</span>
            </div>
        </div>
        <ArrowUpRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
);

export default function ExploreRightPanel() {
    const [topCodex, setTopCodex] = useState([]);
    const [featuredDevlog, setFeaturedDevlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPanelData = async () => {
            try {
                setLoading(true);
                const [codexRes, devlogsRes] = await Promise.allSettled([
                    api.get("/codex?limit=5"), 
                    api.get("/feed?type=devlogs&limit=10")
                ]);

                if (codexRes.status === "fulfilled") {
                   const bData = codexRes.value.codex || codexRes.value.data || codexRes.value;
                   if (Array.isArray(bData)) setTopCodex(bData.slice(0, 5));
                }

                if (devlogsRes.status === "fulfilled") {
                    const pData = devlogsRes.value.data || devlogsRes.value;
                    if (Array.isArray(pData)) {
                        const sorted = [...pData].sort((a,b) => (b.likes || 0) - (a.likes || 0));
                        if (sorted.length > 0) setFeaturedDevlog(sorted[0]);
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
        
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-white/10 p-6 shadow-xl shadow-black/5 hover:shadow-2xl transition-all duration-500">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <TrendingUp size={18} className="text-orange-500" /> Hot Discussions
           </h3>
           
           <div className="flex flex-col">
               {loading ? (
                   [1,2,3,4,5].map(i => (
                       <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                           <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
                           <div className="flex-1 space-y-2">
                               <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                               <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                           </div>
                       </div>
                   ))
               ) : topCodex.length > 0 ? (
                   topCodex.map(codex => <TopCodexItem key={codex._id} codex={codex} />)
               ) : (
                   <p className="text-sm text-slate-500 text-center py-4">No discussions found.</p>
               )}
           </div>
      </div>

      {featuredDevlog && !loading && (
          <div className="bg-slate-900 dark:bg-black rounded-2xl p-1 relative overflow-hidden shadow-2xl group cursor-pointer border border-slate-800 dark:border-white/10">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-indigo-600/30 opacity-50 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
               <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
               
               <div className="relative z-10 bg-slate-900/90 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[22px] p-5 h-full">
                   <div className="flex items-center justify-between mb-4">
                       <div className="text-[10px] font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Devlog Spotlight</div>
                        <Trophy size={14} className="text-pink-400 animate-pulse" />
                   </div>
                   
                   <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 border border-slate-800 dark:border-white/5 shadow-inner">
                        {featuredDevlog.previewFile || featuredDevlog.coverImage ? (
                            <img src={getOptimizedUrl(featuredDevlog.previewFile || featuredDevlog.coverImage)} className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-[1.5s] ease-out" alt="Featured" />
                        ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600"><Code size={30} /></div>
                        )}
                   </div>
                   
                   <h3 className="text-[15px] font-bold text-white mb-3 line-clamp-1 group-hover:text-purple-300 transition-colors drop-shadow-md">{featuredDevlog.title}</h3>
                   
                   <Link href={`/post/${featuredDevlog._id}`}>
                       <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-white/5 active:scale-95">
                           View Devlog <ArrowUpRight size={16} />
                       </button>
                   </Link>
               </div>
          </div>
      )}

    </aside>
  );
}


