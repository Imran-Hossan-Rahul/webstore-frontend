"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React from "react";
import Link from "next/link";
import { Search, User, Layout, FileText, BookOpen, Trophy } from "lucide-react";

/**
 * 🔍 SEARCH SUGGESTIONS COMPONENT
 * 
 * Extracted from GlassNavbar for better performance and modularity.
 */
export default function SearchSuggestions({ 
    suggestions, 
    isSearching, 
    handleSearch, 
    totalResults,
    searchType
}) {
    if (isSearching) {
        return (
            <div className="p-4 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                Searching...
            </div>
        );
    }

    if (!suggestions) return null;

    const { 
        users = [], 
        artifacts = [], 
        posts = [], 
        codex = [], 
        jobs = [], 
        challenges = [],
        marketplace = []
    } = suggestions;

    if (totalResults === 0) {
        return <div className="p-4 text-center text-xs font-bold text-slate-500">No results found</div>;
    }

    return (
        <div className="flex flex-col p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {marketplace.length > 0 && (
                <div className="mb-2">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Marketplace</div>
                    {marketplace.slice(0, 2).map(item => (
                        <Link 
                            href={`/market/product/${item._id}`} 
                            key={item._id} 
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group"
                        >
                             <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                                {item.photos && (() => {
                                    try {
                                        const parsedPhotos = JSON.parse(item.photos);
                                        return parsedPhotos[0] ? <img src={getOptimizedUrl(parsedPhotos[0])} className="w-full h-full object-cover" /> : null;
                                    } catch(e) { return null; }
                                })()}
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</span>
                                 <span className="text-[10px] font-bold text-slate-500">BDT {item.selling_price}</span>
                             </div>
                        </Link>
                    ))}
                </div>
            )}

            {users.length > 0 && (
                <div className="mb-2">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Craftsmen</div>
                    {users.slice(0, 2).map(user => (
                        <Link 
                            href={`/u/${user.username || user._id}`} 
                            key={user._id} 
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group"
                        >
                             <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                 {user.profilePicture ? <img src={getOptimizedUrl(user.profilePicture)} className="w-full h-full object-cover" alt="" /> : <User className="w-full h-full p-1 text-slate-400" />}
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors line-clamp-1">{user.name}</span>
                             </div>
                        </Link>
                    ))}
                </div>
            )}

            {artifacts.length > 0 && (
                <div className="mb-2">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Artifacts</div>
                    {artifacts.slice(0, 3).map(artifact => (
                        <Link 
                            href={`/artifacts/${artifact._id}`} 
                            key={artifact._id} 
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group"
                        >
                             <Layout className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors line-clamp-1">{artifact.title}</span>
                        </Link>
                    ))}
                </div>
            )}

            {codex.length > 0 && (
                <div className="mb-2">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Codex</div>
                    {codex.slice(0, 2).map(item => (
                        <Link 
                            href={`/codex/${item.slug}`} 
                            key={item._id} 
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group"
                        >
                             <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</span>
                        </Link>
                    ))}
                </div>
            )}

            {posts.length > 0 && (
                <div className="mb-2">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Posts</div>
                    {posts.slice(0, 2).map(item => (
                        <Link 
                            href={`/post/${item._id}`} 
                            key={item._id} 
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group"
                        >
                             <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title || "Untitled Post"}</span>
                        </Link>
                    ))}
                </div>
            )}

            {jobs.length > 0 && (
                <div className="mb-2">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Jobs</div>
                    {jobs.slice(0, 2).map(item => (
                        <Link 
                            href={`/jobs/${item._id}`} 
                            key={item._id} 
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group"
                        >
                             <Layout className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</span>
                        </Link>
                    ))}
                </div>
            )}

            {challenges.length > 0 && (
                <div className="mb-2">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Challenges</div>
                    {challenges.slice(0, 2).map(item => (
                        <Link 
                            href={`/challenges/${item._id}`} 
                            key={item._id} 
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group"
                        >
                             <Trophy className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</span>
                        </Link>
                    ))}
                </div>
            )}

            {totalResults > 0 && (
                <div className="border-t border-slate-100 dark:border-white/5 mt-1 pt-2 px-2">
                    <button 
                        onClick={handleSearch} 
                        className="w-full text-center px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                    >
                        See all {totalResults} results
                    </button>
                </div>
            )}
        </div>
    );
}
