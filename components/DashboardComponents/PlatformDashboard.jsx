"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, getHasCraftsmanAccount } from "@/utils/api";
import { Search, Eye, Download, MessageCircle, Star } from "lucide-react";
import axios from "axios";
import { CARD_SHAPES } from "@/constants/cardShapes";
import CraftsmanAccountModal from "./CraftsmanAccountModal";
import ProfileModal from "./ProfileModal";
import CraftsmanProfileModal from "./CraftsmanProfileModal";
import { useToast } from "@/components/ui/ToastProvider";

import AppleSpinner from "@/components/ui/AppleSpinner";

export default function PlatformDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all"); 
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasCraftsmanAccount, setHasCraftsmanAccount] = useState(false);
  const [showCraftsmanModal, setShowCraftsmanModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Infinite Scroll State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Initial Fetch & Search & Tab Change
  useEffect(() => {
    setPage(1);
    setFilteredItems([]); 
    setHasMore(true);
    fetchData(1, true);
  }, [searchQuery, activeTab]); 

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetchingMore) {
           setPage(prev => {
               const nextPage = prev + 1;
               fetchData(nextPage, false);
               return nextPage;
           });
        }
      },
      { threshold: 1.0 }
    );

    const target = document.getElementById("loader-sentinel");
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loading, isFetchingMore]);

  const fetchData = async (pageNum, isReset = false) => {
    if (pageNum === 1) {
        setLoading(true);
        const hasCraftsman = getHasCraftsmanAccount();
        setHasCraftsmanAccount(hasCraftsman);
    }
    else setIsFetchingMore(true);

    try {
      const typeParam = activeTab === 'all' ? undefined : activeTab;
      const response = await api.get("/feed", {
          params: {
              page: pageNum,
              limit: 10,
              type: typeParam,
              q: searchQuery
          }
      });

      const newItems = response.data || [];
      const normalizedItems = newItems.map(item => ({
          ...item,
          cardShape: item.cardShape || (item.type === 'devlog' ? 'square-large' : 'square-medium')
      }));

      if (isReset) {
          setFilteredItems(normalizedItems);
      } else {
          setFilteredItems(prev => [...prev, ...normalizedItems]);
      }
      setHasMore(response.hasMore);
    } catch (error) {
       console.error("Dashboard Fetch Error:", error);
    } finally {
       setLoading(false);
       setIsFetchingMore(false);
    }
  };

  return (
    <div className="w-full pt-4">
      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sticky top-20 z-30 py-4 bg-[#F3F6F8]/95 dark:bg-black/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 bg-brand-surface dark:bg-slate-900 p-1.5 rounded-full border border-brand-navy/[0.08] dark:border-slate-800 shadow-sm">
              {['all', 'codex'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-all ${
                      activeTab === tab
                        ? "bg-black dark:bg-brand-surface text-white dark:text-black shadow-sm transform"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                     {tab}
                  </button>
              ))}
          </div>

          <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-brand-surface dark:bg-slate-900 border border-brand-navy/[0.08] dark:border-slate-800 rounded-full text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm hover:shadow-sm"
              />
          </div>
      </div>

      <ContentGrid items={filteredItems} loading={loading} router={router} />

      <CraftsmanAccountModal 
        isOpen={showCraftsmanModal} 
        onClose={() => setShowCraftsmanModal(false)} 
      />
      
      {hasCraftsmanAccount ? (
        <CraftsmanProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)}
        />
      ) : (
        <ProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)}
          verifiedHasCraftsmanAccount={hasCraftsmanAccount}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 🧱 SHARED GRID COMPONENT
