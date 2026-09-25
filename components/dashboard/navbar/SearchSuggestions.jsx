"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React from "react";
import Link from "next/link";
import { Search, User, Layout, FileText, BookOpen, Trophy } from "lucide-react";

import AppleSpinner from "@/components/ui/AppleSpinner";

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
                <AppleSpinner size={16} />
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
        <div className="flex flex-col p-2 max-h-[60vh] overflow-y-auto custom-scrollbar font-sans antialiased">
            {marketplace.length > 0 && (
                <div className="mb-2 mt-1">
                    {marketplace.slice(0, 5).map(item => (
                        <Link 
                            href={`/product/${item._id}`} 
                            key={item._id} 
                            className="flex items-center gap-3 px-3 py-2 mx-1 hover:bg-slate-100/80 dark:hover:bg-white/5 rounded-[4px] transition-all group"
                        >
                             <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-cloud dark:bg-white/5 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-white/5">
                                {item.photos && (() => {
                                    try {
                                        const parsedPhotos = Array.isArray(item.photos) ? item.photos : JSON.parse(item.photos);
                                        return parsedPhotos[0] ? <img src={getOptimizedUrl(parsedPhotos[0])} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" /> : null;
                                    } catch(e) { return null; }
                                })()}
                             </div>
                             <div className="flex flex-col flex-1 min-w-0 justify-center">
                                 <span className="text-[13.5px] font-medium tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors truncate">{item.title}</span>
                                 <span className="text-[11.5px] font-medium tracking-tight text-[#86868b] dark:text-[#86868b] transition-colors">BDT {item.selling_price}</span>
                             </div>
                        </Link>
                    ))}
                </div>
            )}

            {totalResults > 0 && (
                <div className="border-t border-slate-100 dark:border-white/10 mt-1 pt-2 px-1">
                    <button 
                        onClick={handleSearch} 
                        className="w-full text-center px-3 py-2 text-[13px] font-medium text-brand-blue dark:text-[#2997ff] hover:underline rounded-xl transition-all"
                    >
                        See all {totalResults} results
                    </button>
                </div>
            )}
        </div>
    );
}
