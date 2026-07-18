"use client";
import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { 
  Heart, MessageCircle, ArrowRight, TrendingUp, Clock, BookOpen, Share2, Bookmark, MoreHorizontal, FileText,
  CheckCircle, AlertCircle, HelpCircle, Lightbulb, Flame, Eye, PanelRight, X
} from 'lucide-react';
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
        className="group relative cursor-pointer flex gap-4 sm:gap-5"
        onClick={handleNavigate}
      >
        {/* Instant-navigation overlay — shows immediately on click, zero blank gap */}
        {isNavigating && (
          <div className="absolute inset-0 z-20 rounded-xl bg-white/60 dark:bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <span className="text-[11px] font-mono font-bold text-indigo-500 uppercase tracking-widest">Opening...</span>
            </div>
          </div>
        )}
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
                  <Image
                    src={finalAvatar}
                    fill
                    className="object-cover"
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

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-1">
             <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                 <div className="flex items-center gap-2">
                    <CraftsmanHoverCard
                      userId={author?._id}
                      username={author?.username}
                      avatarUrl={finalAvatar}
                      displayName={author?.name}
                      wrapperDisplay="inline"
                    >
                      <h3 className="font-medium text-slate-900 dark:text-gray-100 text-[15px] hover:text-slate-700 dark:hover:text-white transition-colors duration-150 font-sans">
                          {author?.name || 'Anonymous'}
                      </h3>
                    </CraftsmanHoverCard>
                     {/* TYPE BADGE: CODEX */}
                     <span className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded uppercase tracking-[0.2em] flex items-center gap-1">
                        <FileText size={10} className="stroke-[3]" /> {codex.category && codex.category !== 'uncategorized' ? codex.category : 'Codex'}
                    </span>
                 </div>
                 <span className="hidden sm:inline text-slate-400 text-sm">·</span>
                 <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium uppercase tracking-wider">
                     <span>{new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                     <span className="text-gray-300 dark:text-slate-600">•</span>
                     <span className="flex items-center gap-1">
                         <Clock size={12} /> {readTime}
                     </span>
                 </div>
             </div>
             <button className="lg:hidden flex-shrink-0 ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 bg-slate-100 dark:bg-white/5 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} title="Toggle Details">
                 {isExpanded ? <X size={18} /> : <PanelRight size={18} />}
             </button>
          </div>

          {/* Title — full width above */}
          <div className="mt-1 mb-2">
            <h2 className="text-[20px] sm:text-[22px] font-medium text-slate-900 dark:text-white leading-snug tracking-tight font-sans">
              {title}
            </h2>
          </div>

          {/* Body: image left column + text right column */}
          <div className={`mb-3 relative overflow-hidden rounded-xl lg:rounded-none lg:overflow-visible ${coverImage ? 'lg:flex lg:items-start lg:gap-3' : ''}`}>
            {coverImage && (
              <div className={`w-full lg:w-[42%] flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5`}>
                <div className="aspect-[4/3] relative w-full">
                  {isPreview && typeof coverImage === 'string' && coverImage.startsWith('blob:') ? (
                    <img src={coverImage} alt={title} className="object-cover w-full h-full" />
                  ) : (
                    <Image
                      src={coverImage}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            {(excerpt || subtitle) && (
              <div
                className={`text-slate-600 dark:text-gray-300 text-[14px] sm:text-[15px] leading-relaxed flex-1 
                absolute inset-0 z-20 lg:static lg:z-auto 
                bg-white/40 dark:bg-[#0a0a0a]/60 lg:bg-transparent lg:dark:bg-transparent backdrop-blur-xl lg:backdrop-blur-none
                p-4 lg:p-0 m-2 lg:m-0 rounded-xl lg:rounded-none border border-white/60 dark:border-white/10 lg:border-none shadow-xl lg:shadow-none
                transition-all duration-300 ease-out
                ${isExpanded 
                    ? 'translate-x-0 opacity-100 visible pointer-events-auto' 
                    : 'translate-x-8 opacity-0 invisible pointer-events-none lg:translate-x-0 lg:opacity-100 lg:visible lg:pointer-events-auto'}
                ${isPreview ? 'focus:outline-none focus:ring-1 focus:ring-indigo-500/30' : ''}`}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: coverImage ? 11 : 8,
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
                {(!isPreview && !(excerpt && excerpt.includes('<mark>'))) ? (subtitle || excerpt || "Read the full codex to discover more insights and details.") : undefined}
              </div>
            )}
          </div>

          {/* Action Bar (Souled-Out Refactor: High-Density Discussion Intelligence) */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 dark:border-white/5">
            {/* Left: Discussion Intelligence Box (Fisheye "Dock" Effect) */}
            <div className="flex items-center gap-1 sm:gap-2">
              {(() => {
                const stats = [
                  { id: 'comment', icon: MessageCircle, title: 'Comments' },
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
                      className="group/btn flex items-center gap-1.5 py-1 pr-2 transition-all duration-200 cursor-pointer"
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
                           <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 group-hover/btn:text-slate-800 dark:group-hover/btn:text-slate-200 transition-colors duration-200 tabular-nums">
                               {count}
                           </span>
                       )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Middle: Discovery Tags */}
            <div className="hidden md:flex items-center gap-2 flex-1 justify-center px-4 overflow-hidden">
               {codex.tags && codex.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-[10px] font-bold truncate max-w-[80px]">
                    #{tag}
                  </span>
               ))}
            </div>

            {/* Right: Engagement & Read Status */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Like */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 transition-all ${isLiked ? 'text-pink-500' : 'text-slate-700 dark:text-slate-300 hover:text-pink-500'}`}
              >
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                <span className="font-bold tabular-nums text-[11px]">{likesCount}</span>
              </button>

              {/* Share */}
              <button 
                  className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={handleShare}
              >
                  <Share2 size={18} />
              </button>

            </div>
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



