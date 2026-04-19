"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { Search, Loader2, User, FileText, Layout, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import AIEnhanceButton from '../AIEnhanceButton';

export default function SearchMain() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(query);
  // Separate state for what results are currently showing for
  const [displayedQuery, setDisplayedQuery] = useState(query);
  
  const [results, setResults] = useState({ 
      users: [], 
      posts: [], 
      templates: [], 
      blogs: [] 
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [query]);

  const handleSearch = async (q) => {
    if (!q || !q.trim()) return;
    
    setLoading(true);
    setDisplayedQuery(q);
    
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
      if (res.success) {
        setResults(res.data);
      } else {
        setResults({ users: [], posts: [], templates: [], blogs: [] });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Helper to count total results
  const totalResults = (results.users?.length || 0) + (results.posts?.length || 0) + (results.templates?.length || 0) + (results.blogs?.length || 0);

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] pt-24 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Search Header */}
        <div className="mb-12">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                Search Results
            </h1>
            
            <form onSubmit={onSearchSubmit} className="relative max-w-2xl">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-2 flex items-center shadow-xl">
                        <Search className="w-6 h-6 text-gray-400 ml-4" />
                        
                        <div className="ml-2">
                             <AIEnhanceButton 
                                text={searchQuery} 
                                onUpdate={setSearchQuery}
                                placement="bottom"
                             />
                        </div>

                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search creators, templates, resources..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 text-gray-900 dark:text-white placeholder:text-gray-500 font-medium h-12"
                        />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </form>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {[
                { id: "all", label: "All Results", icon: Layout },
                { id: "users", label: "Creators", icon: User, count: results.users?.length },
                { id: "posts", label: "Posts", icon: FileText, count: results.posts?.length },
                { id: "templates", label: "Templates", icon: Layout, count: results.templates?.length },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                        activeTab === tab.id
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-purple-500/20"
                        : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count > 0 && (
                        <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-white/10'}`}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>

        {/* Results Content */}
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-48 bg-gray-200 dark:bg-white/5 rounded-2xl" />
                ))}
             </div>
        ) : totalResults === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-white/10">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    We couldn't find anything matching "{displayedQuery}". Try searching for something else or use the AI Enhance button to refine your query.
                </p>
            </div>
        ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                
                {/* Users Section */}
                {results.users?.length > 0 && (activeTab === 'all' || activeTab === 'users') && (
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-500" /> Creators
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {results.users.map((user) => (
                                <Link href={`/profile/${user._id}`} key={user._id}>
                                    <div className="bg-white dark:bg-[#111] p-4 rounded-xl border border-gray-100 dark:border-white/5 hover:border-purple-500/30 hover:shadow-xl hover:-translate-y-1 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#222] overflow-hidden">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                                                        {user.name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">{user.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{user.bio || "No bio yet"}</p>
                                                {user.hasCreatorAccount && (
                                                    <span className="inline-block mt-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] font-bold rounded">CREATOR</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Templates Section */}
                {results.templates?.length > 0 && (activeTab === 'all' || activeTab === 'templates') && (
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                             <Layout className="w-5 h-5 text-pink-500" /> Templates
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {results.templates.map((template) => (
                                 <Link href={`/template/${template._id}`} key={template._id} className="group">
                                    <div className="bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 hover:shadow-2xl hover:shadow-pink-500/10 transition-all">
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-pink-500 transition-colors">{template.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{template.description}</p>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {template.tags?.slice(0,3).map(tag => (
                                                    <span key={tag} className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-gray-600 dark:text-gray-300">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                 </Link>
                             ))}
                        </div>
                    </section>
                )}

                {/* Posts/Blogs Section */}
                {results.posts?.length > 0 && (activeTab === 'all' || activeTab === 'posts') && (
                    <section>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                             <FileText className="w-5 h-5 text-blue-500" /> Posts & Blogs
                        </h2>
                        <div className="space-y-4">
                            {results.posts.map((post) => (
                                <Link href={`/post/${post._id}`} key={post._id}>
                                    <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all flex gap-4">
                                        <div className="flex-1">
                                             <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                                    {post.user?.profilePicture && <img src={post.user.profilePicture} className="w-full h-full object-cover" />}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{post.user?.name}</span>
                                                <span className="text-xs text-gray-400">• {new Date(post.createdAt).toLocaleDateString()}</span>
                                             </div>
                                             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{post.content?.substring(0, 80) || "Untitled Post"}...</h3>
                                             <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{post.projectStats?.tools?.join(", ")}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        )}

      </div>
    </div>
  );
}
