import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PenTool, Layout, Code, Heart, Eye, MessageCircle, HelpCircle, CheckCircle, AlertCircle, Lightbulb, Flame, BookOpen, Share2 } from "lucide-react";
import Link from "next/link";
import CreatorProfileModal from "../modals/CreatorProfileModal";
import CreatorHoverCard from "./CreatorHoverCard";
import { api } from "@/utils/api";

const FisheyeBadges = ({ item, href }) => {
    const router = useRouter();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [liveComments, setLiveComments] = useState(item.comments || []);

    useEffect(() => {
        // If comments are missing or not populated objects, fetch them in real-time
        const isPopulated = item.comments && item.comments.length > 0 && typeof item.comments[0] === 'object' && item.comments[0].feedbackType;
        
        if (!isPopulated && (item._id || item.id)) {
            api.get(`/comments/${item._id || item.id}?limit=100`)
                .then(res => {
                    if (res.success && res.data) {
                        setLiveComments(res.data);
                    }
                })
                .catch(() => {});
        }
    }, [item]);

    const stats = [
      { id: 'comment', icon: MessageCircle, color: 'text-gray-500', title: 'Comments' },
      { id: 'question', icon: HelpCircle, color: 'text-blue-500', title: 'Questions' },
      { id: 'answer', icon: CheckCircle, color: 'text-green-500', title: 'Solutions' },
      { id: 'issue', icon: AlertCircle, color: 'text-red-500', title: 'Issues' },
      { id: 'suggestion', icon: Lightbulb, color: 'text-amber-500', title: 'Ideas' },
      { id: 'critique', icon: Eye, color: 'text-purple-500', title: 'Critiques' },
      { id: 'kudos', icon: Flame, color: 'text-orange-500', title: 'Kudos' }
    ];

    return stats.map((stat, idx) => {
      const count = liveComments.filter(c => c && c.feedbackType === stat.id).length;
      const Icon = stat.icon;
      
      let scale = 1;
      let lift = 0;
      if (hoveredIndex !== null) {
        const distance = Math.abs(idx - hoveredIndex);
        if (distance === 0) {
          scale = 1.5;
          lift = -12;
        } else if (distance === 1) {
          scale = 1.2;
          lift = -6;
        }
      }

      return (
        <div 
          key={stat.id} 
          className="relative z-10 transition-all duration-300 ease-out py-2 cursor-pointer"
          style={{ transform: `scale(${scale}) translateY(${lift}px)`, zIndex: scale > 1 ? 20 : 10 }}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const filterType = stat.id === 'comment' ? 'all' : stat.id;
            router.push(`${href}?filter=${filterType}#comments`);
          }}
        >
           <div className="p-1.5 transition-colors">
              <Icon size={18} className={`${stat.color} opacity-100 stroke-[2.5px]`} />
           </div>
           <span className="absolute top-1 right-0 text-gray-400 dark:text-gray-500 text-[9px] font-bold transform translate-x-1/2 -translate-y-1/3 pointer-events-none tabular-nums">
              {count}
           </span>
        </div>
      );
    });
};