// ----------------------------------------------------------------------
function ContentGrid({ items, loading, router, limit }) {
    if (loading) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-brand-surface dark:bg-brand-surface rounded-lg aspect-[4/3] animate-pulse" />
            ))}
          </div>
        );
    }
    
    if (items.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center border-2 border-dashed border-brand-navy/[0.08] dark:border-slate-800 rounded-lg">
            <div className="w-16 h-16 bg-slate-100 dark:bg-brand-surface rounded-full flex items-center justify-center mb-4">
              <Search className="text-slate-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters.</p>
          </div>
        );
    }

    const displayItems = limit ? items.slice(0, limit) : items;

    return (
        // Granular grid rows (10px) to allow exact sizing of Image + Footer
        // Granular grid rows (10px) to allow exact sizing of Image + Footer
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-0 auto-rows-[10px]" style={{ gridAutoFlow: 'dense' }}>
                {displayItems.map((item) => (
                  <ContentCard key={`${item.type}-${item._id}`} item={item} router={router} />
                ))}
            </div>
            
            {/* Sentinel for Infinite Scroll */}
            <div id="loader-sentinel" className="h-10 w-full flex items-center justify-center p-4">
                {/* Optional: Show loading spinner if fetching more */}
                {/* {loading && <AppleSpinner />} */}
            </div>
        </div>
    )
}

