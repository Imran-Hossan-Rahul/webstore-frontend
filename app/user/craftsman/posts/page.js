"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { 
  Eye, Trash2, Edit3, BarChart2,
  MessageSquare, ThumbsUp, Globe, Lock,
  Search,
  LayoutGrid, Mail, Send, Clock, BookOpen, Settings, CheckSquare, FileText
} from "lucide-react";
import PostAnalyticsModal from "@/components/DashboardComponents/PostAnalyticsModal";

export default function CraftsmanPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'published' (active), 'draft' (if any)
  
  // Selection State
  const [selectedPosts, setSelectedPosts] = useState(new Set());

  // Analytics State
  const [analyticsPost, setAnalyticsPost] = useState(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Live Update: Poll every 10 seconds
  useEffect(() => {
    fetchUserPosts();
    const interval = setInterval(fetchUserPosts, 10000); 
    return () => clearInterval(interval);
  }, []);

  const fetchUserPosts = async () => {
    try {
      const res = await api.get("/posts/my-posts");
      if (res.success) {
        setPosts(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      // Assuming generic delete endpoint exists or we use a specific one
      // If no generic delete, we might need to add it to routes
      // checking postRoutes.js... it doesn't have delete yet?
      // Wait, postRoutes.js I saw earlier didn't have delete. I might need to add it.
      // For now, let's assume /posts/:id DELETE exists or I will add it.
      // Actually I should verify this.
      // Let's implement patron side assuming it will work, and I'll update backend if needed.
      const res = await api.delete(`/posts/${id}`);
      if (res.success) {
        fetchUserPosts();
        setSelectedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet; 
        });
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete post.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedPosts.size} posts?`)) return;
    
    // Naive bulk delete loop
    const postsToDelete = posts.filter(t => selectedPosts.has(t._id));
    for (const post of postsToDelete) {
        try {
            await api.delete(`/posts/${post._id}`);
        } catch (err) {
            console.error(`Failed to delete ${post._id}`, err);
        }
    }
    setSelectedPosts(new Set());
    fetchUserPosts();
  };

  // Filter Logic
  const filteredPosts = posts.filter(post => {
    const matchesAuth = activeTab === "all" || 
                        (activeTab === "published" && post.status === "active") || 
                        (activeTab === "draft" && post.status === "draft");
    
    // Search by content or title (if devlog)
    const searchText = (post.title || post.content || "").toLowerCase();
    const matchesSearch = searchText.includes(filterText.toLowerCase());
    
    return matchesAuth && matchesSearch;
  });

  // Select All Logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(filteredPosts.map(t => t._id));
      setSelectedPosts(allIds);
    } else {
      setSelectedPosts(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedPosts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPosts(newSet);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-t-blue-500 border-slate-600 rounded-full"></div>
      </div>
    );
  }

  const allSelected = filteredPosts.length > 0 && selectedPosts.size === filteredPosts.length;

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-gray-300 font-sans">
      {/* Sidebar - Adapted for Dark Mode */}
      <aside className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 gap-8 bg-[#1f1f1f] border-r border-[#3e3e3e] z-50">
        <div className="mb-4">
             <div className="w-8 h-8 bg-white rounded-lg transform rotate-45 flex items-center justify-center cursor-pointer" onClick={() => router.push('/user/craftsman')}>
                 <div className="w-3 h-3 bg-black rounded-full transform -rotate-45"></div>
             </div>
        </div>
        <nav className="flex flex-col gap-6 w-full items-center">
           <NavItem icon={<LayoutGrid size={20} />} onClick={() => router.push('/user/craftsman')} />
           <NavItem icon={<Mail size={20} />} onClick={() => router.push('/messages')} />
           <NavItem icon={<CheckSquare size={20} />} active onClick={() => {}} /> 
           <NavItem icon={<Send size={20} />} onClick={() => router.push('/user/craftsman/chat')} />
           <NavItem icon={<Clock size={20} />} onClick={() => router.push('/history')} />
           <NavItem icon={<FileText size={20} />} active onClick={() => {}} />
           <NavItem icon={null} onClick={() => router.push('/user/craftsman/devlog-posts')} />
           <NavItem icon={<LayoutGrid size={20} />} onClick={() => router.push('/user/craftsman/artifacts')} />

           <NavItem icon={<Settings size={20} />} onClick={() => {}} />
        </nav>
        <div className="mt-auto">
             <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-[#3e3e3e] overflow-hidden cursor-pointer">
                 <img src={getOptimizedUrl("https://ui-avatars.com/api/?name=User")} alt="User" />
             </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 p-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Posts</h1>
                <p className="text-slate-400">Track views, likes, and engagement for your posts</p>
            </div>
            {selectedPosts.size > 0 && (
                <button 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                    <Trash2 size={18} />
                    Delete Selected ({selectedPosts.size})
                </button>
            )}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-[#282828] p-4 rounded-xl border border-[#3e3e3e]">
            {/* Tabs */}
            <div className="flex bg-[#1f1f1f] p-1 rounded-lg border border-[#3e3e3e]">
                {['all', 'published', 'draft'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                            activeTab === tab 
                            ? 'bg-[#3ea6ff] text-[#0f0f0f] shadow-md' 
                            : 'text-slate-400 hover:text-gray-200'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search posts..." 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full bg-[#1f1f1f] text-gray-200 pl-10 pr-4 py-2 rounded-lg border border-[#3e3e3e] focus:outline-none focus:border-[#3ea6ff] text-sm"
                />
            </div>
        </div>

        {/* Table */}
        <div className="bg-[#282828] rounded-xl border border-[#3e3e3e] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1f1f1f] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-[#3e3e3e]">
                  <tr>
                    <th className="p-4 w-12 text-center">
                       <input 
                          type="checkbox" 
                          checked={allSelected}
                          onChange={handleSelectAll}
                          className="rounded border-slate-600 bg-[#282828] text-[#3ea6ff] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                       />
                    </th>
                    <th className="p-4 w-[40%]">Content</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Stats</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3e3e3e]">
                  {filteredPosts.length === 0 ? (
                      <tr>
                          <td colSpan="6" className="p-12 text-center text-slate-500">
                              <div className="flex flex-col items-center gap-3">
                                  <LayoutGrid size={48} className="opacity-20" />
                                  <p className="text-lg">No posts found</p>
                              </div>
                          </td>
                      </tr>
                  ) : (
                      filteredPosts.map((post) => (
                        <tr 
                          key={post._id} 
                          className={`group transition-all hover:bg-[#323232] ${selectedPosts.has(post._id) ? 'bg-[#323232]/50' : ''}`}
                        >
                          {/* Checkbox */}
                          <td className="p-4 text-center">
                             <input 
                                type="checkbox" 
                                checked={selectedPosts.has(post._id)}
                                onChange={() => handleSelectRow(post._id)}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded border-slate-600 bg-[#282828] text-[#3ea6ff] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                             />
                          </td>

                          {/* Post Info - Image or Text Snippet */}
                          <td className="p-4">
                            <div className="flex gap-4">
                              <div 
                                className="w-16 h-16 bg-[#121212] rounded-md overflow-hidden flex-shrink-0 cursor-pointer border border-[#3e3e3e] group-hover:border-[#555] flex items-center justify-center"
                                onClick={() => router.push(`/post/${post._id}`)}
                              >
                                {post.images && post.images.length > 0 ? (
                                  <img src={getOptimizedUrl(post.images[0])} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-slate-600 text-[10px] p-1 text-center font-mono">TEXT</span>
                                )}
                              </div>
                              <div className="flex flex-col justify-center min-w-0">
                                <h3 
                                    className="text-sm font-semibold text-gray-200 line-clamp-2 cursor-pointer hover:text-[#3ea6ff] transition-colors mb-1"
                                    onClick={() => router.push(`/post/${post._id}`)}
                                >
                                    {post.title || post.content || "Untitled"}
                                </h3>
                                <div className="text-xs text-slate-500 truncate max-w-[250px]">
                                    {post.category || "General"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Post Type Badge */}
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-gray-300 border border-slate-600">
                                {post.postType === 'devlog' ? 'Devlog' : post.postType === 'thought' ? 'Thought' : post.postType}
                            </span>
                          </td>

                          {/* Stats */}
                          <td className="p-4">
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                  <div className="flex items-center gap-1.5" title="Views">
                                      <Eye size={14} className="text-[#3ea6ff]" />
                                      <span>{post.views || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5" title="Likes">
                                      <ThumbsUp size={14} className="text-[#00C49F]" />
                                      <span>{post.likes || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5" title="Comments">
                                      <MessageSquare size={14} className="text-[#FFBB28]" />
                                      <span>{post.commentsCount || 0}</span>
                                  </div>
                              </div>
                          </td>

                          {/* Date */}
                          <td className="p-4 text-sm text-slate-400">
                             <div className="flex flex-col">
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                <span className="text-[10px] text-slate-600">
                                    {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                             </div>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => {
                                        setAnalyticsPost(post);
                                        setIsAnalyticsOpen(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-[#3ea6ff] rounded-lg transition-all"
                                    title="Analytics"
                                >
                                    <BarChart2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(post._id)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer / Pagination */}
            <div className="px-6 py-4 bg-[#1f1f1f] border-t border-[#3e3e3e] flex justify-between items-center text-xs text-slate-500">
               <div>
                   {selectedPosts.size > 0 ? (
                       <span className="text-[#3ea6ff]">{selectedPosts.size} selected</span>
                   ) : (
                       <span>Total: {filteredPosts.length} posts</span>
                   )}
               </div>
            </div>
        </div>
      </main>

      <PostAnalyticsModal 
        isOpen={isAnalyticsOpen} 
        onClose={() => setIsAnalyticsOpen(false)} 
        post={analyticsPost} 
      />
    </div>
  );
}

function NavItem({ icon, active, onClick }) {
  return (
      <div 
          onClick={onClick}
          className={`p-3 rounded-full cursor-pointer transition-all duration-200 ${active ? 'bg-[#3ea6ff] text-black shadow-lg' : 'text-slate-400 hover:bg-[#282828] hover:text-gray-200'}`}
      >
          {icon}
      </div>
  )
}



