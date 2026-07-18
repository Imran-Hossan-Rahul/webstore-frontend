"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { Search, Loader2, User, FileText, Layout, ArrowRight, Trophy, Zap, BookOpen, CheckCircle, ShieldCheck, Briefcase, Send } from "lucide-react";
import Link from "next/link";
import AIEnhanceButton from '../AIEnhanceButton';

const HighlightMatch = ({ text, query }) => {
  if (!query || !text || typeof text !== 'string') return <>{text}</>;
  // Escape regex characters in query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-100/80 dark:bg-amber-500/20 text-slate-900 dark:text-amber-100 px-0.5 rounded-sm font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const HighlightedSnippet = ({ text, query, maxLength = 120 }) => {
  if (!text || typeof text !== 'string') return null;
  if (!query) return <>{text.substring(0, maxLength)}{text.length > maxLength ? '...' : ''}</>;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);
  
  if (matchIndex === -1) {
      return <>{text.substring(0, maxLength)}{text.length > maxLength ? '...' : ''}</>;
  }
  
  const halfWindow = Math.floor((maxLength - query.length) / 2);
  let start = Math.max(0, matchIndex - halfWindow);
  let end = Math.min(text.length, matchIndex + query.length + halfWindow);
  
  const snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
  
  return <HighlightMatch text={snippet} query={query} />;
};

const splitMatches = (items, q) => {
    if (!items || !items.length) return { exact: [], partial: [] };
    if (!q || !q.trim()) return { exact: items, partial: [] };
    const lowerQ = q.toLowerCase();
    
    const exact = [];
    const partial = [];
    
    items.forEach(item => {
        const title = (item.title || item.name || item.product_name || item.company || "").toLowerCase();
        const desc = (item.description || item.bio || item.content || item.subtitle || "").toLowerCase();
        
        if (title.includes(lowerQ) || desc.includes(lowerQ)) {
            exact.push(item);
        } else {
            partial.push(item);
        }
    });
    
    return { exact, partial };
};

const MatchRenderer = ({ items, query, renderItem, gridClassName }) => {
    const { exact, partial } = splitMatches(items, query);
    return (
        <div className="space-y-6 w-full mt-4">
            {exact.length > 0 && (
                <div className={gridClassName}>
                    {exact.map(renderItem)}
                </div>
            )}
            {partial.length > 0 && (
                <div className={gridClassName}>
                    {partial.map(renderItem)}
                </div>
            )}
        </div>
    );
};

