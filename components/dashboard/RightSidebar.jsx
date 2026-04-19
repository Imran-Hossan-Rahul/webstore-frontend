"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star, TrendingUp, Tag, Layers } from "lucide-react";
import { api } from "@/utils/api";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

export default function RightSidebar() {
  const pathname = usePathname();
  const [featuredCreator, setFeaturedCreator] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine Context
  const isMsg = pathname?.includes('/messages');
  const isBlog = pathname?.startsWith('/blogs');
  const isTemplate = pathname?.startsWith('/templates');
  const searchParams = useSearchParams();
  const isSaved = pathname === '/' && searchParams?.get('view') === 'saved';

  // Fetch featured creator (Shared logic)
  const fetchFeaturedCreator = async () => {
    try {
      const response = await api.get("/user/featured-creators?limit=1");
      if (response.success && response.data.length > 0) {
        setFeaturedCreator(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch featured creator:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCreator();
  }, []);

  if (isMsg) return null;

  // Fetch real popular topics for blog context
  const [popularTopics, setPopularTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState(false);

  useEffect(() => {
    if (!isBlog) return;
    let cancelled = false;
    const fetchTopics = async () => {
      try {
        setTopicsLoading(true);
        setTopicsError(false);
        const res = await api.get("/blog/popular-topics?limit=8");
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setPopularTopics(res.data);
        } else if (!cancelled) {
          setTopicsError(true);
        }
      } catch {
        if (!cancelled) setTopicsError(true);
      } finally {
        if (!cancelled) setTopicsLoading(false);
      }
    };
    fetchTopics();
    return () => { cancelled = true; };
  }, [isBlog]);

  // Capitalise first letter of each word in a tag
  const formatTag = (tag) =>
    tag.replace(/\b\w/g, (c) => c.toUpperCase());

  // --- BLOG CONTEXT SIDEBAR ---
  if (isBlog) {
    return (
      <aside className="h-full flex flex-col gap-6">
        {/* Popular Topics — real data only */}
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-black/5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag size={16} /> Popular Topics
          </h3>

          {topicsLoading ? (
            // Skeleton loader
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-2/3" />
                  <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-10" />
                </div>
              ))}
            </div>
          ) : topicsError ? (
            <p className="text-sm text-gray-400 text-center py-4">Could not load topics.</p>
          ) : popularTopics.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No topics yet. Start writing!</p>
          ) : (
            <div className="flex flex-col gap-1">
              {popularTopics.map((item, idx) => (
                <Link
                  key={item.tag}
                  href={`/blogs?tag=${encodeURIComponent(item.tag)}`}
                  className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-white/70 dark:hover:bg-white/5 cursor-pointer group transition-all duration-150"
                >
                  <div className="flex items-center gap-2">
                    {/* Rank indicator */}
                    <span className="text-xs font-bold text-gray-300 dark:text-gray-600 w-4 tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {formatTag(item.tag)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full tabular-nums group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                    {item.blogCount} {item.blogCount === 1 ? "post" : "posts"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>
    );
  }

  // --- DEFAULT / HOME / TEMPLATE SIDEBAR ---
  return (
    <aside className="h-full flex flex-col gap-6">
      
      {/* Search / Filter Context for Templates */}
      {isTemplate && (
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-black/5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Layers size={16} /> Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                  {["UI Kits", "Dashboards", "Landing Pages", "Mobile Apps", "Illustrations", "Icons"].map(cat => (
                      <span key={cat} className="px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer hover:border-purple-500 hover:text-purple-500 transition-colors">
                          {cat}
                      </span>
                  ))}
              </div>
          </div>
      )}

      {/* Creator Spotlight Card */}
      <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-black/5 relative overflow-hidden group">
         <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-purple-500/20 rounded-full blur-[60px] group-hover:bg-purple-500/30 transition-colors" />

         <div className="relative z-10">
             <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 uppercase tracking-widest">
                    Creator Spotlight
                </span>
                <div className="p-1 bg-yellow-400/20 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
             </div>

             {loading ? (
                 <div className="text-center py-8">
                     <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse mb-3" />
                     <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
                     <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mx-auto animate-pulse" />
                 </div>
             ) : featuredCreator ? (
                 <>
                     <div className="text-center mb-6">
                         <Link href={`/profile/${featuredCreator._id}`}>
                             <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[3px] mb-3 cursor-pointer hover:scale-105 transition-transform">
                                 <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-black">
                                     {featuredCreator.avatar ? (
                                         <Image 
                                             src={featuredCreator.avatar} 
                                             alt={featuredCreator.name}
                                             width={80}
                                             height={80}
                                             className="object-cover w-full h-full"
                                         />
                                     ) : (
                                         <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                                             {featuredCreator.name?.[0]?.toUpperCase()}
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </Link>
                         <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{featuredCreator.name}</h3>
                         <p className="text-sm text-gray-500">
                             {featuredCreator.bio || featuredCreator.skills?.join(", ") || "Creative Professional"}
                         </p>
                         {featuredCreator.postCount && (
                             <p className="text-xs text-purple-500 font-bold mt-1">{featuredCreator.postCount} Projects</p>
                         )}
                     </div>

                     <div className="grid grid-cols-3 gap-2 mb-6">
                         {featuredCreator.recentPosts && featuredCreator.recentPosts.length > 0 ? (
                             featuredCreator.recentPosts.slice(0, 3).map((post, idx) => (
                                 <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
                                     {post.images && post.images[0] ? (
                                         <Image 
                                             src={post.images[0]} 
                                             alt="Project"
                                             width={100}
                                             height={100}
                                             className="object-cover w-full h-full hover:scale-110 transition-transform"
                                         />
                                     ) : (
                                         <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900" />
                                     )}
                                 </div>
                             ))
                         ) : (
                             <>
                                 <div className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-800" />
                                 <div className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-800" />
                                 <div className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-800" />
                             </>
                         )}
                     </div>

                     <Link href={`/profile/${featuredCreator._id}`}>
                         <button className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                             View Portfolio
                         </button>
                     </Link>
                 </>
             ) : (
                 <div className="text-center py-8 text-gray-500">
                     No featured creators available
                 </div>
             )}
         </div>
      </div>

      {/* Trending Tags Cloud (Default) */}
      {!isTemplate && (
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-black/5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                   <TrendingUp size={16} /> Trending
              </h3>
              <div className="flex flex-wrap gap-2">
                  {["#3DDesign", "#Minimalism", "#Web3", "#Portfolio", "#Abstract", "#Motion"].map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors">
                          {tag}
                      </span>
                  ))}
              </div>
          </div>
      )}

      {/* Pro Banner */}
      {!isSaved && (
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
            <h3 className="font-bold text-lg mb-2">Upgrade to Pro</h3>
            <p className="text-white/80 text-sm mb-4">Get access to exclusive assets and features.</p>
            <button className="flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      )}

    </aside>
  );
}
