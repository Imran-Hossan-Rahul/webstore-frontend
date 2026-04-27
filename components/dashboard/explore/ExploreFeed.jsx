"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Sparkles, TrendingUp, Grid, Award, Heart, Eye, PenTool, Layout, Code } from "lucide-react";
import Link from "next/link";
import CreatorProfileModal from '../modals/CreatorProfileModal';

const ClassicExploreCard = ({ item }) => {
    const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

    let type = item.type;
    
    if (!type) {
         if (item.slug && !item.priceType && !item.projectStats) type = 'blog';
         else if (item.code || item.html || item.priceType) type = 'template';
         else type = 'project';
    }

    let TypeIcon = Code;
    let typeLabel = "Project";
    let href = `/project/${item._id}`;
    let iconColor = "text-purple-500";
    let bgColor = "bg-purple-50 dark:bg-purple-500/10";

    if (type === 'blog') {
        TypeIcon = PenTool;
        typeLabel = "Blog";
        href = `/blogs/${item.slug}`;
        iconColor = "text-orange-500";
        bgColor = "bg-orange-50 dark:bg-orange-500/10";
    } else if (type === 'template') {
        TypeIcon = Layout;
        typeLabel = "Template";
        href = `/templates/${item._id}`;
        iconColor = "text-blue-500";
        bgColor = "bg-blue-50 dark:bg-blue-500/10";
    }

    const authorName = item.user?.name || item.author?.name || "Creator";
    const authorAvatar = item.user?.profilePicture || item.user?.avatar || item.author?.profilePicture || item.author?.avatar;

    return (
        <>
        <Link href={href} className="group block w-full h-full">
            <div className="flex flex-col h-full gap-3 p-2.5 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[24px] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 shadow-sm relative">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-black/5 dark:border-white/5 transition-all duration-500">
                    {item.previewFile || item.coverImage ? (
                        <img 
                            src={item.previewFile || item.coverImage} 
                            alt={item.title} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                           <Layout size={40} />
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 pointer-events-none">
                        <div className="px-4 py-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full text-xs font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 shadow-lg">
                            <span className={iconColor}><TypeIcon size={12} /></span>
                            <span>View {typeLabel}</span>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col justify-end">
                         <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 drop-shadow-md">
                            {item.title || "Untitled"}
                         </h3>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-1 mt-2">
                    <div 
                        className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-80 transition-opacity z-40 relative"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCreatorModalOpen(true); }}
                    >
                         <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-100 dark:ring-white/10 shrink-0 border border-transparent">
                            {authorAvatar ? (
                                <img src={authorAvatar} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                            )}
                         </div>
                         <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-500 hover:underline transition-colors truncate max-w-[80px] sm:max-w-[100px]">
                            {authorName}
                         </span>
                    </div>

                    <div className="flex items-center gap-3 ml-auto text-gray-400 shrink-0">
                         <div className="flex items-center gap-2 text-[10px]">
                             <span className="flex items-center gap-0.5"><Heart size={10} /> {item.likes || item.likesCount || 0}</span>
                             <span className="flex items-center gap-0.5"><Eye size={10} /> {item.views || item.viewsCount || 0}</span>
                         </div>
                         
                         <div className={`shrink-0 ${iconColor} bg-gray-50 dark:bg-white/5 p-1 rounded-full`} title={typeLabel}>
                            <TypeIcon size={12} />
                         </div>
                    </div>
                </div>
            </div>
        </Link>
        
        <CreatorProfileModal 
            isOpen={isCreatorModalOpen}
            onClose={() => setIsCreatorModalOpen(false)}
            userId={item.user?._id || item.author?._id}
        />
        </>
    );
};

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
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-20">
        
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