// ----------------------------------------------------------------------
// 🃏 CONTENT CARD (Refined UX + Chat/Follow Integration)
// ----------------------------------------------------------------------
function ContentCard({ item, router }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const { showToast } = useToast();
  
  const isArtifact = item.type === "artifact";
  const title = item.title;
  const image = isArtifact ? item.thumbnailSource || item.previewFile : item.coverImage;
  const description = isArtifact ? item.description : item.excerpt;
  const tags = item.tags || [];
  const author = isArtifact ? item.user : item.author;

  let shape = item.cardShape || 'square-medium';
  if (!CARD_SHAPES.find(s => s.value === shape)) shape = 'square-medium';
  const shapeConfig = CARD_SHAPES.find(s => s.value === shape);
  
  // Extract Grid logic
  const originalGridClass = shapeConfig?.gridClass || "col-span-2 row-span-2";
  const colSpanClass = originalGridClass?.match(/col-span-\d+/)?.[0] || "col-span-2";
  const rowSpanMatch = originalGridClass.match(/row-span-(\d+)/);
  const originalRowSpan = rowSpanMatch ? parseInt(rowSpanMatch[1]) : 2;

  // Granular Row Calculation (10px rows)
  // Base Image Height: 200px per original row span (user preference)
  const imagePixelHeight = originalRowSpan * 200; 
  // Footer Height: approx 50px visual + 20px buffer/margin
  const footerPixelHeight = 70; 
  const totalPixelHeight = imagePixelHeight + footerPixelHeight;
  const gridRowSpan = Math.ceil(totalPixelHeight / 10);

  const truncatedTitle = title.length > 50 ? title.substring(0, 50) + "..." : title;
  const isFree = isArtifact && (!item.price || item.price === 0);

  // Safe tags slicing
  const displayedTags = Array.isArray(tags) ? tags.slice(0, 3) : [];

  useEffect(() => {
    // Initialize Like State
    if (isArtifact) {
      setLiked(item.isLiked || false);
      setLikeCount(item.likes || 0);
    } else {
      setLikeCount(item.likesCount || 0);
    }

    // Initialize Follow State
    const checkFollowStatus = async () => {
        if (!author?._id) return;
        try {
            const res = await api.get(`/user/follow-status/${author._id}`);
            setFollowing(res.isFollowing);
        } catch (err) {
            console.error("Failed to check follow status", err);
        }
    };
    
    checkFollowStatus();
  }, [item, isArtifact, author]);

  const handleClick = () => {
    if (isArtifact) {
      router.push(`/artifacts/${item._id}`);
    } else {
      router.push(`/codex/${item.slug}`);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isArtifact) return; 

    const artifactId = item._id;
    const prevLiked = liked;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await api.post(`/artifact/${artifactId}/like`);
      if (res.liked !== undefined) {
        setLiked(res.liked);
      }
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(liked ? likeCount + 1 : likeCount - 1);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!isArtifact) {
      router.push(`/codex/${item.slug}`);
      return;
    }

    const artifactId = item._id;
    try {
      const res = await api.post(`/artifact/${artifactId}/download`);
      if (res.url) {
        window.location.href = res.url;
        return;
      }
    } catch (err) {
       console.error("Download fail", err);
       showToast(err.message || "Download failed", "error", "Error");
    }
  };

  const handleFollow = async (e) => {
      e.stopPropagation();
      setLoadingFollow(true);
      const prevFollowing = following;
      setFollowing(!following); // Optimistic update
      try {
          await api.post(`/user/follow/${author._id}`);
      } catch (err) {
          console.error("Follow error", err);
          setFollowing(prevFollowing);
          showToast(err.message || "Failed to update follow status.", "error", "Error");
      } finally {
          setLoadingFollow(false);
      }
  };

  const handleChat = (e) => {
      e.stopPropagation();
      // Navigate to chat with this specific craftsman
      // Assuming a route like /user/messages?chatId=... or /user/craftsman/chat/:id
      // Based on typical patterns, we likely want to go to the messages page and select this user
      // For now, we'll push to a generic chat page or specific if known. 
      // Using standard pattern:
      router.push(`/user/craftsman/chat?targetUser=${author._id}`);
  };

  return (
    <div 
        className={`flex flex-col ${colSpanClass} group mb-6 relative transition-all duration-500 ease-out hover:-translate-y-1`}
        style={{ gridRowEnd: `span ${gridRowSpan}` }}
    >
      {/* 
          1. Card Container (Image)
          Fixed rounding bug: Added transform-gpu and strict overflow handling
      */}
      {/* 
          1. Card Container (Image)
          Fixed rounding bug: Added transform-gpu and strict overflow handling
      */}
      <div
        className="relative rounded-lg overflow-hidden shadow-sm group-hover:shadow-sm cursor-pointer w-full bg-brand-surface dark:bg-brand-surface transition-shadow duration-500 transform-gpu z-0"
        style={{ height: `${imagePixelHeight}px`, WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
        onClick={handleClick}
      >
        {/* Badge */}
        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {item.type === 'devlog' ? (
              <span className={`text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm tracking-wider backdrop-blur ${
                  item.devlogStats?.status === 'Completed' ? 'bg-brand-teal/90' : 'bg-brand-amber/90'
              }`}>
                  {item.devlogStats?.status?.toUpperCase() || 'DEVLOG'}
              </span>
          ) : isArtifact ? (
            isFree ? (
              <span className="bg-brand-teal/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm tracking-wider">
                FREE
              </span>
            ) : (
              <div className="bg-brand-surface text-black px-2 py-1 rounded-full shadow-sm font-bold text-[10px]">
                {item.price} TKNS
              </div>
            )
          ) : (
            <span className="bg-brand-blue/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm tracking-wider">
              CODEX
            </span>
          )}
        </div>

        {/* Media (Strict scaling without overflow issues) */}
        {image && image.endsWith(".mp4") ? (
          <video
            src={image}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            autoPlay
            playsInline
          />
        ) : (
          <img
            src={image || "/placeholder.png"}
            alt={title || "Content"}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:-translate-y-0.5 will-change-transform" 
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 transition-opacity duration-300" />
        
        {/* Overlay Content Area - STATIC Position (No translate-y) */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end h-full pointer-events-none">
              
             <div className="relative z-10 flex flex-col justify-end pointer-events-auto">
                 
                 {/* Title - Static, No animation up/down */}
                 <h3 className="text-white font-bold text-lg leading-snug drop-shadow-sm line-clamp-2 md:text-xl mb-1">
                    {truncatedTitle}
                 </h3>

                 {/* Container for Tags/Stats */}
                 <div className="relative min-h-[20px]">
                      {/* Devlogs: Show Tech Stack & Difficulty */}
                      {item.type === 'devlog' ? (
                          <div className="flex flex-wrap gap-1.5 items-center">
                              {/* Difficulty Badge */}
                              {item.devlogStats?.difficulty && (
                                  <span className="text-[9px] font-bold uppercase text-white/90 bg-brand-surface/20 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                      {item.devlogStats.difficulty}
                                  </span>
                              )}
                              {/* Tech Stack Preview (First 2) */}
                              {item.devlogStats?.tools?.slice(0, 2).map((t, i) => (
                                  <span key={i} className="text-[10px] font-medium text-white/80 bg-black/40 px-1.5 py-0.5 rounded">
                                      {t}
                                  </span>
                              ))}
                              {/* Count for remaining tools */}
                              {(item.devlogStats?.tools?.length || 0) > 2 && (
                                  <span className="text-[9px] text-white/60">+{item.devlogStats.tools.length - 2}</span>
                              )}
                          </div>
                      ) : (
                          /* Other Types: Tags & Description */
                          <div className="grid grid-cols-1 grid-rows-1 pr-16">
                              {/* Tags Layer */}
                              <div className="col-start-1 row-start-1 opacity-100 group-hover:opacity-0 transition-opacity duration-300 flex flex-wrap gap-1.5 items-center self-end">
                                  {displayedTags.length > 0 ? (
                                      displayedTags.map((t, i) => (
                                         <span key={i} className="text-[10px] uppercase font-semibold tracking-wide text-white/90 bg-brand-surface/10 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/5">
                                             {t}
                                         </span>
                                      ))
                                  ) : (
                                      <span className="text-[10px] text-white/60 italic">No tags</span>
                                  )}
                              </div>
                              {/* Description Layer */}
                              <div className="col-start-1 row-start-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                   <p className="text-slate-200 text-xs line-clamp-2 leading-relaxed">
                                       {description || "No description available."}
                                   </p>
                              </div>
                          </div>
                      )}
                 </div>
             </div>
             
             {/* Stats Row */}
             <div className="absolute bottom-3 right-4 flex items-center gap-2 z-40 pointer-events-auto">
                 <button 
                    onClick={handleLike} 
                    className="flex items-center gap-1.5 hover:text-pink-400 transition-colors bg-brand-surface/10 hover:bg-brand-surface/20 px-2 py-1.5 rounded-full backdrop-blur-md border border-white/5"
                 >
                     <Star size={14} className={liked ? "fill-pink-500 text-pink-500" : "text-white"} />
                     <span className="text-[10px] font-bold text-white">{likeCount}</span>
                 </button>
                 
                 <div className="flex items-center gap-1.5 bg-brand-surface/10 px-2 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                     <Eye size={14} className="text-white" />
                     <span className="text-[10px] font-bold text-white">{isArtifact ? item.viewsCount : item.views}</span>
                 </div>

                 {isArtifact && (
                     <button
                        onClick={handleDownload} 
                        className="flex items-center gap-1.5 hover:bg-brand-surface/20 transition-colors bg-brand-surface/10 px-2 py-1.5 rounded-full backdrop-blur-md border border-white/5 text-white"
                        title="Download"
                     >
                        <Download size={14} />
                     </button>
                 )}
             </div>
        </div>
      </div>

      {/* 
         2. Footer (Profile & Follow & Chat) 
         Glassmorphic Refinement
      */}
      <div className="mt-3 flex items-center justify-between px-1 h-10">
          <div className="flex items-center gap-3 w-full">
              {/* Avatar */}
              <div className="relative group/profile cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-brand-surface/[0.1] overflow-hidden border border-white/50 dark:border-slate-700 shadow-sm group-hover/profile:border-purple-500 transition-colors">
                      {author?.profilePic || author?.avatar ? (
                          <img src={getOptimizedUrl(author.profilePic || author.avatar)} alt={author?.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-[12px] font-bold">
                              {author?.name?.charAt(0).toUpperCase()}
                          </div>
                      )}
                  </div>
                  {/* Status Indicator (Optional) */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-teal border-2 border-white dark:border-slate-900 rounded-full"></div>
              </div>
              
              {/* Name & Actions */}
              <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate hover:text-purple-600 transition-colors cursor-pointer leading-tight mb-0.5">
                      {author?.name || 'Craftsman'}
                  </span>
                  
                  {/* Action Row: Follow | Chat */}
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={handleFollow}
                        disabled={loadingFollow}
                        className={`text-[11px] font-semibold tracking-wide text-left transition-colors w-fit flex items-center gap-1 ${following ? 'text-slate-400' : 'text-brand-blue dark:text-blue-400 hover:text-brand-blue'}`}
                      >
                          {following ? 'Following' : 'Follow'}
                      </button>

                      <div className="h-3 w-[1px] bg-slate-300 dark:bg-slate-700"></div>

                      <button 
                        onClick={handleChat}
                        className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 group/chat"
                      >
                          <span>Chat</span>
                          <MessageCircle size={10} className="group-hover/chat:fill-purple-500/20" />
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}



