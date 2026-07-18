import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PenTool, Layout, Code, Heart, Eye, MessageCircle, HelpCircle, CheckCircle, AlertCircle, Lightbulb, Flame, BookOpen, Share2, Edit3, Bookmark } from "lucide-react";
import Link from "next/link";
import CraftsmanHoverCard from "./CraftsmanHoverCard";
import { api } from "@/utils/api";
import { useUser } from "@/context/UserContext";
import { useShare } from "@/hooks/useShare";
import DiscussionBadges from '../ui/DiscussionBadges';

export default function ClassicExploreCard({ item, viewMode = 'grid', gridCols = 3 }) {
    const { user } = useUser();
    let type = item.type;
    
    if (!type) {
         if (item.slug && !item.priceType && !item.devlogStats) type = 'codex';
         else if (item.code || item.html || item.priceType) type = 'artifact';
         else type = 'devlog';
    }

    let TypeIcon = Code;
    let typeLabel = "Devlog";
    let href = `/post/${item._id}`;
    let iconColor = "text-purple-500";
    let bgColor = "bg-purple-50 dark:bg-purple-500/10";

    if (type === 'codex') {
        TypeIcon = PenTool;
        typeLabel = "Codex";
        href = `/codex/${item.slug}`;
        iconColor = "text-orange-500";
        bgColor = "bg-orange-50 dark:bg-orange-500/10";
    } else if (type === 'artifact') {
        TypeIcon = Layout;
        typeLabel = "Artifact";
        href = `/artifacts/${item._id}`;
        iconColor = "text-indigo-600";
        bgColor = "bg-blue-50 dark:bg-indigo-600/10";
    }

    const authorName = item.user?.name || item.author?.name || "Craftsman";
    const initialAvatar = item.user?.profilePicture || item.user?.avatar || item.author?.profilePicture || item.author?.avatar;
    const authorId = item.user?._id || item.author?._id || item.userId?._id || item.userId;
    const isOwner = user && authorId === user._id;
    const router = useRouter();
    const { share } = useShare();

    const rawDesc = item.description || item.excerpt || item.subtitle || item.shortDescription || item.content;
    const descriptionText = typeof rawDesc === 'string' ? rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

    // Resolve the best image to show
    const displayImage = item.previewFile || item.coverImage || (item.images && item.images.length > 0 ? item.images[0] : null) || (item.media && item.media.length > 0 ? item.media[0]?.url : null);

    // Dynamic Avatar Fetching
    const [craftsmanAvatar, setCraftsmanAvatar] = useState(null);
    
    React.useEffect(() => {
        if (authorId && !initialAvatar) {
            if (window.__avatarCache && window.__avatarCache[authorId]) {
                setCraftsmanAvatar(window.__avatarCache[authorId]);
                return;
            }
            
            api.get(`/craftsman/${authorId}`)
                .then(res => {
                    if (res.success && res.data) {  
                        const fetchedAvatar = res.data.profilePicture || res.data.userId?.profilePicture;
                        if (fetchedAvatar) {
                            setCraftsmanAvatar(fetchedAvatar);
                            window.__avatarCache = window.__avatarCache || {};
                            window.__avatarCache[authorId] = fetchedAvatar;
                        }
                    }
                })
                .catch(() => {});
        }
    }, [authorId, initialAvatar]);

    const finalAvatar = craftsmanAvatar || initialAvatar;

    // Like Logic & Craftsman
    const initialLikesCount = item.likesCount !== undefined ? item.likesCount : (typeof item.likes === 'number' ? item.likes : (Array.isArray(item.likes) ? item.likes.length : 0));
    const initialIsLiked = item.isLiked === true;

    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);

    const initialIsFavorited = item.isFavorited === true;
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isFavoriting, setIsFavoriting] = useState(false);

    const handleFavorite = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (isFavoriting) return;
        setIsFavoriting(true);

        const currentIsFavorited = isFavorited;
        setIsFavorited(!currentIsFavorited);

        try {
            let itemType = '';
            if (type === 'codex') itemType = 'Codex';
            else if (type === 'artifact') itemType = 'Artifact';
            else itemType = 'Post';

            await api.post('/favorites/toggle', { postId: item._id || item.id, itemType });
        } catch (error) {
            setIsFavorited(currentIsFavorited);
        } finally {
            setTimeout(() => setIsFavoriting(false), 600);
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const currentIsLiked = isLiked;
        setIsLiked(!currentIsLiked);
        setLikesCount(prev => currentIsLiked ? Math.max(0, prev - 1) : prev + 1);

        try {
            let endpoint = '';
            if (type === 'codex') endpoint = `/codex/${item.slug}/like`;
            else if (type === 'artifact') endpoint = `/artifact/${item._id || item.id}/like`;
            else endpoint = `/devlog/${item._id || item.id}/like`;

            const res = await api.post(endpoint);
            if (res.success || res.queued !== undefined) {
                const backendLiked = res.liked !== undefined ? res.liked : res.isLiked;
                if (backendLiked !== undefined) setIsLiked(backendLiked);
                
                const backendCount = res.likesCount;
                if (backendCount !== undefined) setLikesCount(backendCount);
            } else {
                setIsLiked(currentIsLiked);
                setLikesCount(prev => !currentIsLiked ? Math.max(0, prev - 1) : prev + 1);
            }
        } catch (error) {
            setIsLiked(currentIsLiked);
            setLikesCount(prev => !currentIsLiked ? Math.max(0, prev - 1) : prev + 1);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await share({
            title: item.title || "Codalina",
            text: descriptionText ? descriptionText.substring(0, 100) : "",
            url: href
        });
    };

    if (viewMode === 'list') {
        return (
            <>
            <div className="flex border-b border-slate-100 dark:border-white/5 p-6 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors relative group">
               {/* Left side: Avatar Column */}
               <div className="flex-shrink-0 mr-4">
                   <CraftsmanHoverCard userId={authorId} username={item.user?.username || item.author?.username} avatarUrl={finalAvatar} displayName={authorName}>
                       <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 relative">
                            {finalAvatar ? (
                                <img src={getOptimizedUrl(finalAvatar)} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold">{authorName[0]}</div>
                            )}
                       </div>
                   </CraftsmanHoverCard>
               </div>

               {/* Middle content: Name, Title, Comments */}
               <div className="flex-1 flex flex-col pr-6 min-w-0">
                  {/* Name and Follow */}
                  <div className="flex items-center gap-2 mb-1">
                       <CraftsmanHoverCard userId={authorId} username={item.user?.username || item.author?.username} avatarUrl={finalAvatar} displayName={authorName} wrapperDisplay="inline">
                           <span className="font-bold text-[15px] hover:text-emerald-600 dark:hover:text-green-500 transition-colors text-slate-900 dark:text-gray-100">
                                {authorName}
                           </span>
                       </CraftsmanHoverCard>
                       <span className="text-slate-400 text-sm">·</span>
                       <button className="text-[13px] text-indigo-600 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">Follow</button>
                  </div>

                  {/* Title */}
                  <Link href={href}>
                      <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white leading-snug tracking-tight mb-2">
                          {item.title || "Untitled"}
                      </h2>
                  </Link>
                  
                  {/* Description */}
                    {(descriptionText || (item.excerpt && item.excerpt.includes('<mark>'))) && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                           {(item.excerpt && item.excerpt.includes('<mark>')) ? (
                               <span dangerouslySetInnerHTML={{ __html: item.excerpt.replace(/<(?!\/?mark)[^>]+>/gi, "") }} />
                           ) : (
                               descriptionText
                           )}
                        </div>
                    )}

                  {/* Discussion Badges */}
                  <div className="flex items-center gap-3 px-1 py-1 mt-auto">
                      <DiscussionBadges item={item} href={href} />
                  </div>
               </div>

               {/* Right side content */}
               <div className="w-[120px] sm:w-[150px] flex flex-col shrink-0 items-end">
                   <div className="relative w-full h-[90px] sm:h-[110px] rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 transition-colors">
                       <Link href={href} className="block w-full h-full">
                            {displayImage ? (
                                <img src={getOptimizedUrl(displayImage)} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Layout size={32}/></div>
                            )}
                       </Link>
                        {isOwner && type === 'devlog' && (
                             <button 
                                 className="absolute top-2 right-2 z-40 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                 title="Edit Devlog"
                                 onClick={(e) => { e.stopPropagation(); e.preventDefault(); router.push(`/upload-devlog?edit=${item._id || item.id}`); }}
                             >
                                 <Edit3 size={14} />
                             </button>
                         )}
                         {isOwner && type === 'codex' && (
                             <button 
                                 className="absolute top-2 right-2 z-40 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                 title="Edit Codex"
                                 onClick={(e) => { e.stopPropagation(); e.preventDefault(); router.push(`/codex-editor?slug=${item.slug}`); }}
                             >
                                 <Edit3 size={14} />
                             </button>
                         )}
                   </div>
                    
                    <div className="flex items-center justify-between w-full px-1 text-xs font-bold text-slate-500 dark:text-slate-400 mt-auto">
                        <button 
                             onClick={handleLike}
                             className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                        >
                             <Heart size={16} className={isLiked ? 'fill-current' : ''}/> 
                             <span className="text-[13px]">{likesCount}</span>
                        </button>
                        <span className="flex items-center gap-1.5">
                             <Eye size={16}/> 
                             <span className="text-[13px]">{item.views || item.viewsCount || 0}</span>
                        </span>
                        <button 
                             onClick={handleFavorite}
                             disabled={isFavoriting}
                             className={`flex items-center gap-1.5 transition-colors ${isFavorited ? 'text-pink-500' : 'hover:text-pink-500'}`}
                             title="Save"
                        >
                             <Bookmark size={16} className={isFavorited ? 'fill-current' : ''}/> 
                        </button>
                        <button 
                            onClick={handleShare}
                            className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors"
                            title="Share"
                        >
                            <Share2 size={16}/>
                        </button>
                   </div>
               </div>
            </div>
            </>
        );
    }

    return (
        <>
        <Link href={href} className="group block w-full h-full">
            <div className="flex flex-col h-full bg-white dark:bg-slate-900/20 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 shadow-sm relative overflow-hidden">
                <div className="relative w-full aspect-[3/2] bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 transition-all duration-300 overflow-hidden">
                    {displayImage ? (
                        <img 
                            src={displayImage} 
                            alt={item.title || "Preview"} 
                            className="w-full h-full object-cover transform group-hover:-translate-y-0.5 transition-transform duration-700 ease-in-out"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                           <Layout size={40} />
                        </div>
                    )}

                    {isOwner && type === 'devlog' && (
                        <button 
                            className="absolute top-4 right-4 z-40 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                            title="Edit Devlog"
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); router.push(`/upload-devlog?edit=${item._id || item.id}`); }}
                        >
                            <Edit3 size={16} />
                        </button>
                    )}
                    {isOwner && type === 'codex' && (
                        <button 
                            className="absolute top-4 right-4 z-40 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                            title="Edit Codex"
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); router.push(`/codex-editor?slug=${item.slug}`); }}
                        >
                            <Edit3 size={16} />
                        </button>
                    )}
                    
                    <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 pointer-events-none">
                        <div className="px-4 py-2 bg-white/95 dark:bg-slate-900 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 shadow-lg border border-slate-200 dark:border-white/10">
                            <span className={iconColor}><TypeIcon size={12} /></span>
                            <span>View {typeLabel}</span>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col justify-end">
                         <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 drop-shadow-md">
                            {item.title || "Untitled"}
                         </h3>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-4 px-4 py-3 h-[52px] overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0 shrink-0 z-40 relative">
                         <CraftsmanHoverCard userId={authorId} username={item.user?.username || item.author?.username} avatarUrl={finalAvatar} displayName={authorName}>
                             <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden ring-1 ring-gray-100 dark:ring-white/10 shrink-0 border border-transparent">
                                {finalAvatar ? (
                                    <img src={getOptimizedUrl(finalAvatar)} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-[10px] font-bold text-white">{authorName[0]}</div>
                                )}
                             </div>
                         </CraftsmanHoverCard>
                         <CraftsmanHoverCard userId={authorId} username={item.user?.username || item.author?.username} avatarUrl={finalAvatar} displayName={authorName} wrapperDisplay="inline">
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:underline transition-colors truncate max-w-[100px] sm:max-w-[120px]">
                                {authorName}
                             </span>
                         </CraftsmanHoverCard>
                    </div>

                    <div className="flex items-center gap-3.5 ml-auto text-slate-400 shrink-0 z-40 relative">
                         <div className="flex items-center gap-3 text-[13px] font-semibold">
                             <button 
                                 onClick={handleLike}
                                 className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                             >
                                 <Heart size={16} className={isLiked ? 'fill-current' : ''} /> 
                                 <span>{likesCount}</span>
                             </button>
                             <span className="flex items-center gap-1">
                                 <Eye size={16}/> 
                                 <span>{item.views || item.viewsCount || 0}</span>
                             </span>
                         </div>
                         
                    </div>
                </div>
            </div>
        </Link>
        </>
    );
}



