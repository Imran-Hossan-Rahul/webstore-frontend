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
  // State for Project Detail Modal (Lifted up to fix positioning)
  const [selectedPost, setSelectedPost] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const handleRequireAuth = (reason) => {
      if (onRequireAuth) onRequireAuth(reason);
      else window.dispatchEvent(new CustomEvent('requireAuth', { detail: reason }));
  };

  // SWR Fetching
  const { data: feedItemsData, error: feedError, isLoading: feedLoading } = useSWR(view === 'discover' ? '/feed' : null, fetcher);
  const { data: postsData, error: postsError, isLoading: postsLoading } = useSWR(view === 'community' ? '/posts' : null, fetcher);
  const { data: favsData, error: favsError, isLoading: favsLoading } = useSWR(view === 'saved' ? '/favorites' : null, fetcher);

  React.useEffect(() => {
      if (postsData) setPosts(postsData);
      if (favsData) setPosts(favsData);
  }, [postsData, favsData]);

  const loading = (view === 'discover' && feedLoading) || (view === 'community' && postsLoading) || (view === 'saved' && favsLoading);
  const error = (view === 'discover' && feedError) || (view === 'community' && postsError) || (view === 'saved' && favsError);
  const feedItems = feedItemsData || [];

  const handlePostCreated = (newPost) => {
      setPosts([newPost, ...posts]);
  };

  if (loading) {
      return (
          <div className="w-full max-w-5xl mx-auto">
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
          <div className="w-full max-w-5xl mx-auto">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 px-2 tracking-tight">
                  Community
                  <span className="text-purple-600">.</span>
              </h1>
              
              <CreatePost onPostCreated={handlePostCreated} />

              <div className="bg-white dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
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
    <div className="w-full max-w-5xl mx-auto">
         {/* Filter/Sort Bar */}
         <div className="sticky top-[64px] z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-x border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between gap-6">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
               <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                     selectedCategory === 'all' 
                        ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
               >
                  All
               </button>
               
               <button 
                  onClick={() => setSelectedCategory('templates')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                     selectedCategory === 'templates' 
                        ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
               >
                  Templates
               </button>

               <button 
                  onClick={() => setSelectedCategory('blogs')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                     selectedCategory === 'blogs' 
                        ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
               >
                  Blogs
               </button>
            </div>
            
            {/* Sort Dropdown */}
            {/* <select className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border-0 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/10">
               <option>Latest</option>
               <option>Popular</option>
               <option>Trending</option>
            </select> */}
         </div>
         
         {/* Quick Post Box */}
         {/* <QuickPostBox user={user} onPostCreated={(post) => setFeedItems([post, ...feedItems])} /> */}
         
         {/* Feed List Container - Twitter Style */}
         <div className="flex flex-col border-x border-gray-200 dark:border-white/10 bg-white dark:bg-black min-h-screen">
             {feedItems
                .filter(item => {
                   if (selectedCategory === 'all') return true;
                   if (selectedCategory === 'templates') return item.type === 'template';
                   if (selectedCategory === 'projects') return item.type === 'project' || item.projectStats;
                   if (selectedCategory === 'blogs') return item.type === 'blog' || (!item.type && !item.projectStats);
                   return true;
                })                 .map(item => (
                 <div key={item._id || item.id} className="w-full">
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

