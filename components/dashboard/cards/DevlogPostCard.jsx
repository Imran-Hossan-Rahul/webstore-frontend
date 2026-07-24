import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MessageCircle, Share2, MoreHorizontal, Bookmark, Calendar, MapPin, ExternalLink, Github, Layers, Clock, CheckCircle2, Circle, AlertCircle, FileText, Download, ChevronRight, Tag, Shield, Users, Eye, Lightbulb, Flame, CheckCircle, Code, Zap, HelpCircle, Hash, PanelRight, X, Star } from "lucide-react";
import { api } from "@/utils/api";
import dynamic from 'next/dynamic';
import { useShare } from "@/hooks/useShare";

const AdvancedCommentSection = dynamic(() => import('../comments/AdvancedCommentSection'), { ssr: false });
import CraftsmanProfileModal from '../modals/CraftsmanProfileModal';
import { formatDistanceToNow } from 'date-fns';
import DiscussionBadges from '../ui/DiscussionBadges';
import CraftsmanHoverCard from './CraftsmanHoverCard';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import NProgress from 'nprogress';

const DevlogPostCard = ({ 
  post,
  item, 
  onClick,
  isDetailPage = false,
  isCodex = false,
  isGuest = false,
  onRequireAuth
}) => {
  const actualItem = post || item;
  const router = useRouter();
  const { 
    _id, 
    slug,
    title,
    user, 
    content, 
    images, 
    likes: initialLikes, 
    likesCount,
    commentsCount: initialCommentsCount, 
    isLiked: initialIsLiked, 
    isFavorited: initialIsFavorited,
    devlogStats,
    createdAt,
    viewsCount,
    discussionStats
  } = actualItem;

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(likesCount || initialLikes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isCraftsmanModalOpen, setIsCraftsmanModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { share } = useShare();
  
  const [currentCommentsCount, setCurrentCommentsCount] = useState(initialCommentsCount || 0);

  // Parse stats
  const {
      category: statsCategory,
      tags = [],
      tools = [],
      difficulty = 'Intermediate',
      status = 'Ongoing',
      startDate,
      endDate,
      originalEndDate,
      extensions = [],
      milestones = [],
      resources = [],
      collaborators = [],
      location,
      license = 'None',
      devlogLink,
      livePreviewUrl,
      documentationUrl,
      timeSpent
  } = devlogStats || {};

  const category = statsCategory || actualItem.category || 'Uncategorized';

  const getTimelineProgress = () => {
      if (!startDate || !endDate) return 0;
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const total = end - start;
      const elapsed = now - start;
      return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const progress = getTimelineProgress();
  
  const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const getTechColor = (tool) => {
      if (!tool) return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10';
      const t = tool.toLowerCase();
      if (t.includes('react') || t.includes('flutter')) return 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20';
      if (t.includes('node') || t.includes('mongo') || t.includes('vue')) return 'bg-green-500/10 text-green-500 border-green-500/20';
      if (t.includes('next') || t.includes('vercel')) return 'bg-slate-800 text-gray-200 border-slate-600 dark:bg-white/10 dark:text-gray-200 dark:border-white/20';
      if (t.includes('tailwind') || t.includes('css')) return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      if (t.includes('js') || t.includes('javascript') || t.includes('html')) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      if (t.includes('python') || t.includes('figma')) return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10';
  };
  
  const handleNavigation = (e) => {
      if (isDetailPage) return;
      NProgress.start();
      if (isCodex) {
          router.push(`/codex/${slug}`);
      } else {
          router.push(`/post/${_id}`);
      }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('like'); return; }
    
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
       await api.put(`/posts/${_id}/like`);
    } catch (err) {
       console.error("Like failed", err);
       setIsLiked(!newIsLiked);
       setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('save'); return; }
    const newIsFavorited = !isFavorited;
    setIsFavorited(newIsFavorited);
    try {
        await api.post('/favorites/toggle', { postId: _id, itemType: 'Post' });
    } catch (err) {
        console.error("Favorite failed", err);
        setIsFavorited(!newIsFavorited);
    }
  };

  const getPlainText = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const plainTextDescription = getPlainText(content);

  const handleShare = async (e) => {
    e.stopPropagation();
    await share({
        title: title || "Devlog Update",
        text: plainTextDescription.substring(0, 100),
        url: `/post/${_id}`
    });
  };

  // ----------------------------------------------------------------------
  // Dynamic Avatar Fetching (Mirroring ArtifactPostCard)
  // ----------------------------------------------------------------------
  const [craftsmanAvatar, setCraftsmanAvatar] = useState(null);
  
  useEffect(() => {
    const authorId = user?._id || user;
    const initialAvatar = user?.profilePicture || user?.avatar || user?.profilePic;
    
    if (authorId && !initialAvatar && typeof authorId === 'string') {
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
  }, [user]);

  const userName = user?.name || 'Craftsman';
  const initialAvatarUrl = user?.profilePicture || user?.avatar || user?.profilePic;
  const finalAvatarUrl = craftsmanAvatar || initialAvatarUrl;

  return (
    <div 
        className="group relative sm:border-b border-slate-100 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer p-4 flex gap-2 sm:gap-6"
        onClick={handleNavigation}
    >
        {/* Left Column: Avatar */}
        <div className="flex-shrink-0">
             <CraftsmanHoverCard
               userId={user?._id || user}
               username={user?.username}
               avatarUrl={finalAvatarUrl}
               displayName={userName}
             >
               <div className="relative group/avatar">
                   <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-black border border-slate-200 dark:border-white/10">
                       {finalAvatarUrl ? (
                           <Image 
                               src={finalAvatarUrl} 
                               width={48} 
                               height={48} 
                               className="rounded-full w-full h-full object-cover"
                               alt={userName}
                               unoptimized
                           />
                       ) : (
                           <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                               {userName[0] || "U"}
                           </div>
                       )}
                   </div>
                   <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
               </div>
             </CraftsmanHoverCard>
        </div>

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0">
             {/* Header */}
             <div className="flex justify-between items-start mb-1">
                 <div className="flex flex-row items-center gap-1.5 flex-wrap">
                     <div className="flex items-center gap-2">
                        <CraftsmanHoverCard
                          userId={user?._id || user}
                          username={user?.username}
                          avatarUrl={finalAvatarUrl}
                          displayName={userName}
                          wrapperDisplay="inline"
                        >
                          <h3 className="font-bold text-slate-900 dark:text-gray-100 text-base hover:text-green-500 dark:hover:text-green-400 transition-colors duration-150 font-sans">
                              {userName}
                          </h3>
                        </CraftsmanHoverCard>
                     </div>
                     <span className="text-slate-400 text-sm">·</span>
                     <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium uppercase tracking-wider mt-0.5">
                         {formatDate(createdAt)}
                     </span>
                 </div>
                 <button className="lg:hidden flex-shrink-0 ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 bg-slate-100 dark:bg-white/5 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} title="Toggle Details">
                     {isExpanded ? <X size={18} /> : <PanelRight size={18} />}
                 </button>
             </div>

            {/* Devlog Title & Status */}
                <div className="mb-3 flex justify-between items-start gap-4">
                    <div>
                        <h2 className="text-base font-normal text-slate-900 dark:text-white mb-0.5 font-sans">
                            {title || "Untitled Devlog"}
                        </h2>
                    </div>
                    <div className="flex-shrink-0 hidden sm:block">
                        <span className={`px-2.5 py-1 text-[9px] font-mono font-medium rounded border tracking-[0.2em] uppercase shadow-sm ${
                            status === 'Completed' ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black' : 
                            'bg-white text-slate-900 border-slate-200 dark:bg-black dark:text-white dark:border-white/10'
                        }`}>
                            {status}
                        </span>
                    </div>
                </div>

                <div className="relative">
                {/* Main Content Grid: Image + Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-3 lg:overflow-visible">
                
                {/* Left: Preview Image */}
                <div className="lg:col-span-7 h-full">
                     {images && images.length > 0 ? (
                         <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/5 group/media w-full shadow-inner aspect-[4/3] lg:aspect-auto lg:h-full">
                             {images.length === 1 ? (
                                 <Image 
                                     src={images[0]} 
                                     fill 
                                     alt={title || 'Devlog preview'} 
                                     className="object-cover"
                                 />
                             ) : (
                                 <div className="grid grid-cols-2 h-full w-full gap-0.5">
                                     {images.slice(0, 4).map((img, i) => (
                                         <div key={i} className={`relative overflow-hidden ${
                                             images.length === 3 && i === 0 ? 'row-span-2' : ''
                                         }`}>
                                             <Image 
                                                 src={img} 
                                                 fill 
                                                 alt={`Preview ${i}`} 
                                                 className="object-cover"
                                             />
                                         </div>
                                     ))}
                                 </div>
                             )}
                             {images.length > 1 && (
                                 <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[9px] font-mono font-medium px-2 py-1 rounded-full border border-white/10 uppercase tracking-wider">
                                     {images.length} Images
                                 </div>
                             )}
                         </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 w-full bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10 aspect-[4/3] lg:aspect-auto lg:h-full">
                            <Layers size={48} className="opacity-20 mb-2" />
                            <span className="text-xs font-medium">No preview available</span>
                        </div>
                    )}
                </div>

                {/* Right: Details Section */}
                <div className={`
                    lg:col-span-5 
                    absolute -left-[7px] -right-[7px] top-0 bottom-0 z-20 lg:static lg:z-auto lg:h-full lg:p-0
                    bg-transparent
                    transition-all duration-300 ease-out transform-gpu
                    ${isExpanded 
                        ? 'translate-x-0 opacity-100 visible pointer-events-auto' 
                        : 'translate-x-8 opacity-0 invisible pointer-events-none lg:translate-x-0 lg:opacity-100 lg:visible lg:pointer-events-auto'}
                `}>
                    <div className="bg-white/85 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl lg:bg-transparent lg:dark:bg-transparent lg:backdrop-blur-none rounded-xl p-4 lg:p-0 lg:pl-2 border border-white/60 dark:border-white/10 lg:border-transparent lg:dark:border-transparent h-full flex flex-col shadow-xl lg:shadow-none overflow-y-auto lg:overflow-y-visible [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-thumb]:rounded-full pr-2 [scrollbar-width:thin] [scrollbar-color:#94a3b8_transparent] transform-gpu backface-hidden">
                        <div className="space-y-3 relative z-10">
                            
                            {/* Header: Links & Resources */}
                            <div className="flex justify-between items-start pb-3 border-b border-slate-200 dark:border-white/10">
                                <span className="text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <FileText size={14}/> Details
                                </span>
                                <div className="flex gap-2">
                                     {devlogLink ? (
                                         <a 
                                            href={devlogLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg hover:border-purple-500 hover:text-purple-500 transition-colors shadow-sm" 
                                            title="GitHub"
                                         >
                                             <Github size={14} />
                                         </a>
                                     ) : (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); }}
                                            className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-400 cursor-not-allowed" 
                                            title="No GitHub link"
                                         >
                                             <Github size={14} />
                                         </button>
                                     )}
                                     {livePreviewUrl ? (
                                         <a 
                                            href={livePreviewUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg hover:border-pink-500 hover:text-pink-500 transition-colors shadow-sm" 
                                            title="Live Demo"
                                         >
                                             <ExternalLink size={14} />
                                         </a>
                                     ) : (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); }}
                                            className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-400 cursor-not-allowed" 
                                            title="No live demo"
                                         >
                                             <ExternalLink size={14} />
                                         </button>
                                     )}
                                     {documentationUrl ? (
                                         <a 
                                            href={documentationUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors shadow-sm" 
                                            title="Documentation"
                                         >
                                             <FileText size={14} />
                                         </a>
                                     ) : (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); }}
                                            className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-400 cursor-not-allowed" 
                                            title="No documentation"
                                         >
                                             <FileText size={14} />
                                         </button>
                                     )}

                                     {/* Download Button - Matching Artifact Style */}
                                     {resources && resources.length > 0 ? (
                                         <a 
                                            href={resources[0].link || resources[0].url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded hover:opacity-90 transition-all shadow-sm" 
                                            title="Download Resource"
                                         >
                                             <Download size={14} />
                                         </a>
                                     ) : (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); }}
                                            className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-400 cursor-not-allowed" 
                                            title="No resource available"
                                         >
                                             <Download size={14} />
                                         </button>
                                     )}
                                </div>
                            </div>

                            {/* Info Grid - Always Show */}
                            <div className="grid grid-cols-2 gap-2">
                                 <div className="bg-white/80 dark:bg-white/[0.05] lg:bg-slate-50/50 lg:dark:bg-white/[0.02] p-2.5 rounded-md border border-slate-200/80 dark:border-white/10">
                                      <div className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 uppercase mb-1.5 flex items-center gap-1.5 tracking-wider"><Tag size={11} strokeWidth={2.5}/> Category</div>
                                      <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate font-sans">
                                          {category || <span className="text-slate-500 italic font-normal">Uncategorized</span>}
                                      </div>
                                 </div>
                                 <div className="bg-white/80 dark:bg-white/[0.05] lg:bg-slate-50/50 lg:dark:bg-white/[0.02] p-2.5 rounded-md border border-slate-200/80 dark:border-white/10">
                                      <div className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 uppercase mb-1.5 flex items-center gap-1.5 tracking-wider"><Users size={11} strokeWidth={2.5}/> Team</div>
                                      <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate uppercase font-sans tracking-wide">
                                          {collaborators.length > 0 ? `${collaborators.length} Members` : 'Solo'}
                                      </div>
                                 </div>
                                 <div className="bg-white/80 dark:bg-white/[0.05] lg:bg-slate-50/50 lg:dark:bg-white/[0.02] p-2.5 rounded-md border border-slate-200/80 dark:border-white/10">
                                      <div className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 uppercase mb-1.5 flex items-center gap-1.5 tracking-wider"><Clock size={11} strokeWidth={2.5}/> Timeline</div>
                                      <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate flex items-center gap-2 font-mono">
                                          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex">
                                              <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 relative"></div>
                                          </div>
                                          <span className="text-[11px] font-bold">{Math.round(progress)}%</span>
                                      </div>
                                 </div>
                                 <div className="bg-white/80 dark:bg-white/[0.05] lg:bg-slate-50/50 lg:dark:bg-white/[0.02] p-2.5 rounded-md border border-slate-200/80 dark:border-white/10">
                                      <div className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 uppercase mb-1.5 flex items-center gap-1.5 tracking-wider"><Shield size={11} strokeWidth={2.5}/> License</div>
                                      <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate font-sans">
                                          {license}
                                      </div>
                                 </div>
                            </div>

                            {/* Description - Always Show */}
                            <div className="mt-1">
                                <div className="text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Description</div>
                                <div className="text-[13px] text-slate-800 dark:text-slate-200 font-medium line-clamp-4 leading-relaxed break-words whitespace-normal font-sans">
                                    {content ? (
                                        plainTextDescription.length > 160
                                          ? `${plainTextDescription.substring(0, 160)}...`
                                          : plainTextDescription
                                    ) : (
                                        <span className="text-slate-500 italic">No description provided</span>
                                    )}
                                </div>
                            </div>

                            {/* Tech Stack - Always Show */}
                            <div className="pt-3 mt-1 border-t border-slate-100 dark:border-white/5">
                                <div className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Code size={11} strokeWidth={2} /> Tech Stack</div>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                    {Array.isArray(tools) && tools.length > 0 ? (
                                        <>
                                            {tools.slice(0, 4).map((t, idx) => (
                                                <span key={idx} className={`text-[9px] font-mono font-medium px-2 py-0.5 border rounded shadow-sm cursor-pointer hover:opacity-80 transition-opacity uppercase tracking-wider ${getTechColor(t)}`} onClick={(e) => { e.stopPropagation(); }}>
                                                    {t}
                                                </span>
                                            ))}
                                            {tools.length > 4 && (
                                                <span className="text-[9px] font-mono font-medium px-2 py-0.5 border border-slate-200 dark:border-white/10 rounded text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 uppercase">
                                                    +{tools.length - 4} more
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No tech stack</span>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar (Evenly Distributed) */}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 dark:border-white/5 w-full">
                {/* 1. Discussion (Left) */}
                <DiscussionBadges 
                    item={post} 
                    href={`/post/${_id}`} 
                    initialCounts={{...discussionStats?.types, comment: currentCommentsCount}} 
                />

                {/* 2. Views (Center-Left) */}
                <div className="group/btn flex items-center gap-1.5 py-1 pr-2 transition-all duration-200">
                    <Eye size={16} className="text-slate-700 dark:text-slate-300 group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200 group-hover/btn:scale-105 transition-all duration-200 stroke-[2.2px]" />
                    <span className="text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 group-hover/btn:text-slate-800 dark:group-hover/btn:text-slate-200 transition-colors duration-200 tabular-nums">{viewsCount || 0}</span>
                </div>

                {/* 3. Star (Center-Right) */}
                <button 
                    onClick={handleLike}
                    className="group/btn flex items-center gap-1.5 py-1 pr-2 transition-all duration-200 cursor-pointer"
                >
                    <Star size={16} fill={isLiked ? 'currentColor' : 'none'} className={`${isLiked ? 'text-pink-600 dark:text-pink-500' : 'text-slate-700 dark:text-slate-300 group-hover/btn:text-pink-600 dark:group-hover/btn:text-pink-500'} group-hover/btn:scale-105 transition-all duration-200 stroke-[2.2px]`} />
                    <span className={`text-[11px] font-mono font-medium tabular-nums transition-colors duration-200 ${isLiked ? 'text-pink-600 dark:text-pink-500' : 'text-slate-700 dark:text-slate-300 group-hover/btn:text-pink-600 dark:group-hover/btn:text-pink-500'}`}>{likeCount}</span>
                </button>

                {/* 4. Share (Right) */}
                <button 
                    className="group/btn flex items-center gap-1.5 py-1 transition-all duration-200 cursor-pointer"
                    onClick={handleShare}
                >
                    <Share2 size={16} className="text-slate-700 dark:text-slate-300 group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400 group-hover/btn:scale-105 transition-all duration-200 stroke-[2.2px]" />
                </button>
            </div>
            </div>
        </div>

        {/* Craftsman Profile Modal */}
        <CraftsmanProfileModal 
            isOpen={isCraftsmanModalOpen}
            onClose={() => setIsCraftsmanModalOpen(false)}
            userId={user?._id || user}
        />
    </div>
  );
};

export default DevlogPostCard;


