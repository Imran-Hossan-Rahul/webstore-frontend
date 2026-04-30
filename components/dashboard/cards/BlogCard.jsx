"use client";
import React, { useState } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, MessageCircle, ArrowRight, TrendingUp, Clock, BookOpen, Share2, Bookmark, MoreHorizontal, FileText,
  CheckCircle, AlertCircle, HelpCircle, Lightbulb, Flame, Eye
} from 'lucide-react';
import { api } from '@/utils/api';
import AdvancedCommentSection from '@/components/dashboard/comments/AdvancedCommentSection';
import CreatorProfileModal from '@/components/dashboard/modals/CreatorProfileModal';
import CreatorHoverCard from './CreatorHoverCard';

const BlogCard = ({ blog, currentUser, isGuest = false, onRequireAuth }) => {
  const router = useRouter();

  if (!blog) return null;

  // Combine backend isLiked + local likedBy array check — both sources of truth
  const userId = currentUser?._id?.toString() || currentUser?._id;
  const initialIsLiked = blog.isLiked === true || (userId && blog.likedBy?.includes(userId)) || false;
  const initialLikesCount = blog.likesCount !== undefined ? blog.likesCount : (typeof blog.likes === 'number' ? blog.likes : (Array.isArray(blog.likes) ? blog.likes.length : 0));
  const initialCommentsCount = blog.commentsCount !== undefined ? blog.commentsCount : (Array.isArray(blog.comments) ? blog.comments.length : 0);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [showComments, setShowComments] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

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
  } = blog;

  // Improved excerpt extraction: Fallback to plain string extraction if needed
  const getExcerpt = (blogObj) => {
    // 1. Use the pre-computed excerpt if available (most reliable)
    if (blogObj.excerpt && typeof blogObj.excerpt === 'string' && blogObj.excerpt.trim().length > 0) {
      return blogObj.excerpt;
    }
    
    // 2. Fallback to raw content stripping
    const htmlString = blogObj.content;
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

  const rawExcerpt = getExcerpt(blog);
  // Keep it short and punchy for the feed (Information Gap Theory)
  const excerpt = rawExcerpt.length > 200
    ? rawExcerpt.substring(0, 200).trim() + "..."
    : rawExcerpt;

  const handleNavigate = () => router.push(`/blogs/${slug}`);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('like'); return; }
    const currentIsLiked = isLiked;
    
    setIsLiked(!currentIsLiked);
    setLikesCount(prev => currentIsLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      const res = await api.post(`/blog/${slug}/like`);
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

  const handleCommentToggle = (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('comment'); return; }
    setShowComments(prev => !prev);
  };

  // ----------------------------------------------------------------------
  // Dynamic Avatar Fetching (Mirroring CreatorProfileModal logic)
  // ----------------------------------------------------------------------
  const [creatorAvatar, setCreatorAvatar] = useState(null);
  
  useEffect(() => {
    const authorId = blog.author?._id || blog.author;
    const initialAvatar = blog.author?.profilePicture || blog.author?.avatar;
    
    if (authorId && !initialAvatar) {
      // Check if we already cached this author's avatar globally to prevent N+1 spam
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
        .catch(() => {}); // silent fail, fallback to initial
    }
  }, [blog.author]);

  const finalAvatar = creatorAvatar || author?.profilePicture || author?.avatar;

  return (
    <div className="border-b border-gray-100 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors p-4 sm:p-5">
      <div
        className="group relative cursor-pointer flex gap-4 sm:gap-5"
        onClick={handleNavigate}
      >
        {/* Left Column: Avatar */}
        <div className="flex-shrink-0">
          <CreatorHoverCard
            userId={author?._id}
            avatarUrl={finalAvatar}
            displayName={author?.name}
          >
            <div 
              className="relative group/avatar cursor-pointer"
              onClick={(e) => { 
                  e.stopPropagation(); 
                  e.preventDefault();
                  setIsCreatorModalOpen(true); 
              }}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-white/10">
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
          </CreatorHoverCard>
        </div>

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-1">
             <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                 <div className="flex items-center gap-2">
                    <CreatorHoverCard
                      userId={author?._id}
                      avatarUrl={finalAvatar}
                      displayName={author?.name}
                      wrapperDisplay="inline"
                    >
                      <h3 
                          className="font-bold text-gray-900 dark:text-gray-100 text-[15px] cursor-pointer hover:text-emerald-700 dark:hover:text-green-500 transition-colors duration-150"
                          onClick={(e) => { 
                              e.stopPropagation(); 
                              e.preventDefault();
                              setIsCreatorModalOpen(true); 
                          }}
                      >
                          {author?.name || 'Anonymous'}
                      </h3>
                    </CreatorHoverCard>
                     {/* TYPE BADGE: BLOG */}
                     <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <FileText size={10} className="stroke-[3]" /> {blog.category && blog.category !== 'uncategorized' ? blog.category : 'Article'}
                    </span>
                 </div>
                 <span className="hidden sm:inline text-gray-400 text-sm">·</span>
                 <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[13px]">
                     <span>{new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                     <span className="text-gray-300 dark:text-gray-600">•</span>
                     <span className="flex items-center gap-1">
                         <Clock size={12} /> {readTime}
                     </span>
                 </div>
             </div>
             <button className="text-gray-400 hidden sm:block">
                 <MoreHorizontal size={18} />
             </button>
          </div>

          {/* Body (The Hook) */}
          <div className="space-y-1.5 mb-3 mt-1">
            <h2 className="text-[20px] sm:text-[22px] font-black text-gray-900 dark:text-white leading-snug tracking-tight">
              {title}
            </h2>
            
            {(excerpt || subtitle) && (
              <p className="text-gray-600 dark:text-gray-300 text-[14px] sm:text-[15px] leading-relaxed line-clamp-3">
                {subtitle || excerpt || "Read the full article to discover more insights and details."}
              </p>
            )}
          </div>

          {/* Media (Visual Dominance) */}
          {coverImage && (
            <div className="w-full relative rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 mt-2 mb-3">
              <div className="aspect-[16/9] sm:aspect-[2/1] relative w-full h-full">
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Action Bar (Souled-Out Refactor: High-Density Discussion Intelligence) */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100 dark:border-white/5">
            {/* Left: Discussion Intelligence Box (Fisheye "Dock" Effect) */}
            <div className="flex items-center gap-3 px-1 py-1">
              {(() => {
                const [hoveredIndex, setHoveredIndex] = useState(null);
                const comments = blog.comments || [];
                
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
                  const count = comments.filter(c => c && c.feedbackType === stat.id).length;
                  
                  const Icon = stat.icon;
                  
                  // Calculate scale and lift based on distance from hovered index
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
                      className="relative z-10 transition-all duration-300 ease-out py-2"
                      style={{ 
                        transform: `scale(${scale}) translateY(${lift}px)`, 
                        zIndex: scale > 1 ? 20 : 10 
                      }}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        const filterType = stat.id === 'total' ? 'all' : stat.id;
                        router.push(`/blogs/${blog.slug}?filter=${filterType}#comments`);
                      }}
                    >
                       <div className="p-1.5 transition-colors">
                          <Icon 
                            size={18} 
                            className={`${stat.color} opacity-100 stroke-[2.5px]`} 
                          />
                       </div>
                       <span className="absolute top-1 right-0 text-gray-400 dark:text-gray-500 text-[9px] font-bold transform translate-x-1/2 -translate-y-1/3 pointer-events-none tabular-nums">
                          {count}
                       </span>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Middle: Discovery Tags */}
            <div className="hidden md:flex items-center gap-2 flex-1 justify-center px-4 overflow-hidden">
               {blog.tags && blog.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="text-gray-400 dark:text-gray-500 hover:text-emerald-600 transition-colors text-[10px] font-bold truncate max-w-[80px]">
                    #{tag}
                  </span>
               ))}
            </div>

            {/* Right: Engagement & Read Status */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Like */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 transition-all ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
              >
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                <span className="font-bold tabular-nums text-[11px]">{likesCount}</span>
              </button>

              {/* Share */}
              <button 
                  className="text-gray-500 hover:text-blue-500 transition-colors"
                  onClick={(e) => { e.stopPropagation(); /* share logic */ }}
              >
                  <Share2 size={18} />
              </button>

              {/* Bookmark */}
              <button 
                className="text-gray-400 hover:text-pink-600 transition-colors"
                onClick={(e) => { e.stopPropagation(); /* bookmark logic */ }}
              >
                  <Bookmark size={17} />
              </button>

              <span className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1"></span>

              {/* Read Count */}
              <div className="flex items-center gap-1.5 text-gray-400">
                <BookOpen size={14} />
                <span className="font-bold text-[11px] tabular-nums">{views}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="mt-4 sm:ml-16 border-t border-gray-100 dark:border-white/5 pt-4">
            <AdvancedCommentSection
              postId={_id}
              postAuthorId={author?._id}
              initialComments={blog.comments || []}
              onClose={() => setShowComments(false)}
              onCommentAdded={() => setCommentsCount(prev => prev + 1)}
            />
        </div>
      )}

      {/* Creator Profile Modal */}
      <CreatorProfileModal 
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        userId={author?._id}
      />
    </div>
  );
};

export default React.memo(BlogCard);
