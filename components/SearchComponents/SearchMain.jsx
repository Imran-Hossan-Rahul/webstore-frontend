"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { Search, User, FileText, Layout, ArrowRight, Trophy, Zap, BookOpen, CheckCircle, ShieldCheck, Briefcase, Send } from "lucide-react";
import Link from "next/link";
import AIEnhanceButton from '../AIEnhanceButton';
import AppleSpinner from "@/components/ui/AppleSpinner";

const HighlightMatch = ({ text }) => {
  return <>{text}</>;
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
      marketplace: []
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
        setResults({ marketplace: [] });
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
  const totalResults = (results.marketplace?.length || 0);

  return (
    <div className="bg-transparent">
      <div className="max-w-6xl">
        
        {/* Search Results Summary */}
        <div className="mb-8 flex flex-col gap-4">
            <div>
                <h1 className="text-[28px] font-semibold tracking-tight text-slate-900 dark:text-white">
                    Search Results
                </h1>
                <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1">
                    {loading ? "Searching..." : `Found ${totalResults} results for "${displayedQuery}"`}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-100/50 dark:bg-white/5 p-1 rounded-[4px] w-fit">
                {[
                    { id: "all", label: "All", icon: Layout },
                    { id: "marketplace", label: "Marketplace", icon: Layout, count: results.marketplace?.length },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-[4px] font-medium text-[13px] transition-all whitespace-nowrap ${
                            activeTab === tab.id
                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                            : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-brand-slate dark:hover:text-slate-300"
                        }`}
                    >
                        {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-slate-100 dark:bg-slate-700' : 'bg-slate-200/50 dark:bg-white/10'}`}>
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
                    <div key={i} className="h-32 bg-slate-100 dark:bg-white/5 rounded-[4px] border border-slate-200/50 dark:border-white/5" />
                ))}
             </div>
        ) : totalResults === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-white/5 rounded-[4px] border border-dashed border-slate-200 dark:border-white/10 shadow-sm">
                <div className="w-16 h-16 bg-brand-cloud dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No matches found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                    We couldn&apos;t find anything matching &quot;{displayedQuery}&quot;. Try different keywords.
                </p>
            </div>
        ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Removed legacy sections */}

                {/* Marketplace Section */}
                {results.marketplace?.length > 0 && (activeTab === 'all' || activeTab === 'marketplace') && (
                    <section>
                        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">Marketplace</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                             {results.marketplace.map((product) => (
                                 <Link href={`/market/product/${product._id}`} key={product._id} className="group">
                                     <div className="bg-white dark:bg-[#1d1d1f] rounded-[18px] p-5 shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-lg transition-all duration-300">
                                        <div className="w-full h-36 mb-4 bg-brand-cloud dark:bg-white/5 rounded-[4px] overflow-hidden relative border border-slate-100 dark:border-transparent flex items-center justify-center">
                                            {product.photos && (() => {
                                                try {
                                                    const parsedPhotos = JSON.parse(product.photos);
                                                    return parsedPhotos[0] ? <img src={getOptimizedUrl(parsedPhotos[0])} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal p-2" /> : null;
                                                } catch(e) { return null; }
                                            })()}
                                        </div>
                                        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white group-hover:text-brand-blue transition-colors line-clamp-1">
                                            <HighlightMatch text={product.title} />
                                        </h3>
                                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                            <HighlightedSnippet text={product.description} query={displayedQuery} maxLength={100} />
                                        </p>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                            <span className="text-[15px] font-semibold text-slate-900 dark:text-white">BDT {product.selling_price}</span>
                                            <span className="text-[11px] font-medium px-2.5 py-1 bg-brand-cloud dark:bg-white/5 rounded-full text-slate-500 dark:text-slate-400">
                                                {product.category || 'Product'}
                                            </span>
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
