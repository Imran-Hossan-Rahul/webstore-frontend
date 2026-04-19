"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, MessageCircle, ArrowRight, TrendingUp, Clock, BookOpen
} from 'lucide-react';
import { api } from '@/utils/api';
import AdvancedCommentSection from '@/components/dashboard/comments/AdvancedCommentSection';
import CreatorProfileModal from '@/components/dashboard/modals/CreatorProfileModal';

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
    content,
    coverImage,
    author,
    createdAt,
    readTime = "5 min read",
    views = 0
  } = blog;

  // Safe SSR-compatible HTML stripper (no document.createElement)
  const getExcerpt = (htmlString) => {
    if (!htmlString) return "";

    let parsedData = htmlString;
    try {
      // Try to parse as JSON first (if it's stringified editor.js data)
      if (typeof htmlString === 'string' && (htmlString.startsWith('{') || htmlString.startsWith('['))) {
        parsedData = JSON.parse(htmlString);
      }
    } catch (e) {
      // Not JSON, just normal string
      parsedData = htmlString;
    }

    try {
      // If content is an object (e.g. from editor.js or similar block editor)
      if (typeof parsedData === 'object' && parsedData !== null) {
        if (parsedData.blocks && Array.isArray(parsedData.blocks)) {
          // Extract text from paragraph/header blocks
          return parsedData.blocks
            .filter(b => b.type === 'paragraph' || b.type === 'header')
            .map(b => (b.data?.text || '').replace(/<[^>]*>/g, ' '))
            .join(' ')
            .replace(/&[a-z]+;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        return JSON.stringify(parsedData).substring(0, 100); // Fallback
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

  const rawExcerpt = getExcerpt(content);
  // User asked for 300 characters
  const excerpt = rawExcerpt.length > 300
    ? rawExcerpt.substring(0, 300).trim() + "..."
    : rawExcerpt;

  const handleNavigate = () => router.push(`/blogs/${slug}`);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('like'); return; }
    const currentIsLiked = isLiked;
    
    // Optimistic update for instant feedback
    setIsLiked(!currentIsLiked);
    setLikesCount(prev => currentIsLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      const res = await api.post(`/blog/${slug}/like`);
      if (res.success) {
        // Sync with actual server state (source of truth)
        setIsLiked(res.isLiked);
        setLikesCount(res.likesCount);
      } else {
        // Revert on failure
        setIsLiked(currentIsLiked);
        setLikesCount(prev => !currentIsLiked ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (error) {
      console.error("Failed to like blog:", error);
      // Revert on error
      setIsLiked(currentIsLiked);
      setLikesCount(prev => !currentIsLiked ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  const handleCommentToggle = (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('comment'); return; }
    setShowComments(prev => !prev);
  };


  return (
    <div className="bg-white dark:bg-black border-b border-gray-100 dark:border-white/5">
      {/* Main Card Row */}
      <div
        className="group relative hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer p-4 flex gap-6"
        onClick={handleNavigate}
      >
        {/* Avatar */}
        <div className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); setIsCreatorModalOpen(true); }}>
          <div className="relative w-12 h-12 rounded-full p-[2px] bg-white dark:bg-black border border-gray-200 dark:border-white/10 hover:opacity-80 transition-opacity">
            {(author?.profilePicture || author?.avatar) ? (
              <Image
                src={author.profilePicture || author.avatar}
                width={48}
                height={48}
                className="rounded-full w-full h-full object-cover"
                alt={author?.name || 'Author'}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-100 to-teal-200 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                {author?.name?.[0] || 'A'}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h3 
                className="font-bold text-gray-900 dark:text-gray-100 text-base hover:underline decoration-2 decoration-emerald-500 underline-offset-4"
                onClick={(e) => { e.stopPropagation(); setIsCreatorModalOpen(true); }}
              >
                {author?.name || 'Anonymous'}
              </h3>
              <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <BookOpen size={10} className="stroke-[3]" /> Article
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>{new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {readTime}</span>
            </div>
          </div>

          {/* Title & Excerpt */}
          <div className="mb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors leading-tight">
              {title}
            </h2>
            {excerpt && (
              <p className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed line-clamp-5 font-normal break-words">
                {excerpt}
              </p>
            )}
          </div>

          {/* Cover Image */}
          {coverImage && (
            <div className="mb-4 mt-2 relative w-[calc(100%-50px)] aspect-[16/10] sm:aspect-video rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between max-w-md">
            <div className="flex items-center gap-6">
              {/* Like */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 text-sm group/btn transition-all ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
              >
                <div className="p-1.5 rounded-full group-hover/btn:bg-pink-500/10 transition-colors">
                  <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                </div>
                <span className="text-xs font-bold tabular-nums">{likesCount}</span>
              </button>

              {/* Comment Toggle */}
              <button
                onClick={handleCommentToggle}
                className={`flex items-center gap-2 text-sm group/btn transition-all ${showComments ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
              >
                <div className="p-1.5 rounded-full group-hover/btn:bg-blue-500/10 transition-colors">
                  <MessageCircle size={18} className={showComments ? 'fill-current' : ''} />
                </div>
                <span className="text-xs font-bold tabular-nums">{commentsCount}</span>
              </button>

              {/* Views */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp size={18} />
                <span className="text-xs font-bold tabular-nums">{views}</span>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1 group/read"
            >
              Read Article <ArrowRight size={14} className="group-hover/read:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* AdvancedCommentSection — full featured, same as used for projects */}
      {showComments && (
        <AdvancedCommentSection
          postId={_id}
          postAuthorId={author?._id}
          initialComments={blog.comments || []}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentsCount(prev => prev + 1)}
        />
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

export default BlogCard;