export default function SearchMain() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "all";
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [displayedQuery, setDisplayedQuery] = useState(query);
  
  const [results, setResults] = useState({ 
      users: [], 
      posts: [], 
      artifacts: [], 
      codex: [],
      jobs: [],
      challenges: [],
      marketplace: [],
      workspace: [],
      proposals: [],
      saved: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(typeParam);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [query]);

  useEffect(() => {
    if (typeParam) {
      setActiveTab(typeParam);
    }
  }, [typeParam]);

  const handleSearch = async (q) => {
    if (!q || !q.trim()) return;
    
    setLoading(true);
    setDisplayedQuery(q);
    
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}${verifiedOnly ? '&verifiedOnly=true' : ''}`);
      if (res.success) {
        setResults(res.data);
      } else {
        setResults({ users: [], posts: [], artifacts: [], codex: [], jobs: [], challenges: [], marketplace: [], workspace: [], proposals: [], saved: [] });
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
  const totalResults = (results.users?.length || 0) + (results.posts?.length || 0) + (results.artifacts?.length || 0) + (results.codex?.length || 0) + (results.jobs?.length || 0) + (results.challenges?.length || 0) + (results.marketplace?.length || 0);

  return (
    <div className="bg-transparent">
      <div className="max-w-6xl">
        
        {/* Search Results Summary */}
        <div className="mb-8 flex flex-col gap-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-slate-900 dark:text-white" />
                    Search Results
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {loading ? "Searching..." : `Found ${totalResults} results for "${displayedQuery}"`}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { id: "all", label: "All", icon: Layout },
                    { id: "patrons", label: "Craftsmen", icon: User, count: results.users?.length },
                    { id: "posts", label: "Posts", icon: FileText, count: results.posts?.length },
                    { id: "artifacts", label: "Artifacts", icon: Layout, count: results.artifacts?.length },
                    { id: "codex", label: "Codex", icon: BookOpen, count: results.codex?.length },
                    { id: "jobs", label: "Jobs", icon: null, count: results.jobs?.length },
                    { id: "challenges", label: "Challenges", icon: Trophy, count: results.challenges?.length },
                    { id: "marketplace", label: "Marketplace", icon: Layout, count: results.marketplace?.length },
                    { id: "workspace", label: "Workspace", icon: Briefcase, count: 0 },
                    { id: "proposals", label: "Proposals", icon: Send, count: 0 },
                    { id: "saved", label: "Saved", icon: CheckCircle, count: 0 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                            activeTab === tab.id
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                            : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5"
                        }`}
                    >
                        {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>


        </div>

        {/* Results Content */}
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-32 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
                ))}
             </div>
        ) : totalResults === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No matches found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                    We couldn't find anything matching "{displayedQuery}". Try different keywords.
                </p>
            </div>
        ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Users Section */}
                {results.users?.length > 0 && (activeTab === 'all' || activeTab === 'users' || activeTab === 'patrons') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Craftsmen</h2>
                        </div>
                        <MatchRenderer 
                            items={results.users} 
                            query={displayedQuery} 
                            gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            renderItem={(user) => (
                                <Link href={`/u/${user.username || user._id}`} key={user._id}>
                                    <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden border border-slate-50 dark:border-white/10">
                                                {user.profilePicture ? (
                                                    <img src={getOptimizedUrl(user.profilePicture)} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400">
                                                        {user.name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-white transition-colors truncate flex items-center gap-1.5">
                                                    <HighlightMatch text={user.name} query={displayedQuery} />
                                                    {user.isVerified && <CheckCircle className="w-3.5 h-3.5 text-slate-900 dark:text-white" fill="currentColor" />}
                                                </h3>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                                    @<HighlightMatch text={user.username || "user"} query={displayedQuery} />
                                                </p>
                                                {user.bio && (
                                                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                                                        <HighlightedSnippet text={user.bio} query={displayedQuery} maxLength={60} />
                                                    </p>
                                                )}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-all opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </div>
                                </Link>
                            )}
                        />
                    </section>
                )}

                {/* Artifacts Section */}
                {results.artifacts?.length > 0 && (activeTab === 'all' || activeTab === 'artifacts') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Artifacts</h2>
                        </div>
                        <MatchRenderer 
                            items={results.artifacts} 
                            query={displayedQuery} 
                            gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            renderItem={(artifact) => (
                                <Link href={`/artifacts/${artifact._id}`} key={artifact._id} className="group">
                                    <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-white transition-colors line-clamp-1">
                                            <HighlightMatch text={artifact.title} query={displayedQuery} />
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-medium">
                                            <HighlightedSnippet text={artifact.description} query={displayedQuery} maxLength={100} />
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {(() => {
                                                const matchedTags = artifact.tags?.filter(t => t.toLowerCase().includes(displayedQuery.toLowerCase())) || [];
                                                const otherTags = artifact.tags?.filter(t => !t.toLowerCase().includes(displayedQuery.toLowerCase())) || [];
                                                return [...matchedTags, ...otherTags].slice(0,3).map(tag => (
                                                    <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-white/5 rounded text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5">
                                                        #<HighlightMatch text={tag} query={displayedQuery} />
                                                    </span>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </Link>
                            )}
                        />
                    </section>
                )}

                {/* Posts/Codex Section */}
                {results.posts?.length > 0 && (activeTab === 'all' || activeTab === 'posts') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Posts & Codex</h2>
                        </div>
                        <MatchRenderer 
                            items={results.posts} 
                            query={displayedQuery} 
                            gridClassName="grid grid-cols-1 gap-3"
                            renderItem={(post) => (
                                <Link href={`/post/${post._id}`} key={post._id}>
                                    <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all flex items-start gap-4 group">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors">
                                            <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                                        </div>
                                         <div className="flex-1 min-w-0">
                                             <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-slate-700 dark:group-hover:text-white transition-colors line-clamp-1">
                                                <HighlightMatch text={post.title || (post.content ? post.content.substring(0, 50) : "Untitled Post")} query={displayedQuery} />
                                             </h3>
                                             {post.content && (
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1 font-medium">
                                                    <HighlightedSnippet text={post.content} query={displayedQuery} maxLength={120} />
                                                </p>
                                             )}

                                             <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                 <span className="text-slate-500 dark:text-slate-300 flex items-center gap-1">
                                                     {post.user?.name}
                                                     {post.user?.isVerified && <CheckCircle className="w-2.5 h-2.5 text-slate-900 dark:text-white" fill="currentColor" />}
                                                 </span>
                                                <span>•</span>
                                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                             </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            )}
                        />
                    </section>
                )}

                {/* Codex Section */}
                {results.codex?.length > 0 && (activeTab === 'all' || activeTab === 'codex') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Codex & Codex</h2>
                        </div>
                        <MatchRenderer 
                            items={results.codex} 
                            query={displayedQuery} 
                            gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
                            renderItem={(codex) => (
                                <Link href={`/codex/${codex.slug}`} key={codex._id} className="block h-full">
                                    <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[9px] font-black bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white px-2 py-0.5 rounded uppercase transition-colors">{codex.category || 'Codex'}</span>
                                            <span className="text-[9px] text-slate-400 font-bold">{codex.readTime || '5 min read'}</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-white transition-colors line-clamp-1 leading-tight">
                                            <HighlightMatch text={codex.title} query={displayedQuery} />
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-medium mb-4 flex-grow">
                                            <HighlightedSnippet text={codex.subtitle || codex.content} query={displayedQuery} maxLength={120} />
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                                                    {codex.author?.profilePicture && <img src={getOptimizedUrl(codex.author.profilePicture)} className="w-full h-full object-cover" />}
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                                    {codex.author?.name}
                                                    {codex.author?.isVerified && <CheckCircle className="w-2.5 h-2.5 text-slate-900 dark:text-white" fill="currentColor" />}
                                                </span>
                                            </div>
                                            <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        />
                    </section>
                )}

                {/* Jobs Section */}
                {results.jobs?.length > 0 && (activeTab === 'all' || activeTab === 'jobs') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Jobs</h2>
                        </div>
                        <MatchRenderer 
                            items={results.jobs} 
                            query={displayedQuery} 
                            gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            renderItem={(job) => (
                                <Link href={`/jobs/${job._id}`} key={job._id}>
                                    <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors">
                                                {/* Icon removed */}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    {job.patron?.name}
                                                    {job.patron?.isVerified && <CheckCircle className="w-2.5 h-2.5 text-slate-900 dark:text-white" fill="currentColor" />}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-500">{job.budget?.type === "hourly" ? "Hourly" : "Fixed-price"}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-white transition-colors line-clamp-2 leading-tight">
                                            <HighlightMatch text={job.title} query={displayedQuery} />
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-medium mb-4 flex-grow">
                                            <HighlightedSnippet text={job.description} query={displayedQuery} maxLength={100} />
                                        </p>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-white/5">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                <Zap size={12} className="text-slate-900 dark:text-white" />
                                                {job.budget?.min}–{job.budget?.max} {job.budget?.currency || 'TKNS'}
                                            </span>
                                            <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            )}
                        />
                    </section>
                )}

                {/* Challenges Section */}
                {results.challenges?.length > 0 && (activeTab === 'all' || activeTab === 'challenges') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Challenges</h2>
                        </div>
                        <MatchRenderer 
                            items={results.challenges} 
                            query={displayedQuery} 
                            gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
                            renderItem={(challenge) => (
                                <Link href={`/challenges/${challenge._id}`} key={challenge._id}>
                                    <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors">
                                                <Trophy className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{challenge.difficulty || 'All Levels'}</span>
                                                <span className="text-[10px] font-bold text-slate-500 capitalize">{challenge.status?.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-white transition-colors line-clamp-2 leading-tight">
                                            <HighlightMatch text={challenge.title} query={displayedQuery} />
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-medium mb-4 flex-grow">
                                            <HighlightedSnippet text={challenge.description} query={displayedQuery} maxLength={120} />
                                        </p>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-white/5">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                <Trophy size={12} className="text-amber-500" />
                                                Prize: {challenge.prize}
                                            </span>
                                            <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            )}
                        />
                    </section>
                )}

                {/* Marketplace Section */}
                {results.marketplace?.length > 0 && (activeTab === 'all' || activeTab === 'marketplace') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Marketplace</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {results.marketplace.map((product) => (
                                 <Link href={`/market/product/${product._id}`} key={product._id} className="group">
                                     <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all">
                                        <div className="w-full h-32 mb-3 bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden relative">
                                            {product.photos && (() => {
                                                try {
                                                    const parsedPhotos = JSON.parse(product.photos);
                                                    return parsedPhotos[0] ? <img src={getOptimizedUrl(parsedPhotos[0])} className="w-full h-full object-cover" /> : null;
                                                } catch(e) { return null; }
                                            })()}
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-white transition-colors line-clamp-1">
                                            <HighlightMatch text={product.title} query={displayedQuery} />
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-medium">
                                            <HighlightedSnippet text={product.description} query={displayedQuery} maxLength={100} />
                                        </p>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-white/5">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">BDT {product.selling_price}</span>
                                            <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-white/5 rounded text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5">
                                                {product.category || 'Product'}
                                            </span>
                                        </div>
                                    </div>
                                 </Link>
                             ))}
                        </div>
                    </section>
                )}
                {/* Workspace Special Section */}
                {activeTab === 'workspace' && (
                    <div className="text-center py-16 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Search Your Workspace</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium mb-8">
                            Your workspace is private and contains your personal projects and tasks. Click below to go to your workspace.
                        </p>
                        <Link href={`/workspace?q=${encodeURIComponent(displayedQuery)}`} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                            View Workspace
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

                {/* Proposals Special Section */}
                {activeTab === 'proposals' && (
                    <div className="text-center py-16 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Search Your Proposals</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium mb-8">
                            Your proposals are private. Click below to view and search your submitted proposals.
                        </p>
                        <Link href={`/proposals?q=${encodeURIComponent(displayedQuery)}`} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 transition-all">
                            View Proposals
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

                {/* Saved Special Section */}
                {activeTab === 'saved' && (
                    <div className="text-center py-16 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Search Saved Items</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium mb-8">
                            Your saved items are private to your account. Click below to explore and search your personal saved folder.
                        </p>
                        <Link href={`/saved?q=${encodeURIComponent(displayedQuery)}`} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                            View Saved Items
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

            </div>
        )}

      </div>
    </div>
  );
}