export default function ClassicExploreCard({ item, viewMode = 'grid' }) {
    const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

    let type = item.type;
    
    if (!type) {
         if (item.slug && !item.priceType && !item.projectStats) type = 'blog';
         else if (item.code || item.html || item.priceType) type = 'template';
         else type = 'project';
    }

    let TypeIcon = Code;
    let typeLabel = "Project";
    let href = `/project/${item._id}`;
    let iconColor = "text-purple-500";
    let bgColor = "bg-purple-50 dark:bg-purple-500/10";

    if (type === 'blog') {
        TypeIcon = PenTool;
        typeLabel = "Blog";
        href = `/blogs/${item.slug}`;
        iconColor = "text-orange-500";
        bgColor = "bg-orange-50 dark:bg-orange-500/10";
    } else if (type === 'template') {
        TypeIcon = Layout;
        typeLabel = "Template";
        href = `/templates/${item._id}`;
        iconColor = "text-blue-500";
        bgColor = "bg-blue-50 dark:bg-blue-500/10";
    }

    const authorName = item.user?.name || item.author?.name || "Creator";
    const initialAvatar = item.user?.profilePicture || item.user?.avatar || item.author?.profilePicture || item.author?.avatar;
    const authorId = item.user?._id || item.author?._id;

    // Dynamic Avatar Fetching
    const [creatorAvatar, setCreatorAvatar] = useState(null);
    
    React.useEffect(() => {
        if (authorId && !initialAvatar) {
            if (window.__avatarCache && window.__avatarCache[authorId]) {
                setCreatorAvatar(window.__avatarCache[authorId]);
                return;
            }
            
            api.get(`/creator/${authorId}`)
                .then(res => {
                    if (res.success && res.data) {  
                        const fetchedAvatar = res.data.profilePicture || res.data.userId?.profilePicture;
                        if (fetchedAvatar) {
                            setCreatorAvatar(fetchedAvatar);
                            window.__avatarCache = window.__avatarCache || {};
                            window.__avatarCache[authorId] = fetchedAvatar;
                        }
                    }
                })
                .catch(() => {});
        }
    }, [authorId, initialAvatar]);

    const finalAvatar = creatorAvatar || initialAvatar;

    // Like Logic & Worker
    const initialLikesCount = item.likesCount !== undefined ? item.likesCount : (typeof item.likes === 'number' ? item.likes : (Array.isArray(item.likes) ? item.likes.length : 0));
    const initialIsLiked = item.isLiked === true;

    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isLiking, setIsLiking] = useState(false);

    const handleLike = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (isLiking) return;
        setIsLiking(true);

        const currentIsLiked = isLiked;
        setIsLiked(!currentIsLiked);
        setLikesCount(prev => currentIsLiked ? Math.max(0, prev - 1) : prev + 1);

        try {
            let endpoint = '';
            if (type === 'blog') endpoint = `/blog/${item.slug}/like`;
            else if (type === 'template') endpoint = `/template/${item._id || item.id}/like`;
            else endpoint = `/project/${item._id || item.id}/like`;

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
        } finally {
            setTimeout(() => setIsLiking(false), 600);
        }
    };

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Construct absolute URL for sharing
        const url = window.location.origin + href;
        if (navigator.share) {
            navigator.share({
                title: item.title || "AmrPlatform",
                url: url
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url);
        }
    };

    if (viewMode === 'list') {
        return (
            <>
            <div className="flex border-b border-gray-100 dark:border-white/5 p-6 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors relative group">
               {/* Left side: Avatar Column */}
               <div className="flex-shrink-0 mr-4">
                   <CreatorHoverCard userId={authorId} avatarUrl={finalAvatar} displayName={authorName}>
                       <div 
                            className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 cursor-pointer relative"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCreatorModalOpen(true); }}
                       >
                            {finalAvatar ? (
                                <img src={finalAvatar} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold">{authorName[0]}</div>
                            )}
                       </div>
                   </CreatorHoverCard>
               </div>

               {/* Middle content: Name, Title, Comments */}
               <div className="flex-1 flex flex-col pr-6 min-w-0">
                  {/* Name and Follow */}
                  <div className="flex items-center gap-2 mb-1">
                       <CreatorHoverCard userId={authorId} avatarUrl={finalAvatar} displayName={authorName} wrapperDisplay="inline">
                           <span 
                                className="font-bold text-[15px] cursor-pointer hover:text-emerald-600 dark:hover:text-green-500 transition-colors text-gray-900 dark:text-gray-100"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCreatorModalOpen(true); }}
                           >
                                {authorName}
                           </span>
                       </CreatorHoverCard>
                       <span className="text-gray-400 text-sm">·</span>
                       <button className="text-[13px] text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">Follow</button>
                  </div>

                  {/* Title */}
                  <Link href={href}>
                      <h2 className="text-[18px] sm:text-[20px] font-black text-gray-900 dark:text-white leading-snug tracking-tight mb-3 group-hover:underline">
                          {item.title || "Untitled"}
                      </h2>
                  </Link>

                  {/* Fisheye Comments */}
                  <div className="flex items-center gap-3 px-1 py-1 mt-auto">
                      <FisheyeBadges item={item} href={href} />
                  </div>
               </div>

               {/* Right side content */}
               <div className="w-[120px] sm:w-[150px] flex flex-col shrink-0 items-end">
                   <Link href={href} className="w-full aspect-video rounded-xl overflow-hidden mb-4 relative bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 group-hover:border-purple-500/30 transition-colors">
                        {item.previewFile || item.coverImage ? (
                            <img src={item.previewFile || item.coverImage} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Layout size={32}/></div>
                        )}
                   </Link>
                   
                   <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 mt-auto">
                       <button 
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                       >
                            <Heart size={18} className={isLiked ? 'fill-current' : ''}/> 
                            <span className="text-[13px]">{likesCount}</span>
                       </button>
                       <span className="flex items-center gap-1.5">
                            <BookOpen size={18}/> 
                            <span className="text-[13px]">{item.views || item.viewsCount || 0}</span>
                       </span>
                   </div>
               </div>
            </div>
            
            <CreatorProfileModal 
                isOpen={isCreatorModalOpen}
                onClose={() => setIsCreatorModalOpen(false)}
                userId={authorId}
            />
            </>
        );
    }

    return (
        <>
        <Link href={href} className="group block w-full h-full">
            <div className="flex flex-col h-full bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[24px] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 shadow-sm relative overflow-hidden">
                <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-900 border-b border-black/5 dark:border-white/5 transition-all duration-500 overflow-hidden">
                    {item.previewFile || item.coverImage ? (
                        <img 
                            src={item.previewFile || item.coverImage} 
                            alt={item.title} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                           <Layout size={40} />
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 pointer-events-none">
                        <div className="px-4 py-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full text-xs font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 shadow-lg">
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

                <div className="flex items-center gap-3 px-4 py-3">
                    <div 
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity z-40 relative"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCreatorModalOpen(true); }}
                    >
                         <CreatorHoverCard userId={authorId} avatarUrl={finalAvatar} displayName={authorName}>
                             <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-100 dark:ring-white/10 shrink-0 border border-transparent">
                                {finalAvatar ? (
                                    <img src={finalAvatar} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-[10px] font-bold text-white">{authorName[0]}</div>
                                )}
                             </div>
                         </CreatorHoverCard>
                         <CreatorHoverCard userId={authorId} avatarUrl={finalAvatar} displayName={authorName} wrapperDisplay="inline">
                             <span className="text-[16px] font-bold text-gray-700 dark:text-gray-200 hover:text-purple-500 hover:underline transition-colors truncate max-w-[100px] sm:max-w-[120px]">
                                {authorName}
                             </span>
                         </CreatorHoverCard>
                    </div>

                    <div className="flex items-center gap-3.5 ml-auto text-gray-400 shrink-0 z-40 relative">
                         <div className="flex items-center gap-3 text-[13px] font-semibold">
                             <button 
                                 onClick={handleLike}
                                 disabled={isLiking}
                                 className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                             >
                                 <Heart size={16} className={isLiked ? 'fill-current' : ''} /> 
                                 <span>{likesCount}</span>
                             </button>
                             <span className="flex items-center gap-1">
                                 <Eye size={16} /> 
                                 <span>{item.views || item.viewsCount || 0}</span>
                             </span>
                         </div>
                         
                         <button 
                            onClick={handleShare}
                            className={`shrink-0 text-gray-400 hover:text-emerald-500 bg-gray-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 p-1.5 rounded-full transition-colors`} 
                            title="Share"
                         >
                            <Share2 size={14} />
                         </button>
                    </div>
                </div>
            </div>
        </Link>
        
        <CreatorProfileModal 
            isOpen={isCreatorModalOpen}
            onClose={() => setIsCreatorModalOpen(false)}
            userId={authorId}
        />
        </>
    );
}
