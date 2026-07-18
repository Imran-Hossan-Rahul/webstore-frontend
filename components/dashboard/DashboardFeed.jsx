"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { getShapeConfig } from "@/constants/cardShapes";
import ArtifactPostCard from "./cards/ArtifactPostCard";
import CodexCard from "./cards/CodexCard";
import CreatePost from "./CreatePost";
import PostCard from "./cards/PostCard";
import CraftsmenList from "./CraftsmenList";
import SavedFeed from "./SavedFeed";
import QuickPostBox from "./QuickPostBox";
import EmptyState from "../ui/EmptyState";
import { api } from "@/utils/api";
import useSWRInfinite from "swr/infinite";

const fetcher = async (url) => {
    const res = await api.get(url);
    if (!res.success) throw new Error("Failed to fetch");
    return res.data;
};

export default function DashboardFeed({ user, isGuest = false, onRequireAuth }) {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'discover'; // 'discover' | 'community' | 'craftsmen' | 'saved'

  const [posts, setPosts] = React.useState([]);
  const [selectedPost, setSelectedPost] = React.useState(null);

  const handleRequireAuth = (reason) => {
      if (onRequireAuth) onRequireAuth(reason);
      else window.dispatchEvent(new CustomEvent('requireAuth', { detail: reason }));
  };

  const defaultFeed = user?.appearancePreferences?.defaultFeed || 'trending';
  
  // SWR Infinite Fetching
  const swrConfig = { revalidateOnFocus: false, dedupingInterval: 60000 };
  
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null; // reached the end
    
    if (view === 'discover') return `/feed?view=${defaultFeed}&page=${pageIndex + 1}&limit=20`;
    if (view === 'community') return `/posts?page=${pageIndex + 1}&limit=20`;
    return null;
  };
  
  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, swrConfig);
  
  const rawItems = data ? data.flat() : [];
  const feedItems = view === 'discover' ? rawItems : [];
  const postsData = view === 'community' ? rawItems : [];
  
  const loading = !data && !error;
  const isLoadingMore = loading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const hasMore = data && data[data.length - 1]?.length >= 20;

  React.useEffect(() => {
      if (view === 'community' && postsData.length > 0) {
          setPosts(postsData);
      }
  }, [postsData, view]);
  
  const handleLoadMore = () => {
      setSize(size + 1);
  };
  
  const filteredFeedItems = React.useMemo(() => feedItems, [feedItems]);

  const handlePostCreated = (newPost) => {
      setPosts([newPost, ...posts]);
  };

   if (loading) {
       return (
           <div className="w-full max-w-6xl px-0 flex flex-col">
               <style>{`
                 @keyframes shimmer {
                   0%   { background-position: -600px 0; }
                   100% { background-position:  600px 0; }
                 }
                 .sk {
                   background-image: linear-gradient(
                     90deg,
                     transparent 0%,
                     rgba(0,0,0,0.03) 40%,
                     rgba(0,0,0,0.06) 50%,
                     rgba(0,0,0,0.03) 60%,
                     transparent 100%
                   );
                   background-size: 600px 100%;
                   animation: shimmer 1.6s infinite linear;
                 }
                 .dark .sk {
                   background-image: linear-gradient(
                     90deg,
                     transparent 0%,
                     rgba(255,255,255,0.02) 40%,
                     rgba(255,255,255,0.05) 50%,
                     rgba(255,255,255,0.02) 60%,
                     transparent 100%
                   );
                   background-size: 600px 100%;
                 }
               `}</style>
               
               {[1, 2, 3].map((i, index) => (
                   <div 
                     key={i} 
                     className={`w-full border-x border-b border-slate-200 dark:border-white/10 ${index === 0 ? 'rounded-t-2xl border-t' : ''} bg-white dark:bg-slate-900/20 p-4 sm:p-5`}
                   >
                       <div className="flex gap-4 sm:gap-5">
                           {/* Avatar */}
                           <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.04] sk flex-shrink-0" />
                           
                           <div className="flex-1 min-w-0 flex flex-col">
                               {/* Author & Meta */}
                               <div className="flex items-center gap-2 mb-2">
                                   <div className="h-3 w-28 bg-slate-100 dark:bg-white/[0.04] sk rounded-full" />
                                   <div className="h-3 w-16 bg-slate-100 dark:bg-white/[0.04] sk rounded-full" />
                               </div>
                               
                               {/* Title */}
                               <div className="space-y-2 mb-3 mt-1">
                                   <div className="h-5 w-full bg-slate-100 dark:bg-white/[0.04] sk rounded-md" />
                                   <div className="h-5 w-3/4 bg-slate-100 dark:bg-white/[0.04] sk rounded-md" />
                               </div>
                               
                               {/* Excerpt */}
                               <div className="space-y-1.5 mb-4">
                                   <div className="h-2.5 w-full bg-slate-100 dark:bg-white/[0.04] sk rounded-full" />
                                   <div className="h-2.5 w-5/6 bg-slate-100 dark:bg-white/[0.04] sk rounded-full" />
                               </div>
                               
                               {/* Media (Only for some cards to simulate mixed feed) */}
                               {i % 2 === 0 && (
                                   <div className="w-full aspect-[2/1] bg-slate-100 dark:bg-white/[0.04] sk rounded-xl mb-4 mt-2" />
                               )}
                               
                               {/* Action Bar */}
                               <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 dark:border-white/5">
                                   <div className="flex items-center gap-3">
                                       {[40, 40, 40, 40].map((w, j) => (
                                           <div key={j} className="h-4 bg-slate-100 dark:bg-white/[0.04] sk rounded-full" style={{ width: `${w}px` }} />
                                       ))}
                                   </div>
                                   <div className="flex items-center gap-4">
                                       <div className="h-4 w-12 bg-slate-100 dark:bg-white/[0.04] sk rounded-full" />
                                       <div className="h-4 w-12 bg-slate-100 dark:bg-white/[0.04] sk rounded-full" />
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       );
   }

  if (error) {
      return (
          <div className="w-full text-center py-20 text-red-500">
              {error.message || "Failed to load feed. Please try again later."}
          </div>
      );
  }

  // --- SAVED VIEW ---
  if (view === 'saved') {
      return <SavedFeed />;
  }

  // --- CRAFTSMANS VIEW ---
  if (view === 'craftsmen') {
      return (
        <EmptyState 
            type="default" 
            title="Community Offline" 
            description="The community features are temporarily offline for a major system upgrade." 
        />
      );
  }

  // --- COMMUNITY VIEW ---
  if (view === 'community') {
      return (
          <div className="w-full max-w-6xl">
              <h1 className="text-2xl font-medium text-slate-900 dark:text-white mb-6 px-2 tracking-tight font-sans">
                  Community Hub
              </h1>
              
              <CreatePost onPostCreated={handlePostCreated} />

              <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden min-h-[500px]">
                  {posts.map(post => (
                      <PostCard key={post._id || post.id} {...post} isGuest={isGuest} onRequireAuth={handleRequireAuth} />
                  ))}
                  {posts.length === 0 && !loading && (
                      <EmptyState 
                          type="default" 
                          title="No community posts" 
                          description="Be the first to share an update, ask a question, or spark a discussion!" 
                      />
                  )}
                  {hasMore && posts.length > 0 && (
                      <div className="flex justify-center py-8">
                          <button 
                              onClick={handleLoadMore}
                              disabled={isLoadingMore}
                              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                              {isLoadingMore ? "Loading..." : "Load More Posts"}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- DISCOVER VIEW (Default) ---

  return (
    <div className="w-full max-w-6xl">

         {/* Quick Post Box */}
         {/* <QuickPostBox user={user} onPostCreated={(post) => setFeedItems([post, ...feedItems])} /> */}
         
         {/* Feed List Container - Clean Layout */}
         <div className="flex flex-col min-h-screen px-0">
             {filteredFeedItems.map((item, index) => (
                 <div key={item._id || item.id} className={`w-full overflow-hidden sm:border-x sm:border-b border-slate-200 dark:border-white/10 ${index === 0 ? 'sm:rounded-t-2xl sm:border-t' : ''} bg-transparent sm:bg-white dark:sm:bg-slate-900/20 mb-4 sm:mb-0`}>
                      {item.type === 'artifact' ? (
                           <ArtifactPostCard
                              item={item}
                              
                              isGuest={isGuest}
                              onRequireAuth={handleRequireAuth}
                           />
                      ) : item.type === 'devlog' || item.devlogStats ? (
                           <PostCard
                              {...item}
                              
                              isGuest={isGuest}
                              onRequireAuth={handleRequireAuth}
                            />
                       ) : (
                           <CodexCard codex={item} currentUser={user} isGuest={isGuest} onRequireAuth={handleRequireAuth} />
                       )}
                  </div>
              ))}
              {filteredFeedItems.length === 0 && !loading && (
                  <EmptyState 
                      type="default" 
                      title="Your feed is empty" 
                      description="Follow craftsmen or check back later for new content." 
                  />
              )}
              {hasMore && filteredFeedItems.length > 0 && (
                  <div className="flex justify-center py-10 mt-4">
                      <button 
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm tracking-wide transition-colors disabled:opacity-50"
                      >
                          {isLoadingMore ? "Loading Feed..." : "Load More Feed"}
                      </button>
                  </div>
              )}
         </div>

         {/* Render Modal at Root level to avoid transform stacking context issues */}
         {selectedPost && (
             <React.Suspense fallback={null}>
                 <DevlogDetailModal 
                    post={selectedPost} 
                    onClose={() => setSelectedPost(null)} 
                 />
             </React.Suspense>
         )}
    </div>
  );
}

// Lazy load here since it was removed from PostCard
const DevlogDetailModal = React.lazy(() => import('./modals/DevlogDetailModal'));



