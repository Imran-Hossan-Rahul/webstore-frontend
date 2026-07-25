"use client";
import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { MessageCircle, ArrowRight, TrendingUp, Clock, BookOpen, Share2, Bookmark, MoreHorizontal, FileText, CheckCircle, AlertCircle, HelpCircle, Lightbulb, Flame, Eye, PanelRight, X, Star } from "lucide-react";
import { api } from '@/utils/api';
import { useToast } from "@/components/ui/ToastProvider";
import AdvancedCommentSection from '@/components/dashboard/comments/AdvancedCommentSection';
import CraftsmanHoverCard from './CraftsmanHoverCard';
import { useShare } from "@/hooks/useShare";

const CodexCard = ({ codex, currentUser, isGuest = false, onRequireAuth, isPreview = false, excerptRef, onExcerptInput }) => {
  const router = useRouter();
  const { showToast } = useToast();

  if (!codex) return null;

  // Combine backend isLiked + local likedBy array check — both sources of truth
  const userId = currentUser?._id?.toString() || currentUser?._id;
  const initialIsLiked = codex.isLiked === true || (userId && codex.likedBy?.includes(userId)) || false;
  const initialLikesCount = codex.likesCount !== undefined ? codex.likesCount : (typeof codex.likes === 'number' ? codex.likes : (Array.isArray(codex.likes) ? codex.likes.length : 0));
  const initialCommentsCount = codex.commentsCount !== undefined ? codex.commentsCount : (Array.isArray(codex.comments) ? codex.comments.length : 0);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isFavorited, setIsFavorited] = useState(codex.isFavorited || false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { share } = useShare();

  const {
    _id,
    slug,
    title,
    subtitle,
    content,
    coverImage,
    author,
    createdAt,
    readTime = "5 min read",
    views = 0,
    proTips = [],
    keyTakeaways = []
  } = codex;

  // Improved excerpt extraction: Fallback to plain string extraction if needed
  const getExcerpt = (codexObj) => {
    // 1. Use the pre-computed excerpt if available (most reliable)
    if (codexObj.excerpt && typeof codexObj.excerpt === 'string' && codexObj.excerpt.trim().length > 0) {
      return codexObj.excerpt;
    }
    
    // 2. Fallback to raw content stripping
    const htmlString = codexObj.content;
    if (!htmlString) return "";

    let parsedData = htmlString;
    try {
      if (typeof htmlString === 'string' && (htmlString.startsWith('{') || htmlString.startsWith('['))) {
        parsedData = JSON.parse(htmlString);
      }
    } catch (e) {
      parsedData = htmlString;
    }

    try {
      if (typeof parsedData === 'object' && parsedData !== null) {
        if (parsedData.blocks && Array.isArray(parsedData.blocks)) {
          return parsedData.blocks
            .filter(b => b.type === 'paragraph' || b.type === 'header')
            .map(b => (b.data?.text || '').replace(/<[^>]*>/g, ' '))
            .join(' ')
            .replace(/&[a-z]+;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        return JSON.stringify(parsedData).substring(0, 100);
      }
      return String(parsedData)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch {
      return "";
    }
  };

  const rawExcerpt = getExcerpt(codex);
  // Provide enough text to fill the entire column; CSS line-clamp will truncate it natively
  const excerpt = rawExcerpt.length > 1500
    ? rawExcerpt.substring(0, 1500).trim() + "..."
    : rawExcerpt;

  const handleNavigate = useCallback(() => {
    if (isPreview) return;
    setIsNavigating(true);
    NProgress.start();
    router.push(`/codex/${slug}`);
  }, [router, slug, isPreview]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('like'); return; }
    
    const currentIsLiked = isLiked;
    
    setIsLiked(!currentIsLiked);
    setLikesCount(prev => currentIsLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      const res = await api.post(`/codex/${slug}/like`);
      if (res.success) {
        setIsLiked(res.isLiked);
        setLikesCount(res.likesCount);
      } else {
        setIsLiked(currentIsLiked);
        setLikesCount(prev => !currentIsLiked ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (error) {
      setIsLiked(currentIsLiked);
      setLikesCount(prev => !currentIsLiked ? Math.max(0, prev - 1) : prev + 1);
    }
  };
  
  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('save'); return; }
    const newIsFavorited = !isFavorited;
    setIsFavorited(newIsFavorited);
    try {
        await api.post('/favorites/toggle', { postId: _id, itemType: 'Codex' });
        showToast?.(newIsFavorited ? "Added to favorites" : "Removed from favorites", "success");
    } catch (err) {
        console.error("Favorite failed", err);
        setIsFavorited(!newIsFavorited);
        showToast?.("Failed to update favorites", "error");
    }
  };

  const handleCommentToggle = (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('comment'); return; }
    setShowComments(prev => !prev);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    await share({
        title: title || "Codex",
        text: excerpt ? excerpt.substring(0, 100) : "",
        url: `/codex/${slug}`
    });
  };

  const timeAgo = (dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m";
      return "just now";
  };

  // ----------------------------------------------------------------------
  // Dynamic Avatar Fetching (Mirroring CraftsmanProfileModal logic)
  // ----------------------------------------------------------------------
  const [craftsmanAvatar, setCraftsmanAvatar] = useState(null);
  
  useEffect(() => {
    const authorId = codex.author?._id || codex.author;
    const initialAvatar = codex.author?.profilePicture || codex.author?.avatar;
    
    if (authorId && !initialAvatar) {
      // Check if we already cached this author's avatar globally to prevent N+1 spam
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
        .catch(() => {}); // silent fail, fallback to initial
    }
  }, [codex.author]);

  const finalAvatar = craftsmanAvatar || author?.profilePicture || author?.avatar;

  return (
    <div className="border-b border-slate-100 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors p-4 sm:p-5">
      <div
        className="group relative cursor-pointer"
        onClick={handleNavigate}
      >
        {/* Instant-navigation overlay — shows immediately on click, zero blank gap */}
        {isNavigating && (
          <div className="absolute inset-0 z-20 rounded-xl bg-white/60 dark:bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <span className="text-xs font-semibold text-indigo-500">Opening...</span>
            </div>
          </div>
        )}
        
        {/* Top Row: Avatar + Header + Title */}
        <div className="flex gap-4 sm:gap-5 mb-2">
          {/* Left Column: Avatar */}
          <div className="flex-shrink-0">
            <CraftsmanHoverCard
              userId={author?._id}
              username={author?.username}
              avatarUrl={finalAvatar}
              displayName={author?.name}
            >
              <div className="relative group/avatar">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-black border border-slate-200 dark:border-white/10">
                  {finalAvatar ? (
                    <img
                      src={finalAvatar}
                      className="object-cover w-full h-full"
                      alt={author?.name || 'Author'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-emerald-400 to-teal-500 text-white font-bold text-lg">
                      {author?.name?.[0] || 'A'}
                    </div>
                  )}
                </div>
              </div>
            </CraftsmanHoverCard>
          </div>

          {/* Right Column: Header & Title */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-1">
                 <div className="flex items-center gap-2 flex-wrap">
                     <CraftsmanHoverCard
                        userId={author?._id}
                        username={author?.username}
                        avatarUrl={finalAvatar}
                        displayName={author?.name}
                        wrapperDisplay="inline"
                      >
                        <span className="font-bold text-slate-900 dark:text-white text-base hover:underline decoration-2 decoration-purple-500 underline-offset-4 cursor-pointer font-sans">
                            {author?.name || 'Anonymous'}
                        </span>
                     </CraftsmanHoverCard>
                     {author?.isVerified && (
                          <span className="text-indigo-600">
                               <CheckCircle size={16} className="fill-current" />
                          </span>
                     )}
                     <span className="text-slate-400 text-xs font-semibold">@{author?.username || "user"}</span>
                     <span className="text-gray-300 dark:text-slate-600 text-xs">•</span>
                     <span suppressHydrationWarning className="text-slate-400 text-xs font-semibold hover:text-purple-500 cursor-pointer">{timeAgo(createdAt)}</span>
                 </div>
                 
                 <button className="lg:hidden flex-shrink-0 ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 bg-slate-100 dark:bg-white/5 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} title="Toggle Details">
                   {isExpanded ? <X size={18} /> : <PanelRight size={18} />}
                 </button>
            </div>

            {/* Title — full width above */}
            <div className="mt-0 mb-1">
              <h2 className="text-black dark:text-white text-base leading-relaxed whitespace-pre-wrap break-words font-normal font-sans">
                {title}
              </h2>
            </div>
          </div>
        </div>

        {/* Body: text only (Full Width) */}
        <div className="mb-4">
          {(excerpt || subtitle) && (
            <div
              className={`text-black dark:text-white text-base leading-relaxed whitespace-pre-wrap break-words font-normal font-sans ${isPreview ? 'focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-lg p-2' : ''}`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 6,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
              contentEditable={isPreview ? true : undefined}
              suppressContentEditableWarning={isPreview ? true : undefined}
              ref={excerptRef}
              onInput={onExcerptInput}
              onBlur={onExcerptInput}
              onClick={isPreview ? (e) => e.stopPropagation() : undefined}
              dangerouslySetInnerHTML={
                isPreview
                  ? { __html: excerpt || "Type your excerpt here..." }
                  : (excerpt && excerpt.includes('<mark>'))
                    ? { __html: excerpt }
                    : undefined
              }
            >
              {(!isPreview && !(excerpt && excerpt.includes('<mark>'))) ? (excerpt || subtitle || "Read the full codex to discover more insights and details.") : undefined}
            </div>
          )}
        </div>

        {/* Action Bar (Evenly Distributed on Mobile, Grouped on Desktop) */}
        <div className="flex items-center justify-between pt-3 mt-1 w-full border-t border-slate-100 dark:border-white/5">
          {/* Left: Discussion Intelligence Box & Like */}
          <div className="contents sm:flex sm:items-center sm:gap-4">
            {(() => {
              const stats = [
                { id: 'comment', icon: MessageCircle, title: 'Discussions' },
                { id: 'question', icon: HelpCircle, title: 'Questions' },
                { id: 'answer', icon: CheckCircle, title: 'Solutions' },
                { id: 'issue', icon: AlertCircle, title: 'Issues' },
                { id: 'suggestion', icon: Lightbulb, title: 'Ideas' },
                { id: 'critique', icon: Eye, title: 'Critiques' },
                { id: 'kudos', icon: Flame, title: 'Kudos' }
              ];

              const counts = codex.discussionStats?.types || {};

              return stats.map((stat, idx) => {
                const count = counts[stat.id] || (stat.id === 'comment' ? commentsCount : 0);
                const Icon = stat.icon;
                const hasCount = count > 0;

                const hoverColorMap = {
                    comment: 'group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200',
                    question: 'group-hover/btn:text-indigo-500 dark:group-hover/btn:text-indigo-400',
                    answer: 'group-hover/btn:text-emerald-500 dark:group-hover/btn:text-emerald-400',
                    issue: 'group-hover/btn:text-rose-500 dark:group-hover/btn:text-rose-400',
                    suggestion: 'group-hover/btn:text-amber-500 dark:group-hover/btn:text-amber-400',
                    critique: 'group-hover/btn:text-violet-500 dark:group-hover/btn:text-violet-400',
                    kudos: 'group-hover/btn:text-orange-500 dark:group-hover/btn:text-orange-400'
                };

                const baseColor = 'text-slate-700 dark:text-slate-300';
                
                const hoverColor = hoverColorMap[stat.id] || 'group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200';

                return (
                  <div 
                    key={stat.id} 
                    title={stat.title}
                    className={`group/btn items-center gap-1.5 py-1 pr-2 transition-all duration-200 cursor-pointer ${stat.id === 'comment' ? 'flex' : 'hidden sm:flex'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const filterType = stat.id === 'total' ? 'all' : stat.id;
                      router.push(`/codex/${codex.slug}?filter=${filterType}#comments`);
                    }}
                  >
                     <Icon 
                       size={16} 
                       className={`${baseColor} ${hoverColor} group-hover/btn:opacity-100 group-hover/btn:scale-105 transition-all duration-200 stroke-[2.2px]`} 
                     />
                     {hasCount && (
                         <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover/btn:text-slate-800 dark:group-hover/btn:text-slate-200 transition-colors duration-200 tabular-nums">
                             {count}
                         </span>
                     )}
                  </div>
                );
              });
            })()}

            {/* Like */}
            <button 
                onClick={handleLike}
                className="group/btn flex items-center gap-1.5 py-1 pr-2 transition-all duration-200 cursor-pointer"
            >
                <Star size={16} fill={isLiked ? 'currentColor' : 'none'} className={`${isLiked ? 'text-pink-600 dark:text-pink-500' : 'text-slate-700 dark:text-slate-300 group-hover/btn:text-pink-600 dark:group-hover/btn:text-pink-500'} group-hover/btn:scale-105 transition-all duration-200 stroke-[2.2px]`} />
                <span className={`text-[11px] mt-[2px] font-normal tabular-nums transition-colors duration-200 ${isLiked ? 'text-pink-600 dark:text-pink-500' : 'text-slate-700 dark:text-slate-300 group-hover/btn:text-pink-600 dark:group-hover/btn:text-pink-500'}`}>{likesCount}</span>
            </button>
          </div>

          {/* Middle: Discovery Tags */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center px-4 overflow-hidden">
             {codex.tags && codex.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-[10px] font-bold truncate max-w-[80px]">
                  #{tag}
                </span>
             ))}
          </div>

          {/* Right: Share */}
          <div className="contents sm:flex sm:items-center sm:gap-3">
            <button 
                className="group/btn flex items-center gap-1.5 py-1 pr-2 transition-all duration-200 cursor-pointer"
                onClick={handleShare}
            >
                <Share2 size={16} className="text-slate-700 dark:text-slate-300 group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400 group-hover/btn:scale-105 transition-all duration-200 stroke-[2.2px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="mt-4 sm:ml-16 border-t border-slate-100 dark:border-white/5 pt-4">
            <AdvancedCommentSection
              postId={_id}
              postAuthorId={author?._id}
              initialComments={codex.comments || []}
              onClose={() => setShowComments(false)}
              onCommentAdded={() => setCommentsCount(prev => prev + 1)}
            />
        </div>
      )}
    </div>
  );
};

export default React.memo(CodexCard);



