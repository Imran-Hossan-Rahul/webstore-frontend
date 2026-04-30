"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { getShapeConfig } from "@/constants/cardShapes";
import TemplatePostCard from "./cards/TemplatePostCard";
import BlogCard from "./cards/BlogCard";
import CreatePost from "./CreatePost";
import PostCard from "./cards/PostCard";
import CreatorsList from "./CreatorsList";
import QuickPostBox from "./QuickPostBox";
import { api } from "@/utils/api";
import useSWR from "swr";

const fetcher = async (url) => {
    const res = await api.get(url);
    if (!res.success) throw new Error("Failed to fetch");
    return res.data;
};

export default function DashboardFeed({ user, isGuest = false, onRequireAuth }) {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'discover'; // 'discover' | 'community' | 'creators'

  const [posts, setPosts] = React.useState([]);
  const [selectedPost, setSelectedPost] = React.useState(null);

  const handleRequireAuth = (reason) => {
      if (onRequireAuth) onRequireAuth(reason);
      else window.dispatchEvent(new CustomEvent('requireAuth', { detail: reason }));
  };

  // SWR Fetching
  const swrConfig = { revalidateOnFocus: false, dedupingInterval: 60000 };
  const { data: feedItemsData, error: feedError, isLoading: feedLoading } = useSWR(view === 'discover' ? '/feed' : null, fetcher, swrConfig);
  const { data: postsData, error: postsError, isLoading: postsLoading } = useSWR(view === 'community' ? '/posts' : null, fetcher, swrConfig);
  const { data: favsData, error: favsError, isLoading: favsLoading } = useSWR(view === 'saved' ? '/favorites' : null, fetcher, swrConfig);

  React.useEffect(() => {
      if (postsData) setPosts(postsData);
      if (favsData) setPosts(favsData);
  }, [postsData, favsData]);

  const loading = (view === 'discover' && feedLoading) || (view === 'community' && postsLoading) || (view === 'saved' && favsLoading);
  const error = (view === 'discover' && feedError) || (view === 'community' && postsError) || (view === 'saved' && favsError);
  const feedItems = feedItemsData || [];
  
  const filteredFeedItems = React.useMemo(() => feedItems, [feedItems]);

  const handlePostCreated = (newPost) => {
      setPosts([newPost, ...posts]);
  };

  if (loading) {
      return (
          <div className="w-full max-w-6xl">
              <div className="space-y-4">
                  {[1,2,3].map(i => (
                      <div key={i} className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-6 animate-pulse">
                          <div className="flex gap-3">
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                              <div className="flex-1 space-y-3">
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  if (error) {
      return (
          <div className="w-full text-center py-20 text-red-500">
              {error}
          </div>
      );
  }

  // --- CREATORS VIEW ---
  if (view === 'creators') {
      return <CreatorsList />;
  }

  // --- COMMUNITY VIEW ---
  if (view === 'community') {
      return (
          <div className="w-full max-w-6xl">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 px-2 tracking-tight">
                  Community
                  <span className="text-purple-600">.</span>
              </h1>
              
              <CreatePost onPostCreated={handlePostCreated} />

              <div className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden min-h-[500px]">
                  {posts.map(post => (
                      <PostCard key={post._id || post.id} {...post} isGuest={isGuest} onRequireAuth={handleRequireAuth} />
                  ))}
                  {posts.length === 0 && (
                      <div className="text-center py-20 text-gray-400">
                          No posts yet. Be the first to share!
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- DISCOVER VIEW (Default) ---

  return (
    <div className="w-full max-w-6xl">
         {/* Filter/Sort Bar */}
         <div className="sticky top-[64px] z-40 px-6 py-4 flex items-center justify-between gap-6">
            {/* Filter removed as requested */}
         </div>
         
         {/* Quick Post Box */}
         {/* <QuickPostBox user={user} onPostCreated={(post) => setFeedItems([post, ...feedItems])} /> */}
         
         {/* Feed List Container - Twitter Style */}
         <div className="flex flex-col min-h-screen">
             {filteredFeedItems.map((item, index) => (
                 <div key={item._id || item.id} className={`w-full border-x border-b border-gray-200 dark:border-white/10 ${index === 0 ? 'rounded-t-2xl overflow-hidden border-t' : ''}`}>
                      {item.type === 'template' ? (
                           <TemplatePostCard
                              item={item}
                              onClick={() => setSelectedPost(item)}
                              isGuest={isGuest}
                              onRequireAuth={handleRequireAuth}
                           />
                      ) : item.type === 'project' || item.projectStats ? (
                           <PostCard
                              {...item}
                              onClick={() => setSelectedPost(item)}
                              isGuest={isGuest}
                              onRequireAuth={handleRequireAuth}
                            />
                       ) : (
                           <BlogCard blog={item} currentUser={user} isGuest={isGuest} onRequireAuth={handleRequireAuth} />
                       )}
                  </div>
              ))}
         </div>

         {/* Render Modal at Root level to avoid transform stacking context issues */}
         {selectedPost && (
             <React.Suspense fallback={null}>
                 <ProjectDetailModal 
                    post={selectedPost} 
                    onClose={() => setSelectedPost(null)} 
                 />
             </React.Suspense>
         )}
    </div>
  );
}

// Lazy load here since it was removed from PostCard
const ProjectDetailModal = React.lazy(() => import('./modals/ProjectDetailModal'));

