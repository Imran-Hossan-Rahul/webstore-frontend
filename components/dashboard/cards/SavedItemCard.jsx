"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Trash2, Eye, Clock, PenTool, Layout, Code, Share2, ExternalLink, Trophy, Zap, FolderPlus, Quote, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CraftsmanHoverCard from "./CraftsmanHoverCard";
import { api } from "@/utils/api";
import { useToast } from "../../ui/ToastProvider";
import { useUser } from "@/context/UserContext";
import { useShare } from "@/hooks/useShare";
import AppleSpinner from "@/components/ui/AppleSpinner";

const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '').trim();
};

const SavedItemCard = ({ item, onRemove, folders, onMove, onRemoveFromFolder, searchQuery }) => {
    const type = item.type || 'devlog';
    let TypeIcon = Code;
    let href = `/post/${item._id}`;
    const rawCat = item.category || type || "";
    const itemCat = rawCat.toLowerCase() === 'code' ? 'Dev' : rawCat;
    const typeLabel = itemCat.charAt(0).toUpperCase() + itemCat.slice(1).toLowerCase();
    
    if (type === 'codex') {
        TypeIcon = PenTool;
        href = `/codex/${item.slug}`;
    } else if (type === 'artifact') {
        TypeIcon = Layout;
        href = `/artifacts/${item._id}`;
    } else if (type === 'job') {
        TypeIcon = Zap;
        href = `/jobs/${item._id}`;
    } else if (type === 'challenge') {
        TypeIcon = Trophy;
        href = `/challenges/${item._id}`;
    } else if (type === 'note') {
        TypeIcon = Quote;
        let noteUrl = item.codex ? `/codex/${item.codex.slug}` : item.sourceUrl;
        if (noteUrl && noteUrl.startsWith('http') && noteUrl.includes('.vercel.app')) {
            try {
                noteUrl = new URL(noteUrl).pathname;
            } catch(e) {}
        }
        href = noteUrl || '#';
    }

    const router = useRouter();
    const { showToast } = useToast();
    const { user, isGuest } = useUser();
    const { share } = useShare();
    const [movingFolderId, setMovingFolderId] = useState(null);
    
    // Optimistic Like State
    const initialLikesCount = Array.isArray(item.likes) ? item.likes.length : (item.likesCount || item.likes || 0);
    const initialIsLiked = item.isLiked || (
        Array.isArray(item.likes) && user && item.likes.some(like => {
            const likeId = typeof like === 'object' ? like._id?.toString() : like?.toString();
            return likeId === user._id?.toString();
        })
    );
    const [likeCount, setLikeCount] = useState(initialLikesCount);
    const [isLiked, setIsLiked] = useState(initialIsLiked || false);

    const author = item.user || item.author;
    const imageUrl = item.previewFile || item.coverImage || (item.images && item.images.length > 0 ? item.images[0] : null);

    const handleCardClick = (e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.no-click')) return;
        router.push(href);
    };

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        let endpoint = '';
        let method = 'POST';
        const id = item.slug || item._id || item.id;
        
        if (type === 'codex') endpoint = `/codex/${id}/like`;
        else if (type === 'artifact') endpoint = `/artifacts/${item._id || item.id}/like`;
        else if (type === 'devlog' || item.content) { endpoint = `/posts/${item._id || item.id}/like`; method = 'PUT'; }
        
        if (isGuest) {
            showToast("Please login to like items", "info");
            return;
        }

        if (!endpoint) {
            showToast("Likes not supported for this item yet.", "info");
            return;
        }

        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            const res = method === 'PUT' ? await api.put(endpoint) : await api.post(endpoint);
            if (!(res.success || res.status === 'success' || res.message)) {
                // Revert on failure
                setIsLiked(!newIsLiked);
                setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1);
            }
        } catch (err) {
            setIsLiked(!newIsLiked);
            setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1);
            showToast("Failed to like item", "error");
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await share({
            title: item.title || "Check this out on Codalina",
            text: stripHtml(item.description || (typeof item.content === 'string' ? item.content : "") || item.bio || item.requirements || ""),
            url: href
        });
    };

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const parts = text.toString().split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === query.toLowerCase() 
                ? <mark key={i} className="bg-yellow-200 dark:bg-brand-amber/30 text-inherit rounded-sm px-0.5">{part}</mark> 
                : part
        );
    };

    return (
        <div 
            onClick={handleCardClick}
            className="group relative flex flex-col bg-brand-surface dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/10 hover:shadow-sm hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
        >
            
            {/* Top Indicator / Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md backdrop-blur-md bg-brand-surface/90 dark:bg-slate-900/90 border border-brand-navy/[0.08] dark:border-white/10 shadow-sm">
                <span className="text-slate-900 dark:text-white">
                    {TypeIcon && <TypeIcon size={11} strokeWidth={1.5} />}
                </span>
                <span className="text-[9px] font-bold text-slate-900 dark:text-white">
                    {typeLabel}
                </span>
            </div>

            {/* Remove Action */}
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(item._id || item.id, type);
                }}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-brand-surface/90 dark:bg-slate-900/90 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 shadow-sm"
                title="Remove from Saved"
            >
                <Trash2 size={14} strokeWidth={1.5} />
            </button>

            {/* Preview Image / Placeholder */}
            {type === 'note' ? (
                <div className="relative h-48 bg-amber-50 dark:bg-brand-amber/10 p-6 flex flex-col justify-center">
                    <Quote className="text-amber-200 dark:text-amber-900/50 absolute top-4 left-4 w-12 h-12 -rotate-6" />
                    <p className="relative z-10 text-sm font-medium italic text-brand-slate dark:text-slate-300 line-clamp-4 leading-relaxed">
                        &quot;{item.highlightedText}&quot;
                    </p>
                </div>
            ) : (
                <div className="relative h-48 bg-brand-cloud dark:bg-brand-surface/50 block overflow-hidden">
                    {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt={item.title}
                            className="w-full h-full object-cover transition-opacity duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-brand-slate dark:text-slate-300">
                            {TypeIcon && <TypeIcon size={48} strokeWidth={1} />}
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                    <CraftsmanHoverCard
                        userId={author?._id}
                        displayName={author?.name}
                        username={author?.username}
                        avatarUrl={author?.profilePicture}
                    >
                        <div className="flex items-center gap-2 cursor-pointer group/author">
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-brand-surface/5 overflow-hidden ring-1 ring-slate-100 dark:ring-white/10 shrink-0">
                                {author?.profilePicture ? (
                                    <img src={getOptimizedUrl(author.profilePicture)} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700" />
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors">
                                {highlightText(author?.name || "Anonymous", searchQuery)}
                            </span>
                        </div>
                    </CraftsmanHoverCard>
                    <span className="text-slate-300 dark:text-brand-slate dark:text-slate-300">·</span>
                    <span className="text-[10px] font-medium text-slate-400">
                        {item.createdAt ? formatDistanceToNow(new Date(item.createdAt)) : "recently"}
                    </span>
                </div>

                <div className="block mb-4 flex-1">
                    <h3 className="font-bold text-[15px] text-slate-900 dark:text-white leading-snug line-clamp-2 transition-colors mb-2">
                        {highlightText(type === 'note' ? (item.title || "Highlighted Snippet") : (item.title || "Untitled Masterpiece"), searchQuery)}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {highlightText(type === 'note' ? (item.noteContent || (item.codex ? `From: ${item.codex.title}` : "Saved Note")) : stripHtml(item.description || (typeof item.content === 'string' ? item.content : "") || item.bio || item.requirements || "No description available."), searchQuery)}
                    </p>
                </div>

                {/* Type-Specific Meta */}
                <div className="mb-0">
                    {type === 'job' && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-900 dark:text-white bg-brand-cloud dark:bg-brand-surface/5 px-2.5 py-1 rounded-lg w-fit border border-slate-100 dark:border-white/10">
                            <Zap size={12} strokeWidth={1.5} className="text-slate-400" />
                            <span>{item.budget?.min}-{item.budget?.max} TKNS</span>
                        </div>
                    )}
                    {type === 'challenge' && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-900 dark:text-white bg-brand-cloud dark:bg-brand-surface/5 px-2.5 py-1 rounded-lg w-fit border border-slate-100 dark:border-white/10">
                            <Trophy size={12} strokeWidth={1.5} className="text-slate-400" />
                            <span>{item.prize} Prize Pool</span>
                        </div>
                    )}
                    {(type === 'devlog' || type === 'artifact') && item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {item.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-[9px] font-bold text-slate-400er border border-slate-100 dark:border-white/5 px-1.5 py-0.5 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50 dark:border-white/5">
                    <div className="relative group/folder">
                        <button className="p-1.5 text-slate-300 hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors" title="Move to Folder">
                            <FolderPlus size={14} strokeWidth={1.5} />
                        </button>
                        
                        <div className="absolute bottom-full left-0 pb-2 w-52 opacity-0 invisible group-hover/folder:opacity-100 group-hover/folder:visible transition-all z-30">
                            <div className="bg-brand-surface dark:bg-slate-900 border border-brand-navy/[0.08] dark:border-white/10 rounded-xl shadow-sm py-2">
                                <p className="px-4 py-1 text-[10px] font-black text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">Move to...</p>
                                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                    {(() => {
                                        const itemId = item._id || item.id;
                                        // Find current folder this item belongs to (if any)
                                        const currentFolderId = folders?.find(f =>
                                            f.items?.some(fi => (fi.itemId || fi) === itemId)
                                        )?._id;
                                        // Only show folders this item is NOT already in
                                        const availableFolders = (folders || []).filter(f => f._id !== currentFolderId);

                                        if (availableFolders.length === 0) {
                                            return <p className="px-4 py-2 text-[10px] text-slate-400 italic">No other folders</p>;
                                        }
                                        return availableFolders.map(folder => (
                                            <button
                                                key={folder._id}
                                                onClick={async () => {
                                                    setMovingFolderId(folder._id);
                                                    try {
                                                        await onMove(itemId, folder._id, type);
                                                    } finally {
                                                        setMovingFolderId(null);
                                                    }
                                                }}
                                                disabled={movingFolderId === folder._id}
                                                className="w-full text-left px-4 py-2 text-[12px] font-bold text-brand-slate dark:text-slate-400 hover:bg-brand-cloud dark:hover:bg-brand-surface/5 hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {movingFolderId === folder._id ? (
                                                    <AppleSpinner className="w-3 h-3 animate-spin text-brand-blue" />
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: folder.color || '#64748b' }} />
                                                )}
                                                <span className="truncate">{folder.name}</span>
                                            </button>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button 
                            onClick={handleLike} 
                            className={`p-1.5 transition-colors flex items-center gap-1 rounded-md ${isLiked ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10' : 'text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-brand-cloud dark:hover:bg-brand-surface/5'}`} 
                            title={isLiked ? "Unlike" : "Star"}
                        >
                            <Star size={14} strokeWidth={1.5} className={isLiked ? 'fill-current' : ''} />
                            <span className={`text-[10px] font-bold ${isLiked ? 'text-rose-500' : 'text-slate-400'}`}>{likeCount}</span>
                        </button>
                        <div className="flex items-center gap-1 px-1.5">
                            <span className="text-[10px] font-bold text-slate-400"><Eye size={12} className="inline mr-0.5" />{item.views || item.viewCount || 0}</span>
                        </div>
                        <button onClick={handleShare} className="p-1.5 text-slate-300 hover:text-brand-blue dark:hover:text-indigo-400 hover:bg-brand-sky dark:hover:bg-brand-blue/10 rounded-md transition-colors ml-auto" title="Share">
                            <Share2 size={14} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavedItemCard;



